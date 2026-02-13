import React from 'react';

const SectionOne: React.FC = () => {
  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
      <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        01. Veri — Our Official Brand Character
      </h2>

      <div className="bg-soft-blue border-l-4 border-gold p-6 rounded-r-lg mb-10 shadow-sm">
        <h3 className="font-bold text-navy text-lg mb-2 font-heading uppercase tracking-wider">Style & Imagery Overview</h3>
        <p className="text-navy/80 text-base leading-relaxed">
          The Veri character represents the bridge between human potential and blockchain security. 
          <strong className="text-navy"> Key visual traits:</strong> Photorealistic rendering (never cartoonish), soft yet confident lighting, 
          and a wardrobe palette dominated by Navy and textured fabrics. The 'holographic badge' element serves as the 
          primary visual accent, symbolizing verification.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-12">
        <div>
          <h3 className="font-bold text-2xl text-electric-blue mb-4">The Architect of Potential</h3>
          <p className="text-navy mb-6 leading-relaxed">
            Veri is a confident, intelligent, approachable professional — your peer, not a cartoon. She embodies trust, forward-thinking vision, and human-centred technology.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-lg text-navy leading-relaxed marker:text-electric-blue">
            <li>brown hair in neat waves/style</li>
            <li>Professional textured jacket + premium styling</li>
            <li>Minimalist aesthetic</li>
            <li>clean and uncluttered imagery (brand signature)</li>
          </ul>
        </div>
        <div className="rounded-[18px] overflow-hidden shadow-2xl transform transition hover:scale-[1.01] duration-500 h-[600px]">
          <img 
            src="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/Veri%20Portrait.jpg" 
            alt="Veri Official Portrait" 
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
};

export default SectionOne;