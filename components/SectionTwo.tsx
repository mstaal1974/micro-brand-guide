import React from 'react';
import Card from './Card';

const GalleryItem: React.FC<{
  imageSrc: string;
  title: string;
  description: string;
}> = ({ imageSrc, title, description }) => (
  <div className="bg-soft-blue rounded-[18px] overflow-hidden shadow-lg flex flex-col h-full group hover:shadow-xl transition-all duration-300">
    <div className="h-[480px] overflow-hidden">
        <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
    </div>
    <div className="p-6 bg-white flex-grow">
      <h3 className="font-bold text-xl text-electric-blue mb-2">{title}</h3>
      <p className="text-navy">{description}</p>
    </div>
  </div>
);

const SectionTwo: React.FC = () => {
  return (
    <div className="px-8 md:px-[70px] pb-[70px]">
      <h2 className="font-extrabold text-3xl md:text-4xl text-navy border-l-[7px] border-electric-blue pl-6 my-[70px]">
        02. Official Veri Imagery Library
      </h2>

      <Card title="Usage Guidelines">
        <p className="text-navy/80 text-base leading-relaxed">
          This library emphasizes versatility. <strong className="text-navy">Core principles:</strong> All backgrounds are removed to ensure seamless integration 
          with our brand gradients or clean white space. Poses are categorized by intent (Teaching, Vision, Connection, Authority) 
          to match specific communication goals. Maintain a balance between approachability and professional distance.
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-9 my-12">
        {/* Welcome / Teaching Pose */}
        <GalleryItem 
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/Veri%20Teaching.jpg"
          title="Welcome / Teaching Pose"
          description="Perfect for introductions, course launches, community posts"
        />
        
        {/* Thought Leader / Vision */}
        <GalleryItem 
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/Veri%20Thinking.png"
          title="Thought Leader / Vision"
          description="Future-of-work trends, strategy, long-term value"
        />
        
        {/* Approachability / Human Moment */}
        <GalleryItem 
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/Veri%20Relaxed.png"
          title="Approachability / Human Moment"
          description="Community building, testimonials, behind-the-scenes"
        />
        
        {/* Authority / B2B */}
        <GalleryItem 
          imageSrc="https://raw.githubusercontent.com/mstaal1974/Brand-Guide-/main/assets/veri%20authority.png"
          title="Authority / B2B"
          description="Employer-facing, partnerships, institutional trust"
        />
      </div>
    </div>
  );
};

export default SectionTwo;