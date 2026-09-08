import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Shield, CheckCircle2, ChevronRight, Loader2, AlertCircle, FileSignature } from 'lucide-react';
import SectionHeader from './components/SectionHeader';
import { Lead } from './types';
import { PROGRAMS } from './data';
import confetti from 'canvas-confetti';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function CheckoutForm({ clientSecret, onPaymentSuccess, onCancel }: { clientSecret: string, onPaymentSuccess: (paymentIntentId: string) => void, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Handle mock secret even without stripe instance
    if (clientSecret.startsWith('mock_secret')) {
      setIsProcessing(true);
      setTimeout(() => {
        onPaymentSuccess('mock_intent_' + Math.random().toString(36).slice(2));
        setIsProcessing(false);
      }, 1500);
      return;
    }

    if (!stripe || !elements) {
      setMessage("Stripe has not loaded correctly.");
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An error occurred.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
    setIsProcessing(false);
  };

  const isMock = clientSecret.startsWith('mock_secret');

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-ivory/30 p-6 rounded-2xl border border-espresso/5">
        {isMock ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-orange/20 mx-auto mb-4" />
            <p className="text-xs font-bold text-espresso/60 uppercase tracking-widest">Mock Payment Mode Active</p>
            <p className="text-[10px] text-espresso/40 mt-2">Stripe keys not configured. Click confirm to proceed.</p>
          </div>
        ) : (
          <PaymentElement />
        )}
      </div>
      {message && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{message}</p>}
      <div className="flex flex-col md:flex-row gap-4">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 bg-ivory text-espresso py-6 rounded-2xl font-Archivo font-bold uppercase tracking-widest text-xs border border-espresso/5"
        >
          Cancel
        </button>
        <button 
          disabled={isProcessing || (!isMock && !stripe)}
          className="flex-[2] bg-espresso text-white py-6 rounded-2xl font-Archivo font-bold uppercase tracking-widest text-xs hover:bg-orange transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Confirm Payment
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function RegisterStep2() {
  const { referenceId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'summary' | 'payment' | 'waiver' | 'success'>('summary');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/leads/${referenceId}`);
        const data = await response.json();
        if (data.success) {
          setLead(data.lead);
        } else {
          setError(data.message || 'Reference ID not found.');
        }
      } catch (err) {
        setError('Failed to fetch registration data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (referenceId) {
      fetchLead();
    }
  }, [referenceId]);

  const program = lead ? PROGRAMS.find(p => p.id === lead.programId) : null;
  const registrationFee = 500; // This should ideally come from the server/program config

  const startPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: referenceId }),
      });
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentStep('payment');
      } else {
        alert('Failed to initialize payment.');
      }
    } catch (err) {
      alert('Error connecting to payment server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onPaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, leadId: referenceId }),
      });
      const data = await response.json();
      if (data.success) {
        setPaymentStep('waiver');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWaiverSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!waiverSigned || !signature) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/submit-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: referenceId, 
          signedName: signature,
          timestamp: Date.now()
        }),
      });

      const data = await response.json();
      if (data.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#ffffff', '#1B1B1D']
        });
        setPaymentStep('success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ivory">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ivory p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-serif text-espresso mb-4">Registration Not Found</h2>
        <p className="text-espresso/60 mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate('/register')} className="bg-espresso text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-24 bg-ivory/50 min-h-screen overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1592656670411-b91990822650?q=80&w=2000" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.03] mix-blend-multiply grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/80 via-ivory/40 to-ivory/80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 max-w-3xl relative z-10"
      >
        <div className="mb-12">
          <SectionHeader 
            eyebrow="Step 2 of 2" 
            title="Reserve your spot."
            italicWord="Reserve"
            id="reserve-heading"
          />
        </div>

        <div className="bg-white rounded-[28px] shadow-2xl border border-espresso/5 overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {paymentStep === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 md:p-16 flex flex-col"
              >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-orange/10 rounded-[24px] flex items-center justify-center text-orange">
                      <CreditCard className="w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Enrollment Summary</p>
                      <h3 className="text-3xl font-serif text-espresso">Finalize Registration</h3>
                   </div>
                </div>

                <div className="bg-espresso p-10 rounded-[28px] text-white mb-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 grid gap-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Program Details</span>
                        <h4 className="text-2xl font-serif mt-1">{program?.title}</h4>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">{lead?.batch}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Reference ID</span>
                        <p className="text-xs font-mono font-bold text-orange mt-1">#{referenceId?.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 space-y-4">
                       <div className="flex justify-between text-xs font-bold text-white/60">
                          <span>Program Fee</span>
                          <span>${registrationFee}</span>
                       </div>
                       <div className="flex justify-between text-lg font-bold text-white pt-2">
                          <span>Amount Due Now</span>
                          <span className="text-2xl font-condensed tracking-tighter text-orange">${registrationFee}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-orange/5 rounded-2xl border border-orange/10 mb-12">
                   <p className="text-xs font-Archivo font-bold text-espresso/70 leading-relaxed text-center">
                     "This fee reserves your seat and is adjusted against your total program fee. It is strictly non-refundable."
                   </p>
                </div>

                <button 
                  onClick={startPayment}
                  disabled={isProcessing}
                  className="w-full bg-espresso text-white py-6 rounded-2xl font-Archivo font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange transition-all shadow-xl hover:shadow-orange/20 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Payment'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
                   <Shield className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Stripe Integration</span>
                </div>
              </motion.div>
            )}

            {paymentStep === 'payment' && clientSecret && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 md:p-16"
              >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-orange/10 rounded-[24px] flex items-center justify-center text-orange">
                      <CreditCard className="w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Secure Payment</p>
                      <h3 className="text-3xl font-serif text-espresso">Complete Transaction</h3>
                   </div>
                </div>

                {stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      clientSecret={clientSecret} 
                      onPaymentSuccess={onPaymentSuccess}
                      onCancel={() => setPaymentStep('summary')}
                    />
                  </Elements>
                ) : (
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    onPaymentSuccess={onPaymentSuccess}
                    onCancel={() => setPaymentStep('summary')}
                  />
                )}
              </motion.div>
            )}

            {paymentStep === 'waiver' && (
              <motion.div
                key="waiver"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 md:p-16"
              >
                <div className="flex items-center gap-6 mb-10">
                   <div className="w-16 h-16 bg-orange/10 rounded-[24px] flex items-center justify-center text-orange">
                      <FileSignature className="w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Final Step</p>
                      <h3 className="text-3xl font-serif text-espresso">E-Signature Waiver</h3>
                   </div>
                </div>

                <div className="bg-ivory/50 border border-espresso/5 p-8 rounded-2xl max-h-[250px] overflow-y-auto mb-10 text-sm font-medium text-espresso/60 leading-relaxed">
                   <h4 className="font-serif text-espresso text-lg mb-4">Challengers Coaching Liability Waiver</h4>
                   <p className="mb-4">I, the undersigned, understand that volleyball training involves physical activity and inherent risks. I voluntarily assume all risks on behalf of the participant.</p>
                   <p className="mb-4">I release Challengers Coaching Academy from any liability related to injury or loss during training sessions.</p>
                   <p>By typing my name below and checking the box, I acknowledge this as my legal digital signature.</p>
                </div>

                <form onSubmit={handleWaiverSubmit} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40 ml-2">Type Full Legal Name</label>
                      <input 
                        required
                        className="w-full bg-ivory/50 border border-espresso/5 rounded-2xl py-5 px-8 outline-none focus:border-orange transition-all font-serif italic text-xl"
                        placeholder="John Doe"
                        value={signature}
                        onChange={e => setSignature(e.target.value)}
                      />
                   </div>

                   <label className="flex items-center gap-4 group cursor-pointer">
                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${waiverSigned ? 'bg-orange border-orange text-white' : 'border-espresso/10 group-hover:border-orange/30'}`}>
                        {waiverSigned && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={waiverSigned}
                        onChange={e => setWaiverSigned(e.target.checked)}
                      />
                      <span className="text-sm font-bold text-espresso/80">I agree to the terms and conditions above</span>
                   </label>

                   <button 
                      type="submit"
                      disabled={!waiverSigned || !signature || isProcessing}
                      className="w-full bg-espresso text-white py-6 rounded-2xl font-Archivo font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange transition-all shadow-xl disabled:opacity-50"
                   >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Enrollment'}
                   </button>
                </form>
              </motion.div>
            )}

            {paymentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 md:p-24 text-center flex flex-col items-center justify-center"
              >
                <div className="w-32 h-32 bg-orange/10 rounded-full flex items-center justify-center text-orange mb-12">
                   <CheckCircle2 className="w-16 h-16" />
                </div>
                <h2 className="text-4xl md:text-5xl font-condensed uppercase tracking-tighter text-espresso mb-6">You're in! ✅</h2>
                <p className="text-espresso/60 text-lg font-medium max-w-lg mb-12 leading-relaxed">
                   Registration for <span className="text-espresso font-bold">{program?.title}</span> is complete. A confirmation receipt has been sent to your email.
                </p>
                <div className="p-8 bg-ivory rounded-[2rem] border border-espresso/5 w-full max-w-md mb-12 text-left">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-orange mb-4">What to bring:</h5>
                   <ul className="space-y-3 text-xs font-bold text-espresso/60">
                      <li>• Comfortable sports attire</li>
                      <li>• Indoor volleyball shoes</li>
                      <li>• Personal water bottle</li>
                      <li>• Energy and focus</li>
                   </ul>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-espresso text-white px-12 py-6 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-orange transition-all shadow-2xl"
                >
                  Return to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
