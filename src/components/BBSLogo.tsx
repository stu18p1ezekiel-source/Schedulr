import React from 'react';

interface BBSLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BBSLogo: React.FC<BBSLogoProps> = ({
  className = '',
  showText = false,
  textClassName = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-8 h-10',
    md: 'w-11 h-13',
    lg: 'w-16 h-19',
    xl: 'w-24 h-28',
  };

  const finalClass = className || sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`shrink-0 drop-shadow-xs ${finalClass}`}>
        <svg 
          viewBox="0 0 320 380" 
          className="w-full h-full object-contain"
          aria-label="Bina Bangsa School Crest - BBS Scheduler"
        >
          <defs>
            <clipPath id="bbsShieldClip">
              <path d="M 20 20 L 300 20 L 300 210 C 300 280 220 335 160 365 C 100 335 20 280 20 210 Z" />
            </clipPath>
          </defs>

          {/* Shield Base Content */}
          <g clipPath="url(#bbsShieldClip)">
            {/* Top Left Quadrant: BBS Teal */}
            <rect x="0" y="0" width="160" height="175" fill="#139a91" />
            {/* Top Right Quadrant: Crisp White */}
            <rect x="160" y="0" width="160" height="175" fill="#ffffff" />
            {/* Bottom Left Quadrant: Crisp White */}
            <rect x="0" y="175" width="160" height="210" fill="#ffffff" />
            {/* Bottom Right Quadrant: BBS Teal */}
            <rect x="160" y="175" width="160" height="210" fill="#139a91" />

            {/* Dark Navy Latin Cross */}
            <rect x="115" y="0" width="90" height="380" fill="#082142" />
            <rect x="0" y="95" width="320" height="85" fill="#082142" />

            {/* Open Book in the Center with Chinese Characters "培民" */}
            <g transform="translate(160, 138)">
              {/* Left Page */}
              <path 
                d="M -4 -46 C -32 -54 -68 -48 -84 -40 L -84 18 C -68 10 -32 6 -4 14 Z" 
                fill="#ffffff" 
                stroke="#082142" 
                strokeWidth="4" 
                strokeLinejoin="round" 
              />
              {/* Right Page */}
              <path 
                d="M 4 -46 C 32 -54 68 -48 84 -40 L 84 18 C 68 10 32 6 4 14 Z" 
                fill="#ffffff" 
                stroke="#082142" 
                strokeWidth="4" 
                strokeLinejoin="round" 
              />
              
              {/* Book Details */}
              <path d="M -4 -40 C -30 -47 -64 -42 -76 -36" fill="none" stroke="#082142" strokeWidth="2" />
              <path d="M 4 -40 C 30 -47 64 -42 76 -36" fill="none" stroke="#082142" strokeWidth="2" />
              <line x1="0" y1="-44" x2="0" y2="15" stroke="#082142" strokeWidth="4" strokeLinecap="round" />

              {/* Chinese Characters: 培 民 (Pei Min) */}
              <text 
                x="-44" 
                y="-8" 
                fontFamily="'Source Han Serif SC', 'Noto Serif SC', 'SimSun', 'Songti SC', serif" 
                fontWeight="900" 
                fontSize="34" 
                fill="#082142" 
                textAnchor="middle"
              >
                培
              </text>
              <text 
                x="44" 
                y="-8" 
                fontFamily="'Source Han Serif SC', 'Noto Serif SC', 'SimSun', 'Songti SC', serif" 
                fontWeight="900" 
                fontSize="34" 
                fill="#082142" 
                textAnchor="middle"
              >
                民
              </text>
            </g>

            {/* Bottom BBS Typography in Crisp White on Navy Cross */}
            <g transform="translate(160, 290)">
              <text 
                x="0" 
                y="0" 
                fontFamily="'Times New Roman', 'Source Serif 4', 'Georgia', serif" 
                fontWeight="900" 
                fontSize="52" 
                fill="#ffffff" 
                textAnchor="middle" 
                letterSpacing="3"
              >
                BBS
              </text>
            </g>
          </g>

          {/* Outer Shield Teal Rim */}
          <path 
            d="M 20 20 L 300 20 L 300 210 C 300 280 220 335 160 365 C 100 335 20 280 20 210 Z" 
            fill="none" 
            stroke="#139a91" 
            strokeWidth="16" 
            strokeLinejoin="round" 
          />
          {/* Inner Accent Line */}
          <path 
            d="M 28 28 L 292 28 L 292 208 C 292 274 216 326 160 354 C 104 326 28 274 28 208 Z" 
            fill="none" 
            stroke="#d2f2ef" 
            strokeWidth="2" 
            opacity="0.6" 
          />
        </svg>
      </div>

      {showText && (
        <div className={`flex flex-col ${textClassName}`}>
          <span className="font-serif font-bold text-xl leading-tight text-[#082142] tracking-tight">
            BBS Scheduler
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#0e8b83] uppercase">
            Bina Bangsa School
          </span>
        </div>
      )}
    </div>
  );
};
