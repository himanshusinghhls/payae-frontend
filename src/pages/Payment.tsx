import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ArrowRight, ShieldCheck, Settings2, Store } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const loadRazorpayScript = () => new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

type RoundUpRule = 'NEAREST_10' | 'PERCENT_5' | 'PERCENT_10' | 'CUSTOM';

export default function Payment() {
  const [baseAmount, setBaseAmount] = useState<number | "">("");
  const [roundup, setRoundup] = useState<number>(0);
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(true);
  const [activeRule, setActiveRule] = useState<RoundUpRule>('NEAREST_10');
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success">("idle");
  const [lastPaidRoundup, setLastPaidRoundup] = useState(0);

  const [merchant] = useState(() => {
    const merchants = ["Zomato", "Swiggy", "Amazon", "Starbucks", "Uber", "Reliance Fresh"];
    return merchants[Math.floor(Math.random() * merchants.length)];
  });

  useEffect(() => {
    const val = Number(baseAmount);
    if (!val || val <= 0 || !isRoundUpEnabled) {
      setRoundup(0);
      return;
    }
    let calculated = 0;
    if (activeRule === 'NEAREST_10') {
      const next10 = Math.ceil(val / 10) * 10;
      calculated = next10 === val ? 0 : next10 - val;
    } else if (activeRule === 'PERCENT_5') calculated = val * 0.05;
    else if (activeRule === 'PERCENT_10') calculated = val * 0.10;
    else if (activeRule === 'CUSTOM') calculated = val * (customPercent / 100);
    
    setRoundup(Math.round(calculated * 100) / 100);
  }, [baseAmount, isRoundUpEnabled, activeRule, customPercent]);

  const totalPayable = Number(baseAmount) + roundup;

  const processPayment = useMutation({
    mutationFn: async () => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("SDK failed");
      const orderRes = await api.post("/api/payments/order", { amount: totalPayable });
      
      let actualOrderId = typeof orderRes.data === 'string' ? JSON.parse(orderRes.data).id : orderRes.data.id || orderRes.data;

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY, 
          amount: Math.round(totalPayable * 100), 
          currency: "INR",
          name: "PayAE UPI",
          description: `Payment to ${merchant}`,
          order_id: actualOrderId, 
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
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error("Cancelled")) },
        };
        new (window as any).Razorpay(options).open();
      });
    },
    onSuccess: () => {
      setLastPaidRoundup(roundup);
      setPaymentStatus("success");
      setBaseAmount("");
      setRoundup(0);
      setTimeout(() => setPaymentStatus("idle"), 5000);
    },
    onError: (e: any) => alert("Failed: " + e.message),
  });

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-6 relative z-10 px-4 md:px-0">
        <AnimatePresence mode="wait">
          {paymentStatus === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-payae-card backdrop-blur-xl border border-payae-green/30 p-8 md:p-10 rounded-3xl text-center">
              <CheckCircle className="text-payae-green w-16 h-16 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Payment Sent to {merchant}</h2>
              <p className="text-gray-400 font-medium">₹{lastPaidRoundup.toFixed(2)} was successfully routed to your wealth portfolio!</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 md:p-8 rounded-3xl shadow-2xl">
              
              <div className="flex items-center gap-3 mb-6 border-b border-payae-border pb-6">
                <div className="bg-blue-500/20 p-3 rounded-xl"><Store className="text-blue-400 w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Paying To</p>
                  <h2 className="text-xl font-bold text-white">{merchant} Account</h2>
                </div>
              </div>

              {/* ... (Keep the rest of your baseAmount input and sliders exactly the same) ... */}
              <div className="mb-6 relative">
                <span className="absolute left-4 top-4 text-gray-400 text-xl font-bold">₹</span>
                <input type="number" placeholder="Enter amount" value={baseAmount} 
                onChange={(e) => setBaseAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                className="w-full bg-black/20 border border-payae-border rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold focus:border-payae-accent outline-none" />
              </div>

              {Number(baseAmount) > 0 && (
                 <div className="bg-gradient-to-r from-payae-card to-white/5 border border-payae-border p-5 rounded-2xl mb-8">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-white font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-payae-accent"/> Auto-Invest</h3>
                         <button onClick={() => setIsRoundUpEnabled(!isRoundUpEnabled)} className={`w-12 h-6 rounded-full relative ${isRoundUpEnabled ? 'bg-payae-accent' : 'bg-gray-600'}`}>
                            <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isRoundUpEnabled ? 'right-1' : 'left-1'}`} />
                         </button>
                     </div>
                     {isRoundUpEnabled && (
                         <div className="flex justify-between items-end pt-4 border-t border-payae-border/50">
                             <span className="text-sm text-gray-300">To be invested</span>
                             <span className="text-2xl font-black text-payae-success">+₹{roundup.toFixed(2)}</span>
                         </div>
                     )}
                 </div>
              )}

              <button onClick={() => processPayment.mutate()} disabled={!baseAmount || processPayment.isPending} className="w-full bg-gradient-to-r from-payae-brand to-blue-600 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all">
                {processPayment.isPending ? <Loader2 className="animate-spin" /> : `Pay ₹${totalPayable.toFixed(2)}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}