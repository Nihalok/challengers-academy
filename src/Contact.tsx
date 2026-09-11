import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';
import { Mail, Send, MessageCircle, MapPin, ArrowUpRight, Copy, Check, Sparkles } from 'lucide-react';
import { useState, type FormEvent, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
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

  const triggerDirectEmail = (customSubject?: string, customBody?: string) => {
    const adminEmail = 'challengersvolleyballacademy@gmail.com';
    const subj = customSubject || 'Inquiry - Challengers Volleyball Academy';
    const body = customBody || 'Hello Challengers Volleyball Academy Team,\n\nI would like to inquire about training programs.\n\n';

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;

    const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = mailtoUrl;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const subjectStr = `${formData.subject} - Inquiry from ${formData.name}`;
    const bodyStr = `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}\n\n---\nSent via Challengers Volleyball Academy Portal`;

    // 1. Instantly open user's email client directly to admin mail
    triggerDirectEmail(subjectStr, bodyStr);

    // 2. Also log to backend API in the background
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch((err) => console.warn('Background contact log sync error:', err));
    } catch {
      // Ignore background sync errors
    }

    setSubmitted(true);
  };

  return (
    <div className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 bg-[#FBF9F6] min-h-screen font-sans">
      <SEO 
        title="Contact Us | Challengers Volleyball Academy" 
        description="Get in touch with Challengers Volleyball Academy. Direct email to challengersvolleyballacademy@gmail.com, WhatsApp, or instant enquiry submission."
      />
      
      {/* Decorative Subtle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#F9BC00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D62828]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <SectionHeader 
            eyebrow="Get in Touch" 
            title="Ready to spike your skills?"
            italicWord="spike"
            id="contact-header"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Contact Info Left Column */}
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-condensed uppercase tracking-tighter mb-2 sm:mb-3 leading-tight text-espresso">
                Let's start a <br /><span className="text-[#D62828] italic">conversation.</span>
              </h2>
              <p className="text-xs sm:text-sm font-medium text-espresso/70 leading-relaxed max-w-xl">
                Have questions about our training programs, camps, private coaching, or trial sessions? Reach out directly to our admin team.
              </p>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {/* 1. Official Academy Email Card */}
              <div 
                onClick={() => triggerDirectEmail()}
                className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-[#D62828]/40 hover:shadow-lg cursor-pointer"
                title="Click to email challengersvolleyballacademy@gmail.com"
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#D62828] text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm mt-0.5">
                    <Mail className="w-6 sm:w-7 h-6 sm:h-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">Official Academy Email</p>
                      <span className="text-[10px] sm:text-xs font-bold text-[#D62828] flex items-center gap-1 group-hover:underline">
                        Email Admin <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-bold text-espresso group-hover:text-[#D62828] transition-colors break-all leading-snug my-1">
                      challengersvolleyballacademy@gmail.com
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2.5">
                      Direct inbox · Fast response within 24 hours
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-espresso/5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDirectEmail();
                        }}
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#D62828] hover:bg-espresso text-white px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" /> Open Mailbox
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

              {/* 2. WhatsApp & Support Card */}
              <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-green-600/40 hover:shadow-lg">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm mt-0.5">
                    <MessageCircle className="w-6 sm:w-7 h-6 sm:h-7 text-[#25D366]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">WhatsApp &amp; Direct Support</p>
                      <span className="text-[10px] sm:text-xs font-bold text-green-700 flex items-center gap-1">
                        Instant Chat <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-espresso group-hover:text-green-700 transition-colors my-1">
                      +1 (863) 845-9913
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider mb-2.5">
                      Quickest for instant questions &amp; training schedule inquiries
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-espresso/5">
                      <a
                        href="https://wa.me/18638459913?text=Hi%20Challengers%20Academy%2C%20I%20have%20an%20inquiry%20about%20your%20training%20programs."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Open WhatsApp
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

              {/* 3. Training Centers Card */}
              <NavLink to="/locations">
                <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-espresso/10 shadow-md group transition-all hover:border-[#F3722C]/40 hover:shadow-lg cursor-pointer">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#F3722C] text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm mt-0.5">
                      <MapPin className="w-6 sm:w-7 h-6 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-espresso/50">Training Centers &amp; Facilities</p>
                        <span className="text-[10px] sm:text-xs font-bold text-[#F3722C] flex items-center gap-1 group-hover:underline">
                          View Locations <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-espresso group-hover:text-[#F3722C] transition-colors my-1">
                        Fremont · Manteca · Mountain House · San Jose
                      </p>
                      <p className="text-[10px] sm:text-[11px] font-medium text-espresso/50 uppercase tracking-wider">
                        Kerala House · Courtside Sports · Hansen Elementary · Bay Area Courts
                      </p>
                    </div>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>

          {/* Contact Enquiry Form Right Column */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-espresso/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9BC00]/10 rounded-full blur-2xl pointer-events-none" />
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-10 space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-espresso mb-1.5">Enquiry Transmitted!</h3>
                  <p className="text-espresso/70 font-medium leading-relaxed max-w-sm mx-auto text-xs sm:text-sm">
                    Thank you, <strong>{formData.name}</strong>. Your enquiry has been prepared and sent directly to <strong className="text-espresso">challengersvolleyballacademy@gmail.com</strong>.
                  </p>
                  <p className="text-xs text-espresso/50 mt-2">
                    If your email window didn't open automatically, you can email us directly at <strong>challengersvolleyballacademy@gmail.com</strong>.
                  </p>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="px-6 py-2.5 bg-espresso hover:bg-[#D62828] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                  >
                    Send Another Enquiry
                  </button>
                  <button
                    onClick={() => triggerDirectEmail()}
                    className="px-6 py-2.5 bg-[#FBF9F6] hover:bg-espresso/10 text-espresso text-xs font-bold uppercase tracking-wider rounded-xl border border-espresso/15 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Open Email Client
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D62828]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D62828]">Direct Contact Form</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-condensed font-black uppercase text-espresso tracking-tight mt-1">
                    Send Enquiry to Admin
                  </h3>
                  <p className="text-xs text-espresso/60 font-medium mt-0.5">
                    Submitting sends your message directly to <span className="font-semibold text-espresso">challengersvolleyballacademy@gmail.com</span>.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60 ml-1">Full Name *</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FBF9F6] border border-espresso/15 focus:border-[#D62828] focus:bg-white outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm text-espresso"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60 ml-1">Email Address *</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FBF9F6] border border-espresso/15 focus:border-[#D62828] focus:bg-white outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm text-espresso"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60 ml-1">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FBF9F6] border border-espresso/15 focus:border-[#D62828] focus:bg-white outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm text-espresso"
                  >
                    <option>General Inquiry</option>
                    <option>Program Registration &amp; Schedules</option>
                    <option>Summer Camp Registration</option>
                    <option>Private Coaching Sessions</option>
                    <option>Tryout Evaluation Booking</option>
                    <option>Team Coaching Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60 ml-1">Your Message *</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FBF9F6] border border-espresso/15 focus:border-[#D62828] focus:bg-white outline-none py-2.5 sm:py-3 px-3.5 sm:px-4 transition-all rounded-xl font-medium text-xs sm:text-sm text-espresso resize-none"
                    placeholder="Tell us about your athlete's age, skill level, or what you'd like to learn..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#1A1A1A] hover:bg-[#D62828] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Direct Enquiry to Admin Mail
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-espresso/50 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#F9BC00]" />
                  <span>Transmits directly to challengersvolleyballacademy@gmail.com</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
