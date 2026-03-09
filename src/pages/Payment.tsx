import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ShieldCheck, Settings2, AlertCircle, XCircle, Receipt, QrCode, X, Camera, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Scanner } from '@yudiel/react-qr-scanner';

const loadRazorpayScript = () => new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

type RoundUpRule = 'SMART_ALGO' | 'PERCENT_5' | 'PERCENT_10' | 'CUSTOM';

export default function Payment() {
  const queryClient = useQueryClient(); 
  const [payeeName, setPayeeName] = useState("");
  const [payeeUpi, setPayeeUpi] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [baseAmount, setBaseAmount] = useState<number | "">("");
  const [roundup, setRoundup] = useState<number>(0);
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(() => localStorage.getItem('autoSaveEnabled') !== 'false');
  const [activeRule, setActiveRule] = useState<RoundUpRule>('SMART_ALGO');
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [lastPaidRoundup, setLastPaidRoundup] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinErrorShake, setPinErrorShake] = useState(false);
  const HIGH_VALUE_THRESHOLD = 10000;

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
    if (!val || val <= 0 || !isRoundUpEnabled) { setRoundup(0); return; }
    let calculated = 0;
    if (activeRule === 'SMART_ALGO') {
      if (val <= 50) { 
        calculated = 5 - (val % 5); 
        if (calculated === 0 || calculated === 5) calculated = 5; 
      }
      else if (val <= 100) { 
        calculated = 10 - (val % 10); 
        if (calculated === 0 || calculated === 10) calculated = 10; 
      }
      else if (val <= 500) { 
        calculated = 50 - (val % 50); 
        if (calculated === 0 || calculated === 50) calculated = 50; 
      }
      else { 
        calculated = 100 - (val % 100); 
        if (calculated === 0 || calculated === 100) calculated = 100; 
      }
    } else if (activeRule === 'PERCENT_5') calculated = val * 0.05;
    else if (activeRule === 'PERCENT_10') calculated = val * 0.10;
    else if (activeRule === 'CUSTOM') calculated = val * (customPercent / 100);
    
    setRoundup(Math.round(calculated * 100) / 100);
  }, [baseAmount, isRoundUpEnabled, activeRule, customPercent]);

  const totalPayable = Number(baseAmount) + roundup;
  const isBalanceLow = totalPayable > currentBalance;
  const isHighValue = Number(baseAmount) > HIGH_VALUE_THRESHOLD;

  const handleScan = (result: string) => {
    try {
      const url = new URL(result);
      if (url.protocol === "upi:") {
        const params = new URLSearchParams(url.search);
        const pa = params.get("pa");
        const pn = params.get("pn");
        const am = params.get("am");
        
        if (pa) setPayeeUpi(pa);
        if (pn) setPayeeName(decodeURIComponent(pn));
        if (am) setBaseAmount(Number(am));
        
        setShowScanner(false);
        toast.success(`Scanned: ${decodeURIComponent(pn || pa || 'User')}`);
      } else {
        toast.error("Not a valid UPI QR Code.");
      }
    } catch (e) {
      toast.error("Could not parse QR code.");
    }
  };

  const processPayment = useMutation({
    mutationFn: async () => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("SDK failed");
      const orderRes = await api.post("/api/payments/order", { amount: totalPayable });
      let actualOrderId = typeof orderRes.data === 'string' ? JSON.parse(orderRes.data).id : orderRes.data.id || orderRes.data;

      const finalRoundupAmount = roundup;
      const finalBaseAmount = Number(baseAmount);

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY, 
          amount: Math.round(totalPayable * 100), 
          currency: "INR",
          name: "PayAE UPI",
          description: `Paying ${payeeName || payeeUpi || 'User'}`,
          order_id: actualOrderId, 
          theme: { color: "#1c3166" },
          handler: async function (response: any) {
            try {
              await api.post("/api/payments/verify", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: finalBaseAmount, 
                roundUpAmount: finalRoundupAmount,
                payeeName: payeeName || payeeUpi || "Unknown Payee",
                payeeUpi: payeeUpi
              });
              resolve({ successRoundup: finalRoundupAmount });
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error("Cancelled")) },
        };
        const rzp = new (window as any).Razorpay(options);
        
        rzp.on('payment.failed', async function () {
          try { await api.post("/api/payments/failed", { orderId: actualOrderId, amount: finalBaseAmount, roundUpAmount: finalRoundupAmount, payeeName: payeeName || payeeUpi || "Unknown Payee" }); } catch(e) {}
          reject(new Error("Payment Declined"));
        });
        rzp.open();
      });
    },
    onSuccess: async (data: any) => {
      setLastPaidRoundup(data.successRoundup); 
      setPaymentStatus("success");
      setBaseAmount("");
      setRoundup(0);
      setPayeeName("");
      setPayeeUpi("");
      await queryClient.invalidateQueries({ queryKey: ['dashboard_balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setTimeout(() => setPaymentStatus("idle"), 5000);
    },
    onError: (e: any) => {
      toast.error(e.message || "Payment failed.");
      setPaymentStatus("failed");
      setTimeout(() => setPaymentStatus("idle"), 5000);
    }
  });

  const handlePayClick = () => {
    if (isHighValue) {
      setShowPinModal(true);
      setEnteredPin("");
    } else {
      processPayment.mutate();
    }
  };

  const handlePinInput = (digit: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);
      
      if (newPin.length === 4) {
        const storedPin = localStorage.getItem("userPin") || "0000";
        if (newPin === storedPin) {
          setShowPinModal(false);
          processPayment.mutate();
        } else {
          setPinErrorShake(true);
          setTimeout(() => {
            setPinErrorShake(false);
            setEnteredPin("");
          }, 500);
        }
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-6 relative z-10 px-4 md:px-0">
        
        <AnimatePresence>
          {showPinModal && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-payae-bg border-t md:border border-white/10 p-8 rounded-t-[40px] md:rounded-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center"
              >
                <div className="w-16 h-1.5 bg-white/20 rounded-full mb-6 md:hidden" onClick={() => setShowPinModal(false)} />
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-4"><Lock className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold text-white mb-2">High Value Transaction</h3>
                <p className="text-gray-400 text-sm mb-8 text-center">Verify identity to send ₹{totalPayable.toFixed(2)}</p>

                <motion.div animate={pinErrorShake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="flex gap-4 mb-10">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${pinErrorShake ? 'border-red-500 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : enteredPin.length > i ? 'bg-payae-accent border-payae-accent shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'border-white/20'}`} />
                  ))}
                </motion.div>

                <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'X'].map((key) => (
                    <button 
                      key={key} 
                      onClick={() => {
                        if (key === 'C') setEnteredPin("");
                        else if (key === 'X') setShowPinModal(false);
                        else handlePinInput(key.toString());
                      }}
                      className={`h-16 rounded-full text-2xl font-bold flex items-center justify-center transition-all ${key === 'X' || key === 'C' ? 'text-gray-500 hover:bg-white/5' : 'text-white hover:bg-white/10 bg-white/5'}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScanner && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
              <button onClick={() => setShowScanner(false)} className="absolute top-10 right-10 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><X size={24}/></button>
              <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3"><Camera className="text-payae-accent" /> Scan Any UPI QR</h2>
              <div className="w-full max-w-sm rounded-3xl overflow-hidden border-4 border-payae-accent shadow-[0_0_50px_rgba(0,229,255,0.3)]">
                 <Scanner onScan={(result) => handleScan(result[0].rawValue)} formats={['qr_code']} />
              </div>
              <p className="text-gray-400 mt-6 text-center">Point your camera at a BharatPe, PhonePe, or Paytm QR code.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {paymentStatus === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-black/60 backdrop-blur-3xl border border-payae-green/30 p-8 rounded-3xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
              <CheckCircle className="text-payae-green w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful</h2>
              {lastPaidRoundup > 0 ? <p className="text-gray-400">₹{lastPaidRoundup.toFixed(2)} routed to wealth portfolio!</p> : <p className="text-gray-400">Payment completed.</p>}
              {isHighValue && <p className="text-xs text-yellow-500 mt-4 font-bold tracking-widest uppercase">Security Receipt Sent to Email</p>}
            </motion.div>
          ) : paymentStatus === "failed" ? (
             <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-black/60 backdrop-blur-3xl border border-red-500/30 p-8 rounded-3xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
               <XCircle className="text-red-500 w-16 h-16 mx-auto mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Payment Failed</h2>
               <p className="text-gray-400">Transaction was declined. Recorded in your Ledger.</p>
             </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl">
              
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-3 rounded-xl"><ShieldCheck className="text-blue-400 w-6 h-6" /></div>
                  <h2 className="text-xl font-bold text-white">Make Payment</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Bank Balance</p>
                  <p className={`font-bold text-xl ${currentBalance < 500 ? 'text-red-400' : 'text-payae-success'}`}><AnimatedNumber value={currentBalance} /></p>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Receiver Name (Optional)</label>
                    <input type="text" placeholder="e.g. Starbucks" value={payeeName} onChange={(e) => setPayeeName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-payae-accent outline-none" />
                  </div>
                  <button onClick={() => setShowScanner(true)} className="mt-6 flex items-center justify-center gap-2 bg-payae-accent/10 border border-payae-accent/30 text-payae-accent px-4 rounded-xl hover:bg-payae-accent/20 transition-colors font-bold whitespace-nowrap">
                    <QrCode size={20} /> Scan
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">UPI ID</label>
                  <input type="text" placeholder="e.g. name@okhdfc" value={payeeUpi} onChange={(e) => setPayeeUpi(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-payae-accent outline-none" />
                </div>
              </div>

              <div className="mb-6 relative">
                <span className="absolute left-4 top-4 text-gray-400 text-xl font-bold">₹</span>
                <input type="number" placeholder="Enter amount" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold focus:border-payae-accent outline-none" />
                
                <AnimatePresence>
                  {isHighValue && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-md border border-yellow-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3"/> PIN Protected
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {Number(baseAmount) > 0 && (
                 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="text-white font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-payae-accent"/> Auto-Invest Rule</h3>
                         <button onClick={() => setIsRoundUpEnabled(!isRoundUpEnabled)} className={`w-12 h-6 rounded-full relative ${isRoundUpEnabled ? 'bg-payae-accent' : 'bg-gray-600'}`}>
                            <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isRoundUpEnabled ? 'right-1' : 'left-1'}`} />
                         </button>
                     </div>
                     {isRoundUpEnabled && (
                       <div className="space-y-4">
                         <div className="grid grid-cols-4 gap-2">
                          {[{ id: 'SMART_ALGO', label: 'Smart Algo' }, { id: 'PERCENT_5', label: '5%' }, { id: 'PERCENT_10', label: '10%' }, { id: 'CUSTOM', label: 'Custom' }].map((rule) => (
                            <button key={rule.id} onClick={() => setActiveRule(rule.id as RoundUpRule)} className={`py-2 text-xs font-bold rounded-lg border transition-all ${activeRule === rule.id ? 'bg-payae-accent/20 border-payae-accent text-payae-accent' : 'bg-black/40 border-transparent text-gray-400 hover:text-white'}`}>{rule.label}</button>
                          ))}
                         </div>
                         <AnimatePresence>
                           {activeRule === 'CUSTOM' && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                               <div className="flex justify-between text-xs text-gray-400 mb-2 mt-4"><span>Custom Percentage</span><span className="text-payae-accent font-bold">{customPercent}%</span></div>
                               <input type="range" min="1" max="50" value={customPercent} onChange={(e) => setCustomPercent(Number(e.target.value))} className="w-full accent-payae-accent" />
                             </motion.div>
                           )}
                         </AnimatePresence>
                         <div className="flex justify-between items-end pt-4 border-t border-white/10">
                             <span className="text-sm text-gray-300">To be invested</span>
                             <span className="text-2xl font-black text-payae-success">+₹{roundup.toFixed(2)}</span>
                         </div>
                       </div>
                     )}
                 </div>
              )}

              {Number(baseAmount) > 0 && (
                <div className="bg-black/60 p-4 rounded-xl border border-white/10 flex justify-between items-center mb-6 shadow-inner">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Receipt className="w-5 h-5" /> <span className="font-semibold">Total Payable</span>
                  </div>
                  <span className="text-2xl font-black text-white">₹{totalPayable.toFixed(2)}</span>
                </div>
              )}

              <AnimatePresence>
                {isBalanceLow && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle className="w-5 h-5" /><span className="text-sm font-semibold">Insufficient virtual bank balance!</span></motion.div>
                )}
              </AnimatePresence>

              <button onClick={handlePayClick} disabled={!baseAmount || !payeeUpi || processPayment.isPending || isBalanceLow} className={`w-full text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all ${!baseAmount || !payeeUpi || isBalanceLow ? 'bg-gray-600 cursor-not-allowed opacity-50' : isHighValue ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg' : 'bg-gradient-to-r from-payae-brand to-blue-600 shadow-lg hover:shadow-blue-500/25'}`}>
                {processPayment.isPending ? <Loader2 className="animate-spin" /> : isHighValue ? `Verify Identity to Pay ₹${totalPayable.toFixed(2)}` : `Securely Pay ₹${totalPayable.toFixed(2)}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}