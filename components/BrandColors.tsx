import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const colors = [
  { name: 'Navy', hex: '#0F1E3D' },
  { name: 'Electric Blue', hex: '#00BFFF' },
  { name: 'Gold', hex: '#FFC107' },
  { name: 'Soft Blue', hex: '#E6F4FF' },
  { name: 'Light Gray', hex: '#F0F2F5' },
];

const BrandColors: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
       <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        05. Official Color Palette
      </h2>
      
      <div className="bg-soft-blue border-l-4 border-gold p-6 rounded-r-lg mb-10 shadow-sm">
        <h3 className="font-bold text-navy text-lg mb-2 font-heading uppercase tracking-wider">Color System</h3>
        <p className="text-navy/80 text-base leading-relaxed">
          Our palette is rooted in trust (Navy) and innovation (Electric Blue), with Gold acting as a signal of quality and achievement. Click any swatch to copy the HEX code.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {colors.map((color) => (
          <div 
            key={color.hex}
            onClick={() => copyToClipboard(color.hex)}
            className="group cursor-pointer"
          >
            <div 
                className="h-32 rounded-2xl shadow-lg mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl relative border border-black/5"
                style={{ backgroundColor: color.hex }}
            >
                <div className={`
                    absolute inset-0 flex items-center justify-center bg-navy/20 backdrop-blur-[2px] rounded-2xl transition-opacity duration-200
                    ${copied === color.hex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}>
                    <div className="bg-white p-2 rounded-full text-navy shadow-lg">
                        {copied === color.hex ? <Check size={20} /> : <Copy size={20} />}
                    </div>
                </div>
            </div>
            <div className="text-center">
                <h4 className="font-bold text-navy">{color.name}</h4>
                <p className="text-sm text-gray-500 uppercase font-mono tracking-wider">{color.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandColors;