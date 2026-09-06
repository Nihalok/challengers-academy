import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { label: 'Programs', path: '/programs' },
  { label: 'Performance', path: '/performance' },
  { label: 'Waiver', path: '/waiver' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Camps', path: '/camps' },
  { label: 'Contact', path: '/contact' },
];

export default function Navigation() {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const { pathname } = useLocation();

  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    setIsAtTop(window.scrollY < 20);

    const TOP_THRESHOLD = 40; // always expanded above this
    const DELTA = 4; // ignore tiny scroll jitters

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastY.current;

        setIsAtTop(y < 20);

        if (y < TOP_THRESHOLD) {
          setCollapsed(false);
        } else if (diff > DELTA) {
          // scrolling down
          setCollapsed(true);
        } else if (diff < -DELTA) {
          // scrolling up
          setCollapsed(false);
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* ── Announcement Bar (Top of screen) ── */}
      <aside
        aria-label="Upcoming season announcements"
        className={cn(
          'fixed top-0 left-0 right-0 z-[59] w-full bg-[#0f0f1a] border-b border-white/5 overflow-hidden transition-all duration-300 ease-in-out',
          isAtTop ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          {/* Ticker left */}
          <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
            <span className="text-[#FFD700] text-[9px] sm:text-[10px] font-black uppercase tracking-widest shrink-0 flex items-center gap-1">
              ⚡ UPCOMING SEASON
            </span>
            <div className="overflow-hidden flex-1">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                className="flex whitespace-nowrap"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="text-white/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mr-8">
                    • WEEKEND BATCHES AVAILABLE &nbsp;• FREMONT &nbsp;• TRACY &nbsp;• SAN LEANDRO &nbsp;
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Social icons right */}
          <div className="hidden sm:flex items-center gap-4 ml-4 shrink-0">
            <a href="#" aria-label="Instagram" className="text-white/50 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className="text-white/50 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="text-white/50 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </aside>

      {/* ── Shrinkable Floating Navbar ── */}
      <nav
        className={cn(
          'snb',
          collapsed && 'snb--collapsed',
          isAtTop ? 'snb--top' : 'snb--scrolled'
        )}
        aria-label="Main navigation"
      >
        <div className="snb__inner">
          {/* 3D Projecting Big Logo */}
          <NavLink
            to="/"
            className="snb__logo group"
            aria-label="Challengers Academy Home"
          >
            <div className="snb__logo-badge">
              <div className="snb__logo-mark">
                <img
                  src="/academy_logo.png"
                  alt="Challengers Volleyball Academy Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="snb__logo-text">
              <span className="text-white font-condensed text-[15px] font-black tracking-[0.18em] uppercase leading-none block drop-shadow-sm">
                CHALLENGERS
              </span>
              <span className="text-[#C1272D] font-condensed text-[10px] font-black tracking-[0.25em] uppercase leading-none mt-0.5 block drop-shadow-sm">
                ACADEMY
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <ul className="snb__links">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      'snb__link flex items-center gap-1 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-200 rounded-full',
                      isActive
                        ? 'text-white bg-white/12 shadow-inner'
                        : 'text-white/75 hover:text-white hover:bg-white/8'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Enroll Now + Mobile Toggle */}
          <div className="snb__ctas">
            <NavLink
              to="/register"
              className="snb__btn snb__btn--solid"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </NavLink>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors shrink-0"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                  >
                    <Menu className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] lg:hidden"
          >
            <div className="absolute inset-0 bg-[#1a1a2e]/98 backdrop-blur-3xl" />

            <div className="relative h-full flex flex-col p-8 pt-[110px]">
              <div className="space-y-6">
                <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Academy Navigation</span>
                <div className="flex flex-col gap-4">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <NavLink
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center justify-between py-3 border-b border-white/8 text-3xl sm:text-4xl font-condensed font-black uppercase tracking-tighter',
                            isActive ? 'text-white' : 'text-white/40 hover:text-white'
                          )
                        }
                      >
                        {link.label}
                        <ArrowRight className="w-6 h-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C1272D]" />
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <NavLink
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 w-full bg-[#C1272D] hover:bg-[#a01e24] text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-2xl active:scale-[0.98] transition-transform"
                >
                  Enroll Now
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .snb {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          width: min(1360px, calc(100% - 32px));
          border-radius: 999px;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 14px 40px -10px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
          transition: width 0.45s cubic-bezier(0.65, 0, 0.35, 1),
                      top 0.35s cubic-bezier(0.65, 0, 0.35, 1),
                      background 0.3s ease,
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }

        .snb--top {
          top: 48px;
        }

        .snb--scrolled {
          top: 16px;
        }

        .snb__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 8px 12px 8px 12px;
        }

        .snb__logo {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          color: #fff;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
          position: relative;
        }

        /* 3D Projecting Big Logo Badge */
        .snb__logo-badge {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 28%, #323254 0%, #17172b 68%, #0b0b14 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: -12px;
          margin-bottom: -12px;
          border: 2px solid rgba(255, 255, 255, 0.28);
          box-shadow: 
            0 10px 24px -3px rgba(0, 0, 0, 0.75),
            0 4px 10px rgba(193, 39, 45, 0.4),
            inset 0 2px 3px rgba(255, 255, 255, 0.5),
            inset 0 -3px 5px rgba(0, 0, 0, 0.7);
          transform: translateY(-2px) translateZ(0);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.35s ease;
        }

        .snb__logo:hover .snb__logo-badge {
          transform: translateY(-6px) scale(1.09) rotate(-2deg);
          box-shadow: 
            0 16px 32px -4px rgba(0, 0, 0, 0.85),
            0 8px 18px rgba(193, 39, 45, 0.6),
            inset 0 2.5px 4px rgba(255, 255, 255, 0.7),
            inset 0 -3px 5px rgba(0, 0, 0, 0.7);
        }

        .snb__logo-mark {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
          transition: transform 0.3s ease;
        }

        .snb__logo:hover .snb__logo-mark {
          transform: scale(1.08);
        }

        .snb__logo-text {
          white-space: nowrap;
          overflow: hidden;
          max-width: 190px;
          opacity: 1;
          transition: max-width 0.4s ease, opacity 0.25s ease, margin 0.4s ease;
        }

        .snb__links {
          display: flex;
          align-items: center;
          gap: 6px;
          list-style: none;
          margin: 0;
          padding: 0;
          overflow: hidden;
          max-width: 720px;
          opacity: 1;
          transition: max-width 0.4s ease, opacity 0.25s ease, gap 0.4s ease;
        }

        .snb__links a {
          white-space: nowrap;
        }

        .snb__ctas {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .snb__btn {
          white-space: nowrap;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 9px 20px;
          border-radius: 999px;
          transition: opacity 0.2s ease, transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .snb__btn:active {
          transform: scale(0.96);
        }

        .snb__btn--solid {
          color: #fff;
          background: #C1272D;
          box-shadow: 0 4px 18px rgba(193, 39, 45, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .snb__btn--solid:hover {
          background: #a01e24;
          box-shadow: 0 6px 22px rgba(193, 39, 45, 0.6);
        }

        /* ---- collapsed state ---- */
        .snb--collapsed {
          width: min(340px, calc(100% - 32px));
        }

        .snb--collapsed .snb__logo-text {
          max-width: 0;
          opacity: 0;
          margin-right: -8px;
          pointer-events: none;
        }

        .snb--collapsed .snb__links {
          max-width: 0;
          opacity: 0;
          gap: 0;
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .snb {
            width: calc(100% - 24px);
            top: 46px;
          }
          .snb--top {
            top: 46px;
          }
          .snb--scrolled {
            top: 12px;
          }
          .snb--collapsed {
            width: min(310px, calc(100% - 24px));
          }
          .snb__logo-badge {
            width: 50px;
            height: 50px;
            margin-top: -8px;
            margin-bottom: -8px;
          }
          .snb__logo-mark {
            width: 38px;
            height: 38px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .snb, .snb__logo-text, .snb__links, .snb__btn, .snb__logo-badge {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
