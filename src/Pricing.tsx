import { useState } from 'react';
import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';
import { Check, Info, Clock, Users, User, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SEO from './components/SEO';

const OFFICIAL_PACKAGES = [
  {
    id: 'tryout-session',
    name: 'Tryout Session',
    category: 'Assessment',
    students: 'Individual / Group',
    duration: '2 Hours',
    sessions: '1 Session',
    price: 30,
    priceNote: 'one-time',
    desc: 'Perfect introduction to evaluate skills and experience our coaching style.',
    features: [
      'Comprehensive 2-hour court evaluation',
      'Coach skill & mechanics feedback',
      'Placement recommendation',
      'Zero long-term commitment'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#2E2400] via-[#1C1600] to-[#0A0800] border-[#F9BC00]/60 text-white',
    badgeClass: 'bg-[#F9BC00] text-espresso',
    btnClass: 'bg-[#F9BC00] text-espresso hover:bg-white',
    bgImage: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gym-training-4',
    name: 'Gym Training (4 Sessions)',
    category: 'Indoor Gym',
    students: 'Group',
    duration: '2 Hours / session',
    sessions: '4 Sessions',
    price: 200,
    priceNote: '/ package',
    desc: 'Core indoor academy training with structured drills, rotations, and scrimmage.',
    features: [
      '4 x 2-hour indoor gym sessions',
      'Technical passing, serving & spiking',
      'Positional rotation & game systems',
      'Active coach mentorship'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#1C1600] via-[#2E2400] to-[#121212] border-[#F9BC00]/50 text-white',
    badgeClass: 'bg-[#F9BC00] text-espresso',
    btnClass: 'bg-[#F9BC00] text-espresso hover:bg-white',
    bgImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gym-training-12',
    name: 'Gym Training (12 Sessions)',
    category: 'Indoor Gym',
    students: 'Group',
    duration: '2 Hours / session',
    sessions: '12 Sessions',
    price: 550,
    priceNote: '/ package',
    desc: 'Our most comprehensive indoor development program for rapid improvement.',
    features: [
      '12 x 2-hour high-intensity gym sessions',
      'Position-specific specialization',
      'Biomechanical jump & spike review',
      'School & club tryout prep',
      'Save $50 compared to 4-session pack'
    ],
    popular: true,
    color: 'bg-gradient-to-br from-[#610C0C] via-[#3B0707] to-[#1F0404] border-[#D62828]/80 text-white',
    badgeClass: 'bg-[#D62828] text-white',
    btnClass: 'bg-white text-espresso hover:bg-[#F9BC00]',
    bgImage: 'https://images.unsplash.com/photo-1592656631147-f1aa2112bf7c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'open-park-group',
    name: 'Open Park Group Training',
    category: 'Outdoor Park',
    students: 'Group',
    duration: '2 Hours / session',
    sessions: '4 Sessions',
    price: 150,
    priceNote: 'per student',
    desc: 'High-rep outdoor training building endurance, agility, and fundamental skills.',
    features: [
      '4 x 2-hour outdoor park sessions',
      'Full skill development in open air',
      'High repetition passing & defense',
      'Great value group format'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#06383C] via-[#032023] to-[#011112] border-[#0B5D51]/70 text-white',
    badgeClass: 'bg-[#0B5D51] text-white',
    btnClass: 'bg-[#0B5D51] text-white hover:bg-white hover:text-espresso',
    bgImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'open-park-private',
    name: 'Open Park (Private 1-on-1)',
    category: 'Private Coaching',
    students: '1 Student',
    duration: '1 Hour / session',
    sessions: '4 Sessions',
    price: 360,
    priceNote: '/ package',
    desc: 'Dedicated 1-on-1 coaching customized completely to your personal mechanics.',
    features: [
      '4 x 1-hour private sessions',
      '100% focused one-on-one attention',
      'Targeted weakness elimination',
      'Custom drill progression'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#1F1F24] via-[#0E1520] to-[#070B12] border-amber-400/60 text-white',
    badgeClass: 'bg-amber-400 text-espresso',
    btnClass: 'bg-amber-400 text-espresso hover:bg-white',
    bgImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'open-park-travel',
    name: 'Open Park (Short Distance Travel)',
    category: 'Private Coaching',
    students: '1 Student',
    duration: '1 Hour / session',
    sessions: '4 Sessions',
    price: 320,
    priceNote: '/ package',
    desc: 'Personalized private coaching at convenient nearby park facilities.',
    features: [
      '4 x 1-hour private sessions',
      'Nearby park location flexibility',
      'Custom technique acceleration',
      'Personalized drill routines'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#5E2404] via-[#3A1602] to-[#1F0B01] border-[#F3722C]/70 text-white',
    badgeClass: 'bg-[#F3722C] text-white',
    btnClass: 'bg-[#F3722C] text-white hover:bg-white hover:text-espresso',
    bgImage: 'https://images.unsplash.com/photo-1593787467001-7394837e5814?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'large-group-training',
    name: 'Large Group Training (13+)',
    category: 'Team / Group',
    students: '13+ Students',
    duration: '2 Hours / session',
    sessions: '4 Sessions',
    price: 120,
    priceNote: 'per student',
    desc: 'Special group pricing for school squads, clubs, and large youth batches.',
    features: [
      '4 x 2-hour team & group sessions',
      'Team rotation & system tactical play',
      'Competitive squad scrimmages',
      'Custom scheduling for groups'
    ],
    popular: false,
    color: 'bg-gradient-to-br from-[#071A2D] via-[#04101D] to-[#02080F] border-blue-400/60 text-white',
    badgeClass: 'bg-blue-600 text-white',
    btnClass: 'bg-blue-600 text-white hover:bg-white hover:text-espresso',
    bgImage: 'https://images.unsplash.com/photo-1547347298-1d74850778d1?auto=format&fit=crop&w=800&q=80'
  }
];

export default function Pricing() {
  return (
    <div className="relative pt-32 sm:pt-36 md:pt-40 pb-20 min-h-screen bg-[#FBF9F6] font-sans">
      <SEO 
        title="Training Fees & Packages" 
        description="Transparent pricing for Challengers Volleyball Academy training packages. Gym training, open park group, private 1-on-1, and team coaching in the Bay Area."
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <SectionHeader 
          eyebrow="Transparent Rates" 
          title="Training Packages & Official Fee Schedule." 
          italicWord="Schedule"
          id="pricing-header"
        />

        {/* ── SIBLING FAMILY DISCOUNT HIGHLIGHT BANNER ── */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0B5D51] to-emerald-900 border border-emerald-400/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 text-xl font-black">
              -$50
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-emerald-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Family Discount
                </span>
                <span className="text-emerald-200 text-xs font-semibold">All Programs Included</span>
              </div>
              <h4 className="text-base sm:text-lg font-condensed font-black uppercase tracking-tight text-white mt-0.5">
                Registering with a Sibling? Get an Instant $50 Total Discount!
              </h4>
              <p className="text-xs text-emerald-100/80">
                Enroll 2 brothers or sisters together in any session and save $50 automatically during registration checkout.
              </p>
            </div>
          </div>
          <NavLink
            to="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#0B5D51] font-condensed font-black text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all shrink-0 text-center shadow"
          >
            Claim Sibling Deal &rarr;
          </NavLink>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
          {OFFICIAL_PACKAGES.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`relative p-6 sm:p-8 rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col justify-between ${plan.color}`}
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                  src={plan.bgImage} 
                  alt={plan.name}
                  className="w-full h-full object-cover opacity-20 scale-105 group-hover:scale-110 transition-transform duration-700 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
              </div>

              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D62828] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md z-20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#F9BC00]" /> Most Popular • Best Value
                </div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${plan.badgeClass}`}>
                    {plan.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{plan.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-condensed font-black uppercase tracking-tight mb-2 text-white">{plan.name}</h3>
                <p className="text-xs text-white/75 mb-6 leading-relaxed min-h-[32px]">{plan.desc}</p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl sm:text-5xl font-condensed font-black tracking-tighter text-white">${plan.price}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    {plan.priceNote}
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-[11px] font-bold text-white/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>Students: <strong className="text-white">{plan.students}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>Package: <strong className="text-white">{plan.sessions}</strong></span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs font-medium text-white/90">
                      <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <NavLink
                to={`/register?session=${plan.id}`}
                className={`relative z-10 w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${plan.btnClass}`}
              >
                Enroll in Package <ArrowRight className="w-4 h-4" />
              </NavLink>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-espresso/5 shadow-xl">
          <div className="mb-6">
            <span className="text-[#D62828] text-[10px] font-black uppercase tracking-widest">Official Schedule</span>
            <h3 className="text-2xl sm:text-3xl font-condensed font-black uppercase text-espresso mt-1">
              Challengers Volleyball Academy Training Fees
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-espresso/10 text-espresso/40 text-[10px] font-black uppercase tracking-widest">
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Session Duration</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/5 font-medium text-espresso/80">
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Gym Training</td>
                  <td className="py-3.5 px-4">Group</td>
                  <td className="py-3.5 px-4">2 hours</td>
                  <td className="py-3.5 px-4">4 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$200</td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors bg-[#D62828]/5">
                  <td className="py-3.5 px-4 font-bold text-espresso flex items-center gap-2">
                    Gym Training
                    <span className="text-[9px] bg-[#D62828] text-white px-2 py-0.5 rounded-full font-bold uppercase">Best Value</span>
                  </td>
                  <td className="py-3.5 px-4">Group</td>
                  <td className="py-3.5 px-4">2 hours</td>
                  <td className="py-3.5 px-4">12 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$550</td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Open Park (Private Coaching)</td>
                  <td className="py-3.5 px-4">1 student</td>
                  <td className="py-3.5 px-4">1 hour</td>
                  <td className="py-3.5 px-4">4 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$360</td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Open Park (Short Distance Travel)</td>
                  <td className="py-3.5 px-4">1 student</td>
                  <td className="py-3.5 px-4">1 hour</td>
                  <td className="py-3.5 px-4">4 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$320</td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Open Park - Group Training</td>
                  <td className="py-3.5 px-4">Group</td>
                  <td className="py-3.5 px-4">2 hours</td>
                  <td className="py-3.5 px-4">4 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$150 <span className="text-[10px] text-espresso/40">/ student</span></td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Large Group Training</td>
                  <td className="py-3.5 px-4">13 or more students</td>
                  <td className="py-3.5 px-4">2 hours</td>
                  <td className="py-3.5 px-4">4 sessions</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$120 <span className="text-[10px] text-espresso/40">/ student</span></td>
                </tr>
                <tr className="hover:bg-[#FBF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-espresso">Tryout Session</td>
                  <td className="py-3.5 px-4">Individual / Group</td>
                  <td className="py-3.5 px-4">2 hours</td>
                  <td className="py-3.5 px-4">1 session</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D62828] text-sm">$30</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sibling Discount Info */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-10 bg-white p-6 rounded-[1.5rem] border border-espresso/5 flex items-start gap-4 max-w-xl mx-auto shadow-md"
        >
          <div className="w-10 h-10 bg-[#D62828]/10 rounded-xl flex items-center justify-center text-[#D62828] shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base mb-1 text-espresso">Sibling Discount</h4>
            <p className="text-espresso/60 text-xs leading-relaxed">
              Registering more than one child? We offer a <span className="text-[#D62828] font-bold">10% discount</span> on regular package fees and summer camp registrations for each additional sibling.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

