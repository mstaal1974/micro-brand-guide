import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-soft-blue border-l-4 border-gold p-6 rounded-r-lg mb-10 shadow-sm">
      <h3 className={`font-bold text-navy text-lg mb-2 font-heading uppercase tracking-wider ${icon ? 'flex items-center gap-2' : ''}`}>
        {icon}
        {title}
      </h3>
      <div className="text-navy/80 text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default Card;
