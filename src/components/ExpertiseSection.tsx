import { useRef, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROGRAMS } from '../data';
import SectionHeader from './SectionHeader';
import OptimizedImage from './OptimizedImage';

gsap.registerPlugin(ScrollTrigger);

// Vibrant background color palette for all 7 training programs
const BG_COLORS = ['#F97316', '#D62828', '#B91C1C', '#990D0D', '#0B5D51', '#D97706', '#7C3AED'];

export default function ExpertiseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Force refresh after all components are likely loaded
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Mobile Horizontal Scroll Logic for Background Colors
      mm.add("(max-width: 1023px)", () => {
        const scroller = leftColRef.current;
        if (!scroller) return;

        const handleMobileScroll = () => {
          const scrollLeft = scroller.scrollLeft;
          const cardWidth = scroller.offsetWidth * 0.85; // matching w-[85vw]
          const gap = 24; // matching gap-6
          const totalWidth = cardWidth + gap;
          
          const index = Math.round(scrollLeft / totalWidth);
          const safeIndex = Math.max(0, Math.min(index, BG_COLORS.length - 1));
          
          if (activeIdx !== safeIndex) {
            setActiveIdx(safeIndex);
            gsap.to(sectionRef.current, { 
              backgroundColor: BG_COLORS[safeIndex], 
              duration: 0.6,
              ease: "power2.out"
            });
          }
        };

        scroller.addEventListener('scroll', handleMobileScroll);
        gsap.set('.expertise-card', { opacity: 1 });
        gsap.set(sectionRef.current, { backgroundColor: BG_COLORS[0] });

        return () => scroller.removeEventListener('scroll', handleMobileScroll);
      });

      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray('.expertise-card') as HTMLElement[];
        const images = gsap.utils.toArray('.expertise-image-container') as HTMLElement[];
        const dots = gsap.utils.toArray('.expertise-dot') as HTMLElement[];

        // Initial setup
        gsap.set(sectionRef.current, { backgroundColor: BG_COLORS[0] });
        gsap.set(images, { opacity: 0, scale: 1.05, willChange: "transform, opacity" });
        gsap.set(images[0], { opacity: 1, scale: 1 });
        gsap.set(dots[0], { backgroundColor: '#ffffff', scale: 1.5 });
        gsap.set(cards, { opacity: 0.25, willChange: "opacity" }); 
        gsap.set(cards[0], { opacity: 1 }); 

        // Pinning Right Column
        ScrollTrigger.create({
          trigger: rightColRef.current,
          start: "top top",
          endTrigger: sectionRef.current,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });

        // 1. Scrubbed Background Color Timeline
        const bgTl = gsap.timeline({
          scrollTrigger: {
            trigger: leftColRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
          }
        });

        BG_COLORS.forEach((color, index) => {
          if (index === 0) return;
          bgTl.to(sectionRef.current, { 
            backgroundColor: color,
            ease: "none"
          });
        });

        // 2. Snap transitions for images and dots
        cards.forEach((card: any, index: number) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top center", 
            end: "bottom center",
            onToggle: (self) => {
              if (self.isActive) {
                setActiveIdx(index);
                // Crossfade images smoothly
                gsap.to(images, { opacity: 0, scale: 1.05, duration: 0.6, ease: "power2.inOut", overwrite: "auto" });
                gsap.to(images[index], { opacity: 1, scale: 1, duration: 0.6, ease: "power2.inOut", overwrite: "auto" });

                // Update dots
                gsap.to(dots, { backgroundColor: 'rgba(255, 255, 255, 0.3)', scale: 1, duration: 0.3, overwrite: "auto" });
                gsap.to(dots[index], { backgroundColor: '#ffffff', scale: 1.5, duration: 0.3, overwrite: "auto" });

                // Highlight active text, dim others
                gsap.to(cards, { opacity: 0.25, duration: 0.4, ease: "power2.inOut", overwrite: "auto" });
                gsap.to(card, { opacity: 1, duration: 0.4, ease: "power2.inOut", overwrite: "auto" });
              }
            }
          });
        });
      });

    }, sectionRef);

    return () => {
      ctx.revert();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen" aria-labelledby="expertise-heading">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        
        <div className="mb-10 lg:mb-14 relative z-30">
          <SectionHeader 
            eyebrow="Expert Coaching" 
            title="Building your game on solid ground."
            italicWord="ground."
            dark={false}
            className="mb-0"
            id="expertise-heading"
          />
        </div>

        <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Scrolling Text */}
          <div ref={leftColRef} className="w-full lg:w-5/12 flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-10 pb-6 lg:flex-col lg:overflow-x-visible lg:gap-[20vh] lg:pb-[10vh] lg:snap-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {PROGRAMS.map((program, idx) => (
              <div
                key={program.id}
                className="expertise-card flex flex-col justify-center shrink-0 w-[85vw] sm:w-[70vw] lg:w-full snap-center"
                role="article"
                aria-labelledby={`expertise-title-${program.id}`}
              >
                <div className="max-w-xl">
                  <div className="mb-6 lg:mb-10">
                    <span className="text-white/70 font-bold text-xs tracking-[0.5em] uppercase block mb-3 lg:mb-4">
                      Phase 0{idx + 1}
                    </span>
                    <h3 id={`expertise-title-${program.id}`} className="font-condensed text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white leading-[0.88] mb-6 lg:mb-8 tracking-tighter drop-shadow-2xl break-words">
                      {program.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed font-medium mb-8 lg:mb-12 max-w-lg">
                    {program.longDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-y-4 lg:gap-y-8 gap-x-4 lg:gap-x-8 border-t border-white/10 pt-6 lg:pt-10" aria-label="Program phases">
                    {program.features.map((f, fi) => (
                      <div key={fi} className="group flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50" aria-hidden="true">
                          {String(fi + 1).padStart(2, '0')} //
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-tight">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <NavLink
                      to={`/register?package=${program.id}`}
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-espresso font-condensed font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:bg-yellow hover:scale-105 transition-all duration-300"
                    >
                      <span>Enroll in Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="mt-8 lg:hidden rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl relative">
                   <OptimizedImage src={program.image} alt={`Visual representation of ${program.title}`} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Image Container (Desktop Only) */}
          <div ref={rightColRef} className="hidden lg:flex w-full lg:w-7/12 h-screen flex-col justify-center relative" aria-hidden="true">
            <div className="h-[50vh] w-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] bg-black/5 relative border border-white/10">
              {PROGRAMS.map((program, idx) => (
                <div 
                  key={program.id}
                  className={`expertise-image-container absolute inset-0 w-full h-full transition-transform duration-1000 ease-out will-change-transform ${idx === 0 ? 'opacity-100' : 'opacity-0'}`}
                >
                  <OptimizedImage 
                    src={program.image}
                    alt=""
                    className="w-full h-full object-cover"
                    imgClassName="hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                </div>
              ))}
              
              {/* Refined overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none mix-blend-multiply" />
              
              {/* Side Progress Dots */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-20">
                {PROGRAMS.map((_, i) => (
                  <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                    <div className={`expertise-dot w-2 h-2 rounded-full bg-white/30 backdrop-blur-sm transition-all duration-300`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
