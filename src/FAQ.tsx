import SEO from './components/SEO';
import FAQSection from './components/FAQSection';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FAQ() {
  return (
    <div className="relative py-20 pt-28 sm:pt-36 pb-24 bg-[#FBF9F6] min-h-screen">
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about Challengers Volleyball Academy programs, schedules, locations, age requirements, and attendance policies."
        keywords="volleyball FAQ, volleyball coaching questions, Bay Area volleyball practice schedule, Challengers Volleyball policies"
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span data-anim="hand" className="font-hand text-[#D62828] text-[36px] uppercase block mb-1">
            Have Questions?
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase text-[#1B1B1D]">
            Frequently Asked Questions
          </h1>
        </div>

        <FAQSection />

        <div className="mt-16 text-center">
          <p className="text-[#1B1B1D]/60 text-sm font-medium mb-4">
            Still have a question that isn't answered above?
          </p>
          <NavLink
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C1272D] hover:bg-[#a01e24] text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
          >
            <span>Reach Out to Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
