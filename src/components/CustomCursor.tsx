import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const lastMousePos = useRef({ x: -100, y: -100 });
  const rotation = useRef(0);

  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'hidden'>('hidden');
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only initialize on desktop devices with a fine pointer (mouse/trackpad)
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer || ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    document.documentElement.classList.add('custom-cursor-enabled');

    let rafId: number;

    const updateFrame = () => {
      // Calculate speed and directional spin for volleyball
      const dx = mousePos.current.x - lastMousePos.current.x;
      const dy = mousePos.current.y - lastMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.3) {
        rotation.current += (dx * 0.7 + dy * 0.3);
      }

      lastMousePos.current.x = mousePos.current.x;
      lastMousePos.current.y = mousePos.current.y;

      // Move volleyball cursor instantly (0 latency)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Rotate volleyball smoothly
      if (ballRef.current) {
        ballRef.current.style.transform = `rotate(${rotation.current}deg)`;
      }

      rafId = requestAnimationFrame(updateFrame);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (cursorType === 'hidden') {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => {
      setCursorType('hidden');
    };

    const handleMouseEnter = () => {
      setCursorType('default');
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isClickable = !!target.closest(
        'button, a, [role="button"], input[type="submit"], input[type="button"], label, select, .cursor-pointer, [data-clickable]'
      );

      if (isClickable) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [cursorType]);

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  const isHidden = cursorType === 'hidden';
  const isPointer = cursorType === 'pointer';

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform transition-opacity duration-150 ${
        isHidden ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${
          isClicking ? 'scale-85' : isPointer ? 'scale-120' : 'scale-100'
        }`}
      >
        {/* Standalone Volleyball Ball Only */}
        <div className="relative w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_3px_8px_rgba(0,0,0,0.3)]">
          <div ref={ballRef} className="w-full h-full will-change-transform">
            <VolleyballSVG />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium 3D Vector Volleyball Component
 * Pure volleyball vector graphic with Academy colors (Crimson, Gold, White)
 */
function VolleyballSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full select-none block"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Realistic 3D Spherical Base Gradient */}
        <radialGradient id="vbSphereBase" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="85%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>

        {/* Premium Crimson Panel Gradient */}
        <linearGradient id="vbCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Warm Gold/Yellow Panel Gradient */}
        <linearGradient id="vbGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Deep Navy Seam & Depth Shadow */}
        <radialGradient id="vbAmbientShadow" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Base Spherical Core */}
      <circle cx="50" cy="50" r="46" fill="url(#vbSphereBase)" stroke="#1e293b" strokeWidth="2.8" />

      {/* --- PANEL GROUP 1 (Top-Left) --- */}
      <path
        d="M 12,34 C 20,24 34,18 48,16 C 44,28 36,38 24,44 C 18,42 14,38 12,34 Z"
        fill="url(#vbCrimsonGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 18,22 C 26,14 38,10 50,10 C 48,15 44,20 40,24 C 30,22 22,22 18,22 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 24,44 C 36,38 44,28 48,16 C 54,26 52,38 44,48 C 36,48 30,46 24,44 Z"
        fill="url(#vbGoldGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* --- PANEL GROUP 2 (Top-Right) --- */}
      <path
        d="M 50,10 C 64,10 78,16 86,26 C 76,34 68,40 56,44 C 52,32 50,22 50,10 Z"
        fill="url(#vbCrimsonGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 86,26 C 92,34 94,44 94,52 C 84,50 74,48 66,48 C 72,40 78,34 86,26 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 56,44 C 68,40 76,34 86,26 C 78,40 72,50 66,58 C 58,56 54,50 56,44 Z"
        fill="url(#vbGoldGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* --- PANEL GROUP 3 (Bottom-Left) --- */}
      <path
        d="M 8,50 C 8,62 14,74 24,84 C 32,74 38,64 42,52 C 30,50 20,48 8,50 Z"
        fill="url(#vbCrimsonGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 24,84 C 34,92 44,94 54,94 C 52,82 50,72 48,62 C 40,68 32,76 24,84 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 42,52 C 38,64 32,74 24,84 C 34,80 42,72 48,62 C 48,56 46,52 42,52 Z"
        fill="url(#vbGoldGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* --- PANEL GROUP 4 (Bottom-Right) --- */}
      <path
        d="M 54,94 C 68,94 80,88 88,78 C 78,72 70,64 62,56 C 58,68 56,80 54,94 Z"
        fill="url(#vbCrimsonGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 88,78 C 94,68 96,58 94,52 C 84,56 74,60 66,66 C 72,72 80,76 88,78 Z"
        fill="url(#vbGoldGrad)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 62,56 C 70,64 78,72 88,78 C 76,84 66,90 54,94 C 58,82 60,70 62,56 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Ambient Edge Shadow Overlay */}
      <circle cx="50" cy="50" r="46" fill="url(#vbAmbientShadow)" pointerEvents="none" />

      {/* 3D Specular Highlight */}
      <ellipse
        cx="34"
        cy="28"
        rx="16"
        ry="9"
        transform="rotate(-28 34 28)"
        fill="#ffffff"
        opacity="0.45"
      />
      <circle cx="28" cy="22" r="3" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}
