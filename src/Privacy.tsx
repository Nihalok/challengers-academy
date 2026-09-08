import React from 'react';
import { motion } from 'motion/react';
import SectionHeader from './components/SectionHeader';

export default function Privacy() {
  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-16 bg-ivory/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeader 
          eyebrow="Legal" 
          title="Privacy Policy" 
          italicWord="Policy" 
          id="privacy-heading"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-ivory/20 prose prose-espresso"
        >
          <div className="space-y-8 text-espresso/80 font-medium">
            <section className="bg-orange/5 p-8 rounded-3xl border border-orange/10 mb-12">
              <h2 className="text-xl font-black uppercase tracking-widest text-orange mb-4">Mandatory Confidentiality Clause</h2>
              <p className="text-espresso font-bold text-lg leading-relaxed italic">
                "All customer information collected through Challengers Volleyball Academy will remain confidential and will only be used for academy operations.
              </p>
              <p className="text-espresso font-bold text-lg leading-relaxed italic mt-2">
                Customer information will never be sold or shared with third parties except where required by applicable law."
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-12">
              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Information Collected</h3>
                <p className="text-sm leading-relaxed">
                  We collect information necessary to provide elite athletic training and maintain safe academy operations. This includes personal, student, and parent/guardian data.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Personal & Student Information</h3>
                <p className="text-sm leading-relaxed">
                  We collect names, dates of birth, skill levels, and medical conditions of students to tailor coaching plans and ensure participant safety during high-intensity training.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Payment Information</h3>
                <p className="text-sm leading-relaxed">
                  Payment processing is handled through secure, PCI-compliant gateways. We do not store full credit card numbers on our local servers.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Contact Information</h3>
                <p className="text-sm leading-relaxed">
                  Parent/Guardian phone numbers and email addresses are used for emergency notifications, schedule updates, and academy communications.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Cookies & Analytics</h3>
                <p className="text-sm leading-relaxed">
                  Our website uses cookies to enhance user experience and analytics to understand how visitors interact with our content, allowing us to improve our digital services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Data Security</h3>
                <p className="text-sm leading-relaxed">
                  We implement industry-standard encryption and security protocols to protect your data from unauthorized access or disclosure.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">Children's Privacy</h3>
                <p className="text-sm leading-relaxed">
                  We comply with COPPA regulations. We do not knowingly collect data from children under 13 without explicit parent or guardian consent.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-serif text-espresso mb-4">California Privacy Rights</h3>
                <p className="text-sm leading-relaxed">
                  As a California-based academy, we respect CCPA rights. You have the right to request access to or deletion of your personal information.
                </p>
              </section>
            </div>

            <section className="pt-12 border-t border-espresso/5">
              <h3 className="text-xl font-serif text-espresso mb-4">Contact Information</h3>
              <p className="text-sm leading-relaxed">
                For privacy-related inquiries, please contact our administrative team at <span className="text-orange font-bold">privacy@challengers.com</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
