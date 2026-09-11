import { useState, type FormEvent, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Twitter, Check, ArrowUpRight, Mail, Copy } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleEmailClick = (e: MouseEvent) => {
    e.preventDefault();
    const mailtoUrl = 'mailto:challengersvolleyballacademy@gmail.com?subject=Inquiry%20-%20Challengers%20Volleyball%20Academy';
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=challengersvolleyballacademy@gmail.com&su=Inquiry%20-%20Challengers%20Volleyball%20Academy';
    
    const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = mailtoUrl;
    }
  };

  const handleCopyEmail = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('challengersvolleyballacademy@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };
  return (
    <footer className="bg-espresso text-white pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-10 relative overflow-hidden" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      {/* Background Text Watermark - Original Serif Style */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden leading-none z-0" aria-hidden="true">
        <div className="text-[13vw] font-serif font-black text-white/[0.03] leading-none tracking-tighter whitespace-nowrap transform translate-y-[15%]">
          CHALLENGERS
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <img src="/academy_logo.png" alt="Challengers Logo" className="w-10 h-10 object-contain drop-shadow-md" />
              <span className="text-3xl font-condensed tracking-[0.2em]">CHALLENGERS</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs font-medium">

**Volleyball Training for Ages 5–18 | Bay Area**

From first-time players to competitive athletes, we help young volleyball players build skills, confidence, and a passion for the game.

**Join us on the court — let’s get started!**


            </p>
          </div>

          {/* Column 2: Quick Links */}
          <nav className="space-y-6" aria-label="Footer Navigation">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow">Training</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><NavLink to="/programs" className="hover:text-yellow transition-colors">Programs</NavLink></li>
              <li><NavLink to="/performance" className="hover:text-yellow transition-colors">Performance</NavLink></li>
              <li><NavLink to="/camps" className="hover:text-yellow transition-colors">Elite Camps</NavLink></li>
              <li><NavLink to="/waiver" className="hover:text-yellow transition-colors">Safety Waiver</NavLink></li>
              <li><NavLink to="/pricing" className="hover:text-yellow transition-colors">Pricing</NavLink></li>
              <li><NavLink to="/about" className="hover:text-yellow transition-colors">Our Story</NavLink></li>
            </ul>
          </nav>

          {/* Column 3: Locations */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow">Training Locations</h4>
            <div className="space-y-4 text-xs font-medium leading-relaxed">

              {/* Mountain House */}
              <div>
                <p className="text-white font-bold text-[11px] uppercase tracking-wider">Hansen Elementary School 400 S. Duran Terrace, Mountain House CA</p>
                <p className="text-white/50 mt-0.5">Saturdays · 9:00 am – 11:00 am</p>
              </div>

              {/* Fremont */}
              <div>
                <p className="text-white font-bold text-[11px] uppercase tracking-wider">Kerala House · Fremont</p>
                <p className="text-white/60 text-[10px]">4037 Fremont Blvd, Fremont CA 94538</p>
                <p className="text-white/50 mt-0.5">Sundays · 6:30 pm – 8:30 pm</p>
              </div>

              {/* Manteca */}
              <div>
                <p className="text-white font-bold text-[11px] uppercase tracking-wider">Courtside Sports · Manteca</p>
                <p className="text-white/60 text-[10px]">450 Commerce CT, Manteca CA 95336</p>
                <p className="text-white/50 mt-0.5">Fridays · 5:00 pm – 6:30 pm</p>
              </div>

              {/* San Jose */}
              <div>
                <p className="text-white font-bold text-[11px] uppercase tracking-wider">San Jose</p>
                <p className="text-white/50 mt-0.5">Starting September — details coming soon</p>
              </div>

              {/* Direct Academy Email Transmission */}
              <div className="pt-3 border-t border-white/10 mt-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-yellow mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange" />
                  Direct Email Transmission
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:challengersvolleyballacademy@gmail.com?subject=Inquiry%20-%20Challengers%20Volleyball%20Academy"
                    onClick={handleEmailClick}
                    className="inline-flex items-center gap-2 text-white hover:text-yellow text-[12px] font-bold transition-all break-all group hover:translate-x-0.5 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 w-full"
                    title="Click to compose email to challengersvolleyballacademy@gmail.com"
                  >
                    <span className="underline decoration-white/30 group-hover:decoration-yellow flex-1 text-left">
                      challengersvolleyballacademy@gmail.com
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-yellow opacity-80 group-hover:opacity-100 shrink-0 transition-opacity" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleEmailClick}
                      className="text-[10px] font-black uppercase tracking-wider bg-orange hover:bg-yellow hover:text-espresso text-white px-2.5 py-1 rounded-md transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" /> Open in Mail
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="text-[10px] font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white/90 px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {emailCopied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 id="newsletter-label" className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow">Our Newsletter</h4>
            {subscribed ? (
              <div className="flex items-center gap-3 bg-white/10 border border-green-500/30 text-green-400 rounded-full px-6 py-4 text-xs font-bold">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form className="flex items-center gap-2" onSubmit={handleSubscribe}>
                <label htmlFor="newsletter-email" className="sr-only">Newsletter Email</label>
                <input 
                  id="newsletter-email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR EMAIL" 
                  aria-describedby="newsletter-label"
                  className="bg-white/10 border border-white/20 rounded-full px-6 py-4 text-xs font-bold tracking-widest focus:outline-none focus:bg-white/20 transition-all w-full placeholder:text-white/60 text-white"
                />
                <button 
                  type="submit"
                  className="bg-orange text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-yellow hover:text-espresso transition-all shrink-0 shadow-xl"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowUpRight className="w-6 h-6" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              © 2026 CHALLENGERS VOLLEYBALL ACADEMY. ALL RIGHTS RESERVED.
            </p>
            <span className="hidden sm:inline text-white/20">|</span>
            <p className="text-[10px] font-medium text-white/40 tracking-wider">
              All content and media are protected under copyright law.
            </p>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            <NavLink to="/privacy" className="hover:text-white transition-colors">Privacy</NavLink>
            <NavLink to="/terms" className="hover:text-white transition-colors">Terms</NavLink>
            <div className="flex items-center gap-3 ml-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/challengers_volleyball_academy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Challengers Academy on Instagram"
                className="group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', boxShadow: '0 0 0 0 rgba(220,39,67,0)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 18px 4px rgba(220,39,67,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(220,39,67,0)')}
              >
                <Instagram className="w-6 h-6 text-white" />
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1CFx15eApf/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Challengers Academy on Facebook"
                className="group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-110"
                style={{ background: '#1877F2', boxShadow: '0 0 0 0 rgba(24,119,242,0)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 18px 4px rgba(24,119,242,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(24,119,242,0)')}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com/@challengersflorida?si=v4WMitdB1xMj9Q44"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Challengers Academy on YouTube"
                className="group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-110"
                style={{ background: '#FF0000', boxShadow: '0 0 0 0 rgba(255,0,0,0)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 18px 4px rgba(255,0,0,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,0,0,0)')}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
