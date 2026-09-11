import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import SectionHeader from './components/SectionHeader';
import PerformanceDashboard from './components/PerformanceDashboard';
import ThreeSpike from './components/ThreeSpike';
import { ArrowUpRight, Trophy, Zap, Target, Activity } from 'lucide-react';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';
import { ASSETS } from './assets/images';

export default function Performance() {
  useGsapReveal();
  
  return (
    <div className="relative min-h-screen bg-[#FBF9F6] overflow-hidden">
      {/* Blended Athletic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={ASSETS.PERFORMANCE.DASHBOARD_BG} 
          alt="" 
          className="w-full h-full object-cover scale-110"
          aria-hidden="true"
          decoding="async"
          loading="lazy"
        />
        {/* Multilayered Blending Overlay */}
        <div className="absolute inset-0 bg-ivory/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-ivory/20 via-transparent to-transparent mix-blend-overlay" />
        <div className="absolute inset-0 bg-espresso/20 backdrop-blur-[1px] transition-all duration-1000" />
      </div>

      <SEO 
        title="Performance Analytics" 
        description="Track your progress with our high-performance volleyball analytics dashboard. Measure spikes, agility, and teamwork to reach your full potential."
      />

      <div className="container mx-auto px-4 relative z-10 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16">
        {/* Header */}
        <div className="gsap-reveal mb-14">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-10 bg-[#D62828]" />
                <span className="text-[#D62828] font-black text-[10px] tracking-[0.4em] uppercase">Metrics & Analytics</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-condensed font-black text-espresso uppercase tracking-tighter leading-[0.85] mb-6">
                Precision <span className="text-[#D62828] italic">Feedback.</span>
              </h1>
              <p className="text-espresso/85 text-base font-medium max-w-xl leading-relaxed">
                We utilize advanced biomechanical tracking to quantify athletic growth. Our analytics engine provides real-time insights into velocity, precision, and strategic court coverage.
              </p>
            </motion.div>
            <div className="w-full lg:w-2/5 aspect-[16/10] bg-white border border-espresso/5 rounded-[2.5rem] overflow-hidden shadow-xl relative group">
               <img 
                 src={ASSETS.PERFORMANCE.ANALYTICS_HERO} 
                 alt="Performance Analytics Visualization" 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                 decoding="async"
                 loading="lazy"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent" />
               
               {/* Data HUD Overlay */}
               <div className="absolute top-5 left-5 flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl">
                 <div className="w-7 h-7 bg-[#F9BC00] rounded-md flex items-center justify-center">
                   <Activity className="w-4 h-4 text-espresso" />
                 </div>
                 <div>
                   <div className="text-[8px] font-black uppercase tracking-widest text-white/60">Real-time Feed</div>
                   <div className="text-[10px] font-black text-white">SYNC_ACTIVE</div>
                 </div>
               </div>

               <div className="absolute bottom-5 right-5 flex items-center gap-3">
                 <div className="text-right">
                   <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">Peak Velocity</div>
                   <div className="text-xl font-condensed font-black text-[#F9BC00]">94.2 KM/H</div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Core Dashboard */}
        <div className="gsap-reveal">
          <PerformanceDashboard />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 gsap-reveal" role="list" aria-label="Performance tracking features">
          {[
            { 
              icon: Zap, 
              title: 'Explosive Power', 
              desc: 'Tracking vertical jump velocity and impact force across every training phase.',
              bg: 'bg-[#F9BC00]',
              text: 'text-espresso'
            },
            { 
              icon: Target, 
              title: 'Skill Precision', 
              desc: 'Mathematical measurement of serve placement and passing accuracy on the court.',
              bg: 'bg-[#D62828]',
              text: 'text-white'
            },
            { 
              icon: Trophy, 
              title: 'Elite Status', 
              desc: 'Comparative analysis against National standards and personal growth targets.',
              bg: 'bg-[#1A1A1A]',
              text: 'text-white'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${feature.bg} ${feature.text} p-6 md:p-8 rounded-[2rem] border border-espresso/5 shadow-xl group hover:-translate-y-1 transition-all duration-500`}
              role="listitem"
            >
              <div className={`w-12 h-12 ${feature.bg === 'bg-[#F9BC00]' ? 'bg-espresso/10' : 'bg-white/10'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`} aria-hidden="true">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-condensed font-black uppercase tracking-tight mb-4">{feature.title}</h3>
              <p className="opacity-70 text-xs font-bold leading-relaxed mb-6 italic">
                {feature.desc}
              </p>
              <button 
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`View details for ${feature.title}`}
              >
                METRIC DETAILS <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="group mt-16 p-10 md:p-14 rounded-[3rem] bg-[#D62828] border border-espresso/5 text-center relative overflow-hidden shadow-xl gsap-reveal text-white"
          role="complementary"
          aria-labelledby="performance-cta-heading"
        >
          {/* Subtle Grain/Dot Pattern */}
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-multiply" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6 group-hover:scale-105 transition-transform duration-700">
              <div className="bg-white/10 p-4 rounded-full border border-white/20">
                <Target className="w-8 h-8 text-[#F9BC00]" />
              </div>
            </div>

            <h2 id="performance-cta-heading" className="text-3xl md:text-5xl font-condensed font-black uppercase leading-[0.9] text-white mb-4 tracking-tighter">
              Calibrate Your <span className="text-[#F9BC00] italic">Potential.</span>
            </h2>
            
            <p className="text-white/80 text-sm md:text-base font-medium max-w-xl mx-auto mb-8 leading-relaxed">
              Unlock the full precision of our tracking systems. Get expert video breakdowns and biomechanical analysis for every touch.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <NavLink to="/register" className="px-8 py-4 bg-espresso text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-espresso transition-all shadow-xl">
                Begin Phase 01
              </NavLink>
              <NavLink to="/contact" className="px-8 py-4 bg-white text-espresso border border-espresso/5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-espresso hover:text-white transition-all shadow-md">
                Request Eval
              </NavLink>
            </div>
          </div>
          
          {/* Architectural Ornaments */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-espresso/10 rounded-full blur-[120px] -ml-48 -mb-48" />
        </motion.div>
      </div>
    </div>
  );
}
