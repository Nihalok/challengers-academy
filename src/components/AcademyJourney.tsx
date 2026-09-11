import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { ASSETS } from '../assets/images';
import OptimizedImage from './OptimizedImage';

interface Milestone {
  id: number;
  title: string;
  description: string;
  x: number; // percentage
  y: number; // percentage
  image: string;
}

// Coordinates to start lower and further right, completely eliminating header overlap
const MILESTONES: Milestone[] = [
  {
    id: 1,
    title: "Foundations",
    description: "Learning the basics - how to pass, serve, and move on the court.",
    x: 20,
    y: 48,
    image: ASSETS.JOURNEY.STEP_1
  },
  {
    id: 2,
    title: "Specialization",
    description: "Picking a position and getting good at what that role demands.",
    x: 45,
    y: 75,
    image: ASSETS.JOURNEY.STEP_2
  },
  {
    id: 3,
    title: "Performance",
    description: "Training harder, thinking faster, and competing under pressure.",
    x: 70,
    y: 42,
    image: ASSETS.JOURNEY.STEP_3
  },
  {
    id: 4,
    title: "Mastery",
    description: "Playing at a high level and chasing bigger opportunities.",
    x: 88,
    y: 65,
    image: ASSETS.JOURNEY.STEP_4
  }
];

interface TrailImage {
  id: string;
  x: number;
  y: number;
  src: string;
  rotation: number;
}

