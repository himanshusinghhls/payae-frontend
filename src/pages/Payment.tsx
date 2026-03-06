import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ArrowRight, ShieldCheck, Settings2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type RoundUpRule = 'NEAREST_10' | 'PERCENT_5' | 'PERCENT_10' | 'CUSTOM';

export default function Payment() {
  const [baseAmount, setBaseAmount] = useState<number | "">("");
  const [roundup, setRoundup] = useState<number>(0);
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(true);
  const [activeRule, setActiveRule] = useState<RoundUpRule>('NEAREST_10');
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    const val = Number(baseAmount);
    if (!val || val <= 0 || !isRoundUpEnabled) {
      setRoundup(0);
      return;
    }

    let calculated = 0;
    switch (activeRule) {
      case 'NEAREST_10':
        const next10 = Math.ceil(val / 10) * 10;
        calculated = next10 === val ? 0 : next10 - val;
        break;
      case 'PERCENT_5':
        calculated = val * 0.05;
        break;
      case 'PERCENT_10':
        calculated = val * 0.10;
        break;
      case 'CUSTOM':
        calculated = val * (customPercent / 100);
        break;
    }
    setRoundup(Math.round(calculated * 100) / 100);
  }, [baseAmount, isRoundUpEnabled, activeRule, customPercent]);

  const totalPayable = Number(baseAmount) + roundup;

  const processPayment = useMutation({
    mutationFn: async () => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");
      const orderRes = await api.post("/api/payments/order", { amount: totalPayable });
      const orderData = orderRes.data; 

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY, 
          amount: Math.round(totalPayable * 100), 
          currency: "INR",
          name: "PayAE",
          description: "Payment & Auto-Savings",
          order_id: orderData, 
          theme: { color: "#1c3166" },
          handler: async function (response: any) {
            try {
              await api.post("/api/payments/verify", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: Number(baseAmount), 
                roundUpAmount: roundup
              });
              resolve(true);
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    },
    onSuccess: () => {
      setPaymentStatus("success");
      setBaseAmount("");
      setRoundup(0);
      setTimeout(() => setPaymentStatus("idle"), 4000);
    },
    onError: (error: any) => alert(error.message || "Payment verification failed. Check console."),
  });

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-6 relative z-10">
        <AnimatePresence mode="wait">
          {paymentStatus === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-payae-card backdrop-blur-xl border border-payae-green/30 p-10 rounded-3xl text-center">
              <CheckCircle className="text-payae-green w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400">₹{roundup} has been successfully routed to your wealth portfolio.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-8 rounded-3xl shadow-2xl">
              
              <div className="flex items-center gap-3 mb-8 border-b border-payae-border pb-6">
                <div className="bg-payae-accent/20 p-3 rounded-xl"><ShieldCheck className="text-payae-accent w-6 h-6" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Make Payment</h2>
                  <p className="text-sm text-gray-400">UPI checkout with dynamic wealth routing.</p>
                </div>
              </div>

              {/* Base Amount */}
              <div className="mb-6 relative">
                <span className="absolute left-4 top-4 text-gray-400 text-xl font-bold">₹</span>
                <input type="number" placeholder="Enter base amount" value={baseAmount} 
                onChange={(e) => {
                  const value = e.target.value;
                  setBaseAmount(value === "" ? "" : Number(value));
                  }} className="w-full bg-black/20 border border-payae-border rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold focus:border-payae-accent outline-none" />
              </div>

              {/* Dynamic Rules Engine */}
              {Number(baseAmount) > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-payae-card to-white/5 border border-payae-border p-5 rounded-2xl mb-8 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-payae-accent" />
                      <h3 className="text-white font-semibold">Auto-Invest Rule</h3>
                    </div>
                    <button onClick={() => setIsRoundUpEnabled(!isRoundUpEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${isRoundUpEnabled ? 'bg-payae-accent' : 'bg-gray-600'}`}>
                      <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isRoundUpEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {isRoundUpEnabled && (
                    <div className="space-y-4">
                      {/* Rule Selectors */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'NEAREST_10', label: 'Top ₹10' },
                          { id: 'PERCENT_5', label: '5%' },
                          { id: 'PERCENT_10', label: '10%' },
                          { id: 'CUSTOM', label: 'Custom' }
                        ].map((rule) => (
                          <button
                            key={rule.id}
                            onClick={() => setActiveRule(rule.id as RoundUpRule)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${activeRule === rule.id ? 'bg-payae-accent/20 border-payae-accent text-payae-accent' : 'bg-black/30 border-transparent text-gray-400 hover:text-white'}`}
                          >
                            {rule.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Slider (Only shows if CUSTOM is active) */}
                      <AnimatePresence>
                        {activeRule === 'CUSTOM' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="flex justify-between text-xs text-gray-400 mb-2 mt-4">
                              <span>Custom Percentage</span>
                              <span className="text-payae-accent font-bold">{customPercent}%</span>
                            </div>
                            <input type="range" min="1" max="50" value={customPercent} onChange={(e) => setCustomPercent(Number(e.target.value))} className="w-full accent-payae-accent" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Calculated Result */}
                      <div className="flex justify-between items-end pt-4 border-t border-payae-border/50">
                        <span className="text-sm text-gray-300">To be invested</span>
                        <span className="text-2xl font-black text-payae-success">+₹{roundup.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Total Summary & Button */}
              <div className="flex justify-between items-end mb-6 px-2">
                <span className="text-gray-400">Total Charged to Bank</span>
                <span className="text-3xl font-black text-white">₹{totalPayable.toFixed(2)}</span>
              </div>

              <motion.button onClick={() => processPayment.mutate()} disabled={!baseAmount || processPayment.isPending} className="w-full bg-gradient-to-r from-payae-brand to-blue-600 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all">
                {processPayment.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRight className="w-5 h-5" /> Proceed to Pay</>}
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}