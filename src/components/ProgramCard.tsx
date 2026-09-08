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
            <div className="h-px flex-1 bg-espresso/10" />
          </div>
          
          <h3 id={`program-title-${program.id}`} className="text-2xl font-condensed font-black text-espresso uppercase tracking-tight mb-2.5 leading-none">
            {program.title}
          </h3>
          
          <p className="text-espresso/70 text-xs font-bold leading-relaxed mb-5 italic">
            {program.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-6">
            {program.features.slice(0, 3).map((feature, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${theme.bg} ${theme.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${theme.text}`} />
                <span className="text-[9px] font-black text-espresso/70 uppercase tracking-wider">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <NavLink 
          to={`/register?program=${encodeURIComponent(program.id)}`} 
          className={`relative inline-flex items-center justify-between w-full bg-espresso text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] overflow-hidden group/btn ${theme.btn} transition-all`}
        >
          <span className="relative z-10">Enroll for Phase 0{index + 1}</span>
          <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-all" />
        </NavLink>
      </div>
    </motion.div>
  );

};

export default ProgramCard;