function TrailImageItem({ img, smoothX, smoothY }: any) {
  const driftX = useTransform(smoothX, (latest: number) => (latest - img.x) * 0.05);
  const driftY = useTransform(smoothY, (latest: number) => (latest - img.y) * 0.05);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotate: img.rotation - 15, y: 40 }}
      animate={{ opacity: 1, scale: 1, rotate: img.rotation, y: 0 }}
      exit={{ opacity: 0, scale: 1.2, rotate: img.rotation + 15, y: -40, filter: 'blur(10px)' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute pointer-events-none z-40 will-change-transform"
      aria-hidden="true"
      style={{ 
        left: img.x, top: img.y, x: driftX, y: driftY,
        translateX: '-50%', translateY: '-50%',
        width: '320px', height: '240px',
      }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden border border-black/5 shadow-[0_20px_40px_-15px_rgba(234,88,12,0.3)] backdrop-blur-md bg-white/40">
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
        <OptimizedImage 
          src={img.src} 
          alt=""
          className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
        />
      </div>
    </motion.div>
  );
}

function MilestoneItem({ m, smoothProgress }: { m: Milestone, smoothProgress: any, key?: React.Key }) {
  const isBottomHalf = m.y > 50;
  
  // Calculate threshold based on new X positions (range 20 to 88 -> span of 68)
  const threshold = (m.x - 20) / 68; 
  
  const scale = useTransform(smoothProgress, [Math.max(0, threshold - 0.05), Math.min(1, threshold + 0.05)], [0, 1]);
  const opacity = useTransform(smoothProgress, [Math.max(0, threshold - 0.05), Math.min(1, threshold + 0.05)], [0, 1]);

  return (
    <div 
      className="absolute z-30 will-change-transform"
      style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="relative flex flex-col items-center justify-center group cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${m.title} milestone - Phase 0${m.id}: ${m.description}`}
      >
        {/* Navy/Slate Dot matching your image */}
        <motion.div 
          whileHover={{ scale: 1.4 }}
          className="w-5 h-5 bg-slate-900 rounded-full relative z-20 transition-colors shadow-lg group-hover:bg-[#ea580c] group-hover:shadow-[0_0_20px_rgba(234,88,12,0.5)]"
          aria-hidden="true"
        />

        {/* Text Card - Redesigned to match the uploaded image perfectly */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 w-56 md:w-72 text-center opacity-80 group-hover:opacity-100 transition-all duration-500 pointer-events-none ${
            isBottomHalf ? 'bottom-full pb-6 md:pb-8' : 'top-full pt-6 md:pt-8'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-[1.5rem] border border-black/5 shadow-xl transition-transform duration-500 group-hover:-translate-y-1">
            <span className="text-[10px] md:text-xs font-bold text-[#b91c1c] block mb-1.5 tracking-widest uppercase">PHASE 0{m.id}</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-700 uppercase tracking-tighter mb-2">{m.title}</h3>
            <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed font-semibold uppercase tracking-[0.15em] mx-auto">
              {m.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AcademyJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Refresh ScrollTrigger and Lenis calculation after component mounts
    const timer = setTimeout(() => {
      if ((window as any).__lenis) {
        (window as any).__lenis.resize();
      }
    }, 150);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });
  const pathFlowOffset = useTransform(smoothProgress, [0, 1], [0, -40]); 

  const [trail, setTrail] = useState<TrailImage[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const imageIndex = useRef(0);
  const images = useMemo(() => MILESTONES.map(m => m.image), []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  const gridX = useTransform(smoothX, [0, 2000], [10, -10]);
  const gridY = useTransform(smoothY, [0, 1200], [10, -10]);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const x = e.clientX;
    const y = e.clientY;

    mouseX.set(x);
    mouseY.set(y);

    const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);

    if (dist > 180) {
      const newImage: TrailImage = {
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        src: images[imageIndex.current % images.length],
        rotation: (Math.random() - 0.5) * 20
      };

      setTrail(prev => [...prev.slice(-4), newImage]);
      lastPos.current = { x, y };
      imageIndex.current++;

      const timerId = setTimeout(() => {
        setTrail(prev => prev.filter(img => img.id !== newImage.id));
      }, 1000);

      timersRef.current.push(timerId);
    }
  };

  if (isMobile) {
    return (
      <section className="relative w-full bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] py-10 sm:py-14 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#0f172a] leading-tight mb-3 sm:mb-4">
              Your journey to <br />
              <span className="italic font-light bg-clip-text text-transparent bg-gradient-to-r from-[#b91c1c] to-[#ea580c] pr-4">the top.</span>
            </h2>
            <div className="w-12 h-1 bg-[#ea580c] rounded-full" />
          </div>

          <div className="space-y-8 sm:space-y-12 relative">
            {/* Vertical Line */}
            <div className="absolute left-5 sm:left-6 top-4 bottom-4 w-px bg-slate-200 border-l border-dashed border-slate-300" />
            
            {MILESTONES.map((m) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-12 sm:pl-16"
              >
                {/* Dot */}
                <div className="absolute left-0 top-6 w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center">
                  <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 bg-slate-900 rounded-full shadow-lg ring-4 ring-white" />
                </div>
                
                <div className="bg-white/95 backdrop-blur-md p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-black/5 shadow-lg">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#b91c1c] block mb-1.5 sm:mb-2 tracking-widest uppercase">PHASE 0{m.id}</span>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-700 uppercase tracking-tighter mb-3 sm:mb-4">{m.title}</h3>
                  <div className="aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-black/5">
                    <OptimizedImage src={m.image} className="w-full h-full object-cover" alt={m.title} />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-[0.08em] sm:tracking-[0.1em]">
                    {m.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fef3c7]" aria-label="Academy Journey Timeline">
      
      <div 
        onMouseMove={handleMouseMove}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center"
      >
        
        {/* Blended Background Volleyball Image */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img 
            src={ASSETS.JOURNEY.STYLIZED_BG} 
            alt="" 
            className="w-full h-full object-cover opacity-[0.12] mix-blend-multiply pointer-events-none"
            referrerPolicy="no-referrer"
          />
          {/* Light premium gradient overlay to soften the image edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff7ed]/80 via-transparent to-[#fef3c7]/80 pointer-events-none" />
        </div>

        {/* Orange & Yellow Blended Glowing Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f97316]/10 blur-[140px] rounded-full mix-blend-multiply opacity-70" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#eab308]/15 blur-[150px] rounded-full mix-blend-multiply opacity-60" />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[#fb923c]/15 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
        </div>

        {/* Grid Pattern Background */}
        <motion.div 
          className="absolute inset-0 opacity-[0.3] pointer-events-none z-0"
          style={{ x: gridX, y: gridY }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </motion.div>

        <div className="container mx-auto relative h-full px-4 flex flex-col justify-center pt-20 z-10">
          
          {/* Header Content - Securely positioned at top left to prevent overlapping */}
          <div className="max-w-3xl absolute top-12 md:top-16 left-6 md:left-12 z-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#0f172a] leading-[1.05] drop-shadow-sm tracking-tight">
                Your journey to <br />
                <span className="italic font-light bg-clip-text text-transparent bg-gradient-to-r from-[#b91c1c] to-[#ea580c] drop-shadow-none pr-4">the top.</span>
              </h2>
            </motion.div>
          </div>

          {/* Flowing Dotted Path SVG */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-90 z-10"
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <defs>
              <mask id="scrollMask">
                {/* Updated path reflecting the new safe coordinates */}
                <motion.path
                  d="M 20 48 C 30 48, 35 75, 45 75 C 55 75, 60 42, 70 42 C 80 42, 80 65, 88 65"
                  fill="none"
                  stroke="white"
                  strokeWidth="5" 
                  strokeLinecap="round"
                  style={{ pathLength: smoothProgress }}
                />
              </mask>
            </defs>

            {/* Faint static background track */}
            <path
              d="M 20 48 C 30 48, 35 75, 45 75 C 55 75, 60 42, 70 42 C 80 42, 80 65, 88 65"
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="0.2"
              strokeLinecap="round"
              strokeDasharray="0 1.5"
            />
            
            {/* The Dotted Line - Updated to match orange/red theme */}
            <motion.path
              d="M 20 48 C 30 48, 35 75, 45 75 C 55 75, 60 42, 70 42 C 80 42, 80 65, 88 65"
              fill="none"
              stroke="#c2410c"
              strokeWidth="0.4"
              strokeLinecap="round"
              strokeDasharray="0.1 1.5"
              mask="url(#scrollMask)"
              style={{ strokeDashoffset: pathFlowOffset }}
            />
          </svg>

          {/* Milestones popping in automatically as the path hits them */}
          {MILESTONES.map((m) => (
            <MilestoneItem key={m.id} m={m} smoothProgress={smoothProgress} />
          ))}

          {/* Image Trail on Mouse Hover */}
          <AnimatePresence>
            {trail.map((img) => (
              <TrailImageItem key={img.id} img={img} smoothX={smoothX} smoothY={smoothY} />
            ))}
          </AnimatePresence>
        </div>

        {/* Decorative Bottom Elements */}
        <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 pointer-events-none z-20">
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em]">01 - 04 Steps</span>
            <div className="w-12 md:w-24 h-px bg-slate-300" />
          </div>
        </div>

        <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 text-right pointer-events-none z-20">
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-[0.8em] mb-3">Scroll to Reveal</p>
          <div className="flex items-center justify-end gap-3">
            <div className="w-2 h-2 bg-[#ea580c] rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.4)]" />
            <p className="text-slate-600 font-medium uppercase tracking-widest text-xs">Journey Active</p>
          </div>
        </div>
      </div>
    </section>
  );
}