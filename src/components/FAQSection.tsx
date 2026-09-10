import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What age groups do you train?",
    answer: "We work with kids and teens from 5 to 18 years old. We split players into groups based on their age and skill level so everyone gets coaching that actually fits where they are."
  },
  {
    question: "Can my child join if they've never played before?",
    answer: "Absolutely. We have a beginner group specifically for players who are just starting out. We go over the basics - how to pass, how to position, how to move - before anything more advanced."
  },
  {
    question: "When are the training sessions?",
    answer: "We typically train on weekday evenings and weekend mornings. The exact schedule depends on which group you're in and which location you pick. Once you register, we'll share the full schedule with you."
  },
  {
    question: "Where are you located?",
    answer: "We currently run sessions in Fremont, Manteca, Mountain House, and San Jose. We always make sure to book top facilities with quality flooring and proper nets."
  },
  {
    question: "What should my child bring to practice?",
    answer: "Indoor court shoes (non-marking soles), comfortable workout clothes, knee pads, and a water bottle. We have all the Volleyballs and other training gear - you don't need to bring any of that."
  },
  {
    question: "How does moving up to a higher level work?",
    answer: "We have 5 training levels. Players move up when they're genuinely ready - our coaches assess each player regularly and let families know when it's time to step up. It's always based on skill, not just how long they've been attending."
  },
  {
    question: "What is your attendance and makeup class policy?",
    answer: "Students who miss regular training classes are eligible for 1 makeup class quarterly, subject to academy scheduling and class availability. Please notify our staff prior to missing a session so we can coordinate availability."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-[2rem] border transition-all duration-500 overflow-hidden ${
              activeIndex === index 
                ? 'bg-white border-espresso/10 shadow-2xl' 
                : 'bg-white/40 border-espresso/5 hover:border-espresso/10 shadow-sm'
            }`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-8 py-8 flex items-center justify-between text-left group"
            >
              <span className={`text-lg font-serif transition-colors duration-300 ${
                activeIndex === index ? 'text-crimson' : 'text-espresso'
              }`}>
                {faq.question}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                activeIndex === index 
                  ? 'bg-crimson text-white rotate-180' 
                  : 'bg-espresso/5 text-espresso group-hover:bg-espresso/10'
              }`}>
                {activeIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-8 pb-8">
                    <div className="h-px w-12 bg-crimson/20 mb-6" />
                    <p className="text-espresso/60 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
