import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeader from './components/SectionHeader';
import { Calendar, Target, Trophy, CheckCircle2, ChevronRight, ChevronLeft, Clock, Star, ArrowRight, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ASSETS } from './assets/images';
import SEO from './components/SEO';

const CAMP_DURATIONS = [
  { id: '7-day', name: '7-Day Intensive', duration: '7 Days', months: 'June & July', bestFor: 'Technique Refinement' },
  { id: '10-day', name: '10-Day Elite', duration: '10 Days', months: 'June & July', bestFor: 'Game Strategy' },
  { id: '15-day', name: '15-Day Master', duration: '15 Days', months: 'June & July', bestFor: 'High Performance' },
];

const SLIDER_CARDS = [
  {
    id: '7-day-track',
    title: '7-Day Intensive',
    subtitle: 'Technique Refinement',
    desc: 'Focused 7-day immersion building core passing mechanics, serving accuracy, and explosive jump technique on open outdoor grounds.',
    bg: ASSETS.CAMPS.DAY_7,
    thumb: ASSETS.CAMPS.DAY_7,
    tag: 'FOUNDATION TRACK',
    link: '/register?program=7-day-intensive'
  },
  {
    id: '10-day-track',
    title: '10-Day Elite',
    subtitle: 'Game Strategy & Systems',
    desc: 'Advanced 10-day outdoor bootcamp mastering 5-1 rotational tactics, block timing, and live match play execution.',
    bg: ASSETS.CAMPS.DAY_10,
    thumb: ASSETS.CAMPS.DAY_10,
    tag: 'TACTICAL TRACK',
    link: '/register?program=10-day-elite'
  },
  {
    id: '15-day-track',
    title: '15-Day Master',
    subtitle: 'High Performance',
    desc: 'Our ultimate 15-day masterclass combining pro conditioning, positional mastery, and high-energy tournament scrimmages.',
    bg: ASSETS.CAMPS.DAY_15,
    thumb: ASSETS.CAMPS.DAY_15,
    tag: 'PRO MASTERCLASS',
    link: '/register?program=15-day-master'
  },
  {
    id: 'private-mastery',
    title: '1-on-1 Camp Mastery',
    subtitle: 'Custom Mechanics',
    desc: 'Dedicated 1-on-1 private coaching during camp week for hyper-focused mechanical fixes on sunlit outdoor park courts.',
    bg: ASSETS.CAMPS.PRIVATE,
    thumb: ASSETS.CAMPS.PRIVATE,
    tag: 'PRIVATE COACHING',
    link: '/register?program=private-camp'
  },
  {
    id: 'junior-spikers-camp',
    title: 'Junior Spikers Camp',
    subtitle: 'Ages 5-10 Foundations',
    desc: 'Fun, high-energy foundation camp teaching young athletes ball control, footwork, and team play on lush green grounds.',
    bg: ASSETS.CAMPS.JUNIOR,
    thumb: ASSETS.CAMPS.JUNIOR,
    tag: 'YOUTH SQUAD',
    link: '/register?program=junior-spikers'
  }
];

