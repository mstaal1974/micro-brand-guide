
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Save, Upload, FileText, ShieldCheck, AlertCircle, Link as LinkIcon, Plus, X, Trash2, Calendar, Wand2, Download, ArrowUpRight, Play, Linkedin, Instagram, Facebook, Video, Search } from 'lucide-react';
import * as replicate from '../lib/replicate';

declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
    jspdf: any;
    autoTable: any;
    google: any;
  }
}

interface PlanItem {
  platform: 'LinkedIn' | 'Instagram' | 'TikTok' | 'Facebook';
  week: string;
  day: string;
  format: string;
  theme: string;
  headline: string;
  visualPrompt: string;
  caption: string;
}

interface AdminTrainingProps {
    onSendToAI: (data: { scenePrompt: string, headline: string, caption: string, mode?: 'image' | 'video' }) => void;
}

const OFFICIAL_STRATEGY_TEXT = `
BLOCKSURE MARKETING STRATEGY (Consumers + RTOs)

1) Positioning & Messaging Architecture
1.1 Brand positioning:
- One-line: “If skills are the future currency, Blocksure is the bank and exchange.”
- Core promise: Quality-assured, machine-readable skills.
- Consumers: Digital Skills Wallet + Smart Resume that turns learning into verifiable, shareable, instantly checkable skills.
- RTOs: Compliance + growth infrastructure: QA overlay, credential integrity, marketplace distribution + payments, AI course mapping.

2) Channel Strategy
- LinkedIn (RTO focus): Authority + proof + demos + partner stories.
- Instagram (Consumer focus): Aspiration + progress + trust-building.
- TikTok (Consumer focus): Short “aha” explainers, job outcomes.

3) Visual Style & Creative Guardrails
- Imagery system: "Badge proof" mockups, "Pathway ladder" graphics, "Screenshot + highlight" (marketplace / MicroPromote).
- Tone: Professional, confident, forward-thinking (Veri persona).
- Language: Australian English (e.g., 'colour', 'optimise').
- Avoid: Don't over-index on "blockchain" as the hero. Use it as verification proof only.
`;

