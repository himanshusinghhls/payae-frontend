import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ArrowRight, ShieldCheck, Settings2, Users, AlertCircle, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const loadRazorpayScript = () => new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

type RoundUpRule = 'SMART_ALGO' | 'PERCENT_5' | 'PERCENT_10' | 'CUSTOM';

const CONTACTS = [
  { id: 1, name: "Amazon India", upi: "amazon@apl" },
  { id: 2, name: "Zomato", upi: "zomato@paytm" },
  { id: 3, name: "Starbucks", upi: "starbucks@sbi" },
  { id: 4, name: "xyz", upi: "xyz@oksbi" },
  { id: 5, name: "College Canteen", upi: "canteen@ybl" }
];

export default function Payment() {
  const queryClient = useQueryClient();
  const [baseAmount, setBaseAmount] = useState<number | "">("");
  const [roundup, setRoundup] = useState<number>(0);
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(true);
  const [activeRule, setActiveRule] = useState<RoundUpRule>('SMART_ALGO');
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [lastPaidRoundup, setLastPaidRoundup] = useState(0);
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard_balance'],
    queryFn: async () => {
      const res = await api.get("/api/dashboard");
      return res.data?.data || res.data;
    }
  });

  const currentBalance = dashboardData?.bankBalance || 0;

  useEffect(() => {
    const val = Number(baseAmount);
    if (!val || val <= 0 || !isRoundUpEnabled) {
      setRoundup(0);
      return;
    }
    
    let calculated = 0;
    if (activeRule === 'SMART_ALGO') {
      if (val < 25) {
        calculated = 1;
      } else if (val >= 25 && val < 50) {
        calculated = 2;
      } else if (val >= 50 && val < 100) {
        const rem = val % 5;
        calculated = rem === 0 ? 0 : 5 - rem;
        if (calculated < 4) calculated += 5; 
      } else if (val >= 100 && val < 500) {
        const rem = val % 10;
        calculated = rem === 0 ? 0 : 10 - rem;
        if (calculated < 9) calculated += 10;
      } else if (val >= 500 && val < 1000) {
        const rem = val % 20;
        calculated = rem === 0 ? 0 : 20 - rem;
      } else {
        const rem = val % 50;
        calculated = rem === 0 ? 0 : 50 - rem;
      }
    } else if (activeRule === 'PERCENT_5') calculated = val * 0.05;
    else if (activeRule === 'PERCENT_10') calculated = val * 0.10;
    else if (activeRule === 'CUSTOM') calculated = val * (customPercent / 100);
    
    setRoundup(Math.round(calculated * 100) / 100);
  }, [baseAmount, isRoundUpEnabled, activeRule, customPercent]);

  const totalPayable = Number(baseAmount) + roundup;
  const isBalanceLow = totalPayable > currentBalance;

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
          description: `Paying ${selectedContact.name}`,
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
        const rzp = new (window as any).Razorpay(options);
        
        rzp.on('payment.failed', function () {
          reject(new Error("Payment Declined"));
        });
        
        rzp.open();
      });
    },
    onSuccess: () => {
      setLastPaidRoundup(roundup); 
      setPaymentStatus("success");
      setBaseAmount("");
      setRoundup(0);
      
      queryClient.invalidateQueries({ queryKey: ['dashboard_balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });

      setTimeout(() => setPaymentStatus("idle"), 5000);
    },
    onError: () => {
      setPaymentStatus("failed");
      setTimeout(() => setPaymentStatus("idle"), 5000);
    },
  });

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-6 relative z-10 px-4 md:px-0">
        <AnimatePresence mode="wait">
          {paymentStatus === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-payae-card backdrop-blur-xl border border-payae-green/30 p-8 rounded-3xl text-center">
              <CheckCircle className="text-payae-green w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Paid to {selectedContact.name}</h2>
              <p className="text-gray-400">₹{lastPaidRoundup.toFixed(2)} was successfully routed to your wealth portfolio!</p>
            </motion.div>
          ) : paymentStatus === "failed" ? (
             <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-payae-card backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl text-center">
               <XCircle className="text-red-500 w-16 h-16 mx-auto mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Payment Failed</h2>
               <p className="text-gray-400">The transaction was declined or cancelled. No money was deducted.</p>
             </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 md:p-8 rounded-3xl shadow-2xl">
              
              <div className="flex justify-between items-center mb-6 border-b border-payae-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-3 rounded-xl"><ShieldCheck className="text-blue-400 w-6 h-6" /></div>
                  <h2 className="text-xl font-bold text-white">Make Payment</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Bank Balance</p>
                  <p className={`font-bold ${currentBalance < 500 ? 'text-red-400' : 'text-payae-success'}`}>₹{currentBalance.toFixed(2)}</p>
                </div>
              </div>

              {/* Payee Dropdown */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2"><Users className="w-4 h-4"/> Select Payee</label>
                <select 
                  className="w-full bg-black/30 border border-payae-border rounded-xl p-4 text-white font-semibold focus:border-payae-accent outline-none appearance-none"
                  onChange={(e) => setSelectedContact(CONTACTS.find(c => c.id === Number(e.target.value)) || CONTACTS[0])}
                >
                  {CONTACTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.upi})</option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="mb-6 relative">
                <span className="absolute left-4 top-4 text-gray-400 text-xl font-bold">₹</span>
                <input type="number" placeholder="Enter amount" value={baseAmount} 
                onChange={(e) => setBaseAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                className="w-full bg-black/20 border border-payae-border rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold focus:border-payae-accent outline-none" />
              </div>

              {/* Auto-Invest Rules */}
              {Number(baseAmount) > 0 && (
                 <div className="bg-gradient-to-r from-payae-card to-white/5 border border-payae-border p-5 rounded-2xl mb-8">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="text-white font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-payae-accent"/> Auto-Invest Rule</h3>
                         <button onClick={() => setIsRoundUpEnabled(!isRoundUpEnabled)} className={`w-12 h-6 rounded-full relative ${isRoundUpEnabled ? 'bg-payae-accent' : 'bg-gray-600'}`}>
                            <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isRoundUpEnabled ? 'right-1' : 'left-1'}`} />
                         </button>
                     </div>

                     {isRoundUpEnabled && (
                       <div className="space-y-4">
                         <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'SMART_ALGO', label: 'Smart Algo' },
                            { id: 'PERCENT_5', label: '5%' },
                            { id: 'PERCENT_10', label: '10%' },
                            { id: 'CUSTOM', label: 'Custom' }
                          ].map((rule) => (
                            <button key={rule.id} onClick={() => setActiveRule(rule.id as RoundUpRule)} className={`py-2 text-xs font-bold rounded-lg border transition-all ${activeRule === rule.id ? 'bg-payae-accent/20 border-payae-accent text-payae-accent' : 'bg-black/30 border-transparent text-gray-400 hover:text-white'}`}>
                              {rule.label}
                            </button>
                          ))}
                         </div>
                         <div className="flex justify-between items-end pt-4 border-t border-payae-border/50">
                             <span className="text-sm text-gray-300">To be invested</span>
                             <span className="text-2xl font-black text-payae-success">+₹{roundup.toFixed(2)}</span>
                         </div>
                       </div>
                     )}
                 </div>
              )}

              {/* Low Balance Warning */}
              <AnimatePresence>
                {isBalanceLow && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Insufficient virtual bank balance!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => processPayment.mutate()} 
                disabled={!baseAmount || processPayment.isPending || isBalanceLow} 
                className={`w-full text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all ${isBalanceLow ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-payae-brand to-blue-600 shadow-lg hover:shadow-blue-500/25'}`}
              >
                {processPayment.isPending ? <Loader2 className="animate-spin" /> : `Pay ₹${totalPayable.toFixed(2)}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}