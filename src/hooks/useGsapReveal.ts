import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGsapReveal = () => {
  useEffect(() => {
    let ctx: gsap.Context;

    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const reveals = document.querySelectorAll('.gsap-reveal');
        
        reveals.forEach((el) => {
          gsap.fromTo(el, 
            { 
              y: 20, 
              opacity: 0 
            }, 
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                toggleActions: 'play none none none',
                once: true
              }
            }
          );
        });
      });

      ScrollTrigger.refresh();
    }, 40);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, []);
};
