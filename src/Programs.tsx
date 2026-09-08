import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PROGRAMS } from './data';
import { ASSETS } from './assets/images';
import SectionHeader from './components/SectionHeader';
import ProgramCard from './components/ProgramCard';
import { useGsapReveal } from './hooks/useGsapReveal';
import { Package, User, Users, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Sparkles } from 'lucide-react';
import { useRef, RefObject, useEffect } from 'react';
import SEO from './components/SEO';

export default function Programs() {
  const [programsList, setProgramsList] = useState<any[]>(PROGRAMS);
  
  useGsapReveal();

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.programs?.length) {
          const uniqueProgs = Array.from(new Map(data.programs.map((p: any) => [p.id, p])).values());
          setProgramsList(uniqueProgs);
        }
      })
      .catch(() => {
        // Silently fallback to static data
      });
  }, []);

  const REGULAR_PACKAGES = [
    { 
      id: 'gym-training-4',
      title: 'Gym Training (4 Sessions)', 
      fee: '$200', 
      sessions: '4 Gym Sessions', 
      duration: '2 Hours per Session',
      students: 'Group Training',
      popular: false,
      tag: 'INDOOR GYM',
      bgImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      themeClass: 'bg-gradient-to-br from-[#1C1600] via-[#2E2400] to-[#121212] border-[#F9BC00]/40 text-white',
      badgeStyle: 'bg-[#F9BC00] text-espresso',
      btnStyle: 'bg-[#F9BC00] text-espresso hover:bg-white',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    },
    { 
      id: 'gym-training-12',
      title: 'Gym Training (12 Sessions)', 
      fee: '$550', 
      sessions: '12 Intensive Gym Sessions', 
      duration: '2 Hours per Session',
      students: 'Group Training',
      popular: true,
      tag: 'POPULAR INTENSIVE',
      bgImage: 'https://images.unsplash.com/photo-1592656631147-f1aa2112bf7c?auto=format&fit=crop&w=800&q=80',
      themeClass: 'bg-gradient-to-br from-[#610C0C] via-[#3B0707] to-[#1F0404] border-[#D62828]/60 text-white',
      badgeStyle: 'bg-[#D62828] text-white',
      btnStyle: 'bg-white text-espresso hover:bg-[#F9BC00]',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    },
    { 
      id: 'open-park-group',
      title: 'Open Park Group Training', 
      fee: '$150', 
      sessions: '4 Outdoor Sessions', 
      duration: '2 Hours per Session',
      students: '12 Members',
      popular: false,
      tag: 'OUTDOOR PARK',
      bgImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
      themeClass: 'bg-gradient-to-br from-[#06383C] via-[#032023] to-[#011112] border-[#0B5D51]/50 text-white',
      badgeStyle: 'bg-[#0B5D51] text-white',
      btnStyle: 'bg-[#0B5D51] text-white hover:bg-white hover:text-espresso',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    },
    { 
      id: 'open-park-private',
      title: 'Open Park (Private 1-on-1)', 
      fee: '$360', 
      sessions: '4 Private Sessions', 
      duration: '1 Hour per Session',
      students: '1 Student Dedicated',
      popular: false,
      tag: 'PRIVATE 1-ON-1',
      bgImage: ASSETS.EXPERTISE.ELITE,
      themeClass: 'bg-gradient-to-br from-[#1F1F24] via-[#0E1520] to-[#070B12] border-amber-400/40 text-white',
      badgeStyle: 'bg-amber-400 text-espresso',
      btnStyle: 'bg-amber-400 text-espresso hover:bg-white',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    },
    { 
      id: 'open-park-travel',
      title: 'Open Park (Travel Coaching)', 
      fee: '$320', 
      sessions: '4 Private Sessions', 
      duration: '1 Hour per Session',
      students: '1 Student (Long Distance)',
      popular: false,
      tag: 'TRAVEL COACHING',
      bgImage: 'https://images.unsplash.com/photo-1593787467001-7394837e5814?auto=format&fit=crop&w=800&q=80',
      themeClass: 'bg-gradient-to-br from-[#5E2404] via-[#3A1602] to-[#1F0B01] border-[#F3722C]/50 text-white',
      badgeStyle: 'bg-[#F3722C] text-white',
      btnStyle: 'bg-[#F3722C] text-white hover:bg-white hover:text-espresso',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    },
    { 
      id: 'large-group-training',
      title: 'Large Group (13+ Students)', 
      fee: '$120', 
      sessions: '4 Team Sessions', 
      duration: '2 Hours per Session',
      students: '13+ Students (Per Student)',
      popular: false,
      tag: 'TEAM SQUAD',
      bgImage: ASSETS.EXPERTISE.TACTICAL,
      themeClass: 'bg-gradient-to-br from-[#071A2D] via-[#04101D] to-[#02080F] border-blue-400/40 text-white',
      badgeStyle: 'bg-blue-600 text-white',
      btnStyle: 'bg-blue-600 text-white hover:bg-white hover:text-espresso',
      ageRange: '11 - 18',
      ageGroups: ['11-14', '15-18']
    },
    { 
      id: 'tryout-session',
      title: 'Tryout Session', 
      fee: '$30', 
      sessions: '1 Court Evaluation', 
      duration: '2 Hours Duration',
      students: 'Individual / Group',
      popular: false,
      tag: 'EVALUATION',
      bgImage: ASSETS.HERO.ACTION_CARD_4,
      themeClass: 'bg-gradient-to-br from-[#3D3000] via-[#241C00] to-[#120E00] border-[#F9BC00]/50 text-white',
      badgeStyle: 'bg-[#F9BC00] text-espresso',
      btnStyle: 'bg-[#F9BC00] text-espresso hover:bg-white',
      ageRange: '5 - 18',
      ageGroups: ['5-10', '11-14', '15-18']
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const programScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right', ref: RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pt-32 sm:pt-36 md:pt-40 pb-10 sm:pb-12 min-h-screen overflow-hidden font-sans">
      <SEO 
        title="Training Programs" 
        description="We have training programs for all ages and skill levels - from complete beginners to players looking to compete seriously. Based in the Bay Area."
      />
      
      {/* High-Impact Volleyball Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/volleyball_bg.avif" 
          alt="Volleyball Action" 
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Abstract Red/Yellow Blurs */}
        <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-[#D62828]/15 blur-[180px] rounded-full opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[1000px] h-[1000px] bg-[#F9BC00]/15 blur-[180px] rounded-full opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Intro */}
        <div className="gsap-reveal mb-8 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#D62828]" />
            <span className="text-[#D62828] font-black text-[9px] tracking-[0.35em] uppercase">Development Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-condensed font-black text-espresso uppercase tracking-tighter leading-[0.85] mb-3">
            Find the right <span className="text-[#D62828] italic">program for you.</span>
          </h1>
          <p className="text-espresso/85 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto italic">
            Whether your child is picking up a volleyball for the first time or training to compete, we have a program that fits.
          </p>
        </div>

        {/* Dynamic Programs Carousel */}
        <div className="relative mb-10 sm:mb-12 gsap-reveal">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black uppercase tracking-tight text-espresso/40">
              Foundational Framework
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left', programScrollRef)}
                className="w-9 h-9 rounded-full bg-[#D62828] text-white flex items-center justify-center hover:bg-espresso hover:scale-105 transition-all shadow-md group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => scroll('right', programScrollRef)}
                className="w-9 h-9 rounded-full bg-[#D62828] text-white flex items-center justify-center hover:bg-espresso hover:scale-105 transition-all shadow-md group"
              >
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
          
          <div 
            ref={programScrollRef}
            className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory -mx-4 px-4"
          >
            <AnimatePresence mode="popLayout">
              {programsList.map((program, idx) => (
                <motion.div
                  key={program.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="shrink-0 w-[78vw] sm:w-[320px] md:w-[340px] snap-center"
                >
                  <ProgramCard 
                    program={program}
                    index={idx}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Regular Coaching Packages - Sliding Carousel */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-end justify-between mb-8 gsap-reveal">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F3722C]/10 rounded-xl flex items-center justify-center text-[#F3722C]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-condensed font-black uppercase text-espresso">
                  Regular Coaching Packages
                </h2>
                <p className="text-espresso/40 text-[9px] font-black uppercase tracking-widest">Our regular coaching programs</p>
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => scroll('left', scrollRef)}
                className="w-12 h-12 rounded-full bg-[#F9BC00] text-espresso flex items-center justify-center hover:bg-espresso hover:text-white hover:scale-105 transition-all shadow-md group"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => scroll('right', scrollRef)}
                className="w-12 h-12 rounded-full bg-[#F9BC00] text-espresso flex items-center justify-center hover:bg-espresso hover:text-white hover:scale-105 transition-all shadow-md group"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport */}
          <div 
            ref={scrollRef}
            className="relative -mx-4 px-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory flex gap-6"
          >
            <AnimatePresence mode="popLayout">
              {REGULAR_PACKAGES.map((pkg, idx) => (
                <motion.div 
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className={`relative p-5 sm:p-7 md:p-8 rounded-[1.8rem] sm:rounded-[2.2rem] border overflow-hidden shadow-2xl transition-all duration-500 shrink-0 w-[80vw] sm:w-[320px] md:w-[350px] snap-center flex flex-col justify-between ${pkg.themeClass}`}
                >
                  {/* Background Image with Dark Tint */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <img 
                      src={pkg.bgImage} 
                      alt={pkg.title}
                      className="w-full h-full object-cover opacity-25 scale-105 group-hover:scale-110 transition-transform duration-700 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                  </div>

                  {/* Content Layer */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${pkg.badgeStyle}`}>
                        {pkg.tag}
                      </span>
                      {pkg.popular && (
                        <span className="bg-[#D62828] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-condensed font-black uppercase tracking-tight text-white mb-1">
                      {pkg.title}
                    </h3>
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-4">
                      Ages {pkg.ageRange}
                    </div>
                    
                    <div className="mb-5 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-5xl font-condensed font-black tracking-tighter text-white">
                        {pkg.fee}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
                        {pkg.students.includes('Per Student') ? '/ student' : '/ package'}
                      </span>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {[pkg.sessions, pkg.duration, pkg.students, 'Certified Coaches'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <NavLink 
                    to={`/register?session=${pkg.id}`}
                    className={`relative z-10 block text-center py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-md active:scale-95 ${pkg.btnStyle}`}
                  >
                    Enroll Now
                  </NavLink>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Specialized Coaching */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10 sm:mb-16">
          {/* Personal Training */}
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-[1.8rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#1C170B] via-[#120F06] to-[#070603] text-white border border-[#F9BC00]/30 shadow-2xl gsap-reveal group hover:border-[#F9BC00] transition-all duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img 
                src={ASSETS.EXPERTISE.ELITE} 
                alt="Personal Training" 
                className="w-full h-full object-cover opacity-20 scale-105 group-hover:scale-110 transition-transform duration-700 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#F9BC00] rounded-xl sm:rounded-2xl flex items-center justify-center text-espresso mb-4 sm:mb-6 group-hover:scale-105 transition-transform shadow-lg">
                <User className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F9BC00] block mb-2">One-on-One Mastery</span>
              <h3 className="text-xl sm:text-3xl font-condensed font-black uppercase tracking-tight text-white mb-3 sm:mb-4">Personal Training</h3>
              <p className="text-white/80 text-xs sm:text-sm font-bold leading-relaxed mb-5 sm:mb-7 max-w-sm italic">
                Just you and the coach. Sessions are planned around your specific weaknesses and goals. Good for players who want faster results.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {['One-on-One', 'Customized Plans', 'Flexible Schedule', 'Performance Analysis'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F9BC00]" />
                    {item}
                  </div>
                ))}
              </div>
              <a href="/contact" className="inline-flex items-center gap-3 bg-[#F9BC00] text-espresso px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl">
                Book a Program <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Team Coaching */}
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-[1.8rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#692200] via-[#451600] to-[#1A0800] text-white border border-[#F3722C]/40 shadow-2xl gsap-reveal group hover:border-[#F3722C] transition-all duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img 
                src={ASSETS.EXPERTISE.TACTICAL} 
                alt="Team Coaching" 
                className="w-full h-full object-cover opacity-25 scale-105 group-hover:scale-110 transition-transform duration-700 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#F3722C] rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 group-hover:scale-105 transition-transform shadow-lg">
                <Users className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F3722C] block mb-2">Team Squad Development</span>
              <h3 className="text-xl sm:text-3xl font-condensed font-black uppercase tracking-tight text-white mb-3 sm:mb-4">Team Coaching</h3>
              <p className="text-white/80 text-xs sm:text-sm font-bold leading-relaxed mb-5 sm:mb-7 max-w-sm italic">
                We coach school teams, club teams, and competitive squads - either at your gym or ours. Works for all age groups.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {['School Teams', 'Club Teams', 'Competitive Teams', 'All Ages'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F3722C]" />
                    {item}
                  </div>
                ))}
              </div>
              <a href="/contact" className="inline-flex items-center gap-3 bg-white text-espresso px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F3722C] hover:text-white transition-all shadow-xl">
                Enroll Now <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Summer Camp Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3rem] bg-[#D62828] text-white text-center relative overflow-hidden shadow-2xl gsap-reveal"
        >
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-700">
              <div className="bg-white/20 backdrop-blur-xl p-3.5 sm:p-4 rounded-full border border-white/20">
                <Users className="w-6 sm:w-8 h-6 sm:h-8" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-condensed font-black uppercase tracking-tighter mb-3 sm:mb-5 leading-[0.9]">
              Summer <span className="text-[#F9BC00] italic">Intensives</span> 2026
            </h2>
            
            <p className="text-white/80 text-xs sm:text-base font-medium max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Summer is the best time to get serious. Our intensive camps give players more time on the court, focused coaching, and a real jump in skill.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
              <a href="/camps" className="px-7 sm:px-10 py-3.5 sm:py-4 bg-espresso text-white rounded-xl font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] hover:bg-white hover:text-espresso transition-all shadow-xl">
                View Camp Details
              </a>
              <div className="hidden sm:flex items-center gap-3 text-white/60">
                <div className="h-px w-6 bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-widest">Early Enrollment Open</span>
              </div>
            </div>
          </div>
          
          {/* Architectural Ornaments */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-espresso/10 rounded-full blur-[120px]" />
        </motion.div>
      </div>
    </div>
  );
}
