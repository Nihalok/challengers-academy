import React from 'react';
import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';

export default function Terms() {
  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-16 bg-ivory/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeader 
          eyebrow="Rules" 
          title="Academy Policies" 
          italicWord="Policies" 
          id="terms-heading"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-ivory/20 prose prose-espresso"
        >
          <div className="space-y-12 text-espresso/80 font-medium">
            <section>
              <h2 className="text-2xl font-serif text-espresso mb-6">Attendance & Makeup Class Policy</h2>
              <ul className="space-y-4 list-disc pl-6">
                <li className="leading-relaxed">
                  <strong>Eligibility:</strong> Students who miss regular training classes will be eligible for 1 makeup class quarterly, subject to academy scheduling and availability.
                </li>
                <li className="leading-relaxed">
                  <strong>Scheduling:</strong> Makeup classes are subject to academy scheduling and class availability. We cannot guarantee a specific time slot for makeup sessions.
                </li>
                <li className="leading-relaxed">
                  <strong>Notification:</strong> If any participant is planning to be absent, please inform us prior to the start of the class to help us manage session capacity and scheduling.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-espresso mb-6">Enrollment & Fees</h2>
              <ul className="space-y-4 list-disc pl-6">
                <li className="leading-relaxed">
                  <strong>Non-Refundable:</strong> All enrollment fees, including regular coaching packages and summer camps, are non-refundable.
                </li>
                <li className="leading-relaxed">
                  <strong>Registration:</strong> Registration is only complete once the registration form is submitted and payment is confirmed.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-espresso mb-6">Conduct & Safety</h2>
              <p className="leading-relaxed">
                Challengers Volleyball Academy reserves the right to remove any participant from a session if their conduct is deemed unsafe or disruptive to other players.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