const OFFICIAL_CALENDAR_DATA: PlanItem[] = [
  {
    platform: 'LinkedIn', week: 'W1', day: 'Mon', format: 'Carousel', theme: 'Credential Integrity',
    headline: 'Stop issuing "pretty badges." Start issuing proof.',
    visualPrompt: '5-slide carousel: clean backgrounds, Navy and Electric Blue palette. Slide 1: Text "Badges vs Proof". Slide 5: Demo screenshot montage of credentials and analytics dashboard.',
    caption: 'RTOs don’t need another badge tool — they need credential integrity. Open Badges 3.0, QA overlay, and instant verification.'
  },
  {
    platform: 'LinkedIn', week: 'W1', day: 'Wed', format: 'Demo clip', theme: 'Marketplace Embed',
    headline: 'Embed your marketplace. Keep your branding.',
    visualPrompt: 'Screen recording mockup: Settings page cursor clicking "Partner URL", showing an embedded storefront on a university website. Clean UI overlays.',
    caption: 'Keep traffic on your domain, still get marketplace reach + payments. Embed your branded marketplace in an afternoon.'
  },
  {
    platform: 'LinkedIn', week: 'W1', day: 'Fri', format: 'Static Checklist', theme: 'Metadata',
    headline: 'The 6 metadata fields employers actually care about',
    visualPrompt: 'One-page checklist graphic in brand colors. Items: Skill statements, Occupation codes, Alignment, Keywords, Verification, Expiry.',
    caption: 'Most credentials fail because they aren’t machine-readable. Here are the 6 fields that actually matter for employability.'
  },
  {
    platform: 'LinkedIn', week: 'W2', day: 'Mon', format: 'Carousel', theme: 'Stackable Skills',
    headline: 'Micro-credentials that boost completion',
    visualPrompt: 'Ladder graphic: 3-stack pathway showing "Intermediate Milestone" -> "Learner Momentum" -> "Completion". Minimalist 3D style.',
    caption: 'Show the "stacking" concept: intermediate milestones create learner momentum and better completion narratives.'
  },
  {
    platform: 'LinkedIn', week: 'W2', day: 'Wed', format: 'Demo clip', theme: 'MicroPromote',
    headline: 'MicroPromote: generate 9 posts from 1 course',
    visualPrompt: 'Dashboard screenshot of "MicroPromote" tool showing a content calendar being auto-filled from a course module. Overlay text: "From Course -> Post".',
    caption: 'Small teams shouldn’t have small reach. MicroPromote uses your courses as the knowledge base to generate text, images, and video.'
  },
  {
    platform: 'LinkedIn', week: 'W2', day: 'Fri', format: 'Static', theme: 'Payments',
    headline: 'Payments direct to you — when you want',
    visualPrompt: 'Screenshot-style mockup: Payout summary dashboard with "Payments Direct" headline highlighted in Electric Blue.',
    caption: 'Marketplace distribution + transparent payment rails can shorten time-to-revenue.'
  },
  {
    platform: 'LinkedIn', week: 'W3', day: 'Mon', format: 'Carousel', theme: 'Revenue Scope',
    headline: 'Your scope already contains new revenue.',
    visualPrompt: 'Diagram carousel: Scope -> Skills -> Badges -> Marketplace -> Pathways. Connecting lines in Electric Blue.',
    caption: 'You just can’t see it yet. Map scope to job-ready skills and occupational profiles to unlock pathway bundles.'
  },
  {
    platform: 'LinkedIn', week: 'W3', day: 'Wed', format: 'Demo clip', theme: 'Trust',
    headline: 'Open Badges 3.0 + revocation = trust',
    visualPrompt: 'Badge verify flow animation: Show "Instant Verification" green checkmark screen + "Revocation Capacity" shield icon callout.',
    caption: 'Verifiable, sharable, revocable. That is the difference between a PDF and a credential.'
  },
  {
    platform: 'LinkedIn', week: 'W3', day: 'Fri', format: 'Static', theme: 'Automation',
    headline: '3 things to automate before you hire another marketer',
    visualPrompt: '3-panel graphic with icons: 1) Course-to-Post, 2) Scheduling, 3) Analytics. One MicroPromote screenshot tile included.',
    caption: '1) Course → post generation, 2) Scheduling, 3) Performance analytics. Automate the routine, hire for strategy.'
  },
  {
    platform: 'LinkedIn', week: 'W4', day: 'Mon', format: 'Carousel', theme: 'Integration',
    headline: '“Machine-readable skills” is not a buzzword.',
    visualPrompt: 'Carousel showing one RSD (Rich Skill Descriptor) example. Labels pointing to: Name, Codes, Keywords, Standards Alignment.',
    caption: 'It’s the integration layer. Explain RSDs: human + machine-readable skill descriptors aligned to global standards.'
  },
  {
    platform: 'LinkedIn', week: 'W4', day: 'Wed', format: 'Demo clip', theme: 'APIs',
    headline: 'APIs to SMS/LMS = faster adoption',
    visualPrompt: 'Motion graphic: "SMS/LMS -> Blocksure -> Wallet/Verification" with flowing data arrows. Minimal text.',
    caption: 'Show integration story: issue credentials, sync enrolments, reduce admin friction.'
  },
  {
    platform: 'LinkedIn', week: 'W4', day: 'Fri', format: 'Static', theme: 'Launch Offer',
    headline: 'Launch offer: Issuer Launch Pack (90 days)',
    visualPrompt: 'Simple timeline graphic with milestones: First Badge -> Marketplace Embedded -> Social Calendar -> First Bundle.',
    caption: '90-day plan to activation. Get your marketplace embedded and your first pathway live.'
  },
  { platform: 'LinkedIn', week: 'W5', day: 'Mon', format: 'Carousel', theme: 'Workflow', headline: 'From course to credential in one workflow', visualPrompt: 'Step-by-step carousel with numbered panels; include one marketplace course card screenshot.', caption: 'Show the workflow: course mapping → badge → skills inherited → listing.' },
  { platform: 'LinkedIn', week: 'W5', day: 'Wed', format: 'Static', theme: 'Analytics', headline: 'Promotion of excellence: rankings + outcomes', visualPrompt: 'Dashboard-style mockup: "outcomes", "engagement", "enrolment sources".', caption: 'Position outcomes reporting as differentiation for providers.' },
  { platform: 'LinkedIn', week: 'W5', day: 'Fri', format: 'Demo clip', theme: 'Scheduling', headline: 'Schedule content across platforms in one place', visualPrompt: 'Screen record calendar view; overlay "3 posts/week auto-scheduled".', caption: 'Show MicroPromote scheduling suite + platform connections.' },
  { platform: 'LinkedIn', week: 'W6', day: 'Mon', format: 'Carousel', theme: 'Chaos Fix', headline: 'Credential chaos is real. Here’s the fix.', visualPrompt: '2-column comparison slides (Chaos vs Order); end with Blocksure ecosystem diagram.', caption: 'Contrast: badge-only tools vs skills infrastructure stack.' },
  { platform: 'LinkedIn', week: 'W6', day: 'Wed', format: 'Static', theme: 'Metrics', headline: '3 metrics to watch after launch', visualPrompt: 'Minimal chart graphic with "target ranges" placeholders for Impressions, Clicks, CTR.', caption: 'Impressions → clicks → CTR, plus marketplace conversion.' },
  { platform: 'LinkedIn', week: 'W6', day: 'Fri', format: 'Demo clip', theme: 'Bundling', headline: 'Course bundling: manual or AI suggested', visualPrompt: 'Show bundle creation + pathway builder view UI.', caption: 'Increase LTV and completion by bundling into pathways.' },
  { platform: 'LinkedIn', week: 'W7', day: 'Mon', format: 'Carousel', theme: 'QA', headline: '“Quality assured” doesn’t mean slow.', visualPrompt: 'Use the QA decision-flow as simplified infographic.', caption: 'Explain QA overlay decisions + issuing confidence.' },
  { platform: 'LinkedIn', week: 'W7', day: 'Wed', format: 'Static', theme: 'Branding', headline: 'Your branded marketplace, your rules', visualPrompt: 'Before/after mock: generic marketplace vs branded storefront.', caption: 'Reinforce branding + course-only filters + website integration.' },
  { platform: 'LinkedIn', week: 'W7', day: 'Fri', format: 'Demo clip', theme: 'Aggregation', headline: 'Skills aggregator: import badges + build analytics', visualPrompt: 'Profile page + skill charts highlight; zoom on "imports badges".', caption: 'Show aggregation and analytics for providers/industry.' },
  { platform: 'LinkedIn', week: 'W8', day: 'Mon', format: 'Carousel', theme: 'Consistency', headline: 'RTO marketing isn’t the problem. Consistency is.', visualPrompt: 'Carousel: Week plan snapshots + "generated from one course".', caption: 'Show how MicroPromote turns course knowledge into repeatable campaigns.' },
  { platform: 'LinkedIn', week: 'W8', day: 'Wed', format: 'Static', theme: 'Enrolment', headline: '2-click enrolment + payment reduces drop-off', visualPrompt: 'Flow graphic: Browse → Apply code → Pay → Confirm.', caption: 'Highlight friction removal: promo codes, ratings, 2-click pay.' },
  { platform: 'LinkedIn', week: 'W8', day: 'Fri', format: 'Demo clip', theme: 'Inheritance', headline: 'Course skills inherit through badges', visualPrompt: 'Course page screenshot + badge skills chips callouts.', caption: 'Explain inheritance: course completion updates skill evidence.' },
  { platform: 'LinkedIn', week: 'W9', day: 'Mon', format: 'Carousel', theme: 'Employer Value', headline: 'What employers get when you issue better credentials', visualPrompt: 'Carousel: Employer lens, with "before/after" hiring signals.', caption: 'Employer value: machine-readable skills, faster verification, better matching.' },
  { platform: 'LinkedIn', week: 'W9', day: 'Wed', format: 'Static', theme: 'Reporting', headline: 'Monthly “performance snapshot” email idea', visualPrompt: 'Mock one-page report preview.', caption: 'Offer a template: report enrolments + top posts + CTR + next actions.' },
  { platform: 'LinkedIn', week: 'W9', day: 'Fri', format: 'Demo clip', theme: 'Connections', headline: 'Link your social accounts once, manage all', visualPrompt: 'Screen record "connected accounts" page with icons.', caption: 'Single sign-in + connected accounts.' },
  { platform: 'LinkedIn', week: 'W10', day: 'Mon', format: 'Carousel', theme: 'Ecosystem', headline: 'The “skills currency” model — in one picture', visualPrompt: 'Clean ecosystem diagram with highlights.', caption: 'Teach the ecosystem: RSDs → credentials → aggregator → marketplace.' },
  { platform: 'LinkedIn', week: 'W10', day: 'Wed', format: 'Static', theme: 'Roadmap', headline: 'RTOs: your next 90 days, mapped', visualPrompt: 'Timeline graphic with 4 milestones.', caption: 'Post a mini roadmap: first badge, first pathway, first campaign, first report.' },
  { platform: 'LinkedIn', week: 'W10', day: 'Fri', format: 'Demo clip', theme: 'Analytics', headline: 'Analytics: impressions, clicks, reach, CTR', visualPrompt: 'Screen record dashboard; overlay labels for each metric.', caption: 'Show MicroPromote analytics dashboards.' },
  { platform: 'LinkedIn', week: 'W11', day: 'Mon', format: 'Carousel', theme: 'Security', headline: 'Credential integrity: 3 levels of security', visualPrompt: '3-tier pyramid graphic + small verification screenshot.', caption: 'Explain: linked/assured, blockchain secured, integration API, revocation.' },
  { platform: 'LinkedIn', week: 'W11', day: 'Wed', format: 'Static', theme: 'LMS Import', headline: 'Course import from LMS: less admin, faster revenue', visualPrompt: 'Split graphic: LMS logo → marketplace course tiles.', caption: 'Highlight import + course management + promotions scheduling.' },
  { platform: 'LinkedIn', week: 'W11', day: 'Fri', format: 'Demo clip', theme: 'Promos', headline: 'Promo codes + boosting discounts (scheduled)', visualPrompt: 'Screen record discount scheduling UI; overlay "set + forget".', caption: 'Demonstrate "boosting discount" scheduling and promo codes.' },
  { platform: 'LinkedIn', week: 'W12', day: 'Mon', format: 'Carousel', theme: 'Retro', headline: 'What we learned in 90 days (template)', visualPrompt: 'Carousel with 4 slides: KPI, funnel, best posts, next tests.', caption: 'Share a "post-launch retro" framework: content → conversion → optimisation.' },
  { platform: 'LinkedIn', week: 'W12', day: 'Wed', format: 'Static', theme: 'Start', headline: 'Ready to be an issuer? Start with one course.', visualPrompt: 'One hero mock: course card → badge → marketplace listing.', caption: 'Low-friction call: "Pick one course, we’ll map it, issue a badge, and publish it."' },
  { platform: 'LinkedIn', week: 'W12', day: 'Fri', format: 'Demo clip', theme: 'Loop', headline: 'MicroPromote: generate, schedule, measure — loop', visualPrompt: 'Fast montage: generator → calendar → analytics → repeat icon.', caption: 'Wrap the story: content engine + scheduling + analytics creates consistency.' },
  { platform: 'Instagram', week: 'W1', day: 'Mon', format: 'Reel', theme: 'Skills Wallet',
    headline: 'Your resume tells a story. Your wallet proves it.',
    visualPrompt: 'Face-to-camera + quick screen recording insert; overlay text "Proof > claims". Veri holding phone showing wallet.',
    caption: 'A resume lists experience. A verified microcredential proves it. Create your wallet in 2 minutes.'
  },
  { platform: 'Instagram', week: 'W1', day: 'Wed', format: 'Carousel', theme: 'Stacking',
    headline: 'Stack skills like levels in a game',
    visualPrompt: 'Pathway ladder graphic + badge mockups; human photo background. Slide 1: Start Small. Slide 2: Earn Proof. Slide 3: Stack.',
    caption: 'Start small. Earn proof. Stack. Get noticed. Browse pathway bundles today.'
  },
  { platform: 'Instagram', week: 'W1', day: 'Fri', format: 'Static', theme: 'Spotlight',
    headline: 'Course spotlight: skill you can prove this month',
    visualPrompt: 'Course card mockup + 3 bullet overlays + subtle badge icon. Professional but vibrant.',
    caption: 'What you’ll learn + proof you’ll earn + who it’s for. Tap to enrol.'
  },
  { platform: 'Instagram', week: 'W2', day: 'Mon', format: 'Reel', theme: 'Underselling',
    headline: '3 signs you’re under-selling your skills',
    visualPrompt: 'Talking head + "checklist" overlay. 1) Vague bullets, 2) No evidence, 3) No pathway.',
    caption: '1) vague bullet points, 2) no evidence, 3) no pathway. Fix: wallet + verifiable credentials.'
  },
  { platform: 'Instagram', week: 'W2', day: 'Wed', format: 'Carousel', theme: 'Verification',
    headline: 'What is a "verifiable credential"?',
    visualPrompt: 'Credential mockups + "verified" check marks; minimal text. Swipe to see verification screen.',
    caption: 'Shareable, instantly verifiable, revocable—so employers trust it.'
  },
  { platform: 'Instagram', week: 'W2', day: 'Fri', format: 'Reel', theme: 'Goal Setting',
    headline: 'Pick your goal → get your next skill steps',
    visualPrompt: 'Screen capture of goal selection + recommendations list. Arrows pointing to "Promotion", "Career Change".',
    caption: 'Don\'t guess. Promotion / career change / first job. We map the skills.'
  },
  { platform: 'Instagram', week: 'W3', day: 'Mon', format: 'Carousel', theme: 'Progress',
    headline: 'Progress that employers can see',
    visualPrompt: 'Milestone timeline with badges at each step. Bright, encouraging visuals.',
    caption: 'Stackable micro-credentials = visible milestones. Start your first milestone.'
  },
  { platform: 'Instagram', week: 'W3', day: 'Wed', format: 'Reel', theme: 'Experience',
    headline: 'How to turn "experience" into proof',
    visualPrompt: 'Split-screen: person + UI flow. Resume -> Skills Extracted -> Gaps -> Course.',
    caption: 'Turn your resume into machine-readable proof.'
  },
  { platform: 'Instagram', week: 'W3', day: 'Fri', format: 'Static', theme: 'Share',
    headline: 'Friday win: share your credential link',
    visualPrompt: 'Minimal quote-card + small badge icon. "Share one proof this week."',
    caption: 'Share one proof this week. Employers want evidence, not just adjectives. Link in bio.'
  },
  { platform: 'Instagram', week: 'W4', day: 'Mon', format: 'Reel', theme: 'Currency',
    headline: 'Skills currency in 20 seconds',
    visualPrompt: 'Fast explainer: skills -> credential -> wallet -> opportunities. Quick cuts + animated arrows.',
    caption: 'Fast explainer: skills → credential → wallet → opportunities. Start your wallet.'
  },
  { platform: 'Instagram', week: 'W4', day: 'Wed', format: 'Carousel', theme: 'Pathways',
    headline: 'Choose-your-own-path learning',
    visualPrompt: 'Pathway map screenshot + highlighted next nodes. "Without wasting time" subtitle.',
    caption: 'Explain dynamic pathways + stacking + marketplace browsing. Explore pathways.'
  },
  { platform: 'Instagram', week: 'W4', day: 'Fri', format: 'Reel', theme: 'Promise',
    headline: 'One course. One credential. One shareable proof.',
    visualPrompt: 'Talking head + credential mock overlay. Simple promise.',
    caption: 'One course. One credential. One shareable proof. Tap to start.'
  },
  { platform: 'Instagram', week: 'W5', day: 'Mon', format: 'Carousel', theme: 'Power Skills', headline: 'The 5 skills your future self will thank you for', visualPrompt: 'Icon-led slides + badge placeholders.', caption: 'List 5 "power skills" and link to "prove them" with credentials.' },
  { platform: 'Instagram', week: 'W5', day: 'Wed', format: 'Reel', theme: 'Interview', headline: 'How to explain your skills in interviews', visualPrompt: 'On-screen "interview script" text.', caption: 'Script: "I earned X, verified here, demonstrated by Y."' },
  { platform: 'Instagram', week: 'W5', day: 'Fri', format: 'Static', theme: 'Challenge', headline: 'Weekend challenge: complete one micro-module', visualPrompt: 'Minimal challenge graphic.', caption: 'Motivation post + reminder "small wins stack."' },
  { platform: 'Instagram', week: 'W6', day: 'Mon', format: 'Reel', theme: 'Trust', headline: 'What employers see when they click "verify"', visualPrompt: 'Screen recording with blur/redaction + arrows.', caption: 'Show verification screen + "why trust increases."' },
  { platform: 'Instagram', week: 'W6', day: 'Wed', format: 'Carousel', theme: 'Gaps', headline: 'Skill gaps aren’t bad. They’re a map.', visualPrompt: 'Map metaphor visuals + pathway ladder.', caption: 'Normalize gaps → show how to close them with recommended courses.' },
  { platform: 'Instagram', week: 'W6', day: 'Fri', format: 'Reel', theme: 'Next Step', headline: 'Stop guessing your next step', visualPrompt: 'Quick cuts + text overlay "next step unlocked".', caption: 'Show: goal → pathway → recommended course list.' },
  { platform: 'Instagram', week: 'W7', day: 'Mon', format: 'Carousel', theme: 'Portfolio', headline: 'Portfolio career? Here’s how to prove it.', visualPrompt: 'Portfolio layout mock + credential tiles.', caption: 'Explain skills wallet as portable proof across gigs/roles.' },
  { platform: 'Instagram', week: 'W7', day: 'Wed', format: 'Reel', theme: 'Machine Readable', headline: 'Make your resume machine-readable', visualPrompt: 'Resume visual with highlighted skill fields.', caption: 'Explain that embedded structured skills help matching; show "skills chips".' },
  { platform: 'Instagram', week: 'W7', day: 'Fri', format: 'Static', theme: 'Proof', headline: 'Proof Friday: post your badge screenshot', visualPrompt: 'Template frame for users to repost.', caption: 'Community prompt: "tag us" + "share link in bio".' },
  { platform: 'Instagram', week: 'W8', day: 'Mon', format: 'Reel', theme: 'Mythbust', headline: 'Micro-credentials: what they are (and aren’t)', visualPrompt: 'Talking head + myth/fact overlay.', caption: 'Debunk: not fluff—when aligned + verifiable.' },
  { platform: 'Instagram', week: 'W8', day: 'Wed', format: 'Carousel', theme: 'Funnel', headline: 'From learning to earning: shorten the gap', visualPrompt: 'Funnel graphic: Learn → Prove → Share → Apply.', caption: 'Explain "one-click apply / share proof" concept.' },
  { platform: 'Instagram', week: 'W8', day: 'Fri', format: 'Reel', theme: 'Choice', headline: 'How to choose a course (in 3 questions)', visualPrompt: 'On-screen questions + course page flashes.', caption: '1) What skill proof do I get? 2) Does it stack? 3) Can I share/verify it?' },
  { platform: 'Instagram', week: 'W9', day: 'Mon', format: 'Carousel', theme: 'Plan', headline: 'Build a 30-day pathway (template)', visualPrompt: 'Calendar-style graphic.', caption: 'Offer a simple 30-day plan: 1 credential + 1 stretch skill + 1 share action.' },
  { platform: 'Instagram', week: 'W9', day: 'Wed', format: 'Reel', theme: 'Time', headline: '“I don’t have time” — do this instead', visualPrompt: 'Fast cuts, timer overlay "10 minutes".', caption: 'Show bite-sized learning + stacking logic.' },
  { platform: 'Instagram', week: 'W9', day: 'Fri', format: 'Static', theme: 'Checklist', headline: 'Save this: skills proof checklist', visualPrompt: 'Saveable infographic.', caption: 'Checklist bullets; CTA "create wallet".' },
  { platform: 'Instagram', week: 'W10', day: 'Mon', format: 'Reel', theme: 'LinkedIn', headline: 'What to post on LinkedIn when you finish', visualPrompt: 'Template overlay + example post mock.', caption: 'Give a post template; prompt to share credential link.' },
  { platform: 'Instagram', week: 'W10', day: 'Wed', format: 'Carousel', theme: 'Tour', headline: 'Skills wallet tour: where everything lives', visualPrompt: 'UI tour with highlighted boxes.', caption: 'Show sections: skills, credentials, pathways, recommendations.' },
  { platform: 'Instagram', week: 'W10', day: 'Fri', format: 'Reel', theme: 'Story', headline: 'One credential that changes your interview', visualPrompt: 'Storytelling + subtle b-roll.', caption: 'Mini-story format; CTA to enrol.' },
  { platform: 'Instagram', week: 'W11', day: 'Mon', format: 'Carousel', theme: 'Confidence', headline: 'Confidence comes from evidence', visualPrompt: 'Human portraits + minimal text overlays.', caption: 'Reframe: "you’re not behind—you’re building proof."' },
  { platform: 'Instagram', week: 'W11', day: 'Wed', format: 'Reel', theme: 'Ladder', headline: 'How to stack: beginner → intermediate → job-ready', visualPrompt: 'Animated ladder + badge icons.', caption: 'Show a 3-step ladder; CTA to pathway.' },
  { platform: 'Instagram', week: 'W11', day: 'Fri', format: 'Static', theme: 'Q&A', headline: 'Ask us anything: skills, careers, pathways', visualPrompt: 'Story-style graphic posted to feed; include "drop a question".', caption: 'Question sticker prompt; drive DMs.' },
  { platform: 'Instagram', week: 'W12', day: 'Mon', format: 'Reel', theme: 'Recap', headline: '12-week recap: what you can do now', visualPrompt: 'Montage of best moments + CTA.', caption: 'Recap outcomes: wallet, first credential, first stack, share proof.' },
  { platform: 'Instagram', week: 'W12', day: 'Wed', format: 'Carousel', theme: 'Next 90', headline: 'Your next 90 days: a simple pathway plan', visualPrompt: 'Plan graphic + icons + "save this".', caption: 'Offer a 3-step path; link to marketplace.' },
  { platform: 'Instagram', week: 'W12', day: 'Fri', format: 'Reel', theme: 'Push', headline: 'Final push: create your wallet in 2 minutes', visualPrompt: 'Timer overlay + screen capture.', caption: 'Direct CTA, minimal words.' },
  { platform: 'TikTok', week: 'W1', day: 'Mon', format: '20s Video', theme: 'Currency',
    headline: '“Skills are currency” — here’s what that means',
    visualPrompt: 'Face cam + animated text "Degrees vs Skills". 1 quick UI flash of wallet. Upbeat energy.',
    caption: 'Degrees tell where you studied. Skills tell what you can do. A skills wallet stores proof. Create yours in 2 mins.'
  },
  { platform: 'TikTok', week: 'W1', day: 'Wed', format: '25s Video', theme: 'Underselling',
    headline: '3 steps to stop underselling yourself',
    visualPrompt: 'Checklist overlay + "ding" transitions. Veri pointing to 1, 2, 3.',
    caption: 'Step 1: pick goal role. Step 2: map gaps. Step 3: earn verifiable proof.'
  },
  { platform: 'TikTok', week: 'W1', day: 'Fri', format: '30s Video', theme: 'Verification',
    headline: 'What happens when an employer clicks verify?',
    visualPrompt: 'Screen recording insert of verification process; blur personal info. "Verified" stamp effect.',
    caption: 'They see it’s real—instantly. No calling universities. Just proof.'
  },
  { platform: 'TikTok', week: 'W2', day: 'Mon', format: '20s Video', theme: 'Scam vs Smart',
    headline: 'Micro-credentials: scam or smart?',
    visualPrompt: 'Split-screen myth vs fact text. Veri shaking head at myth, nodding at fact.',
    caption: 'Myth: They are fake. Fact: If it’s verifiable, aligned, and stackable—it’s valuable.'
  },
  { platform: 'TikTok', week: 'W2', day: 'Wed', format: '25s Video', theme: 'Fast Choice',
    headline: 'How to choose a course (fast)',
    visualPrompt: 'Cut to course card and badge mock. Fast pacing.',
    caption: '1. What skill proof do I get? 2. Does it stack? 3. Can I share it?'
  },
  { platform: 'TikTok', week: 'W2', day: 'Fri', format: '30s Video', theme: 'Career Change',
    headline: 'Career change? Don’t guess your next step',
    visualPrompt: 'On-screen arrows + UI flashes. Goal -> Pathway -> Credential.',
    caption: 'Show: goal → recommended pathway → first credential pick.'
  },
  { platform: 'TikTok', week: 'W3', day: 'Mon', format: '15s Video', theme: 'No Time',
    headline: '“No time” — do 10 minutes',
    visualPrompt: 'Timer overlay; quick motivational tone. Clock ticking sound fx.',
    caption: 'Small wins stack. Start with one micro-module today.'
  },
  { platform: 'TikTok', week: 'W3', day: 'Wed', format: '30s Video', theme: 'Flow',
    headline: 'Resume → skills → gaps (in one flow)',
    visualPrompt: 'Screen recording insert + captions. Scanning a resume animation.',
    caption: 'Extract skills, find gaps, get recommendations. All in one flow.'
  },
  { platform: 'TikTok', week: 'W3', day: 'Fri', format: '25s Video', theme: 'Cheat Code',
    headline: 'Stacking = the cheat code for confidence',
    visualPrompt: 'Animated ladder + badge icons. "Level Up" graphical style.',
    caption: 'One credential proves one thing. Three stacked proves job-ready.'
  },
  { platform: 'TikTok', week: 'W4', day: 'Mon', format: '25s Video', theme: 'Prove It',
    headline: 'Stop writing “good communication” — prove it',
    visualPrompt: 'Text overlay "prove it" + credential mock. Veri looking skeptical then happy.',
    caption: 'Evidence beats adjectives. Earn proof and link it.'
  },
  { platform: 'TikTok', week: 'W4', day: 'Wed', format: '30s Video', theme: 'Wallet Tour',
    headline: 'What is a skills wallet?',
    visualPrompt: 'Tour-style screen recording, fast cuts. Swipe through sections.',
    caption: 'It’s your portable proof: skills + credentials + pathways.'
  },
  { platform: 'TikTok', week: 'W4', day: 'Fri', format: '20s Video', theme: 'One Click',
    headline: 'One-click share: the best part',
    visualPrompt: 'Show share UI; big captions. Sending a link.',
    caption: 'Send proof, not paragraphs. One click.'
  },
  { platform: 'TikTok', week: 'W5', day: 'Mon', format: '25s Video', theme: 'Behind', headline: '“I’m behind” → “I’m building proof”', visualPrompt: 'Empathetic tone; subtitles. Veri comforting.', caption: 'Reframe + tiny action: create wallet, pick 1 skill.' },
  { platform: 'TikTok', week: 'W5', day: 'Wed', format: '30s Video', theme: 'Interview', headline: 'How to talk about your credential in interviews', visualPrompt: 'Script overlay; quick example.', caption: 'Give a 2-sentence script + show credential.' },
  { platform: 'TikTok', week: 'W5', day: 'Fri', format: '20s Video', theme: 'Challenge', headline: 'Weekend challenge: earn one milestone', visualPrompt: 'Challenge graphic overlays.', caption: 'One small win. Then share it.' },
  { platform: 'TikTok', week: 'W6', day: 'Mon', format: '25s Video', theme: 'Resumes', headline: 'Why employers don’t trust resumes', visualPrompt: 'Direct, slightly spicy hook. Ripping paper sound.', caption: 'No verification. Fix it with proof links.' },
  { platform: 'TikTok', week: 'W6', day: 'Wed', format: '30s Video', theme: 'Visible', headline: '3 ways to make your learning visible', visualPrompt: 'Listicle style. 1, 2, 3 fingers.', caption: 'Credential, pathway, share weekly proof.' },
  { platform: 'TikTok', week: 'W6', day: 'Fri', format: '25s Video', theme: 'Role', headline: 'Pick a role → build your pathway', visualPrompt: 'UI flashes with arrows.', caption: 'Goal → steps → recommend course.' },
  { platform: 'TikTok', week: 'W7', day: 'Mon', format: '20s Video', theme: 'Stacking', headline: 'Stacking explained like you’re 5', visualPrompt: 'Simple prop/visual metaphor (lego blocks).', caption: 'Small blocks build big towers.' },
  { platform: 'TikTok', week: 'W7', day: 'Wed', format: '30s Video', theme: 'Proof Friday', headline: 'Proof Friday (yes, on Wednesday)', visualPrompt: 'Community call-to-action.', caption: 'Prompt: "Share one proof link this week."' },
  { platform: 'TikTok', week: 'W7', day: 'Fri', format: '25s Video', theme: 'Spotlight', headline: 'Course spotlight: the skill that stacks best', visualPrompt: 'Course card + ladder graphic.', caption: 'Explain why it stacks + next step credential.' },
  { platform: 'TikTok', week: 'W8', day: 'Mon', format: '25s Video', theme: 'Viral', headline: 'Verifiable ≠ viral — but it wins jobs', visualPrompt: 'Calm, confident tone.', caption: 'Lean into trust and evidence; end CTA.' },
  { platform: 'TikTok', week: 'W8', day: 'Wed', format: '30s Video', theme: 'Revocation', headline: 'How your credential can be revoked', visualPrompt: 'Trust-building explanation. Security shield.', caption: 'Explain revocation = integrity.' },
  { platform: 'TikTok', week: 'W8', day: 'Fri', format: '20s Video', theme: 'Collection', headline: 'Stop collecting certificates. Start collecting proof.', visualPrompt: 'Bold text overlays.', caption: 'Hard hook + CTA.' },
  { platform: 'TikTok', week: 'W9', day: 'Mon', format: '25s Video', theme: 'Plan', headline: 'Build a 30-day plan (copy this)', visualPrompt: 'Calendar overlay.', caption: '3 steps + CTA.' },
  { platform: 'TikTok', week: 'W9', day: 'Wed', format: '30s Video', theme: 'Machine', headline: 'What “machine-readable skills” does for you', visualPrompt: 'Simple animated diagram. Robots reading text.', caption: 'Explainer: easier matching + clearer proof.' },
  { platform: 'TikTok', week: 'W9', day: 'Fri', format: '20s Video', theme: 'Share', headline: 'Share this with someone job hunting', visualPrompt: 'Friend-to-friend tone.', caption: 'Quick pitch + CTA.' },
  { platform: 'TikTok', week: 'W10', day: 'Mon', format: '30s Video', theme: 'LinkedIn', headline: 'How to post your credential on LinkedIn', visualPrompt: 'Template overlay + example post.', caption: 'Give the exact post structure + CTA.' },
  { platform: 'TikTok', week: 'W10', day: 'Wed', format: '25s Video', theme: 'Gap', headline: 'Skill gap = opportunity map', visualPrompt: 'Map metaphor graphics.', caption: 'Normalize gap; recommend "one next step".' },
  { platform: 'TikTok', week: 'W10', day: 'Fri', format: '20s Video', theme: 'Stacks', headline: 'One course that stacks into a pathway', visualPrompt: 'Ladder animation.', caption: 'Course → next 2 steps; CTA.' },
  { platform: 'TikTok', week: 'W11', day: 'Mon', format: '25s Video', theme: 'Future', headline: 'Your future job might not exist yet', visualPrompt: 'Trend-style hook; captions.', caption: 'So build portable proof, not a static title.' },
  { platform: 'TikTok', week: 'W11', day: 'Wed', format: '30s Video', theme: 'Confidence', headline: 'Proof beats confidence (and builds it)', visualPrompt: 'Loop animation.', caption: 'Explain confidence loop: learn → prove → share → opportunities.' },
  { platform: 'TikTok', week: 'W11', day: 'Fri', format: '20s Video', theme: 'Apply', headline: 'Do this before you apply for your next role', visualPrompt: 'Fast actionable clip.', caption: 'Create wallet + add proof link.' },
  { platform: 'TikTok', week: 'W12', day: 'Mon', format: '30s Video', theme: 'Recap', headline: '12-week recap: what you can do now', visualPrompt: 'Montage recap.', caption: 'Wallet + first credential + first stack + share proof.' },
  { platform: 'TikTok', week: 'W12', day: 'Wed', format: '25s Video', theme: 'Next 90', headline: 'Your next 90 days (simple plan)', visualPrompt: 'Calendar overlay.', caption: '3-step plan + CTA to pathways.' },
  { platform: 'TikTok', week: 'W12', day: 'Fri', format: '20s Video', theme: 'Start', headline: 'Start now: 2 minutes to build proof', visualPrompt: 'Timer overlay + screen capture.', caption: 'Direct CTA, minimal words.' },
];

