import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, Organization, Membership, OrgRole } from './supabase';

interface OrgContextValue {
  ready: boolean;
  configured: boolean;
  user: User | null;
  session: Session | null;
  orgs: Array<{ org: Organization; role: OrgRole }>;
  currentOrgId: string | null;
  currentOrg: Organization | null;
  currentRole: OrgRole | null;
  setCurrentOrgId: (id: string | null) => void;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createOrg: (name: string) => Promise<Organization>;
}

const Ctx = createContext<OrgContextValue | null>(null);

const STORAGE_KEY = 'mp_current_org_id';

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orgs, setOrgs] = useState<Array<{ org: Organization; role: OrgRole }>>([]);
  const [currentOrgId, setCurrentOrgIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const setCurrentOrgId = useCallback((id: string | null) => {
    setCurrentOrgIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadMemberships = useCallback(async (uid: string) => {
    const { data, error } = await supabase()
      .from('memberships')
      .select('role, organizations:org_id ( id, name, created_at, created_by )')
      .eq('user_id', uid);
    if (error) {
      console.error('loadMemberships', error);
      setOrgs([]);
      return;
    }
    const rows = (data || [])
      .map((m: any) => ({ org: m.organizations as Organization, role: m.role as OrgRole }))
      .filter(r => r.org);
    setOrgs(rows);
    if (rows.length && !rows.some(r => r.org.id === currentOrgId)) {
      setCurrentOrgId(rows[0].org.id);
    } else if (!rows.length) {
      setCurrentOrgId(null);
    }
  }, [currentOrgId, setCurrentOrgId]);

  const refresh = useCallback(async () => {
    if (!configured) return;
    const { data: { session: s } } = await supabase().auth.getSession();
    setSession(s);
    setUser(s?.user ?? null);
    if (s?.user) await loadMemberships(s.user.id);
    else setOrgs([]);
  }, [configured, loadMemberships]);

  useEffect(() => {
    if (!configured) return;
    refresh().finally(() => setReady(true));
    const sub = supabase().auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadMemberships(s.user.id);
      else { setOrgs([]); setCurrentOrgId(null); }
    });
    return () => { sub.data.subscription.unsubscribe(); };
  }, [configured, refresh, loadMemberships, setCurrentOrgId]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase().auth.signUp({ email, password });
    if (error) throw error;
  };
  const signOut = async () => {
    await supabase().auth.signOut();
    setCurrentOrgId(null);
  };
  const createOrg = async (name: string) => {
    if (!user) throw new Error('Sign in first.');
    const { data, error } = await supabase()
      .from('organizations')
      .insert({ name, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    await loadMemberships(user.id);
    setCurrentOrgId(data.id);
    return data as Organization;
  };

  const currentOrg = useMemo(
    () => orgs.find(o => o.org.id === currentOrgId)?.org ?? null,
    [orgs, currentOrgId]
  );
  const currentRole = useMemo(
    () => orgs.find(o => o.org.id === currentOrgId)?.role ?? null,
    [orgs, currentOrgId]
  );

  const value: OrgContextValue = {
    ready, configured, user, session, orgs, currentOrgId, currentOrg, currentRole,
    setCurrentOrgId, refresh, signIn, signUp, signOut, createOrg,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useOrg(): OrgContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOrg must be inside <OrgProvider>');
  return v;
}

export function canReview(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'approver';
}
