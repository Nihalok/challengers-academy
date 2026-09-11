import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ASSETS } from './assets/images';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';
import CoachesSection from './components/CoachesSection';
import FAQSection from './components/FAQSection';
import { 
  Award, 
  Trophy, 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Flame, 
  BookOpen,
  Compass,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '35+', label: 'Years Experience', sub: 'Coaching & Playing' },
  { value: '500+', label: 'Athletes Mentored', sub: 'Youth to Advanced' },
  { value: 'FIVB L2', label: 'Certified Coaching', sub: 'International Standards' },
  { value: '4 Centers', label: 'Bay Area Hubs', sub: 'Fremont, Manteca, MH, SJ' },
];

const FOUNDER_PILLARS = [
  {
    icon: Flame,
    title: 'Athletic Foundation',
    tag: 'Multi-Sport Discipline',
    desc: 'Coach Wilson grew up at G.V. Raja Sports School in Kerala, India. He initially excelled in track and field — winning state and National championships in Shot Put, Discus, and High Jump — before dedicating his athletic focus to volleyball.',
    accent: '#D62828'
  },
  {
    icon: Trophy,
    title: 'SAI Elite Development',
    tag: '5 Years Intensive Training',
    desc: 'Selected for the Sports Authority of India (SAI), he completed five years of elite training under premier National Coaches. He proudly represented his State, University, and Indian Railways, earning National-Level awards and recognition in premier competitions.',
    accent: '#F3722C'
  },
  {
    icon: Award,
    title: 'National & International Honors',
    tag: 'MVP & Camp Selection',
    desc: 'Earned selection for the Junior Indian Camp at Aurangabad and was awarded Most Valuable Player (MVP) at the prestigious Jimmy George National Tournament in Dallas (2026), reflecting decades of dedication.',
    accent: '#F9BC00'
  },
  {
    icon: BookOpen,
    title: 'Coaching Philosophy',
    tag: 'FIVB Certified Level 1 & 2',
    desc: 'Holding international FIVB Level 1 and Level 2 coaching accreditations, Head Coach Wilson builds technical precision, court awareness, mental toughness, and high-character athletes who succeed both on and off the court.',
    accent: '#1B1B1D'
  }
];

const MILESTONES = [
  {
    period: 'Foundations',
    title: 'Track & Field National Excellence',
    location: 'Kerala, India',
    desc: 'National Silver Medalist in Shot Put and State Champion across multiple disciplines at G.V. Raja Sports School.'
  },
  {
    period: 'Elite Academy',
    title: 'Sports Authority of India (SAI)',
    location: 'National Centers',
    desc: 'Selected for India’s premier SAI program, completing 5 years of rigorous, high-level volleyball coaching.'
  },
  {
    period: 'National Camps',
    title: 'National-Level Volleyball achievements',
    location: 'All-India Centers',
    desc: 'Earned medals at numerous National-level championships and Tournaments, along with extensive participation in National-level Volleyball camps throughout my playing career.'
  },
  {
    period: 'Competition',
    title: 'Junior Indian Camp & Railways',
    location: 'Aurangabad & National Tour',
    desc: 'Represented State University and National teams, Indian Railways, and selected to the Junior Indian National Camp.'
  },
  {
    period: 'Championship',
    title: 'National Tournament MVP',
    location: 'Dallas, TX',
    desc: 'Awarded MVP honors at the Jimmy George National Tournament, showcasing top-tier competitive play.'
  },
  {
    period: 'Current Era',
    title: 'Challengers Academy Expansion',
    location: 'SFO Bay Area, CA',
    desc: 'Bringing international FIVB training standards to young athletes across Fremont, Manteca, Mountain House, and San Jose.'
  }
];

const CORE_VALUES = [
  {
    icon: Target,
    title: 'Technical Precision',
    description: 'We prioritize clean mechanics, footwork fundamentals, and repeatable habits over shortcuts. Strong basics build champions.'
  },
  {
    icon: ShieldCheck,
    title: 'Honest Mentorship',
    description: 'Direct, constructive feedback. We give every athlete a clear roadmap of where they stand and what is needed to reach the next tier.'
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'A family-first environment where parents, players, and coaches build meaningful connections, sportsmanship, and lifelong discipline.'
  },
  {
    icon: Sparkles,
    title: 'Growth Mindset',
    description: 'We prepare players for high school, club, and collegiate competition by cultivating emotional resilience and court confidence.'
  }
];

