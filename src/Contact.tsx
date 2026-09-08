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
    <div className="relative py-12 md:py-16 bg-[#FBF9F6] min-h-screen overflow-hidden font-sans">
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
        className="container mx-auto px-4 relative z-10"
      >
        <div className="gsap-reveal mb-10">
          <SectionHeader 
            eyebrow="Get in Touch" 
            title="Ready to spike your skills?"
            italicWord="spike"
            id="contact-header"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mt-8 sm:mt-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8 sm:space-y-12 gsap-reveal">
            <div>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-condensed uppercase tracking-tighter mb-4 sm:mb-6 leading-tight text-espresso">Let's start a <br /><span className="text-[#D62828] italic">conversation.</span></h2>
              <p className="text-base sm:text-lg md:text-xl font-medium text-espresso/60 leading-relaxed max-w-xl">
                Have questions about our programs, camps, or schedule? We're here to help you find the perfect fit for your athlete.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                { icon: Phone, label: 'Phone', value: '+1 (510) 555-0123', sub: 'Mon-Fri 9am - 6pm', color: 'bg-[#F9BC00]' },
                { icon: Mail, label: 'Email', value: 'challengersacademy@gmail.com', sub: 'Response within 24 hours', color: 'bg-[#D62828]' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+1 863-845-9913', sub: 'Fastest for quick questions', color: 'bg-[#1A1A1A]' },
                { icon: MapPin, label: 'Training Locations', value: 'Fremont · Manteca · Mountain House · San Jose', sub: 'Hansen Elementary, Courtside Sports & more', color: 'bg-[#F3722C]' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 10 }}
                  className="flex gap-4 sm:gap-6 items-center p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-espresso/5 shadow-xl group transition-all"
                >
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 ${item.color} ${idx === 0 ? 'text-espresso' : 'text-white'} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                    <item.icon className="w-6 sm:w-7 h-6 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-espresso/40 mb-0.5 sm:mb-1">{item.label}</p>
                    <p className="text-base sm:text-lg font-bold text-espresso">{item.value}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-espresso/30 uppercase tracking-widest">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-espresso/5 relative overflow-hidden group gsap-reveal">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9BC00]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-12 space-y-6 sm:space-y-8"
              >
                <div className="w-16 sm:w-24 h-16 sm:h-24 bg-[#D62828]/10 rounded-full flex items-center justify-center mx-auto text-[#D62828]">
                  <Send className="w-8 sm:w-12 h-8 sm:h-12" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-serif text-espresso mb-3 sm:mb-4">Message Sent!</h3>
                  <p className="text-espresso/60 font-medium leading-relaxed max-w-sm mx-auto text-xs sm:text-sm">
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
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-espresso/40 ml-2">Full Name</label>
                    <input 
                      required
                      className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-3.5 sm:py-5 px-4 sm:px-6 transition-all rounded-xl sm:rounded-2xl font-medium text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-espresso/40 ml-2">Email Address</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-3.5 sm:py-5 px-4 sm:px-6 transition-all rounded-xl sm:rounded-2xl font-medium text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-espresso/40 ml-2">Subject</label>
                  <select className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-3.5 sm:py-5 px-4 sm:px-6 transition-all rounded-xl sm:rounded-2xl font-medium text-sm appearance-none">
                    <option>General Inquiry</option>
                    <option>Program Registration</option>
                    <option>Summer Camp Questions</option>
                    <option>Private Coaching Request</option>
                  </select>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-espresso/40 ml-2">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-[#FBF9F6] border border-espresso/5 focus:border-[#F9BC00] outline-none py-3.5 sm:py-5 px-4 sm:px-6 transition-all rounded-xl sm:rounded-2xl font-medium text-sm resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button type="submit" className="w-full bg-espresso text-white py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#D62828] transition-all shadow-xl hover:shadow-[#D62828]/20">
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
