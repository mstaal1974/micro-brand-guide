import { createClient, SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || '';
const ANON = process.env.SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    if (!URL || !ANON) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local.'
      );
    }
    client = createClient(URL, ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON);
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