export default function Camps() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);

  const prev = () => setActive((i) => Math.max(i - 1, 0));
  const next = () => setActive((i) => Math.min(i + 1, SLIDER_CARDS.length - 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) prev();
      else next();
    }
  };

  return (
    <div className="relative bg-[#FBF9F6] min-h-screen overflow-hidden font-sans pt-32 sm:pt-36 md:pt-40">
      <SEO 
        title="Summer Elite Camps 2026" 
        description="High-energy summer volleyball camps for youth and high school players in Fremont, Manteca, Mountain House, and San Jose."
      />

      {/* Blended Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1592656670411-b91990822650?q=80&w=2000" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.06] mix-blend-multiply grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF9F6]/90 via-transparent to-[#FBF9F6]/90" />
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 relative z-10 pb-8 sm:pb-12"
      >
        <div className="gsap-reveal mb-6 sm:mb-8">
          <SectionHeader 
            eyebrow="Summer 2026" 
            title="Summer Elite Camps." 
            italicWord="Elite"
            id="camps-heading"
          />
        </div>

        {/* Camp Overview */}
        <div className="grid lg:grid-cols-2 gap-6 items-center mb-10 sm:mb-14">
          <div className="space-y-3.5 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-espresso leading-tight">Intensive training for <span className="text-[#D62828] italic">future champions.</span></h2>
            <p className="text-espresso/85 text-xs sm:text-sm font-medium leading-relaxed">
              Our Summer Camps are designed to provide a high-energy, focused environment where players can rapidly improve their skills, build confidence, and forge lasting friendships.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-4 bg-[#F9BC00] rounded-xl border border-espresso/5 shadow-sm">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-espresso mb-1.5" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-espresso mb-0.5">Availability</h4>
                <p className="text-xs font-bold text-espresso/70">June & July 2026</p>
              </div>
              <div className="p-3 sm:p-4 bg-[#D62828] rounded-xl border border-espresso/5 shadow-sm text-white">
                <Target className="w-4 sm:w-5 h-4 sm:h-5 text-[#F9BC00] mb-1.5" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">Skill Levels</h4>
                <p className="text-xs font-bold text-white">Beginner & Intermediate</p>
              </div>
            </div>
          </div>
          <div className="relative mt-4 lg:mt-0">
            <div className="aspect-[16/9] max-h-[260px] sm:max-h-[300px] w-full bg-espresso rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden rotate-1 shadow-xl relative z-10 border-4 border-white mx-auto">
              <img 
                src={ASSETS.CAMPS.HERO} 
                alt="Volleyball Outdoor Summer Camp Action" 
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-[#D62828] rounded-full -z-10 blur-2xl opacity-30" />
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#F9BC00] rounded-full -z-10 blur-2xl opacity-30" />
          </div>
        </div>

        {/* ── INTERACTIVE EXPANDING ACCORDION SLIDER (CENTER-MODE PRODUCTIVITY SLIDER) ── */}
        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#F3722C]" />
                <span className="text-[#F3722C] text-[10px] font-black uppercase tracking-[0.3em]">Interactive Camp Showcase</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-condensed font-black uppercase text-espresso leading-none">
                Boost your game & <span className="text-[#D62828] italic">workflow</span>
              </h2>
            </div>

            {/* Slider Navigation Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={prev}
                disabled={active === 0}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-espresso text-white flex items-center justify-center hover:bg-[#F3722C] disabled:opacity-30 disabled:hover:bg-espresso transition-all shadow-md active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                disabled={active === SLIDER_CARDS.length - 1}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-espresso text-white flex items-center justify-center hover:bg-[#F3722C] disabled:opacity-30 disabled:hover:bg-espresso transition-all shadow-md active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop & Mobile Accordion Slider Track */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-center items-stretch min-h-[460px] md:h-[28rem] py-2"
          >
            {SLIDER_CARDS.map((card, i) => {
              const isActive = i === active;
              return (
                <div
                  key={card.id}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border ${
                    isActive 
                      ? 'md:flex-[1_1_32rem] flex-[1_1_18rem] border-white/40 shadow-2xl scale-[1.01] -translate-y-1' 
                      : 'md:flex-[0_0_5rem] flex-[0_0_4.5rem] border-espresso/10 opacity-80 hover:opacity-100 hover:border-espresso/30'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={card.bg}
                    alt={card.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                      isActive ? 'brightness-[0.9] saturate-125 scale-105' : 'brightness-[0.7] saturate-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Card Content Layer */}
                  <div className="relative z-10 w-full h-full p-4 sm:p-6 flex flex-col justify-end">
                    {!isActive ? (
                      /* Collapsed Vertical Title (Desktop) & Compact View (Mobile) */
                      <div className="w-full h-full flex md:flex-col items-center justify-center">
                        <span className="hidden md:block text-white font-condensed font-black uppercase text-xl tracking-wider whitespace-nowrap [writing-mode:vertical-rl] rotate-180 drop-shadow-md">
                          {card.title}
                        </span>
                        <span className="md:hidden text-white font-condensed font-black uppercase text-base tracking-wide truncate">
                          {card.title}
                        </span>
                      </div>
                    ) : (
                      /* Expanded Full Content View */
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 w-full"
                      >
                        {/* Thumbnail Image */}
                        <img
                          src={card.thumb}
                          alt={card.title}
                          className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 rounded-xl object-cover border-2 border-white/30 shadow-xl shrink-0 hidden xs:block"
                        />

                        {/* Text & Action */}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-[#F3722C] text-white text-[9px] font-black uppercase tracking-widest mb-2 shadow-sm">
                            {card.tag}
                          </span>
                          <h3 className="text-xl sm:text-3xl font-condensed font-black uppercase text-white tracking-tight mb-1 leading-tight drop-shadow-sm">
                            {card.title}
                          </h3>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F9BC00] mb-2">
                            {card.subtitle}
                          </p>
                          <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed mb-4 max-w-md line-clamp-2 sm:line-clamp-3">
                            {card.desc}
                          </p>
                          
                          <NavLink
                            to={card.link}
                            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#F3722C] to-[#D62828] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group/btn border-t border-white/30"
                          >
                            <span>Enroll for Camp</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </NavLink>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {SLIDER_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-[#F3722C]' : 'w-2.5 bg-espresso/20 hover:bg-espresso/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Duration Options */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-5 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-serif text-espresso mb-1">Choose Your Duration</h3>
            <p className="text-espresso/60 text-[9px] font-black uppercase tracking-widest">Multiple options to fit your summer schedule</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3.5 sm:gap-4">
            {CAMP_DURATIONS.map((camp, idx) => (
              <motion.div 
                key={camp.id}
                whileHover={{ y: -4 }}
                className={`p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-espresso/5 shadow-md group transition-all relative overflow-hidden ${idx === 0 ? 'bg-[#1A1A1A] text-white' : idx === 1 ? 'bg-[#D62828] text-white' : 'bg-[#F9BC00] text-espresso'}`}
              >
                {/* Blurry Background Image */}
                <div className="absolute inset-0 z-0 opacity-15 blur-[1px] pointer-events-none">
                  <img 
                    src={idx === 0 ? ASSETS.CAMPS.DAY_7 : idx === 1 ? ASSETS.CAMPS.DAY_10 : ASSETS.CAMPS.DAY_15} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${idx === 0 ? 'bg-[#1A1A1A]/40' : idx === 1 ? 'bg-[#D62828]/40' : 'bg-[#F9BC00]/40'}`} />
                </div>

                <div className="relative z-10">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform ${idx === 2 ? 'bg-espresso/10 text-espresso' : 'bg-white/10 text-white'}`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-base font-serif mb-0.5">{camp.name}</h4>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${idx === 2 ? 'text-espresso/60' : 'text-white/60'}`}>{camp.duration}</p>
                  <div className="space-y-1 mb-3">
                    <div className={`flex items-center gap-2 text-[10px] font-medium ${idx === 2 ? 'text-espresso/70' : 'text-white/80'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${idx === 2 ? 'text-espresso' : 'text-white'}`} />
                      {camp.months}
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-medium ${idx === 2 ? 'text-espresso/70' : 'text-white/80'}`}>
                      <Star className={`w-3 h-3 ${idx === 2 ? 'text-espresso' : 'text-white'}`} />
                      {camp.bestFor}
                    </div>
                  </div>
                  <NavLink to="/register" className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-colors ${idx === 2 ? 'text-espresso hover:text-espresso/60' : 'text-white hover:text-white/60'}`}>
                    Enroll Now <ChevronRight className="w-3 h-3" />
                  </NavLink>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits of Joining */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-[#F3722C] p-5 sm:p-7 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-espresso/5 shadow-xl text-white relative overflow-hidden">
            {/* Blurry Background Image */}
            <div className="absolute inset-0 z-0 opacity-15 blur-[2px] pointer-events-none">
              <img 
                src={ASSETS.CAMPS.HERO} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#F3722C]/40" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-serif mb-4 text-espresso">Benefits of Joining Our Camps</h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  { title: 'Technical Mastery', desc: 'Accelerated development of serves, spikes, and defensive play.' },
                  { title: 'Mental Resilience', desc: 'Workshops on court psychology and competitive mindset.' },
                  { title: 'Team Bonding', desc: 'Collaborative drills that build trust and communication skills.' },
                  { title: 'Elite Exposure', desc: 'Feedback from master coaches with international experience.' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3.5 sm:p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-serif mb-0.5">{benefit.title}</h5>
                      <p className="text-xs text-white/90 leading-snug font-medium">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#D62828] p-5 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-condensed uppercase tracking-tighter mb-2 sm:mb-3 leading-none">
              Spaces are <span className="text-[#F9BC00] font-serif-italic lowercase italic tracking-normal">filling fast.</span>
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              Our summer camps are our most popular programs. Don't miss your chance to train with Head Coach Wilson this summer.
            </p>
            <NavLink 
              to="/register?program=summer-camp-2026-fremont" 
              className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-espresso text-white rounded-full font-bold uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-[#F9BC00] hover:text-espresso transition-all shadow-xl"
            >
              Secure Your Spot
            </NavLink>
          </div>
          {/* Abstract Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
      </motion.div>
    </div>
  );
}
