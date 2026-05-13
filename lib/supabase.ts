import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase's auth/rest endpoints live at fixed paths off the project origin
// (e.g. /auth/v1/token, /rest/v1/...). If SUPABASE_URL was pasted with any
// extra path or trailing slash, the SDK appends to it and the server returns
// 404 "Invalid path specified in request URL". Strip everything but origin.
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const u = new URL(trimmed);
    if (u.pathname && u.pathname !== '/') {
      console.warn(
        `[supabase] SUPABASE_URL contained a path (${u.pathname}); using origin only: ${u.origin}`
      );
    }
    return u.origin;
  } catch {
    // Bare host without scheme — assume https.
    if (!/^https?:\/\//.test(trimmed)) {
      try { return new URL(`https://${trimmed}`).origin; } catch { /* fall through */ }
    }
    return trimmed.replace(/\/+$/, '');
  }
}

const URL_VALUE = normalizeUrl(process.env.SUPABASE_URL || '');
const ANON = (process.env.SUPABASE_ANON_KEY || '').trim();

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    if (!URL_VALUE || !ANON) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local.'
      );
    }
    client = createClient(URL_VALUE, ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(URL_VALUE && ANON);
}

export function getSupabaseUrl(): string {
  return URL_VALUE;
}

// --- Domain types (mirror db/schema.sql) ---

export type OrgRole = 'owner' | 'admin' | 'approver' | 'member';
export type PostStatus = 'pending' | 'approved' | 'rejected';
export type Platform = 'linkedin' | 'facebook' | 'instagram' | 'twitter';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface SocialPost {
  id: string;
  org_id: string;
  author_id: string;
  reviewer_id: string | null;
  status: PostStatus;
  platform: Platform;
  headline: string | null;
  caption: string;
  asset_url: string | null;
  asset_kind: 'image' | 'video' | null;
  scheduled_for: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}
