import React from 'react';

const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-gradient-to-br from-navy to-[#1a2b50] text-white pt-[60px] pb-[60px] px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="font-black text-3xl md:text-6xl tracking-tighter bg-gradient-to-r from-electric-blue to-gold bg-clip-text text-transparent m-0 mb-4">
                app.microcredentials.io
            </h1>
            <p className="text-lg md:text-2xl opacity-90 font-semibold max-w-2xl mx-auto leading-relaxed">
                The Architect of Potential — Verifiable, Secure, Empowering
            </p>
            
            <nav className="mt-10 flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base font-bold tracking-wide">
                {['Character', 'Imagery', 'Examples', 'Typography', 'AI Generator', 'Colors', 'Strategy'].map((item) => (
                    <button 
                        key={item}
                        onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                        className="text-white/70 hover:text-electric-blue transition-colors border-b-2 border-transparent hover:border-electric-blue py-1"
                    >
                        {item}
                    </button>
                ))}
            </nav>
        </div>
        
        {/* Abstract Background Decorations */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-electric-blue opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] bg-gold opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
    </header>
  );
};

export default Header;