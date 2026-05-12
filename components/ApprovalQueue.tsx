import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, Clock, XCircle, CheckCircle2, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';
import { supabase, SocialPost, PostStatus, Platform } from '../lib/supabase';
import { useOrg, canReview } from '../lib/OrgContext';

const PLATFORM_ICON: Record<Platform, any> = {
  linkedin: Linkedin, facebook: Facebook, instagram: Instagram, twitter: Twitter,
};

const TABS: Array<{ id: PostStatus; label: string; Icon: any }> = [
  { id: 'pending', label: 'Pending', Icon: Clock },
  { id: 'approved', label: 'Approved', Icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', Icon: XCircle },
];

const ApprovalQueue: React.FC = () => {
  const { configured, user, currentOrgId, currentOrg, currentRole } = useOrg();
  const [tab, setTab] = useState<PostStatus>('pending');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewer = canReview(currentRole);

  const load = useCallback(async () => {
    if (!configured || !currentOrgId) { setPosts([]); return; }
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase()
        .from('social_posts')
        .select('*')
        .eq('org_id', currentOrgId)
        .eq('status', tab)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data as SocialPost[]) || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [configured, currentOrgId, tab]);

  useEffect(() => { load(); }, [load]);

  const decide = async (post: SocialPost, status: PostStatus, notes?: string) => {
    if (!user) return;
    setError(null);
    const { error } = await supabase()
      .from('social_posts')
      .update({ status, reviewer_id: user.id, review_notes: notes ?? post.review_notes })
      .eq('id', post.id);
    if (error) setError(error.message);
    else load();
  };

  if (!configured) {
    return (
      <section id="approvals" className="px-4 md:px-[70px] py-[70px]">
        <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 mb-6">
          05. Approval Queue
        </h2>
        <p className="text-gray-500">Supabase is not configured. Set <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in <code>.env.local</code> and run the SQL in <code>db/schema.sql</code>.</p>
      </section>
    );
  }

  return (
    <section id="approvals" className="px-4 md:px-[70px] py-[70px] bg-light-gray/40">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6">
            05. Approval Queue
          </h2>
          <p className="text-gray-500 mt-2 pl-7">Review and approve posts before they go live.{currentOrg ? ` · ${currentOrg.name}` : ''}</p>
        </div>
        <button onClick={load} className="bg-white border border-gray-200 hover:border-electric-blue text-navy px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${tab === id ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {!currentOrgId && (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
          Select an organisation to view its approval queue.
        </div>
      )}

      {currentOrgId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[200px]">
          {loading && <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>}
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>}
          {!loading && !posts.length && (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
              <ShieldCheck size={32} className="opacity-50"/>
              <span>{tab === 'pending' ? 'No posts awaiting approval.' : tab === 'approved' ? 'No approved posts yet.' : 'No rejected posts.'}</span>
            </div>
          )}
          <ul className="divide-y divide-gray-100">
            {posts.map(post => {
              const Icon = PLATFORM_ICON[post.platform];
              return (
                <li key={post.id} className="p-4 flex flex-col md:flex-row gap-4">
                  {post.asset_url && (
                    post.asset_kind === 'video' ? (
                      <video src={post.asset_url} controls className="w-full md:w-48 h-48 object-cover rounded-lg bg-gray-50"/>
                    ) : (
                      <img src={post.asset_url} className="w-full md:w-48 h-48 object-cover rounded-lg bg-gray-50"/>
                    )
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="bg-navy/5 text-navy text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Icon size={12}/> {post.platform}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${post.status === 'pending' ? 'bg-amber-100 text-amber-800' : post.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {post.status}
                      </span>
                      {post.scheduled_for && (
                        <span className="text-xs text-gray-500">Scheduled {new Date(post.scheduled_for).toLocaleString()}</span>
                      )}
                    </div>
                    {post.headline && <div className="font-bold text-navy mb-1">{post.headline}</div>}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{post.caption}</p>
                    {post.review_notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">Reviewer note: {post.review_notes}</p>
                    )}
                    {tab === 'pending' && reviewer && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => decide(post, 'approved')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 size={12}/> Approve
                        </button>
                        <button
                          onClick={() => {
                            const notes = window.prompt('Reason for rejection (optional)');
                            decide(post, 'rejected', notes || undefined);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle size={12}/> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ApprovalQueue;
