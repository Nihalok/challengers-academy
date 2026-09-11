import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';
import { Mail, Send, MessageCircle, MapPin, ArrowUpRight, Copy, Check, Smartphone } from 'lucide-react';
import { useState, type FormEvent, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  useGsapReveal();

  const handleCopyEmail = (e?: MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    navigator.clipboard?.writeText('challengersvolleyballacademy@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const handleCopyPhone = (e?: MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    navigator.clipboard?.writeText('+18638459913');
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2500);
  };

  const triggerDirectEmail = (subjectStr?: string, bodyStr?: string) => {
    const email = 'challengersvolleyballacademy@gmail.com';
    const subj = subjectStr || 'Inquiry - Challengers Volleyball Academy';
    const body = bodyStr || 'Hello Challengers Academy Team,\n\n';

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;

    const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = mailtoUrl;
    }
  };

  const sendViaWhatsApp = () => {
    const text = encodeURIComponent(`Hi Challengers Academy,\nName: ${formData.name || 'Parent/Athlete'}\nEmail: ${formData.email || 'N/A'}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message || 'I have an inquiry about training programs.'}`);
    window.open(`https://wa.me/18638459913?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const sendViaSMS = () => {
    const body = encodeURIComponent(`Hi Challengers Academy,\nName: ${formData.name || 'Parent/Athlete'}\nSubject: ${formData.subject}\nMessage: ${formData.message || 'I have an inquiry about training programs.'}`);
    window.location.href = `sms:+18638459913?body=${body}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Direct email client transmission with pre-filled content
    const mailtoSubject = `[Challengers Academy Inquiry] ${formData.subject} - from ${formData.name}`;
    const mailtoBody = `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}\n\n--- Sent via Challengers Volleyball Academy Website ---`;
    
    triggerDirectEmail(mailtoSubject, mailtoBody);
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
          <div className="space-y-4 sm:space-y-5 gsap-reveal">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-condensed uppercase tracking-tighter mb-2 sm:mb-3 leading-tight text-espresso">Let's start a <br /><span className="text-[#D62828] italic">conversation.</span></h2>
              <p className="text-xs sm:text-sm font-medium text-espresso/60 leading-relaxed max-w-xl">
                Have questions about our programs, camps, or schedule? We're here to help you find the perfect fit for your athlete.
              </p>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {/* 1. Email Card (Full Width & Prominent) */}
              <div 
                onClick={() => triggerDirectEmail()}
                className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-[#D62828]/40 hover:shadow-lg cursor-pointer"
                title="Click to transmit email to challengersvolleyballacademy@gmail.com"
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#D62828] text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm mt-0.5">
                    <Mail className="w-6 sm:w-7 h-6 sm:h-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">Official Academy Email</p>
                      <span className="text-[10px] sm:text-xs font-bold text-[#D62828] flex items-center gap-1 group-hover:underline">
                        Compose Email <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-bold text-espresso group-hover:text-[#D62828] transition-colors break-all leading-snug my-1">
                      challengersvolleyballacademy@gmail.com
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-3">
                      Fast response within 24 hours
                    </p>

                    {/* Direct Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-espresso/5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDirectEmail();
                        }}
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#D62828] hover:bg-espresso text-white px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" /> Compose Email
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#FBF9F6] hover:bg-espresso/10 text-espresso px-3.5 py-1.5 rounded-lg border border-espresso/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {emailCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-espresso/70" /> Copy Address
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. WhatsApp & Direct SMS Text Message Card (Big & Visible) */}
              <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-green-600/40 hover:shadow-lg">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm mt-0.5">
                    <MessageCircle className="w-6 sm:w-7 h-6 sm:h-7 text-[#25D366]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">WhatsApp &amp; Text Message (SMS)</p>
                      <span className="text-[10px] sm:text-xs font-bold text-green-700 flex items-center gap-1">
                        Instant Contact <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-espresso group-hover:text-green-700 transition-colors my-1">
                      +1 (863) 845-9913
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-3">
                      Fastest response for quick questions &amp; immediate updates
                    </p>

                    {/* Direct Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-espresso/5">
                      <a
                        href="https://wa.me/18638459913?text=Hi%20Challengers%20Academy%2C%20I%20have%20a%20question%20about%20your%20training%20programs."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                      </a>
                      <a
                        href="sms:+18638459913?body=Hi%20Challengers%20Academy%2C%20I%20have%20a%20question%20about%20your%20training%20programs."
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-espresso hover:bg-[#D62828] text-white px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Send Text Message
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#FBF9F6] hover:bg-espresso/10 text-espresso px-3.5 py-1.5 rounded-lg border border-espresso/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {phoneCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-espresso/70" /> Copy Number
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Training Centers Card (Big & Visible) */}
              <NavLink to="/locations">
                <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-[#F3722C]/40 hover:shadow-lg cursor-pointer">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#F3722C] text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm mt-0.5">
                      <MapPin className="w-6 sm:w-7 h-6 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">Training Centers &amp; Facilities</p>
                        <span className="text-[10px] sm:text-xs font-bold text-[#F3722C] flex items-center gap-1 group-hover:underline">
                          View Details <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-espresso group-hover:text-[#F3722C] transition-colors my-1">
                        Fremont · Manteca · Mountain House · San Jose
                      </p>
                      <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider">
                        Kerala House · Courtside Sports · Hansen Elementary · Local Bay Area Parks
                      </p>
                    </div>
                  </div>
                </div>
              </NavLink>
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
                  <h3 className="text-xl sm:text-2xl font-serif text-espresso mb-2">Message Ready to Transmit!</h3>
                  <p className="text-espresso/70 font-medium leading-relaxed max-w-sm mx-auto text-xs sm:text-sm">
                    Choose how you'd like to transmit your inquiry to our coaching staff:
                  </p>
                </div>
                <div className="pt-3 flex flex-col gap-2.5 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => triggerDirectEmail(`[Challengers Academy Inquiry] ${formData.subject} - from ${formData.name}`, `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`)}
                    className="w-full px-5 py-2.5 bg-[#D62828] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow hover:bg-espresso transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" /> Open Email Composer
                  </button>
                  <button
                    type="button"
                    onClick={sendViaWhatsApp}
                    className="w-full px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Send via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={sendViaSMS}
                    className="w-full px-5 py-2.5 bg-espresso hover:bg-[#D62828] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Send as Text Message (SMS)
                  </button>
                  <button 
                    type="button"
                    onClick={handleCopyEmail}
                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {emailCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                    {emailCopied ? 'Address Copied!' : 'Copy Email Address'}
                  </button>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="text-espresso/60 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-[#D62828] transition-colors py-2 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Full Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FBF9F6] border border-espresso/10 focus:border-[#D62828] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FBF9F6] border border-espresso/10 focus:border-[#D62828] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FBF9F6] border border-espresso/10 focus:border-[#D62828] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Program Registration</option>
                    <option>Summer Camp Questions</option>
                    <option>Private Coaching Request</option>
                  </select>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-espresso/50 ml-1">Your Message (Email, WhatsApp or Text Message)</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FBF9F6] border border-espresso/10 focus:border-[#D62828] outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm resize-none"
                    placeholder="Tell us how we can help... (you can send via Email, WhatsApp, or Text)"
                  />
                </div>

                {/* Send Buttons Row */}
                <div className="space-y-2 pt-1">
                  <button type="submit" className="w-full bg-espresso text-white py-3 sm:py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#D62828] transition-all shadow-md hover:shadow-[#D62828]/20 cursor-pointer">
                    <Mail className="w-3.5 h-3.5" /> Send via Email
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={sendViaWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2.5 sm:py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={sendViaSMS}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 sm:py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Text (SMS)
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
