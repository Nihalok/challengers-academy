import { useState, type FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Twitter, Check, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
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
              Volleyball coaching for all ages in the Bay Area. Come train with us - we'd love to have you.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <nav className="space-y-6" aria-label="Footer Navigation">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange">Training</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><NavLink to="/programs" className="hover:text-yellow transition-colors">Programs</NavLink></li>
              <li><NavLink to="/performance" className="hover:text-yellow transition-colors">Performance</NavLink></li>
              <li><NavLink to="/camps" className="hover:text-yellow transition-colors">Elite Camps</NavLink></li>
              <li><NavLink to="/waiver" className="hover:text-yellow transition-colors">Safety Waiver</NavLink></li>
              <li><NavLink to="/pricing" className="hover:text-yellow transition-colors">Pricing</NavLink></li>
              <li><NavLink to="/about" className="hover:text-yellow transition-colors">Our Story</NavLink></li>
            </ul>
          </nav>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange">Contact Us</h4>
            <address className="text-sm font-medium leading-relaxed not-italic">
              Fremont · Manteca · Mountain House · San Jose<br />
              California, USA<br />
              <a href="mailto:challengersacademy@gmail.com" className="text-white/60 text-xs hover:text-white transition-colors">challengersacademy@gmail.com</a>
            </address>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 id="newsletter-label" className="text-[10px] font-black uppercase tracking-[0.4em] text-orange">Our Newsletter</h4>
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
            <div className="flex items-center gap-4 ml-4">
              <a 
                href="https://www.instagram.com/challengers_volleyball_academy" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit Challengers Academy on Instagram"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 cursor-pointer" />
              </a>
              <a 
                href="https://www.facebook.com/share/1CFx15eApf/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit Challengers Academy on Facebook"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a 
                href="https://youtube.com/@challengersflorida?si=v4WMitdB1xMj9Q44" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit Challengers Academy on YouTube"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
