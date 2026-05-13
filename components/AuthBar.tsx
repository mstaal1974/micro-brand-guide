import React, { useState } from 'react';
import { LogIn, LogOut, Plus, Building2, ChevronDown } from 'lucide-react';
import { useOrg } from '../lib/OrgContext';
import { getSupabaseUrl } from '../lib/supabase';

function explainAuthError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid path')) {
    return `Supabase rejected the request URL. Check that SUPABASE_URL points only at your project origin (e.g. https://abcd1234.supabase.co) with no path. Currently: ${getSupabaseUrl() || '(unset)'}`;
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
    return `Could not reach Supabase at ${getSupabaseUrl() || '(unset)'}. Check the URL and that the project is not paused.`;
  }
  if (msg.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Email not confirmed. Check your inbox for the confirmation link, or disable confirmations in Supabase Auth settings.';
  }
  return raw;
}

const AuthBar: React.FC = () => {
  const { configured, user, orgs, currentOrgId, currentOrg, currentRole, setCurrentOrgId, signIn, signUp, signOut, createOrg } = useOrg();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 text-center">
        Supabase is not configured. Set <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in <code>.env.local</code> to enable organisations and approvals.
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
      setEmail(''); setPassword('');
    } catch (e: any) { setError(explainAuthError(e?.message || String(e))); }
    finally { setBusy(false); }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setBusy(true); setError(null);
    try {
      await createOrg(orgName.trim());
      setOrgName(''); setShowNewOrg(false);
    } catch (e: any) { setError(explainAuthError(e?.message || String(e))); }
    finally { setBusy(false); }
  };

  if (!user) {
    return (
      <div className="bg-navy text-white px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-center border-b border-white/10">
        <form onSubmit={handleAuth} className="flex flex-wrap gap-2 items-center">
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email" autoComplete="email"
            className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm w-48 focus:border-electric-blue outline-none"
          />
          <input
            type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm w-40 focus:border-electric-blue outline-none"
          />
          <button type="submit" disabled={busy} className="bg-electric-blue hover:bg-[#00d4ff] text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 disabled:opacity-50">
            <LogIn size={14}/> {mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
          <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-xs text-white/60 hover:text-white underline">
            {mode === 'signin' ? 'Need an account?' : 'Have one already?'}
          </button>
        </form>
        {error && <span className="text-red-300 text-xs">{error}</span>}
      </div>
    );
  }

  return (
    <div className="bg-navy text-white px-4 py-2 flex flex-wrap items-center gap-3 justify-between border-b border-white/10 text-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <Building2 size={16} className="text-electric-blue"/>
        {orgs.length > 0 ? (
          <div className="relative">
            <select
              value={currentOrgId || ''}
              onChange={e => setCurrentOrgId(e.target.value || null)}
              className="bg-white/10 border border-white/20 rounded pl-2 pr-7 py-1 text-sm appearance-none focus:border-electric-blue outline-none"
            >
              {orgs.map(({ org }) => <option key={org.id} value={org.id} className="text-navy">{org.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"/>
          </div>
        ) : (
          <span className="text-white/60 text-xs">No organisation yet</span>
        )}
        {currentRole && (
          <span className="text-[10px] uppercase tracking-wider bg-electric-blue/20 text-electric-blue px-2 py-0.5 rounded">
            {currentRole}
          </span>
        )}
        {currentOrg && (
          <span className="text-white/60 text-xs">· {currentOrg.name}</span>
        )}
        <button onClick={() => setShowNewOrg(s => !s)} className="text-xs text-white/60 hover:text-white flex items-center gap-1">
          <Plus size={12}/> New org
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/60 text-xs hidden sm:inline">{user.email}</span>
        <button onClick={() => signOut()} className="text-xs text-white/70 hover:text-white flex items-center gap-1">
          <LogOut size={12}/> Sign out
        </button>
      </div>
      {showNewOrg && (
        <form onSubmit={handleCreateOrg} className="w-full flex gap-2 items-center pt-2 border-t border-white/10">
          <input
            value={orgName} onChange={e => setOrgName(e.target.value)}
            placeholder="Organisation name"
            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm focus:border-electric-blue outline-none"
          />
          <button type="submit" disabled={busy || !orgName.trim()} className="bg-electric-blue hover:bg-[#00d4ff] text-white px-3 py-1.5 rounded text-sm font-bold disabled:opacity-50">
            Create
          </button>
          <button type="button" onClick={() => setShowNewOrg(false)} className="text-white/60 hover:text-white text-xs">Cancel</button>
        </form>
      )}
      {error && <span className="text-red-300 text-xs w-full">{error}</span>}
    </div>
  );
};

export default AuthBar;