const CREDENTIALS = [
  { 
    code: 'FIVB', 
    name: 'FIVB Level 1 & 2', 
     
    badge: 'Certified',
    logo: ASSETS.LOGOS.FIVB,
    color: '#F9BC00',
    bg: 'bg-white',
    border: 'border-amber-200',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  { 
    code: 'USAV', 
    name: 'USA Volleyball', 
    subtitle: 'Member', 
    badge: 'Active',
    logo: ASSETS.LOGOS.USAV,
    color: '#1B1B1D',
    bg: 'bg-white',
    border: 'border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  { 
    code: 'AAU', 
    name: 'AAU Volleyball', 
    subtitle: 'Member', 
    badge: 'Active',
    logo: ASSETS.LOGOS.AAU,
    color: '#D62828',
    bg: 'bg-white',
    border: 'border-red-200',
    badgeColor: 'bg-red-50 text-red-800 border-red-200'
  }
];

const TICKER_ITEMS = [
  'EXCELLENCE IN MOTION',
  'FIVB CERTIFIED COACHING',
  '35+ YEARS ATHLETIC PEDIGREE',
  'BAY AREA VOLLEYBALL ACADEMY',
  'FOUNDATION & DISCIPLINE',
  'SAI NATIONAL DEVELOPMENT',
  'JUNIOR INDIAN CAMP SELECTION',
  'FREMONT • MANTECA • MH • SAN JOSE'
];

export default function About() {
  useGsapReveal();
  const heroGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Render 64 cells for the hero Grid overlay (matching reference)
    if (heroGridRef.current && heroGridRef.current.children.length === 0) {
      const accents = new Set([2, 7, 18, 23, 36, 39, 44, 53, 58, 60]);
      for (let i = 0; i < 64; i++) {
        const div = document.createElement('div');
        div.className = `border border-white/40 ${accents.has(i) ? 'bg-[#D62828]/35 mix-blend-multiply' : ''}`;
        heroGridRef.current.appendChild(div);
      }
    }
  }, []);

  return (
    <div className="bg-white text-[#1B1B1D] w-full overflow-x-hidden font-sans selection:bg-[#D62828] selection:text-white">
      <SEO
        title="About Us | Challengers Volleyball Academy"
        description="Learn about Challengers Volleyball Academy, founded by Head Coach Wilson Mathew (FIVB Level 1 & 2). Professional youth volleyball training across the SOF Bay Area."
      />

      {/* ── TOP EDITORIAL MARQUEE TICKER ───────────────────────── */}
      <div className="pt-28 sm:pt-32 bg-white overflow-hidden border-b border-[#1B1B1D]/10 py-3">
        <div 
          className="flex gap-12 whitespace-nowrap" 
          style={{ animation: 'ticker 45s linear infinite' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-12 shrink-0">
              <span className="font-sans text-[13px] sm:text-[14px] uppercase tracking-[0.2em] font-bold text-[#1B1B1D]">
                {item}
              </span>
              <span className="w-16 h-px bg-[#1B1B1D]/20"></span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO EDITORIAL SECTION (REFERENCE MATCHING) ────────── */}
      <section className="relative px-4 sm:px-8 pt-8 sm:pt-12 pb-10 overflow-hidden bg-[#FBF9F6]">
        {/* 4 Corner Editorial Info Badges */}
        <div data-anim="hero-info" className="absolute top-6 left-6 sm:left-12 z-10 hidden sm:block">
          <div className="flex flex-col font-sans text-[#1B1B1D] uppercase items-start">
            <p className="text-[11px] font-black text-[#D62828] tracking-widest">FOUNDER & HEAD COACH</p>
            <p className="text-[16px] font-bold">Wilson Mathew</p>
          </div>
        </div>
        <div data-anim="hero-info" className="absolute top-6 right-6 sm:right-12 z-10 hidden sm:block">
          <div className="flex flex-col font-sans text-[#1B1B1D] uppercase items-end text-right">
            <p className="text-[11px] font-black text-[#D62828] tracking-widest">EXPERIENCE</p>
            <p className="text-[16px] font-bold">35+ Years</p>
          </div>
        </div>
        <div data-anim="hero-info" className="absolute bottom-6 left-6 sm:left-12 z-10 hidden sm:block">
          <div className="flex flex-col font-sans text-[#1B1B1D] uppercase items-start">
            <p className="text-[11px] font-black text-[#D62828] tracking-widest">ACCREDITATION</p>
            <p className="text-[16px] font-bold">FIVB Level 1 & 2</p>
          </div>
        </div>
        <div data-anim="hero-info" className="absolute bottom-6 right-6 sm:right-12 z-10 hidden sm:block">
          <div className="flex flex-col font-sans text-[#1B1B1D] uppercase items-end text-right">
            <p className="text-[11px] font-black text-[#D62828] tracking-widest">LOCATION</p>
            <p className="text-[16px] font-bold">SFO Bay Area, CA</p>
          </div>
        </div>

        {/* Center Editorial Title Banner with Script Overlay */}
        <div className="mx-auto max-w-[1400px] px-3 sm:px-8 flex justify-center py-8 sm:py-16 w-full overflow-hidden">
          <div className="relative inline-block leading-[0.88] text-center max-w-full" style={{ fontSize: 'clamp(34px, 11.5vw, 160px)' }}>
            <h1 data-anim="hero-h1" className="font-display font-bold uppercase text-[#1B1B1D] tracking-[-0.03em] block leading-[inherit] text-[1em] whitespace-nowrap">
              Challengers
            </h1>
            
            {/* Handwritten Decorative Script Accents */}
            <span data-anim="hero-decor" className="font-hand text-[#D62828] leading-[0.9] absolute pointer-events-none whitespace-nowrap drop-shadow-sm" style={{ top: '55%', left: '50%', transform: 'translate(-48%,-50%)', fontSize: 'clamp(16px, 4.5vw, 58px)' }}>
              Volleyball Academy
            </span>
            <span data-anim="hero-decor" className="font-hand text-[#F3722C] absolute leading-none whitespace-nowrap" style={{ top: '-0.3em', left: '26%', transform: 'translateX(-50%) rotate(-12deg)', fontSize: 'clamp(13px, 3vw, 38px)' }}>
              Elite
            </span>
            <span data-anim="hero-decor" className="font-hand text-[#D62828] absolute leading-none whitespace-nowrap" style={{ bottom: '-0.32em', left: '0%', transform: 'rotate(-18deg)', fontSize: 'clamp(12px, 2.6vw, 34px)' }}>
              SFO Bay Area
            </span>
            <span data-anim="hero-decor" className="font-sans font-black text-[#1B1B1D]/30 absolute leading-none hidden sm:block" style={{ top: '-0.02em', right: '-0.15em', fontSize: '0.12em' }}>
              ©
            </span>
            <span data-anim="hero-decor" className="font-hand text-[#F9BC00] absolute leading-none whitespace-nowrap" style={{ bottom: '-0.32em', right: '0%', fontSize: 'clamp(12px, 2.6vw, 34px)' }}>
              '26
            </span>
          </div>
        </div>
      </section>

      {/* ── HERO HIGH-IMPACT PHOTO BANNER WITH GRID OVERLAY ─────── */}
      <section className="px-4 sm:px-8 pt-4 pb-12 bg-white">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-[#1B1B1D] shadow-2xl border-4 border-white">
          <img 
            data-anim="zoom" 
            src={ASSETS.HERO.ACTION_CARD_4} 
            alt="Challengers Volleyball Academy Playing Action" 
            className="absolute inset-0 size-full object-cover opacity-90" 
          />
          {/* 8x8 Grid Overlay */}
          <div 
            ref={heroGridRef} 
            data-anim="hero-grid" 
            className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1D]/90 via-transparent to-transparent flex items-end p-6 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#D62828] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-3 shadow-lg">
                  Disciplined Excellence
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold uppercase text-white tracking-tight">
                  Building Champions On & Off The Court
                </h2>
              </div>
              <a 
                href="/programs" 
                className="bg-[#F9BC00] text-[#1B1B1D] font-display font-bold uppercase px-8 py-4 rounded-2xl text-[13px] tracking-wider hover:bg-white transition-all shadow-xl shrink-0 inline-flex items-center gap-2"
              >
                <span>View Our Programs</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR (EDITORIAL STYLE) ────────────────────────── */}
      <section className="px-4 sm:px-8 py-6 bg-[#FBF9F6] border-y border-[#1B1B1D]/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {STATS.map((stat, idx) => (
            <div key={idx} className="p-4 sm:p-6 bg-white rounded-2xl border border-[#1B1B1D]/5 shadow-sm text-left">
              <div className="text-3xl sm:text-5xl font-display font-bold text-[#D62828] tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1B1B1D] uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#1B1B1D]/60 font-medium">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL ABOUT & PHILOSOPHY (MATCHING REFERENCE ROTATED CARD STACK) ── */}
      <section id="about-intro" className="relative p-6 sm:p-12 md:p-16 min-h-[850px] flex flex-col justify-between bg-white border-b border-[#1B1B1D]/10">
        <div className="flex items-start justify-between w-full max-w-[1600px] mx-auto">
          <p data-anim="reveal" className="font-sans text-[13px] sm:text-[14px] uppercase tracking-[0.14px] leading-[1.3] max-w-[180px] font-bold text-[#1B1B1D]/70">
            Experienced<br />Head Coach & Founder
          </p>
          <p data-anim="hand" className="font-hand text-[#D62828] text-[32px] sm:text-[42px] uppercase">
            Philosophy
          </p>
        </div>

        <div className="my-12 sm:my-16 flex-1 flex items-center justify-center relative max-w-[1600px] mx-auto w-full">
          <div className="relative max-w-[920px] w-full text-center">
            <h2 data-anim="reveal" className="font-display font-bold uppercase text-[42px] sm:text-[68px] md:text-[88px] leading-[0.95] tracking-[-0.04em] text-[#1B1B1D]">
              Independent volleyball academy in SFO Bay Area, creating clean, modern athletic form
            </h2>
            
            {/* Floating Script Accents */}
            <span data-anim="hand" className="font-hand text-[#D62828] text-[30px] sm:text-[38px] uppercase absolute -top-10 right-[10%] whitespace-nowrap hidden sm:block">
              Who We Are
            </span>
            <span data-anim="hand" className="font-hand text-[#F3722C] text-[30px] sm:text-[38px] uppercase absolute -left-8 top-[calc(50%-60px)] hidden sm:block">
              Elite
            </span>
            <span data-anim="hand" className="font-hand text-[#F9BC00] text-[30px] sm:text-[38px] uppercase absolute -bottom-10 left-[15%] whitespace-nowrap hidden sm:block">
              Since 2018
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between w-full max-w-[1600px] mx-auto gap-6 pt-6 border-t border-[#1B1B1D]/10">
          <p data-anim="reveal" className="font-sans text-[13px] sm:text-[14px] uppercase tracking-wider font-bold max-w-[180px] text-[#1B1B1D]">
            Focused on Longevity & Discipline
          </p>
          <div data-anim="reveal" className="flex flex-col gap-4 max-w-[400px]">
            <p className="font-sans text-[16px] sm:text-[18px] leading-relaxed text-[#1B1B1D]/80">
              Head Coach Wilson Mathew shapes players with technical precision, court balance, and long-term athletic focus.
            </p>
            <a href="/register" className="group relative inline-flex items-center gap-2 text-[14px] uppercase tracking-widest text-[#D62828] font-bold w-fit">
              <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#D62828]"></span>
              <span>Enroll In Coaching</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ── HEAD COACH BIO & FOUNDER PILLARS (EDITORIAL CARDS) ───── */}
      <section className="bg-[#1B1B1D] text-white px-6 sm:px-12 py-20 md:py-28 relative">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <span data-anim="hand" className="font-hand text-[#F9BC00] text-[32px] uppercase block mb-1">
                Leadership & Pedigree
              </span>
              <h2 data-anim="reveal" className="font-display font-bold uppercase text-4xl sm:text-6xl text-white tracking-tight">
                Meet Head Coach Wilson Mathew
              </h2>
            </div>
            <p data-anim="reveal" className="text-white/70 max-w-md text-sm sm:text-base leading-relaxed">
              Over three decades of international athletic competition, National training academy credentials, and certified FIVB coaching expertise.
            </p>
          </div>

          {/* Coach Bio Card & Pillars Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Coach Highlight Card */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/20 shadow-2xl">
                  <img src={ASSETS.ABOUT.COACH_WILSON_ABOUT} alt="Coach Wilson Mathew" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1D] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block px-3 py-1 rounded-md bg-[#F9BC00] text-[#1B1B1D] text-[10px] font-black uppercase tracking-wider mb-2">
                      Founder & Head Coach
                    </span>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
                      Wilson Mathew
                    </h3>
                    <p className="text-xs text-white/80 font-medium">
                      FIVB Level 1 & 2 Certified Coach
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border-l-4 border-[#D62828] mb-6">
                  <p className="text-xs sm:text-sm italic font-medium text-white/90 leading-relaxed">
                    "Volleyball is about more than just technique — it instills discipline, mental clarity, and the resilience to perform under pressure."
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-xs text-white/80 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F9BC00] shrink-0" />
                  <span>Sports Authority of India (SAI) 5-Year Trainee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F9BC00] shrink-0" />
                  <span>Junior Indian  Camp attended at Aurangabad(1997)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F9BC00] shrink-0" />
                  <span>National Tournament MVP (Dallas 2026)</span>
                </div>
              </div>
            </div>

            {/* Right 4 Founder Pillar Cards */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {FOUNDER_PILLARS.map((pillar, idx) => (
                <div 
                  key={idx} 
                  data-anim="card-pop"
                  className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col justify-between hover:bg-white/10 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: pillar.accent }}
                      >
                        <pillar.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white/80">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CAREER TIMELINE & MILESTONES (STAGGERED EDITORIAL NUMBERS) ───── */}
      <section className="px-6 sm:px-12 py-20 md:py-28 bg-[#FBF9F6] border-b border-[#1B1B1D]/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span data-anim="hand" className="font-hand text-[#D62828] text-[36px] uppercase block mb-1">
              Historical Record
            </span>
            <h2 data-anim="reveal" className="font-display font-bold uppercase text-3xl sm:text-5xl md:text-6xl text-[#1B1B1D]">
              Career Timeline & Milestones
            </h2>
            <p data-anim="reveal" className="text-xs sm:text-base text-[#1B1B1D]/70 mt-3">
              From National Track & Field Gold Medals in India to FIVB Volleyball Coaching in the Bay Area.
            </p>

          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[#D62828] mb-4 px-1">
            <span>Swipe Milestones</span>
            <span>01 - 06 →</span>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 overflow-x-auto pb-6 md:pb-0 no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
            {MILESTONES.map((item, idx) => (
              <div 
                key={idx}
                data-anim="stagger"
                className="shrink-0 w-[82vw] sm:w-[340px] md:w-auto snap-center bg-white p-6 sm:p-8 rounded-3xl border border-[#1B1B1D]/10 shadow-sm relative overflow-hidden group hover:border-[#D62828]/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-hand text-[#D62828] text-[36px] leading-none">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#D62828]/10 text-[#D62828]">
                      {item.period}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-[#1B1B1D] uppercase tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <div className="text-xs font-bold text-[#1B1B1D]/50 uppercase tracking-widest flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#D62828]" /> {item.location}
                  </div>
                  <p className="text-xs sm:text-sm text-[#1B1B1D]/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE ACADEMY VALUES (PROCESS STEPS EDITORIAL) ────────── */}
      <section className="relative px-6 py-20 sm:py-28 bg-white overflow-hidden border-b border-[#1B1B1D]/10">
        <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col items-center gap-12">
          <div className="text-center">
            <span data-anim="hand" className="font-hand text-[#D62828] text-[36px] uppercase block mb-1">
              What To Expect
            </span>
            <h2 data-anim="reveal" className="font-display font-bold uppercase text-3xl sm:text-5xl text-[#1B1B1D] tracking-tight">
              Our Core Standards
            </h2>
          </div>

          <div data-anim="steps" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {CORE_VALUES.map((val, idx) => (
              <div key={idx} className="bg-[#FBF9F6] p-6 sm:p-8 rounded-3xl border border-[#1B1B1D]/10 flex flex-col justify-between">
                <div>
                  <div className="relative inline-flex items-start uppercase mb-6">
                    <p className="font-hand absolute -left-6 -top-3 text-[#D62828] text-[32px]">0{idx + 1}</p>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#1B1B1D]/10 flex items-center justify-center text-[#D62828]">
                      <val.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#1B1B1D] uppercase tracking-tight mb-3">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1B1B1D]/75 leading-relaxed font-normal">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCREDITATIONS & GOVERNING AFFILIATIONS ── */}
      <section className="py-14 sm:py-20 bg-[#FBF9F6] border-b border-[#1B1B1D]/10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1B1B1D]/40 block mb-1">
              Official Standards
            </span>
            <h3 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#1B1B1D]">
              Accreditations & Governing Affiliations
            </h3>
          </div>

          {/* Desktop: Static centered grid */}
          <div className="hidden md:flex justify-center gap-6">
            {CREDENTIALS.map((cred, idx) => (
              <div 
                key={idx}
                className="w-[260px] p-5 sm:p-6 bg-white rounded-3xl border border-[#1B1B1D]/10 shadow-sm text-center flex flex-col items-center justify-between gap-3 sm:gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cred.badgeColor}`}>
                  {cred.badge}
                </div>
                <div 
                  className={`w-28 h-20 sm:w-32 sm:h-24 bg-white ${cred.border} rounded-2xl flex items-center justify-center p-3 border shadow-sm hover:scale-105 transition-transform duration-300 overflow-hidden`}
                >
                  <img 
                    src={cred.logo} 
                    alt={cred.name} 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <span className="hidden font-black text-xl font-condensed tracking-wider text-espresso">
                    {cred.code}
                  </span>
                </div>
                <div className="whitespace-normal">
                  <h4 className="text-base font-bold text-[#1B1B1D] tracking-tight mb-0.5">
                    {cred.name}
                  </h4>
                  <p className="text-[11px] text-[#1B1B1D]/60 font-medium">
                    {cred.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Scrolling marquee */}
          <div className="md:hidden relative w-full overflow-hidden flex">
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#FBF9F6] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#FBF9F6] to-transparent z-10 pointer-events-none" />
            <motion.div 
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="flex gap-6 whitespace-nowrap shrink-0 px-4"
            >
              {[...CREDENTIALS, ...CREDENTIALS].map((cred, idx) => (
                <div 
                  key={idx}
                  className="shrink-0 w-[240px] p-5 bg-white rounded-3xl border border-[#1B1B1D]/10 shadow-sm text-center flex flex-col items-center justify-between gap-3"
                >
                  <div className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cred.badgeColor}`}>
                    {cred.badge}
                  </div>
                  <div className={`w-28 h-20 bg-white ${cred.border} rounded-2xl flex items-center justify-center p-3 border shadow-sm overflow-hidden`}>
                    <img src={cred.logo} alt={cred.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="whitespace-normal">
                    <h4 className="text-base font-bold text-[#1B1B1D] tracking-tight mb-0.5">{cred.name}</h4>
                    <p className="text-[11px] text-[#1B1B1D]/60 font-medium">{cred.subtitle}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COACHES SECTION ────────────────────────────────────── */}
      <div className="w-full relative bg-white">
        <CoachesSection />
      </div>

      {/* ── FAQ SECTION ────────────────────────────────────────── */}
      <section className="relative py-20 bg-[#FBF9F6] border-t border-[#1B1B1D]/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span data-anim="hand" className="font-hand text-[#D62828] text-[36px] uppercase block mb-1">
              Have Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase text-[#1B1B1D]">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQSection />
        </div>
      </section>
    </div>
  );
}
