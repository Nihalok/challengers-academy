import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Play, Trophy, Target, Users } from 'lucide-react';
import { ASSETS } from '../assets/images';

export default function ModernHero() {
  return (
    <section className="relative min-h-[calc(100vh-104px)] lg:h-[calc(100vh-104px)] flex items-center overflow-hidden bg-white mt-[104px]">
      {/* ── Background Atmospheric Color Shading & Ambient Glow ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Red/Orange glow top-left */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #C1272D 0%, #F26627 60%, transparent 80%)' }}
        />
        {/* Soft Rainbow/Blue glow bottom-left matching the floor splash */}
        <div 
          className="absolute -bottom-20 left-10 w-[480px] h-72 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(ellipse at center, #0066cc 0%, #00cc66 40%, #ffcc00 70%, transparent 90%)' }}
        />
        {/* Radial highlight behind emblem */}
        <div 
          className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #C1272D 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Desktop Artwork Image (modern1.png) ── */}
      <div className="hidden lg:flex absolute inset-0 z-0 pointer-events-none items-center justify-end overflow-hidden">
        <img
          src={ASSETS.HERO.BACKGROUND}
          alt="Challengers Volleyball Academy Desktop"
          loading="eager"
          className="h-full w-auto max-w-none object-contain object-right opacity-100"
          style={{
            maxHeight: 'calc(100vh - 104px)',
          }}
        />
      </div>

      {/* ── Mobile Artwork Image (modern hero.png) ── */}
      <div className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img
          src={ASSETS.HERO.MOBILE_BACKGROUND}
          alt="Challengers Volleyball Academy Mobile"
          loading="eager"
          className="h-full w-full object-cover object-center opacity-95"
        />
      </div>

      {/* ── Desktop Shading Overlay (Unchanged for Desktop) ── */}
      <div 
        className="hidden lg:block absolute inset-y-0 left-0 w-[55%] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #ffffff 0%, #ffffff 32%, rgba(255,255,255,0.96) 42%, rgba(255,255,255,0.75) 58%, rgba(255,255,255,0.25) 80%, transparent 100%)',
        }}
      />

      {/* ── Mobile Shading Overlay (Soft Top-to-Bottom Fade for Mobile Text Alignment) ── */}
      <div 
        className="lg:hidden absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.15) 75%, transparent 100%)',
        }}
      />

      {/* ── Interactive Content Layer (Left Zone) ── */}
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 relative z-20 flex flex-col justify-start lg:justify-center min-h-[calc(100vh-104px)] lg:min-h-0 pt-2 sm:pt-4 lg:py-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg lg:max-w-xl flex flex-col items-start text-left w-full h-full min-h-[calc(100vh-140px)] lg:min-h-0"
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#C1272D]/20 bg-white/95 shadow-sm text-[#C1272D] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C1272D] animate-pulse" />
            Challengers Volleyball Academy
          </div>

          {/* Main headline - Positioned on Top White Area of hero mob.png */}
          <h1 className="text-3xl sm:text-5xl lg:text-[4.5rem] xl:text-[5rem] font-condensed font-black leading-[0.9] tracking-tighter text-[#1a1a2e] mb-2 sm:mb-4 uppercase">
            TRAIN HARD <br />
            <span className="text-[#C1272D] drop-shadow-[0_4px_24px_rgba(193,39,45,0.25)]">
              PLAY BETTER
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#1a1a2e]/90 text-[11px] sm:text-sm font-bold tracking-wider uppercase leading-relaxed mb-4 sm:mb-7 max-w-md">
            Real coaching. Real improvement. <br className="hidden sm:inline" />
            For kids and adults of all skill levels.
          </p>

          {/* Action CTAs - Side-by-Side Aligned on Desktop */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 lg:mb-10 w-full">
            {/* Enroll Now CTA - Desktop Only (Mobile has top fixed Enroll button) */}
            <div className="hidden lg:block">
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 bg-[#C1272D] hover:bg-[#a01e24] text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_8px_25px_rgba(193,39,45,0.35)] hover:shadow-[0_12px_32px_rgba(193,39,45,0.5)] active:scale-95 group"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </div>

            {/* About Us CTA - Highlighted & Aligned on both Desktop & Mobile */}
            <div className="mt-auto lg:mt-0 w-full lg:w-auto flex justify-start">
              <NavLink
                to="/about"
                className="inline-flex items-center gap-3 bg-white/95 hover:bg-white text-[#1a1a2e] hover:text-[#C1272D] font-black text-xs uppercase tracking-widest px-6 py-3.5 sm:py-4 rounded-full shadow-lg border border-black/10 transition-all group backdrop-blur-md hover:shadow-xl active:scale-95"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#1a1a2e]/15 bg-white flex items-center justify-center group-hover:border-[#C1272D] group-hover:bg-[#C1272D]/10 transition-all shadow-sm shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-[#C1272D]" />
                </div>
                <span>About us</span>
              </NavLink>
            </div>
          </div>

          {/* Bottom 3 Feature Badges - Hidden on mobile view (< sm), intact on desktop/tablet (sm+) */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 sm:p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C1272D]/10 text-[#C1272D] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1a1a2e] leading-tight">Expert Coaching</h4>
                <p className="text-[10px] font-bold text-[#1a1a2e]/75 leading-tight truncate">Learn from the best</p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 sm:p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C1272D]/10 text-[#C1272D] flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1a1a2e] leading-tight">All Skill Levels</h4>
                <p className="text-[10px] font-bold text-[#1a1a2e]/75 leading-tight truncate">Kids to Adults</p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 sm:p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C1272D]/10 text-[#C1272D] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1a1a2e] leading-tight">Stronger Together</h4>
                <p className="text-[10px] font-bold text-[#1a1a2e]/75 leading-tight truncate">Build Confidence</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
