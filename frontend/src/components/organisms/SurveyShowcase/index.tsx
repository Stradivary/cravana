import React from 'react';

interface SurveyShowcaseProps {
  className?: string;
}

export const SurveyShowcase: React.FC<SurveyShowcaseProps> = ({ className = '' }) => {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[32px] border border-amber-100 bg-gradient-to-br from-[#fff7ed] via-white to-rose-50 p-4 shadow-[0_20px_60px_rgba(180,83,9,0.12)] sm:p-5',
        className,
      ].join(' ')}
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />

      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1400&q=80"
          alt="Orang sedang mengadon kue dengan ceria"
          className="h-[240px] w-full rounded-[24px] object-cover sm:h-[300px]"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1400&q=80';
          }}
        />
      </div>
    </div>
  );
};
