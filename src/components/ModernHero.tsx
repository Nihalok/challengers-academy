import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Play, Trophy, Target, Users } from 'lucide-react';
import { ASSETS } from '../assets/images';

export default function ModernHero() {
  return (
    <section className="relative min-h-[calc(100vh-96px)] lg:h-[calc(100vh-96px)] flex items-center overflow-hidden mt-[96px] sm:mt-[100px]" style={{ background: 'linear-gradient(135deg, #fff8f0 0%, #fdf3ea 30%, #fff5f5 65%, #fef9f0 100%)' }}>
      {/* ── Background Atmospheric Glows (Premium Warm Light) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Warm crimson glow top-left */}
        <div 
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] opacity-30"
          style={{ background: 'radial-gradient(circle, #ff9a9e 0%, #C1272D 50%, transparent 85%)' }}
        />
        {/* Warm golden amber glow bottom-left */}
        <div 
          className="absolute -bottom-28 -left-10 w-[560px] h-[400px] rounded-full blur-[120px] opacity-25"
          style={{ background: 'radial-gradient(ellipse at center, #ffd89b 0%, #f8a84b 50%, transparent 90%)' }}
        />
        {/* Soft peach glow right */}
        <div 
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-20"
          style={{ background: 'radial-gradient(circle, #ffc3a0 0%, #ff9a9e 40%, transparent 75%)' }}
        />
        {/* Subtle warm white center gloss */}
        <div 
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.7) 0%, transparent 60%)' }}
        />
      </div>

      {/* ── Desktop Artwork Image (modern1.png) ── */}
      <div className="hidden lg:flex absolute inset-0 z-0 pointer-events-none items-center justify-end overflow-hidden">
        <img
          src={ASSETS.HERO.BACKGROUND}
          alt="Challengers Volleyball Academy Desktop"
          loading="eager"
          className="h-full w-auto max-w-none object-contain object-right opacity-100 min-h-full"
          style={{
            maxHeight: 'calc(100vh - 96px)',
          }}
        />
      </div>

      {/* ── Mobile Artwork Image (hero mob.png) ── */}
      <div className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img
          src={ASSETS.HERO.MOBILE_BACKGROUND}
          alt="Challengers Volleyball Academy Mobile"
          loading="eager"
          className="h-full w-full object-cover object-center opacity-95"
        />
      </div>

      {/* ── Desktop Shading Overlay (Warm Light Fade) ── */}
      <div 
        className="hidden lg:block absolute inset-y-0 left-0 w-[62%] xl:w-[56%] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(255,248,240,0.97) 0%, rgba(255,248,240,0.93) 28%, rgba(255,248,240,0.82) 44%, rgba(255,248,240,0.45) 62%, rgba(255,248,240,0.1) 82%, transparent 100%)',
        }}
      />

      {/* ── Mobile Shading Overlay (Warm Light Fade) ── */}
      <div 
        className="lg:hidden absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,248,240,0.90) 0%, rgba(255,248,240,0.65) 40%, rgba(255,248,240,0.2) 75%, transparent 100%)',
        }}
      />

      {/* ── Interactive Content Layer (Left Zone) ── */}
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 relative z-20 flex flex-col justify-start lg:justify-center min-h-[calc(100vh-96px)] lg:min-h-0 py-4 lg:py-6 xl:py-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg lg:max-w-xl xl:max-w-2xl flex flex-col items-start text-left w-full h-full min-h-[calc(100vh-140px)] lg:min-h-0 hero-desktop-compact"
        >
          {/* Main headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4.5rem] 2xl:text-[5rem] font-condensed font-black leading-[0.9] tracking-tighter mb-2 lg:mb-3 xl:mb-4 uppercase shrink-0" style={{ color: '#1a0a00' }}>
            TRAIN HARD <br />
            <span style={{ color: '#C1272D', textShadow: '0 2px 20px rgba(193,39,45,0.20)' }}>
              PLAY BETTER
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs xl:text-sm font-bold tracking-wider uppercase leading-relaxed mb-4 lg:mb-5 xl:mb-7 max-w-md shrink-0" style={{ color: 'rgba(60,30,10,0.65)' }}>
            Real coaching. Real improvement. <br className="hidden sm:inline" />
            For kids and adults of all skill levels.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:gap-6 mb-5 lg:mb-7 xl:mb-10 w-full shrink-0">
            {/* Enroll Now CTA */}
            <div className="hidden lg:block">
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 text-white px-6 xl:px-9 py-3 xl:py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 group"
                style={{ background: 'linear-gradient(135deg, #C1272D 0%, #a01e24 100%)', boxShadow: '0 8px 28px rgba(193,39,45,0.35), 0 0 0 1px rgba(255,120,100,0.1) inset' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 36px rgba(193,39,45,0.50), 0 0 0 1px rgba(255,120,100,0.2) inset')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(193,39,45,0.35), 0 0 0 1px rgba(255,120,100,0.1) inset')}
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </div>

            {/* About Us CTA */}
            <div className="mt-auto lg:mt-0 w-full lg:w-auto flex justify-start">
              <NavLink
                to="/about"
                className="inline-flex items-center gap-2.5 xl:gap-3 font-black text-xs uppercase tracking-widest px-5 xl:px-6 py-3 xl:py-4 rounded-full transition-all group backdrop-blur-sm hover:shadow-lg active:scale-95 border"
                style={{ background: 'rgba(255,255,255,0.75)', borderColor: 'rgba(193,39,45,0.18)', color: 'rgba(60,20,10,0.80)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.color = 'rgba(60,20,10,0.80)'; }}
              >
                <div className="w-7 h-7 xl:w-9 xl:h-9 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0" style={{ background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.20)' }}>
                  <Play className="w-3 h-3 xl:w-3.5 xl:h-3.5 fill-current ml-0.5 text-[#C1272D]" />
                </div>
                <span>About us</span>
              </NavLink>
            </div>
          </div>

          {/* Bottom 3 Feature Badges — Warm Glass */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-2.5 xl:gap-3 w-full shrink-0">
            <div className="backdrop-blur-sm rounded-2xl p-2.5 xl:p-3.5 flex items-center gap-2.5 xl:gap-3" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(193,39,45,0.12)', boxShadow: '0 4px 20px rgba(180,60,0,0.08)' }}>
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(193,39,45,0.10)', color: '#C1272D' }}>
                <Trophy className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] xl:text-[11px] font-black uppercase tracking-wider leading-tight" style={{ color: '#1a0a00' }}>Expert Coaching</h4>
                <p className="text-[9px] xl:text-[10px] font-bold leading-tight truncate" style={{ color: 'rgba(60,30,10,0.55)' }}>Learn from the best</p>
              </div>
            </div>

            <div className="backdrop-blur-sm rounded-2xl p-2.5 xl:p-3.5 flex items-center gap-2.5 xl:gap-3" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(193,39,45,0.12)', boxShadow: '0 4px 20px rgba(180,60,0,0.08)' }}>
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(193,39,45,0.10)', color: '#C1272D' }}>
                <Target className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] xl:text-[11px] font-black uppercase tracking-wider leading-tight" style={{ color: '#1a0a00' }}>All Skill Levels</h4>
                <p className="text-[9px] xl:text-[10px] font-bold leading-tight truncate" style={{ color: 'rgba(60,30,10,0.55)' }}>Kids to Adults</p>
              </div>
            </div>

            <div className="backdrop-blur-sm rounded-2xl p-2.5 xl:p-3.5 flex items-center gap-2.5 xl:gap-3" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(193,39,45,0.12)', boxShadow: '0 4px 20px rgba(180,60,0,0.08)' }}>
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(193,39,45,0.10)', color: '#C1272D' }}>
                <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] xl:text-[11px] font-black uppercase tracking-wider leading-tight" style={{ color: '#1a0a00' }}>Stronger Together</h4>
                <p className="text-[9px] xl:text-[10px] font-bold leading-tight truncate" style={{ color: 'rgba(60,30,10,0.55)' }}>Build Confidence</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) and (max-height: 850px) {
          .hero-desktop-compact h1 {
            font-size: 3.2rem !important;
            line-height: 0.9 !important;
            margin-bottom: 0.5rem !important;
          }
          .hero-desktop-compact p {
            margin-bottom: 0.85rem !important;
          }
          .hero-desktop-compact > div:first-child {
            margin-bottom: 0.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}

