import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ArrowRight, ShieldCheck, Edit2 } from "lucide-react";
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

export default function Payment() {
  const [baseAmount, setBaseAmount] = useState<number | "">("");
  const [roundup, setRoundup] = useState<number>(0);
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success">("idle");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < 0) return;
    setBaseAmount(val || "");
    
    if (val > 0) {
      const next = Math.ceil(val / 10) * 10;
      setRoundup(next === val ? 0 : next - val);
    } else {
      setRoundup(0);
    }
  };

  const totalPayable = Number(baseAmount) + (isRoundUpEnabled ? roundup : 0);

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
    onError: (error: any) => alert(error.message || "Payment failed."),
  });

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-payae-accent/10 blur-[100px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {paymentStatus === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-payae-card backdrop-blur-xl border border-payae-green/30 p-10 rounded-3xl shadow-2xl text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-payae-green/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-payae-green w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400">Your total of ₹{totalPayable} was processed securely.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-8 rounded-3xl shadow-2xl z-10 relative">
              <div className="flex items-center gap-3 mb-8 border-b border-payae-border pb-6">
                <div className="bg-payae-accent/20 p-3 rounded-xl"><ShieldCheck className="text-payae-accent w-6 h-6" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Make Payment</h2>
                  <p className="text-sm text-gray-400">Secure UPI Simulation via Razorpay</p>
                </div>
              </div>

              {/* Base Payment Input */}
              <div className="mb-6 relative">
                <span className="absolute left-4 top-4 text-gray-400 text-xl font-bold">₹</span>
                <input type="number" placeholder="Enter base amount" value={baseAmount} onChange={handleAmountChange} className="w-full bg-black/20 border border-payae-border rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-payae-accent transition-colors" />
              </div>

              {/* Dynamic Round-Up Control */}
              {Number(baseAmount) > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-payae-card to-white/5 border border-payae-border p-5 rounded-2xl mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-white font-semibold">Enable Auto-Savings</h3>
                      <p className="text-xs text-gray-400">Round up to the nearest ₹10</p>
                    </div>
                    {/* Toggle Switch */}
                    <button onClick={() => setIsRoundUpEnabled(!isRoundUpEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${isRoundUpEnabled ? 'bg-payae-accent' : 'bg-gray-600'}`}>
                      <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isRoundUpEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {isRoundUpEnabled && (
                    <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-payae-border/50">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-payae-accent" />
                        <span className="text-sm text-gray-300">Investment Amount</span>
                      </div>
                      <input type="number" value={roundup} onChange={(e) => setRoundup(Number(e.target.value))} className="w-24 bg-transparent text-right text-xl font-black text-payae-accent focus:outline-none border-b border-payae-accent/30" />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Total Payable Summary */}
              <div className="flex justify-between items-end mb-6 px-2">
                <span className="text-gray-400">Total to Pay</span>
                <span className="text-3xl font-black text-white">₹{totalPayable.toFixed(2)}</span>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => processPayment.mutate()} disabled={!baseAmount || Number(baseAmount) <= 0 || processPayment.isPending} className="w-full bg-gradient-to-r from-payae-brand to-blue-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {processPayment.isPending ? <><Loader2 className="animate-spin w-5 h-5" /> Processing Securely...</> : <><ArrowRight className="w-5 h-5" /> Proceed to Pay</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}