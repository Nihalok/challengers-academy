import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Program } from '../types';
import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface ProgramCardProps {
  program: Program;
  index: number;
}

const PHASE_THEMES = [
  { text: 'text-[#F9BC00]', bg: 'bg-[#F9BC00]/15', border: 'border-[#F9BC00]/30', btn: 'hover:bg-[#F9BC00] hover:text-espresso' },
  { text: 'text-[#D62828]', bg: 'bg-[#D62828]/15', border: 'border-[#D62828]/30', btn: 'hover:bg-[#D62828] hover:text-white' },
  { text: 'text-[#071A2D]', bg: 'bg-[#071A2D]/15', border: 'border-[#071A2D]/30', btn: 'hover:bg-[#071A2D] hover:text-white' },
  { text: 'text-[#F3722C]', bg: 'bg-[#F3722C]/15', border: 'border-[#F3722C]/30', btn: 'hover:bg-[#F3722C] hover:text-white' },
  { text: 'text-[#0B5D51]', bg: 'bg-[#0B5D51]/15', border: 'border-[#0B5D51]/30', btn: 'hover:bg-[#0B5D51] hover:text-white' },
];

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index }) => {
  const [mousePos, setMousePos] = useState({ x: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = PHASE_THEMES[index % PHASE_THEMES.length];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-[1.8rem] overflow-hidden border border-espresso/10 hover:border-espresso/30 transition-all duration-500 flex flex-col h-full shadow-md hover:shadow-xl"
      role="article"
      aria-labelledby={`program-title-${program.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={program.image} 
          alt={program.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Age Badge */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-espresso">
              Ages {program.ageRange}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`font-condensed text-xs font-black tracking-widest uppercase ${theme.text}`}>
              Phase 0{index + 1}
            </span>
            <div className="h-px flex-1 bg-espresso/15" />
          </div>
          
          <h3 id={`program-title-${program.id}`} className="text-xl sm:text-2xl font-condensed font-black text-espresso uppercase tracking-tight mb-2.5 leading-tight">
            {program.title}
          </h3>
          
          <p className="text-espresso font-bold text-xs sm:text-sm leading-relaxed mb-5">
            {program.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-6">
            {program.features.slice(0, 3).map((feature, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${theme.bg} ${theme.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${theme.text}`} />
                <span className="text-[9.5px] font-black text-espresso uppercase tracking-wider">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <NavLink 
          to={`/register?program=${encodeURIComponent(program.id)}`} 
          className="relative inline-flex items-center justify-between w-full bg-gradient-to-r from-[#F3722C] via-[#FF6A00] to-[#E05200] text-white px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.16em] text-[10px] sm:text-[11px] overflow-hidden group/btn shadow-[0_8px_22px_rgba(243,114,44,0.4)] hover:shadow-[0_16px_32px_rgba(243,114,44,0.6),0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0.5 active:scale-95 transition-all duration-300 border-t border-white/35"
        >
          <span className="relative z-10 font-black">Enroll for Phase 0{index + 1}</span>
          <div className="relative z-10 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-[#F3722C] transition-all shadow-sm">
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </div>
        </NavLink>
      </div>
    </motion.div>
  );

};

export default ProgramCard;
