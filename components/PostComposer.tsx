import React, { useState } from 'react';
import { X, Send, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';
import { supabase, Platform } from '../lib/supabase';
import { useOrg } from '../lib/OrgContext';

interface Props {
  assetUrl: string | null;
  assetKind: 'image' | 'video';
  headline: string;
  caption: string;
  onClose: () => void;
}

const PLATFORMS: Array<{ id: Platform; label: string; Icon: any }> = [
  { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { id: 'facebook', label: 'Facebook', Icon: Facebook },
  { id: 'instagram', label: 'Instagram', Icon: Instagram },
  { id: 'twitter', label: 'X / Twitter', Icon: Twitter },
];

// Supabase rows have row size limits; refuse to embed huge base64 payloads.
const MAX_INLINE_BYTES = 800_000;

const PostComposer: React.FC<Props> = ({ assetUrl, assetKind, headline, caption: initialCaption, onClose }) => {
  const { user, currentOrgId, currentOrg } = useOrg();
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [caption, setCaption] = useState(initialCaption);
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentOrgId) { setError('Sign in and pick an organisation first.'); return; }
    setBusy(true); setError(null);
    try {
      let storedAsset = assetUrl;
      if (storedAsset && storedAsset.startsWith('data:') && storedAsset.length > MAX_INLINE_BYTES) {
        throw new Error(
          'Asset is too large to attach inline. Configure Supabase Storage and upload there, or use the Download button and attach manually.'
        );
      }
      const { error: insertErr } = await supabase().from('social_posts').insert({
        org_id: currentOrgId,
        author_id: user.id,
        platform,
        headline: headline || null,
        caption,
        asset_url: storedAsset,
        asset_kind: assetKind,
        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        status: 'pending',
      });
      if (insertErr) throw insertErr;
      setDone(true);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-navy text-white px-5 py-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Submit for Approval</h3>
            {currentOrg && <p className="text-xs text-white/60">{currentOrg.name}</p>}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18}/></button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-green-600 font-bold text-lg">Sent to the approval queue.</div>
            <p className="text-gray-500 text-sm">An approver in {currentOrg?.name || 'your organisation'} will review the post.</p>
            <button onClick={onClose} className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-bold">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {assetUrl ? (
              assetKind === 'image' ? (
                <img src={assetUrl} className="w-full max-h-56 object-contain rounded-lg border border-gray-200 bg-gray-50"/>
              ) : (
                <video src={assetUrl} controls className="w-full max-h-56 rounded-lg border border-gray-200 bg-gray-50"/>
              )
            ) : (
              <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded">No asset attached. The post will be caption-only.</div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Platform</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORMS.map(({ id, label, Icon }) => (
                  <button
                    type="button" key={id} onClick={() => setPlatform(id)}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${platform === id ? 'border-electric-blue bg-electric-blue/10 text-navy' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Icon size={16}/> {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Caption</label>
              <textarea
                value={caption} onChange={e => setCaption(e.target.value)} required
                rows={5}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-electric-blue outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Schedule for (optional)</label>
              <input
                type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-electric-blue outline-none"
              />
            </div>

            {error && <div className="bg-red-50 text-red-700 text-xs p-2 rounded">{error}</div>}

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
              <button
                type="submit" disabled={busy || !caption.trim()}
                className="bg-electric-blue hover:bg-[#00d4ff] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <Send size={14}/> {busy ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostComposer;
