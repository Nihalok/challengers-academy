import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { STATS } from './data';
import SectionHeader from './components/SectionHeader';
import { ArrowRight, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import ExpertiseSection from './components/ExpertiseSection';
import Moodboard from './components/Moodboard';
import WaiverBanner from './components/WaiverBanner';
import ModernHero from './components/ModernHero';
import Marquee from './components/Marquee';
import TextReveal from './components/TextReveal';
import MarqueeTestimonials from './components/MarqueeTestimonials';
import RotatingBadge from './components/RotatingBadge';
import SkillRadarChart from './components/SkillRadarChart';
import Counter from './components/Counter';
import AcademyJourney from './components/AcademyJourney';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';

import { ASSETS } from './assets/images';
import OptimizedImage from './components/OptimizedImage';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  useGsapReveal();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"]
  });

  const missionY = useTransform(missionProgress, [0, 1], [-100, 100]);

  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 0.2], [0, -140]);
  const y4 = useTransform(scrollYProgress, [0, 0.2], [0, -80]);

  const r1 = useTransform(scrollYProgress, [0, 0.2], [-8, -15]);
  const r2 = useTransform(scrollYProgress, [0, 0.2], [5, 12]);
  const r3 = useTransform(scrollYProgress, [0, 0.2], [-3, -10]);
  const r4 = useTransform(scrollYProgress, [0, 0.2], [8, 18]);

  return (
    <div ref={containerRef} className="flex flex-col">
      <SEO 
        title="Challengers Volleyball Academy" 
        description="Volleyball coaching for kids and adults. We train at Fremont, Manteca, Mountain House, and San Jose. All skill levels welcome."
      />
      <ModernHero />
      <Marquee 
        text="TRAIN LIKE A PRO • REACH YOUR PEAK • CHALLENGERS ACADEMY • " 
        className="bg-orange rotate-[-1deg] scale-[1.05] z-20 shadow-2xl" 
        speed={25}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-stretch pt-0 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true">
          <OptimizedImage 
            src={ASSETS.HERO.BACKGROUND} 
            alt="Academy Background" 
            priority
            className="w-full h-full object-cover object-center mix-blend-overlay scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/90 to-transparent" />
        </div>

        {/* Left Col: Warm Amber Premium */}
        <div className="flex-1 p-6 sm:p-12 lg:p-20 pt-20 sm:pt-32 flex flex-col justify-between relative border-r overflow-hidden" style={{ background: 'linear-gradient(145deg, #fffbf0 0%, #fff3d6 40%, #fef7e0 70%, #fffaf0 100%)', borderColor: 'rgba(193,39,45,0.08)' }}>
          {/* Stylized Background Image for Yellow Section */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <OptimizedImage 
              src={ASSETS.JOURNEY.STYLIZED_BG} 
              alt="Volleyball Texture" 
              className="w-full h-full object-cover grayscale mix-blend-multiply scale-125 rotate-12"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="text-[10px] mb-3 md:mb-4 tracking-[0.3em] md:tracking-[0.4em] uppercase font-black" style={{ color: 'rgba(193,100,0,0.5)' }}>ELITE TRAINING</div>
            <h1 className="font-condensed text-4xl sm:text-7xl md:text-8xl leading-[0.9] md:leading-[0.85] mb-6 md:mb-8 uppercase tracking-tighter" style={{ color: '#1a0800' }}>
              PLAY <br />
              <span style={{ color: '#C1272D', textShadow: '0 2px 20px rgba(193,39,45,0.18)' }}>BETTER</span> <br />
              <span className="font-serif-italic text-2xl sm:text-5xl md:text-6xl normal-case tracking-normal block mt-2" style={{ color: 'rgba(100,50,0,0.55)' }}>reach higher.</span>
            </h1>
            <p className="text-xs sm:text-sm max-w-[320px] leading-relaxed mb-8 md:mb-10 font-bold" style={{ color: 'rgba(80,40,0,0.60)' }}>
              Good coaching makes a real difference. We work with each player to sharpen their skills and track how far they've come.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8 md:mt-12">
              <NavLink 
                to="/register" 
                className="text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-condensed text-xs tracking-widest flex items-center gap-3 transition-all group shadow-xl"
                style={{ background: 'linear-gradient(135deg, #C1272D 0%, #a01e24 100%)', boxShadow: '0 8px 28px rgba(193,39,45,0.30)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 36px rgba(193,39,45,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(193,39,45,0.30)')}
              >
                BOOK CLASS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-4 items-end mt-10 md:mt-20 relative min-h-[220px] sm:min-h-[250px] md:h-56">
            {[ASSETS.HERO.ACTION_CARD_1, ASSETS.HERO.ACTION_CARD_2, ASSETS.HERO.ACTION_CARD_3, ASSETS.HERO.ACTION_CARD_4].map((img, i) => (
              <motion.div 
                key={i}
                style={{ 
                  rotate: [r1, r2, r3, r4][i], 
                  y: [y1, y2, y3, y4][i],
                  left: `${i * 1.75}rem`,
                  zIndex: (i + 1) * 10
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="absolute bottom-2 w-20 sm:w-32 h-28 sm:h-44 bg-sand rounded-2xl overflow-hidden border border-espresso/10 shadow-2xl will-change-transform"
              >
                <OptimizedImage src={img} alt="Action" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Col: Warm Ivory Premium */}
        <div className="flex-[1.4] p-12 lg:p-20 pt-32 hidden md:flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fdf3ea 40%, #fff5f0 75%, #fef9f0 100%)' }}>
          <div className="absolute inset-0 z-0 opacity-60" aria-hidden="true">
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(circle, rgba(193,39,45,0.08) 0%, rgba(255,150,80,0.05) 60%, transparent 80%)' }} />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(255,200,100,0.10) 0%, transparent 70%)' }} />
          </div>

          <div className="flex justify-between items-start mb-16 relative z-10">
            <div>
              <div className="font-black text-[10px] mb-4 tracking-[0.4em] uppercase" style={{ color: '#C1272D' }}>PRO PERFORMANCE</div>
              <h2 className="font-condensed text-6xl uppercase leading-none tracking-tighter" style={{ color: '#1a0800' }}>
                ELEVATE <br />
                <span className="font-serif-italic lowercase italic tracking-normal text-5xl" style={{ color: '#C1272D' }}>your game.</span>
              </h2>
            </div>
            <div className="flex flex-col items-end gap-6">
              <RotatingBadge />
              <NavLink to="/programs" className="group border-b border-espresso/10 pb-2 text-[10px] font-black uppercase text-espresso tracking-widest hover:border-orange transition-all flex items-center gap-3">
                Browse Programs 
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-orange" />
              </NavLink>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10 flex-grow relative z-10">
            <div className="group p-10 rounded-[3.5rem] flex flex-col justify-between shadow-lg cursor-pointer transition-all duration-500 border"
              style={{ background: 'rgba(255,255,255,0.80)', borderColor: 'rgba(193,39,45,0.10)', boxShadow: '0 12px 40px rgba(180,60,0,0.08)' }}
              onClick={() => window.location.href = '/programs'}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.97)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-10px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 50px rgba(180,60,0,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.80)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(180,60,0,0.08)'; }}
            >
              <div className="relative">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500" style={{ background: 'rgba(193,39,45,0.08)', color: '#C1272D' }}>
                    <span className="text-[10px] font-black tracking-widest">01</span>
                  </div>
                  <div className="w-2 h-2 bg-orange rounded-full animate-ping" />
                </div>
                <h3 className="font-serif-italic text-3xl mt-10 transition-colors" style={{ color: '#1a0800' }}>Setting Basics</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] mt-4 font-black" style={{ color: 'rgba(80,40,0,0.40)' }}>Technique Class</p>
                <p className="text-xs mt-6 leading-relaxed max-w-[200px]" style={{ color: 'rgba(80,40,0,0.60)' }}>We break down the setting motion step by step - great for beginners and players looking to clean up their form.</p>
              </div>
              
              <div className="mt-12 flex items-center gap-4">
                <div className="h-px flex-grow" style={{ background: 'rgba(193,39,45,0.08)' }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C1272D' }}>Enroll</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-orange text-white p-10 rounded-[3.5rem] flex flex-col justify-between shadow-2xl shadow-orange/20 relative overflow-hidden cursor-pointer transition-all duration-500"
              onClick={() => window.location.href = '/performance'}
            >
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-white/40 tracking-[0.4em]">PLAYER HUB</span>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-condensed text-3xl mt-8 leading-[0.9] font-black tracking-tighter uppercase">
                  SEE YOUR <br /> PROGRESS
                </h3>
              </div>
              
              <div className="my-8 transform scale-95" aria-hidden="true">
                <SkillRadarChart />
              </div>

              <div className="space-y-4 relative">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                  <span>Growth Velocity</span>
                  <span>+12.4%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-espresso/5 pt-12 relative z-10">
            <div className="flex items-center gap-16">
              <div>
                <div className="text-5xl font-condensed tracking-tighter leading-none" style={{ color: '#1a0800' }}>1.2k</div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-black mt-3" style={{ color: 'rgba(80,40,0,0.35)' }}>Active Athletes</div>
              </div>
              <div className="w-px h-10" style={{ background: 'rgba(193,39,45,0.12)' }} />
              <div>
                <div className="text-5xl font-condensed tracking-tighter leading-none" style={{ color: '#1a0800' }}>98%</div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-black mt-3" style={{ color: 'rgba(80,40,0,0.35)' }}>Success Rate</div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-black uppercase tracking-widest text-espresso/40 mb-2">Powered By</div>
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-ivory bg-sand overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-ivory bg-orange flex items-center justify-center text-[10px] text-white font-black">+</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Academy Journey Section */}
      <div className="gsap-reveal">
        <AcademyJourney />
      </div>

      {/* Video Statement Section */}
      <section className="bg-espresso py-14 md:py-20 px-4 overflow-hidden gsap-reveal">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">

            {/* Heading */}
            <div className="text-center mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white font-condensed text-3xl md:text-5xl leading-[1.1] mb-4"
              >
                SEE OUR <span className="font-serif-italic text-orange italic">players</span> IN <br />
                REAL ACTION.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-white/60 text-sm leading-relaxed font-medium max-w-xl mx-auto"
              >
                Watch how we train - we focus on the details that make players better, every session.
              </motion.p>
            </div>

            {/* Video Carousel */}
            <VideoCarousel />

          </div>
        </div>
      </section>


      {/* Text Reveal Section */}
      <section className="bg-ivory gsap-reveal">
        <TextReveal text="We help players get better - one session at a time. Our Coaches keep it simple, focused, and built around what each player actually needs." />
      </section>

      {/* Expertise Section (Pinned Panels) */}
      <ExpertiseSection />

      {/* Mission Section */}
      <section ref={missionRef} className="h-[65vh] relative overflow-hidden flex items-center justify-center section-dark">
        <div className="absolute inset-0 z-0">
          <img src={ASSETS.HERO.ACTION_CARD_4} className="w-full h-full object-cover opacity-30 grayscale" />
        </div>
        
        {/* Infinite Horizontal Marquee behind text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-[25vw] font-black uppercase text-white">
            ELITE PERFORMANCE • UNSTOPPABLE DRIVE • MISSION FIRST • 
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-yellow font-condensed text-[10px] sm:text-xs mb-4 sm:mb-6 tracking-[0.35em] sm:tracking-[0.5em] uppercase">What we stand for</div>
            <h2 className="text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-condensed leading-[0.9] md:leading-[0.85] mb-6 sm:mb-10 uppercase tracking-tighter">
              We're here to <span className="font-serif-italic lowercase text-orange italic tracking-normal">help you</span> <br />
              get better.
            </h2>
            <NavLink to="/about" className="group inline-flex items-center gap-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80 hover:text-orange transition-colors">
              Discover Our Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden gsap-reveal" style={{ background: '#FBF9F6' }}>
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none">
          <img 
            src={ASSETS.HERO.TEXTURE_BG} 
            alt="Texture" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="max-w-xl">
              <div className="text-[10px] font-black tracking-[0.4em] md:tracking-[0.5em] uppercase mb-3 md:mb-4 flex items-center gap-3 md:gap-4" style={{ color: '#C1272D' }}>
                <span className="w-8 md:w-10 h-px" style={{ background: 'rgba(193,39,45,0.30)' }} />
                Our Results
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-condensed uppercase leading-[0.9] md:leading-[0.85] tracking-tighter" style={{ color: '#1a0800' }}>
                Real progress <br />
                you can <span className="font-serif-italic normal-case italic" style={{ color: '#C1272D' }}>see.</span>
              </h2>
            </div>
            <div className="max-w-xs">
              <p className="text-[11px] sm:text-xs font-medium leading-relaxed uppercase tracking-widest" style={{ color: 'rgba(80,40,0,0.50)' }}>
                Numbers we're proud of - earned through hard work on the court, not marketing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative h-[280px] sm:h-[340px] rounded-[2rem] sm:rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center overflow-hidden group shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.18)] ${
                  idx === 0 ? "bg-[#1A1A1A] text-white" :
                  idx === 1 ? "bg-[#D62828] text-white" :
                  idx === 2 ? "bg-[#F9BC00] text-espresso" :
                  "bg-[#F3722C] text-white"
                }`}
              >
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2rem] sm:rounded-[2.5rem] pointer-events-none" />
                
                {/* Decorative Background Accent - Stylized Image */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none overflow-hidden scale-110 group-hover:scale-125">
                  <img 
                    src={ASSETS.JOURNEY.STYLIZED_BG} 
                    alt="Volleyball" 
                    className="w-full h-full object-cover grayscale brightness-200"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Abstract Circle Accent */}
                <div className="absolute -right-20 -top-20 w-80 h-80 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                  <div className="w-full h-full rounded-full border-[60px] border-white" />
                </div>

                <div className="relative z-10 flex flex-col items-center w-full max-w-full">
                  <div className={`font-black uppercase tracking-[0.35em] md:tracking-[0.4em] text-[9px] sm:text-[10px] mb-3 sm:mb-4 transition-colors duration-500 ${
                    idx === 2 ? "text-espresso/60" : "text-white/50"
                  }`}>
                    {stat.label}
                  </div>

                  <div className={`font-condensed font-black leading-none tracking-tighter flex items-center justify-center flex-wrap ${
                    stat.value >= 1000 ? "text-4xl sm:text-5xl md:text-6xl" : "text-4xl sm:text-6xl md:text-7xl"
                  }`}>
                    <Counter value={stat.value} duration={2.5} />
                    <span className={`font-serif-italic italic ml-1 opacity-80 ${
                      stat.value >= 1000 ? "text-lg sm:text-2xl" : "text-xl sm:text-3xl"
                    }`}>{stat.suffix}</span>
                  </div>
                  
                  {/* Subtle Accent Line */}
                  <div className="h-1 w-10 sm:w-12 bg-current mt-4 sm:mt-6 opacity-20 rounded-full group-hover:w-16 transition-all duration-700 ease-out" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Marquee Testimonials (Colorful) */}
      <div className="gsap-reveal">
        <MarqueeTestimonials />
      </div>

      {/* Scattered Moodboard Section */}
      <section className="py-12 sm:py-16 md:py-24 section-dark overflow-hidden gsap-reveal">
        <div className="container mx-auto px-4">
          <SectionHeader 
            eyebrow="Academy Life" 
            title="What happens at practice." 
            italicWord="practice"
            ctaLabel="Join the Team"
            ctaPath="/register"
            dark 
          />
          <div className="mt-8 sm:mt-12">
            <Moodboard />
          </div>
        </div>
      </section>

      {/* Insights Section (Scrapbook Style) */}
      <section className="py-12 sm:py-16 md:py-24 section-dark gsap-reveal">
        <div className="container mx-auto px-4">
          <SectionHeader 
            eyebrow="Tips & News" 
            title="A few things we've learned."
            italicWord="learned"
            ctaLabel="Read More"
            ctaPath="/about"
            dark
          />
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {[
              { title: 'How to Improve Your Jump Float', date: 'Oct 12, 2024', image: ASSETS.EXPERTISE.FOUNDATIONAL, tag: 'Technical' },
              { title: 'What to Eat Before a Game', date: 'Oct 08, 2024', image: ASSETS.EXPERTISE.ELITE, tag: 'Fitness' },
              { title: 'Staying Calm When You\'re Down by Two Sets', date: 'Sep 28, 2024', image: ASSETS.EXPERTISE.TACTICAL, tag: 'Mental Game' },
            ].map((post, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 sm:mb-5 shadow-xl">
                  <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-espresso/20 group-hover:bg-espresso/0 transition-all" />
                  
                  {/* Sticker/Staged Badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 -rotate-12 bg-white text-espresso px-2.5 sm:px-3 py-1 rounded-sm font-black text-[8px] sm:text-[9px] uppercase tracking-widest shadow-xl">
                    {post.tag}
                  </div>
                  
                  {/* Marker overlay */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <p className="text-white text-[10px] font-bold bg-orange px-2.5 py-1 inline-block rotate-1">READ MORE →</p>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-orange font-condensed text-[10px] tracking-[0.2em]">{post.date}</p>
                  <h3 className="text-lg sm:text-xl font-serif text-white group-hover:text-orange transition-colors leading-tight">
                    {post.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-orange relative overflow-hidden gsap-reveal">
        {/* Massive Background Text */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center">
          <div className="text-[25vw] font-serif font-black text-white/10 tracking-tighter transform rotate-[-5deg]">
            SPIKE
          </div>
        </div>

        {/* Background Volleyball Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src={ASSETS.HERO.TEXTURE_BG} 
            alt="Texture" 
            className="w-full h-full object-cover mix-blend-multiply grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] text-[10px] sm:text-xs mb-4 sm:mb-6">Ready to play?</p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white mb-8 sm:mb-10 leading-[0.9] md:leading-[0.85]">
              Come train <br />
              <span className="text-white font-serif-italic normal-case italic opacity-90">with us.</span>
            </h2>
            <div className="flex justify-center gap-6">
              <NavLink 
                to="/register" 
                className="bg-white text-orange px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-sm sm:text-base hover:bg-espresso hover:text-white transition-all shadow-2xl group flex items-center gap-3 uppercase tracking-widest"
              >
                Start Training
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>
      <WaiverBanner />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Carousel - coaching 1.mp4 & coaching 2.mp4
// ─────────────────────────────────────────────────────────────────────────────
const COACHING_VIDEOS = [
  {
    src: new URL('./assets/video/coaching 1.mp4', import.meta.url).href,
    poster: ASSETS.HERO.ACTION_CARD_1,
    label: 'Coaching Session 1',
    description: 'Elite training drills & fundamentals',
  },
  {
    src: new URL('./assets/video/coaching 2.mp4', import.meta.url).href,
    poster: ASSETS.HERO.ACTION_CARD_3,
    label: 'Coaching Session 2',
    description: 'Advanced techniques & team play',
  },
];

function VideoCarousel() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = (idx: number) => {
    // Pause current video
    videoRefs.current[active]?.pause();
    setActive(idx);
  };

  const prev = () => goTo((active - 1 + COACHING_VIDEOS.length) % COACHING_VIDEOS.length);
  const next = () => goTo((active + 1) % COACHING_VIDEOS.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Slide window */}
      <div className="relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden aspect-video shadow-2xl border-[6px] border-white/8 bg-zinc-950">
        {COACHING_VIDEOS.map((v, i) => (
          <video
            key={v.src}
            ref={el => { videoRefs.current[i] = el; }}
            src={v.src}
            poster={v.poster}
            controls
            playsInline
            muted
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'auto' : 'none' }}
          />
        ))}

        {/* Label badge */}
        <div className="absolute top-5 left-5 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 pointer-events-none">
          <span className="text-[11px] font-black uppercase tracking-widest text-white">
            {COACHING_VIDEOS[active].label}
          </span>
        </div>

        {/* Slide counter */}
        <div className="absolute top-5 right-5 z-10 px-3 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 pointer-events-none">
          <span className="text-[11px] font-black text-white/70 tabular-nums">
            {active + 1} / {COACHING_VIDEOS.length}
          </span>
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous video"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-orange backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next video"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-orange backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators + description */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="flex gap-3">
          {COACHING_VIDEOS.map((v, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to ${v.label}`}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-400"
                style={{
                  width: i === active ? '2.5rem' : '1rem',
                  backgroundColor: i === active ? '#F26627' : 'rgba(255,255,255,0.25)',
                }}
              />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${i === active ? 'text-orange' : 'text-white/30'}`}>
                {v.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs font-medium">
          {COACHING_VIDEOS[active].description}
        </p>
      </div>
    </motion.div>
  );
}
