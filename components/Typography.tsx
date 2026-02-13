import React from 'react';
import { Type, Layout, MousePointer2 } from 'lucide-react';
import Card from './Card';

const Typography: React.FC = () => {
  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
      <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        04. Typography & Layout
      </h2>

      <Card title="The Voice of Veri" icon={<Type size={20} />}>
        <p>
          Our typography balances <strong>authority</strong> with <strong>clarity</strong>. We use <span className="font-montserrat font-bold">Montserrat</span> for bold, impactful headlines that demand attention, and <span className="font-opensans">Open Sans</span> for clean, readable body copy that builds trust.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* PRIMARY FONT */}
        <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <span className="text-xs font-bold text-electric-blue uppercase tracking-widest mb-2 block">Headlines & Display</span>
                <h3 className="text-6xl font-black text-navy font-montserrat">Montserrat</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-4xl font-black text-navy font-montserrat">Aa</span>
                        <span className="text-sm font-mono text-gray-400">900 / Black</span>
                    </div>
                    <p className="font-montserrat font-black text-2xl text-navy">The Architect of Potential</p>
                    <p className="text-xs text-gray-400 mt-1">Used for: Main Headlines, Hero Text, Numerical Stats</p>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-4xl font-bold text-navy font-montserrat">Aa</span>
                        <span className="text-sm font-mono text-gray-400">700 / Bold</span>
                    </div>
                    <p className="font-montserrat font-bold text-2xl text-navy">Secure. Verifiable. Yours.</p>
                    <p className="text-xs text-gray-400 mt-1">Used for: Subheads, Buttons, Navigation</p>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-4xl font-semibold text-navy font-montserrat">Aa</span>
                        <span className="text-sm font-mono text-gray-400">600 / SemiBold</span>
                    </div>
                    <p className="font-montserrat font-semibold text-2xl text-navy">Start your journey today.</p>
                    <p className="text-xs text-gray-400 mt-1">Used for: UI Labels, Small Highlights</p>
                </div>
            </div>
        </div>

        {/* SECONDARY FONT */}
        <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <span className="text-xs font-bold text-electric-blue uppercase tracking-widest mb-2 block">Body & UI Text</span>
                <h3 className="text-6xl font-normal text-navy font-opensans">Open Sans</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-4xl font-bold text-navy font-opensans">Aa</span>
                        <span className="text-sm font-mono text-gray-400">700 / Bold</span>
                    </div>
                    <p className="font-opensans font-bold text-lg text-navy">Critical information requiring emphasis.</p>
                    <p className="text-xs text-gray-400 mt-1">Used for: Inline emphasis, Strong tags</p>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-4xl font-normal text-navy font-opensans">Aa</span>
                        <span className="text-sm font-mono text-gray-400">400 / Regular</span>
                    </div>
                    <p className="font-opensans font-normal text-lg text-navy leading-relaxed">
                        Every badge you earn is an immutable digital asset—owned by you, verifiable forever, and enriched with real skill metadata.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Used for: Paragraphs, Long descriptions</p>
                </div>
            </div>
        </div>
      </div>

      <hr className="my-16 border-gray-200" />

      {/* FORMATTING RULES */}
      <h3 className="font-bold text-navy text-2xl mb-8 font-heading flex items-center gap-2">
         <Layout size={24} className="text-electric-blue"/> UI Formatting & Shapes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Style */}
          <div className="bg-white p-8 rounded-[20px] shadow-[0_20px_50px_rgba(15,30,61,0.15)] flex flex-col justify-center items-center text-center">
              <span className="text-electric-blue font-bold mb-2 text-sm uppercase">Containers</span>
              <p className="text-navy font-bold text-lg">Soft Rounded Corners</p>
              <div className="mt-4 text-xs font-mono bg-gray-100 p-2 rounded text-gray-600">border-radius: 20px</div>
              <p className="text-sm text-gray-500 mt-2">Used for: Cards, Modals, Images</p>
          </div>

          {/* Button Style */}
          <div className="bg-light-gray p-8 rounded-[20px] flex flex-col justify-center items-center text-center">
               <span className="text-electric-blue font-bold mb-4 text-sm uppercase">Interactive</span>
               <button className="bg-electric-blue text-white px-8 py-3 rounded-full font-bold shadow-[0_8px_25px_rgba(0,191,255,0.35)] flex items-center gap-2 hover:scale-105 transition-transform">
                   <MousePointer2 size={16}/> CTA Button
               </button>
               <div className="mt-6 text-xs font-mono bg-white p-2 rounded text-gray-600">rounded-full + shadow-glow</div>
          </div>

          {/* Gradient Style */}
          <div className="bg-gradient-to-br from-navy to-[#1a2b50] p-8 rounded-[20px] text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue opacity-20 blur-[50px] rounded-full"></div>
                <span className="text-gold font-bold mb-2 text-sm uppercase relative z-10">Backgrounds</span>
                <p className="font-bold text-lg relative z-10">Deep Navy Gradient</p>
                <div className="mt-4 text-xs font-mono bg-white/10 p-2 rounded text-white/70 relative z-10">from-navy to-[#1a2b50]</div>
          </div>
      </div>

    </div>
  );
};

export default Typography;