const AdminTraining: React.FC<AdminTrainingProps> = ({ onSendToAI }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'knowledge' | 'planner'>('knowledge');
  const [strategyText, setStrategyText] = useState(OFFICIAL_STRATEGY_TEXT);
  const [error, setError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [plannerStep, setPlannerStep] = useState(2);
  const [targetAudience, setTargetAudience] = useState('');
  const [goals, setGoals] = useState('');
  const [platforms, setPlatforms] = useState('LinkedIn, Twitter/X');
  const [generatedPlan, setGeneratedPlan] = useState<PlanItem[]>(OFFICIAL_CALENDAR_DATA);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<'LinkedIn' | 'Instagram' | 'TikTok' | 'Facebook'>('LinkedIn');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterTheme, setFilterTheme] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedStrategy = localStorage.getItem('veri_brand_strategy');
    if (storedStrategy) {
        setStrategyText(storedStrategy);
    } else {
        localStorage.setItem('veri_brand_strategy', OFFICIAL_STRATEGY_TEXT);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ABCmanagement') {
      setIsLocked(false);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleSave = () => {
    localStorage.setItem('veri_brand_strategy', strategyText);
    setSuccessMsg('Strategy saved. AI context updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClear = () => {
    if (window.confirm("Reset to Official Default?")) {
        setStrategyText(OFFICIAL_STRATEGY_TEXT);
        localStorage.setItem('veri_brand_strategy', OFFICIAL_STRATEGY_TEXT);
        setSuccessMsg('Reset to Default.');
        setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const appendToStrategy = (sourceName: string, content: string) => {
      const timestamp = new Date().toLocaleString();
      const header = `\n\n[SOURCE: ${sourceName} | ${timestamp}]\n==================================================\n`;
      setStrategyText((prev) => (prev || "") + header + content.trim());
  };

  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let extractedText = "";
      const arrayBuffer = await file.arrayBuffer();

      if (fileType === 'pdf') {
        extractedText = await extractTextFromPdf(arrayBuffer);
      } else if (fileType === 'docx' || fileType === 'doc') {
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        extractedText = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.readAsText(file);
        });
      }
      appendToStrategy(file.name, extractedText);
      setSuccessMsg(`Imported ${file.name}`);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Error parsing file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleAddUrl = () => {
      if (!urlInput) return;
      appendToStrategy("URL Reference", `${urlInput}\n(AI Instruction: Contextualize knowledge from this URL pattern)`);
      setUrlInput('');
      setShowUrlInput(false);
      setSuccessMsg('URL added.');
      setTimeout(() => setSuccessMsg(''), 3000);
  };

  const generatePlan = async () => {
    setIsGeneratingPlan(true);
    try {
        const prompt = `
            You are a Senior Content Strategist for app.microcredentials.io.
            Based on our STRATEGY KNOWLEDGE BASE:
            ${strategyText.substring(0, 10000)}... (truncated for context)

            Create a 7-Day Growth Content Plan using Australian English spelling and grammar (e.g. 'optimise', 'colour', 'centre').
            Target Audience: ${targetAudience}
            Goals: ${goals}
            Platforms: ${platforms}

            Return a JSON array of 7 objects ONLY (no prose, no markdown fences). Each object must have:
            - platform (one of 'LinkedIn', 'Instagram', 'TikTok')
            - week (e.g. "Custom")
            - day (e.g. "Day 1")
            - format (e.g. "Post")
            - theme (Short topic)
            - headline (Punchy overlay text, max 8 words)
            - visualPrompt (Detailed scene description for AI image gen, professional style)
            - caption (Social style, max 40 words, AU English)
        `;

        const text = await replicate.generateText({ prompt, maxTokens: 2048 });
        const cleaned = text.replace(/```json|```/g, '').trim();
        const start = cleaned.indexOf('[');
        const end = cleaned.lastIndexOf(']');
        if (start < 0 || end <= start) throw new Error('Model did not return a JSON array.');
        const newItems = JSON.parse(cleaned.slice(start, end + 1)) as PlanItem[];
        setGeneratedPlan([...newItems, ...OFFICIAL_CALENDAR_DATA]);
        setPlannerStep(2);
    } catch (e: any) {
        console.error(e);
        alert(`Failed to generate plan: ${e?.message || e}`);
    } finally {
        setIsGeneratingPlan(false);
    }
  };

  const exportPDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 30, 61);
      doc.setFontSize(20);
      doc.text(`Production Schedule - ${activePlatformTab}`, 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 191, 255);
      doc.text(`app.microcredentials.io | Generated: ${timestamp}`, 14, 30);

      const filteredPlan = getVisibleItems();
      
      const tableData = filteredPlan.map(row => [
          `${row.week} ${row.day}`,
          row.format,
          row.headline, 
          row.caption
      ]);

      (doc as any).autoTable({
          startY: 40,
          head: [['When', 'Format', 'Headline', 'Caption']],
          body: tableData,
          headStyles: { fillColor: [15, 30, 61] },
          styles: { fontSize: 9 },
          columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 25 },
              2: { cellWidth: 50 }
          }
      });

      doc.save(`Veri_${activePlatformTab}_Plan_${timestamp}.pdf`);
  };

  const sendToGenerator = (item: PlanItem) => {
      const isCarousel = item.format.toLowerCase().includes('carousel');
      const isVideoFormat = item.format.toLowerCase().includes('video') || item.format.toLowerCase().includes('clip');
      
      let mode: 'image' | 'video' = 'image';
      let prompt = item.visualPrompt;

      if (isCarousel || isVideoFormat) {
          mode = 'video';
          if (isCarousel) {
             prompt = `Create a cinematic video presentation showing these slides in sequence: ${item.visualPrompt}. Professional corporate style.`;
          }
      }

      onSendToAI({
          scenePrompt: prompt,
          headline: item.headline,
          caption: item.caption,
          mode: mode
      });

      const element = document.getElementById('ai-generator');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const uniqueWeeks = [...new Set(OFFICIAL_CALENDAR_DATA.map(item => item.week))].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const uniqueThemes = [...new Set(OFFICIAL_CALENDAR_DATA.map(item => item.theme))].sort();

  const getVisibleItems = () => {
    let items = generatedPlan;

    if (activePlatformTab === 'Facebook') {
      items = items.filter(item => item.platform === 'LinkedIn');
    } else {
      items = items.filter(item => item.platform === activePlatformTab);
    }

    if (filterWeek) {
      items = items.filter(item => item.week === filterWeek);
    }

    if (filterTheme) {
      items = items.filter(item => item.theme === filterTheme);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.headline.toLowerCase().includes(lowercasedTerm) ||
        item.caption.toLowerCase().includes(lowercasedTerm) ||
        item.theme.toLowerCase().includes(lowercasedTerm) ||
        item.visualPrompt.toLowerCase().includes(lowercasedTerm)
      );
    }
    return items;
  };

  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
      <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        06. Strategic Command Hub
      </h2>

      <div className="bg-navy rounded-[20px] shadow-2xl overflow-hidden relative min-h-[600px]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-electric-blue opacity-5 rounded-full blur-[60px]"></div>
        </div>

        {isLocked ? (
          <div className="relative z-10 flex flex-col items-center justify-center h-[600px] p-8 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 text-gold animate-bounce">
                <Lock size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Restricted Access</h3>
            <p className="text-white/60 mb-8">Authorized Brand Managers Only</p>
            
            <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-4">
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className={`w-full p-4 rounded-xl bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 text-center tracking-widest ${error ? 'border-red-400' : 'border-white/20 focus:border-electric-blue'}`}
                />
                <button type="submit" className="w-full bg-electric-blue text-white font-bold py-3 rounded-xl hover:bg-[#00d4ff] transition-colors shadow-lg flex items-center justify-center gap-2">
                    <Unlock size={18} /> Authenticate
                </button>
            </form>
          </div>
        ) : (
          <div className="relative z-10 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button 
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-white text-navy' : 'text-white/60 hover:text-white'}`}
                >
                    <ShieldCheck size={18} /> Strategy Context
                </button>
                <button 
                    onClick={() => setActiveTab('planner')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'planner' ? 'bg-gold text-navy' : 'text-white/60 hover:text-white'}`}
                >
                    <Calendar size={18} /> Production Schedule
                </button>
            </div>

            {activeTab === 'knowledge' && (
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-white/60 text-sm">Official Brand Strategy & Context (Editable)</p>
                        <div className="flex gap-2">
                             {showUrlInput && (
                                <div className="flex items-center bg-white/10 rounded-lg p-1">
                                    <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="bg-transparent text-white text-sm px-2 w-40 focus:outline-none" />
                                    <button onClick={handleAddUrl} className="p-1 hover:text-electric-blue text-white"><Plus size={14}/></button>
                                </div>
                             )}
                             <button onClick={() => setShowUrlInput(!showUrlInput)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg"><LinkIcon size={16} /></button>
                             <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> : <Upload size={16} />} Upload
                             </button>
                             <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                        </div>
                    </div>
                    <textarea 
                        value={strategyText}
                        onChange={(e) => setStrategyText(e.target.value)}
                        className="flex-grow bg-black/20 border border-white/10 rounded-xl p-4 text-white/80 font-mono text-xs focus:border-electric-blue focus:ring-1 focus:ring-electric-blue resize-none min-h-[300px]"
                    />
                    <div className="flex justify-between items-center mt-4">
                        <button onClick={handleClear} className="text-red-400 text-sm hover:underline flex items-center gap-1"><Trash2 size={14}/> Reset Default</button>
                        <div className="text-green-400 text-sm font-bold">{successMsg}</div>
                        <button onClick={handleSave} className="bg-electric-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-[#00d4ff] flex items-center gap-2"><Save size={16}/> Save Context</button>
                    </div>
                </div>
            )}

            {activeTab === 'planner' && (
                <div className="h-full flex flex-col">
                    {plannerStep === 1 && (
                        <div className="max-w-2xl mx-auto w-full space-y-6 py-8">
                            <h3 className="text-2xl text-white font-bold text-center">Generate New Plan</h3>
                            <div>
                                <label className="text-gold text-sm font-bold uppercase">Target Audience</label>
                                <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white mt-1" placeholder="e.g. L&D Managers, HR Directors..." />
                            </div>
                            <div>
                                <label className="text-gold text-sm font-bold uppercase">Campaign Goal</label>
                                <input value={goals} onChange={e => setGoals(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white mt-1" placeholder="e.g. Increase demo signups, brand awareness..." />
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setPlannerStep(2)} 
                                    className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={generatePlan} 
                                    disabled={isGeneratingPlan}
                                    className="flex-1 bg-gradient-to-r from-electric-blue to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                >
                                    {isGeneratingPlan ? <><Wand2 className="animate-spin"/> Drafting...</> : <><Wand2 /> Generate Plan</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {plannerStep === 2 && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                                <h4 className="text-white font-bold text-lg">12-Week Social Media Calendar</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => setPlannerStep(1)} className="text-white/60 hover:text-white text-sm px-3 flex items-center gap-1"><Plus size={14}/> New Custom Plan</button>
                                    <button onClick={exportPDF} className="bg-white text-navy px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-100">
                                        <Download size={16}/> Export PDF
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mb-4 p-4 bg-white/5 rounded-xl border border-white/10 flex-wrap">
                                <div className="relative flex-grow min-w-[200px]">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search content, theme, headline..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded-lg p-2 pl-10 text-white placeholder-white/40 w-full"
                                    />
                                </div>
                                <select
                                    value={filterWeek}
                                    onChange={(e) => setFilterWeek(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg p-2 text-white min-w-[120px]"
                                >
                                    <option value="">All Weeks</option>
                                    {uniqueWeeks.map(week => <option key={week} value={week}>{week}</option>)}
                                </select>
                                <select
                                    value={filterTheme}
                                    onChange={(e) => setFilterTheme(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg p-2 text-white flex-grow min-w-[150px]"
                                >
                                    <option value="">All Themes</option>
                                    {uniqueThemes.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl w-fit">
                                <button onClick={() => setActivePlatformTab('LinkedIn')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${activePlatformTab === 'LinkedIn' ? 'bg-[#0077b5] text-white' : 'text-white/50 hover:bg-white/10'}`}>
                                    <Linkedin size={16} /> LinkedIn (RTO)
                                </button>
                                <button onClick={() => setActivePlatformTab('Instagram')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${activePlatformTab === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-white/50 hover:bg-white/10'}`}>
                                    <Instagram size={16} /> Instagram
                                </button>
                                <button onClick={() => setActivePlatformTab('TikTok')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${activePlatformTab === 'TikTok' ? 'bg-black border border-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}>
                                    <Video size={16} /> TikTok
                                </button>
                                <button onClick={() => setActivePlatformTab('Facebook')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${activePlatformTab === 'Facebook' ? 'bg-[#1877F2] text-white' : 'text-white/50 hover:bg-white/10'}`}>
                                    <Facebook size={16} /> Facebook
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10 mb-2 h-[500px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse relative">
                                    <thead className="sticky top-0 bg-navy z-10">
                                        <tr className="text-gold border-b border-white/10 text-xs uppercase tracking-wider shadow-sm">
                                            <th className="p-4 font-bold w-32">When</th>
                                            <th className="p-4 font-bold w-32">Format</th>
                                            <th className="p-4 font-bold">Content Strategy</th>
                                            <th className="p-4 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/90 text-sm divide-y divide-white/5">
                                        {getVisibleItems().length > 0 ? getVisibleItems().map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-bold text-electric-blue align-top">
                                                    <div className="text-lg">{item.week}</div>
                                                    <div className="text-white/50 text-xs">{item.day}</div>
                                                </td>
                                                <td className="p-4 align-top font-mono text-xs text-white/70 uppercase">
                                                    <span className="bg-white/10 px-2 py-1 rounded">{item.format}</span>
                                                </td>
                                                <td className="p-4 align-top max-w-xl">
                                                    <div className="text-xs text-gold font-bold mb-1 uppercase tracking-wide">{item.theme}</div>
                                                    <div className="font-bold text-white mb-3 text-base leading-tight">"{item.headline}"</div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-white/5 p-3 rounded-lg">
                                                            <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Visual Direction</div>
                                                            <div className="text-white/80 text-xs italic">{item.visualPrompt}</div>
                                                        </div>
                                                        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-electric-blue">
                                                            <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Caption / Script</div>
                                                            <div className="text-white/80 text-xs">{item.caption}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <button 
                                                        onClick={() => sendToGenerator(item)}
                                                        className="bg-electric-blue hover:bg-[#00d4ff] text-white px-4 py-3 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ml-auto hover:scale-105 whitespace-nowrap"
                                                    >
                                                        <Play size={14} fill="currentColor" /> Produce
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-white/50 italic">
                                                    No content found for the selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTraining;
