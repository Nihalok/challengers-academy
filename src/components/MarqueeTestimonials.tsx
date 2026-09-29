import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data';

export default function MarqueeTestimonials() {
  // Duplicate testimonials for seamless looping
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-24 bg-gradient-to-r from-yellow via-orange to-crimson overflow-hidden relative border-y-8 border-white/20" aria-labelledby="testimonials-marquee-heading">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full flex flex-wrap gap-8 p-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-32 h-32 rounded-full border-[10px] border-white rotate-45" />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-white font-black uppercase tracking-[0.4em] text-[10px] mb-4 drop-shadow-sm">Player Experiences</div>
            <h2 id="testimonials-marquee-heading" className="text-4xl sm:text-5xl md:text-7xl font-condensed text-white uppercase tracking-tighter drop-shadow-md">
              The <span className="font-serif-italic normal-case text-white italic drop-shadow-none">Impact.</span>
            </h2>
          </motion.div>
        </div>

        {/* Marquee Wrapper */}
        <div className="flex relative overflow-hidden" role="region" aria-label="Customer testimonials carousel">
          <motion.div 
            className="flex whitespace-nowrap gap-8"
            animate={{ 
              x: [0, -1000],
            }}
            transition={{ 
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {marqueeItems.map((testimonial, idx) => (
              <div 
                key={`${testimonial.id}-${idx}`}
                className="w-[280px] sm:w-[340px] lg:w-[400px] bg-white/95 backdrop-blur-md p-5 sm:p-7 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl flex flex-col justify-between border border-white relative group hover:scale-[1.02] transition-transform duration-500"
                role="article"
              >
                <Quote className="absolute top-6 right-8 w-12 h-12 text-orange/10 group-hover:text-orange/20 transition-colors" aria-hidden="true" />
                
                <div className="relative z-10">
                  <p className="text-espresso font-serif-italic italic text-lg leading-relaxed mb-8 whitespace-normal">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-espresso/5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange/20 bg-ivory">
                    <img 
                      src={testimonial.avatar} 
                      alt={`Avatar of ${testimonial.name}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-espresso font-bold text-sm tracking-tight">{testimonial.name}</h4>
                    <p className="text-orange font-condensed text-[10px] uppercase tracking-widest font-black">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
