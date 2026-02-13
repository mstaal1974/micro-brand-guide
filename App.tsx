
import React, { useState } from 'react';
import Header from './components/Header';
import SectionOne from './components/SectionOne';
import SectionTwo from './components/SectionTwo';
import SectionThree from './components/SectionThree';
import Typography from './components/Typography';
import AIGenerator from './components/AIGenerator';
import BrandColors from './components/BrandColors';
import AdminTraining from './components/AdminTraining';
import Footer from './components/Footer';

export interface PrefillData {
  scenePrompt?: string;
  headline?: string;
  caption?: string;
  mode?: 'image' | 'video';
}

const App: React.FC = () => {
  // Global state to handle "Send to AI" workflow from Strategy Hub
  const [generatorPrefill, setGeneratorPrefill] = useState<PrefillData | null>(null);

  return (
    <div className="max-w-[1150px] mx-auto bg-white shadow-2xl min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="character">
            <SectionOne />
        </section>
        <section id="imagery">
            <SectionTwo />
        </section>
        <section id="examples">
            <SectionThree />
        </section>
        <section id="typography">
            <Typography />
        </section>
        <section id="ai-generator" className="scroll-mt-32">
            <AIGenerator prefillData={generatorPrefill} />
        </section>
        <section id="colors">
            <BrandColors />
        </section>
        <section id="strategy">
            <AdminTraining onSendToAI={(data) => setGeneratorPrefill(data)} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default App;
