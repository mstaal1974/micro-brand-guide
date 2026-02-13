import React from 'react';
import { User } from 'lucide-react';

const SocialPost: React.FC<{
  handle: string;
  time: string;
  imageSrc: string;
  overlayText: React.ReactNode;
  caption: React.ReactNode;
  ctaText: string;
}> = ({ handle, time, imageSrc, overlayText, caption, ctaText }) => (
  <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(15,30,61,0.18)] transition-transform duration-300 hover:-translate-y-4 flex flex-col h-full">
    <div className="flex items-center p-5 bg-[#fafafa] border-b border-[#eee]">
      <div className="w-[52px] h-[52px] rounded-full bg-navy mr-3.5 flex items-center justify-center text-white">
          <User size={24} />
      </div>
      <div>
        <div className="font-bold text-[1.05rem] text-navy">{handle}</div>
        <div className="text-[#888] text-sm mt-0.5">{time}</div>
      </div>
    </div>
    <div className="relative h-[540px] bg-navy overflow-hidden group">
      <img 
        src={imageSrc} 
        alt="Post visual" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
      />
      <div className="absolute bottom-[34px] left-[34px] right-[34px] text-white font-extrabold text-3xl md:text-4xl leading-[1.2] shadow-black drop-shadow-lg bg-navy/60 p-7 rounded-2xl backdrop-blur-sm">
        {overlayText}
      </div>
    </div>
    <div className="p-7 text-[1.05rem] bg-white flex-grow flex flex-col justify-between">
      <div className="text-navy mb-6">
        {caption}
      </div>
      <a 
        href="#" 
        className="inline-block text-center bg-electric-blue text-white py-3.5 px-8 rounded-full font-bold shadow-[0_8px_25px_rgba(0,191,255,0.35)] hover:bg-[#00d4ff] hover:-translate-y-1 transition-all w-fit"
      >
        {ctaText}
      </a>
    </div>
  </div>
);

const SectionThree: React.FC = () => {
  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
      <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        03. Live Social Post Examples (2025 Ready)
      </h2>

      <div className="bg-soft-blue border-l-4 border-gold p-6 rounded-r-lg mb-10 shadow-sm">
        <h3 className="font-bold text-navy text-lg mb-2 font-heading uppercase tracking-wider">Social Aesthetic & Tone</h3>
        <p className="text-navy/80 text-base leading-relaxed">
          <strong className="text-navy">Stop the scroll:</strong> Social assets utilize high-contrast overlays using <em>Montserrat ExtraBold</em>. 
          The composition splits focus between the 'Human Element' (Veri) and the 'Message' (Overlay). 
          Copy is punchy, direct, and asset-focused. The UI elements (buttons, badges) use Electric Blue to guide user action.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
        
        {/* Post 1: Skills deserve better */}
        <SocialPost 
          handle="@microcredentials.io"
          time="3h ago"
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/social%20omage%201.png"
          overlayText={<>Your skills deserve<br/>better than a PDF.</>}
          caption={
            <p>
              A resume lists experience.<br/>
              A <strong className="text-electric-blue">verified microcredential proves it</strong> — with immutable evidence, rich skill descriptors, and blockchain-backed trust.<br/><br/>
              This is how you turn learning into real career capital in 2025.
            </p>
          }
          ctaText="Claim Your First Badge →"
        />

        {/* Post 2: Stop collecting titles */}
        <SocialPost 
          handle="@microcredentials.io"
          time="1d ago"
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/stacking.png"
          overlayText={<>Stop collecting titles.<br/>Start building assets.</>}
          caption={
            <p>
              Every badge you earn on app.microcredentials.io is an immutable digital asset — owned by you, verifiable forever, and enriched with real skill metadata.<br/><br/>
              The future of work isn’t about where you studied.<br/>
              It’s about what you can prove.
            </p>
          }
          ctaText="Explore Pathways →"
        />

        {/* Post 3: Your career */}
        <SocialPost 
          handle="@microcredentials.io"
          time="2d ago"
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/badge%20secure.png"
          overlayText={<>Your career.<br/>Your rules.<br/>Your proof.</>}
          caption={
            <p>
              No more gatekeepers. No more outdated transcripts.<br/><br/>
              With Blocksure-powered credentials, you control your professional narrative — instantly shareable, globally trusted, forever yours.
            </p>
          }
          ctaText="Start Building Today →"
        />

      </div>
    </div>
  );
};

export default SectionThree;