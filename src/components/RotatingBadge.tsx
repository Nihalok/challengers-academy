import React from 'react';
import { motion } from 'motion/react';

export default function RotatingBadge() {
  return (
    <div className="relative w-[92px] h-[92px] sm:w-28 sm:h-28 flex items-center justify-center select-none group">
      {/* Frosted badge backing ensuring crisp contrast and isolation from any background */}
      <div className="absolute inset-0 rounded-full bg-white/92 backdrop-blur-md shadow-[0_4px_20px_rgba(193,39,45,0.18)] border border-red-500/20" />

      {/* Rotating Circular Text & Orbit Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[3px] flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <path
              id="challengers-badge-path"
              d="M 50, 50 m -36.5, 0 a 36.5,36.5 0 1,1 73,0 a 36.5,36.5 0 1,1 -73,0"
              fill="transparent"
            />
          </defs>

          {/* Outer subtle orbital ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="none" 
            stroke="#d97706" 
            strokeWidth="0.75" 
            strokeDasharray="2 3" 
            opacity="0.45" 
          />

          {/* Circular Text with beautiful typography */}
          <text 
            className="font-black uppercase text-[7px] tracking-[0.14em]"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            <textPath 
              xlinkHref="#challengers-badge-path" 
              startOffset="0%" 
              textLength="228" 
              lengthAdjust="spacing"
            >
              <tspan fill="#C1272D" fontWeight="900">CHALLENGERS ACADEMY</tspan>
              <tspan fill="#d97706"> ★ </tspan>
              <tspan fill="#1a0a00" fontWeight="800">EST. 2024</tspan>
              <tspan fill="#d97706"> ★ </tspan>
              <tspan fill="#C1272D" fontWeight="900">VOLLEYBALL</tspan>
              <tspan fill="#d97706"> ★ </tspan>
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Center Medallion — Athletic Volleyball Crest */}
      <motion.div 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#d32f2f] via-[#C1272D] to-[#821317] p-0.5 shadow-[0_3px_12px_rgba(193,39,45,0.45)] border-2 border-amber-400/90 flex items-center justify-center overflow-hidden"
      >
        {/* Subtle radial inner glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Stylized Volleyball Icon */}
        <svg 
          viewBox="0 0 32 32" 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Ball Outer Circle */}
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.8" />
          {/* Volleyball Classic 3-Panel Seams */}
          <path d="M16 3 C16 11, 16 21, 16 29" stroke="currentColor" opacity="0.9" />
          <path d="M4 11 C12 13, 22 13, 29 9" stroke="currentColor" opacity="0.9" />
          <path d="M4 22 C11 19, 21 20, 28 23" stroke="currentColor" opacity="0.9" />
          {/* Center core star or accent */}
          <circle cx="16" cy="16" r="2.2" fill="#fbbf24" stroke="none" />
        </svg>
      </motion.div>
    </div>
  );
}

