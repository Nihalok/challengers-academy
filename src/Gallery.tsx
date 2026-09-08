import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Maximize2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from './components/SEO';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  category?: string;
  createdAt?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT GALLERY ITEMS - initial academy archive photos
// ─────────────────────────────────────────────────────────────────────────────
const GALLERY_ITEMS: GalleryItem[] = [
  // ── Real training photos ─────────────────────────────────────────────────
  {
    id: 'coaching-session',
    type: 'image',
    url: new URL('./assets/images/coaching.png', import.meta.url).href,
    title: 'Head Coach Wilson at the Net',
    description: 'Head Coach Wilson Mathew during a live training session - focused, composed, and ready to coach.',
    category: 'Coaching & Technique',
  },
  {
    id: 'wilson-training',
    type: 'image',
    url: new URL('./assets/images/wilson.png', import.meta.url).href,
    title: 'Team Formation Drill',
    description: 'Players spread across the court in formation during a structured team training drill.',
    category: 'Team Drills',
  },
  {
    id: 'volley-practice',
    type: 'image',
    url: new URL('./assets/images/volley.png', import.meta.url).href,
    title: 'Setting Practice',
    description: 'Athletes perfecting their setting technique - the cornerstone of elite volleyball play.',
    category: 'Skill Foundations',
  },
  // ── Existing academy photos ───────────────────────────────────────────────
  {
    id: 'skill-dev',
    type: 'image',
    url: new URL('./assets/images/skill_development_1783920238862.jpg', import.meta.url).href,
    title: 'Skill Development',
    description: 'Intensive skill development drills building the fundamentals of elite volleyball.',
    category: 'Student Spotlight',
  },
  {
    id: 'team-huddle',
    type: 'image',
    url: new URL('./assets/images/team_training_huddle_1783920253600.jpg', import.meta.url).href,
    title: 'Team Huddle',
    description: "High-energy team training and huddle under Head Coach Wilson's expert guidance.",
    category: 'Team Drills',
  },
  {
    id: 'personal-coaching',
    type: 'image',
    url: new URL('./assets/images/personal_coaching_1783920294194.jpg', import.meta.url).href,
    title: 'Personal Coaching',
    description: 'One-on-one coaching sessions to sharpen individual technique and mental resilience.',
    category: 'Coaching & Technique',
  },
  {
    id: 'volleyball-hero',
    type: 'image',
    url: new URL('./assets/images/volleyball_hero_1783920221366.jpg', import.meta.url).href,
    title: 'In Action',
    description: 'Elite athletes pushing their limits on the Challengers court.',
    category: 'Matches & Scrimmages',
  },
  {
    id: 'journey-foundations',
    type: 'image',
    url: new URL('./assets/images/journey_phase_1_foundations_1784052995126.jpg', import.meta.url).href,
    title: 'Foundations Phase',
    description: 'Building strong volleyball fundamentals from day one.',
    category: 'Youth Academy',
  },
  {
    id: 'journey-specialization',
    type: 'image',
    url: new URL('./assets/images/journey_phase_2_specialization_1784053013443.jpg', import.meta.url).href,
    title: 'Specialization Phase',
    description: 'Athletes honing their specialty positions and tactical understanding.',
    category: 'Skill Foundations',
  },
  {
    id: 'journey-performance',
    type: 'image',
    url: new URL('./assets/images/journey_phase_3_performance_1784053031683.jpg', import.meta.url).href,
    title: 'Performance Phase',
    description: 'Athletes entering the high-performance stage of their development journey.',
    category: 'Matches & Scrimmages',
  },
  {
    id: 'journey-mastery',
    type: 'image',
    url: new URL('./assets/images/journey_phase_4_mastery_1784053049057.jpg', import.meta.url).href,
    title: 'Mastery',
    description: 'The pinnacle of the Challengers development programme - elite mastery.',
    category: 'Student Spotlight',
  },
  {
    id: 'vibrant-hero',
    type: 'image',
    url: new URL('./assets/images/vibrant_volleyball_hero_action_1784055193011.jpg', import.meta.url).href,
    title: 'Championship Spirit',
    description: 'Challengers athletes showcasing elite form and explosive athleticism.',
    category: 'Student Spotlight',
  },
];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          // Normalize URLs: if it's one of the bundled default items, use the local bundled Vite asset
          const resolvedItems = data.items.map((item: GalleryItem) => {
            const matchedLocal = GALLERY_ITEMS.find(local => local.id === item.id);
            if (matchedLocal) {
              return {
                ...item,
                url: matchedLocal.url,
                category: item.category || matchedLocal.category
              };
            }
            return item;
          });
          setItems(resolvedItems);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Live gallery fetch fallback to default assets:', err);
      }

      setItems(GALLERY_ITEMS);
      setIsLoading(false);
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: globalThis.WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 2, behavior: 'smooth' });
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const scrollContainer = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const openLightbox = (item: GalleryItem) => {
    const idx = items.indexOf(item);
    setLightboxIndex(idx);
    setSelectedItem(item);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const newIdx =
      dir === 'prev'
        ? (lightboxIndex - 1 + items.length) % items.length
        : (lightboxIndex + 1) % items.length;
    setLightboxIndex(newIdx);
    setSelectedItem(items[newIdx]);
  };

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 overflow-x-hidden flex flex-col justify-between">
      <SEO
        title="Academy Gallery"
        description="Browse through the highlights of Challengers Volleyball Academy. Photos and videos of our training sessions, matches, and community events."
      />
      <div className="container mx-auto px-4 md:px-8 my-auto">

        {/* ── Header with Scroll Navigation Buttons ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-12 h-[1px] bg-[#D62828]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D62828]">
                Visual Archives
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-condensed font-black text-espresso uppercase tracking-tighter leading-[0.85] mb-2"
            >
              CHALLENGERS{' '}
              <span className="font-serif-italic lowercase italic text-orange">in motion.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-espresso/60 max-w-lg text-xs md:text-sm font-medium leading-relaxed"
            >
              A high-definition chronicle of elite performance, championship victories, and daily practice.
            </motion.p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {!isLoading && (
              <span className="text-[11px] font-black text-espresso/40 uppercase tracking-widest hidden sm:inline-block">
                Scroll or Use Arrows ({items.length} Photos)
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollContainer('left')}
                aria-label="Scroll left"
                className="w-11 h-11 rounded-full bg-white hover:bg-orange hover:text-white text-espresso flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 border border-espresso/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollContainer('right')}
                aria-label="Scroll right"
                className="w-11 h-11 rounded-full bg-orange text-white flex items-center justify-center hover:bg-espresso transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Compact Horizontal Scrollable Gallery ── */}
        {isLoading ? (
          <div className="flex gap-5 overflow-hidden py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[280px] md:w-[360px] aspect-[4/3] shrink-0 rounded-[24px] bg-sand animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto py-4 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.04,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="shrink-0 w-[280px] sm:w-[340px] md:w-[400px] snap-start"
              >
                <GalleryCard item={item} index={index} onClick={() => openLightbox(item)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedItem(null)}
            className="absolute inset-0 bg-[#0e0e0e]/96 backdrop-blur-xl"
          />

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
            className="absolute left-4 md:left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image panel */}
          <motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-5xl bg-espresso rounded-[24px] overflow-hidden shadow-2xl z-10 flex flex-col"
          >
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#111]">
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="w-full max-h-[72vh] object-contain"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full max-h-[72vh] object-contain"
                />
              )}
            </div>
            <div className="px-6 py-5 bg-espresso flex items-center justify-between gap-4">
              <div>
                {selectedItem.category && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange block mb-1">
                    {selectedItem.category}
                  </span>
                )}
                <h2 className="text-lg md:text-2xl font-condensed font-black text-white uppercase tracking-tight">
                  {selectedItem.title}
                </h2>
                <p className="text-white/50 text-xs mt-1 max-w-xl">{selectedItem.description}</p>
              </div>
              <span className="text-white/30 text-sm font-black shrink-0">
                {lightboxIndex + 1} / {items.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-colors text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate('next'); }}
            className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}

function GalleryCard({ item, index, onClick }: GalleryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-sand cursor-pointer shadow-md hover:shadow-2xl transition-all duration-400 border border-espresso/10"
    >
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            {item.type === 'video' ? (
              <Play className="w-4 h-4 fill-current" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </div>
          <Maximize2 className="w-4 h-4 text-white/70" />
        </div>
        {item.category && (
          <span className="text-[9px] font-black uppercase tracking-wider text-orange mb-0.5 block">
            {item.category}
          </span>
        )}
        <h3 className="text-lg font-condensed font-black text-white uppercase tracking-tight leading-tight">
          {item.title}
        </h3>
        <p className="text-white/60 text-xs mt-1 line-clamp-2">{item.description}</p>
      </div>

      {/* Index & Category badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 group-hover:opacity-0 transition-opacity">
        <div className="px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-espresso/5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-espresso">
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        {item.category && (
          <div className="px-2.5 py-1 rounded-full bg-espresso/80 backdrop-blur-md text-white shadow-sm hidden sm:block">
            <span className="text-[9px] font-black uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
