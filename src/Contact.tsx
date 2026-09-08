import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';
import { Mail, Phone, Send, MessageCircle, MapPin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  useGsapReveal();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-14 bg-[#FBF9F6] min-h-screen overflow-hidden font-sans">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Challengers Volleyball Academy. Reach out for enrollment, trial sessions, or any inquiries about our elite training programs."
      />
      
      {/* Blended Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1592656670411-b91990822650?q=80&w=2000" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.05] mix-blend-multiply grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF9F6]/80 via-transparent to-[#FBF9F6]/80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl"
      >
        <div className="gsap-reveal mb-4 sm:mb-6">
          <SectionHeader 
            eyebrow="Get in Touch" 
            title="Ready to spike your skills?"
            italicWord="spike"
            id="contact-header"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 mt-4 sm:mt-6 items-start">
          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6 gsap-reveal">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-condensed uppercase tracking-tighter mb-2 sm:mb-3 leading-tight text-espresso">Let's start a <br /><span className="text-[#D62828] italic">conversation.</span></h2>
              <p className="text-xs sm:text-sm font-medium text-espresso/60 leading-relaxed max-w-xl">
                Have questions about our programs, camps, or schedule? We're here to help you find the perfect fit for your athlete.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: Phone, label: 'Phone', value: '+1 (510) 555-0123', sub: 'Mon-Fri 9am - 6pm', color: 'bg-[#F9BC00]' },
                { icon: Mail, label: 'Email', value: 'challengersacademy@gmail.com', sub: 'Response within 24 hours', color: 'bg-[#D62828]' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+1 863-845-9913', sub: 'Fastest for quick questions', color: 'bg-[#1A1A1A]' },
                { icon: MapPin, label: 'Training Locations', value: 'Fremont · Manteca · MH · SJ', sub: 'Hansen Elem, Courtside & more', color: 'bg-[#F3722C]' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="flex gap-3 items-center p-3.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-espresso/5 shadow-md group transition-all"
                >
                  <div className={`w-10 sm:w-11 h-10 sm:h-11 ${item.color} ${idx === 0 ? 'text-espresso' : 'text-white'} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-espresso/40 mb-0.5">{item.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-espresso truncate">{item.value}</p>
                    <p className="text-[9px] sm:text-[10px] font-medium text-espresso/40 uppercase tracking-wider truncate">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-espresso/5 relative overflow-hidden group gsap-reveal">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9BC00]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 sm:py-8 space-y-4"
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#D62828]/10 rounded-full flex items-center justify-center mx-auto text-[#D62828]">
                  <Send className="w-7 sm:w-8 h-7 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif text-espresso mb-2">Message Sent!</h3>
                  <p className="text-espresso/60 font-medium leading-relaxed max-w-sm mx-auto text-xs">
                    Thank you for reaching out. We've received your message and our team will get back to you shortly.
                  </p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-[#D62828] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-espresso transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Full Name</label>
                    <input 
                      required
                      className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Email Address</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Subject</label>
                  <select className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm appearance-none">
                    <option>General Inquiry</option>
                    <option>Program Registration</option>
                    <option>Summer Camp Questions</option>
                    <option>Private Coaching Request</option>
                  </select>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button type="submit" className="w-full bg-espresso text-white py-3 sm:py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#D62828] transition-all shadow-md hover:shadow-[#D62828]/20">
                  Send Message
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
