import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Plus, Loader2, X, Target, Activity, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import OnboardingTour from "../components/ui/OnboardingTour";

const loadRazorpayScript = () => new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const fetchDashboard = async () => {
  const res = await api.get("/api/dashboard"); 
  return res.data.data || res.data; 
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dashData, isLoading: isDashLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, refetchInterval: 10000 });
  const { data: rawTransactions, isLoading: isLedgerLoading } = useQuery({ queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }});
  const { data: profile } = useQuery({ queryKey: ['userProfile'], queryFn: async () => { const res = await api.get("/api/users/me"); return res.data; } });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | "">("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.hasCompletedOnboarding === "false") {
      setShowOnboarding(true);
    }
  }, [profile]);

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/onboarding/complete"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    completeOnboardingMutation.mutate();
  };

  const handleRazorpayTopUp = async () => {
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    try {
      setIsTopUpLoading(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");
      
      const orderRes = await api.post("/api/payments/order", { amount: Number(topUpAmount) });
      let actualOrderId = typeof orderRes.data === 'string' ? JSON.parse(orderRes.data).id : orderRes.data.id || orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: Number(topUpAmount) * 100,
        currency: "INR",
        name: "PayAE Top-Up",
        description: "Add money to Virtual Wallet",
        order_id: actualOrderId,
        theme: { color: "#00E5FF" },
        handler: async function (response: any) {
          try {
            await api.post("/api/payments/verify-topup", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: Number(topUpAmount)
            });
            toast.success(`₹${topUpAmount} added to your virtual wallet!`);
            setShowTopUpModal(false);
            setTopUpAmount("");
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_balance'] });
          } catch (err) {
            toast.error("Top-Up verification failed on our servers.");
          }
        },
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error("Payment was declined.");
      });
      rzp.open();
    } catch (err) {
      toast.error("Top-Up initialization failed.");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const calcSavings = Number(dashData?.savingsBalance || 0);
  const calcMf = Number(dashData?.mutualFundUnits || 0);
  const calcGold = Number(dashData?.goldGrams || 0);

  const weeklyData = useMemo(() => {
    if (!rawTransactions) return [];
    const days = Array.from({length: 7}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { 
        dateString: d.toISOString().split('T')[0], 
        label: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        total: 0 
      };
    });
    rawTransactions.forEach((tx: any) => {
      if (tx.type === "ROUND_UP") {
        const dayMatch = days.find(d => d.dateString === tx.timestamp.split('T')[0]);
        if (dayMatch) dayMatch.total += tx.amount;
      }
    });
    return days;
  }, [rawTransactions]);

  const maxDailyValue = Math.max(...weeklyData.map(d => d.total), 50);

  const mouseX = useMotionValue(0); 
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 }); 
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const rotateY = useTransform(springX, [-0.5, 0, 0.5], ["-4deg", "0deg", "4deg"]); 
  const rotateX = useTransform(springY, [-0.5, 0, 0.5], ["4deg", "0deg", "-4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5); 
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  if (isDashLoading || isLedgerLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;

  const bankBalance = Number(dashData?.bankBalance || 0);
  const totalPayments = Number(dashData?.totalInvested || dashData?.totalPayments || 0);
  const totalWealth = calcSavings + calcMf + calcGold;
  const goalTarget = Number(profile?.wealthGoal) || 2000;
  
  if (totalWealth >= goalTarget && !localStorage.getItem("milestoneGoal")) {
    setShowConfetti(true);
    localStorage.setItem("milestoneGoal", "true");
    setTimeout(() => setShowConfetti(false), 6000);
  }

  const completionPercentage = Math.min((totalWealth / goalTarget) * 100, 100);
  const coinsToRender = Math.floor(completionPercentage);
  const coinsArray = Array.from({ length: coinsToRender }, (_, i) => i);

  return (
    <AppLayout>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#00E5FF', '#00FF94', '#f58220']} className="z-[100]" />}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      <div className="max-w-7xl mx-auto space-y-6 relative mt-2">
        <AnimatePresence>
          {showTopUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTopUpModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-payae-card border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md z-10">
                <button onClick={() => setShowTopUpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-bold text-white mb-6">Top Up Wallet</h3>
                
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-bold">₹</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={topUpAmount} 
                    onChange={(e) => setTopUpAmount(e.target.value ? Number(e.target.value) : "")} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-3xl font-black focus:border-payae-accent outline-none transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[500, 1000, 5000].map(amt => (
                    <button key={amt} onClick={() => setTopUpAmount(amt)} className="py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 hover:text-white transition-colors">
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button onClick={handleRazorpayTopUp} disabled={isTopUpLoading || !topUpAmount || Number(topUpAmount) <= 0} className="w-full bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isTopUpLoading ? <Loader2 className="animate-spin mx-auto" /> : `Proceed to Pay`}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 relative z-10">
          <motion.div className="bg-gradient-to-br from-payae-card to-black border border-payae-orange/30 p-5 rounded-2xl shadow-[0_0_30px_rgba(245,130,32,0.1)] relative overflow-hidden group flex flex-col justify-center">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-widest">Virtual Balance</p>
                <h3 className="text-2xl font-black text-white"><AnimatedNumber value={bankBalance} /></h3>
              </div>
              <button onClick={() => setShowTopUpModal(true)} className="w-9 h-9 bg-payae-orange/20 text-payae-orange rounded-xl flex items-center justify-center hover:bg-payae-orange hover:text-black transition-colors shrink-0"><Plus className="w-4 h-4" /></button>
            </div>
          </motion.div>
          <StatCard title="Total Payments" value={totalPayments} prefix="₹" />
          <StatCard title="Liquid Savings" value={calcSavings} prefix="₹" highlight />
          <StatCard title="Mutual Funds" value={calcMf} prefix="₹" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div style={{ perspective: "1000px" }} className="h-[320px] lg:col-span-2">
            <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="bg-gradient-to-br from-black/60 to-black/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl h-full flex flex-col justify-between relative cursor-crosshair">
              <div style={{ transform: "translateZ(30px)" }} className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-payae-accent" /> 7-Day Pulse</h2>
                    <p className="text-gray-400 text-xs mb-4">Your recent auto-investment volume.</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">7d Total</p>
                     <p className="text-xl font-black text-payae-accent">₹{weeklyData.reduce((a, b) => a + b.total, 0).toFixed(0)}</p>
                  </div>
                </div>
                
                <div className="flex items-end justify-between h-40 gap-2 mt-auto w-full px-2">
                  {weeklyData.map((day, idx) => {
                    const heightPct = Math.max((day.total / maxDailyValue) * 100, 5);
                    const isToday = idx === 6;
                    return (
                      <div key={idx} className="flex flex-col items-center w-full group relative h-full justify-end">
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-all bg-black border border-white/20 text-white text-xs font-black py-1.5 px-3 rounded-lg -top-12 z-30 pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                          ₹{day.total.toFixed(2)}
                        </div>
                        <div className="w-full max-w-[32px] h-full flex flex-col justify-end relative">
                           <motion.div 
                              initial={{ bottom: 0 }} animate={{ bottom: `${heightPct}%` }} transition={{ duration: 1.5, delay: idx * 0.1, type: "spring" }} 
                              className={`absolute w-full h-1.5 rounded-t-sm z-20 ${day.total > 0 ? 'bg-payae-accent shadow-[0_0_10px_rgba(0,229,255,0.8)]' : 'bg-gray-700'}`} 
                           />
                           <motion.div 
                              initial={{ height: 0 }} animate={{ height: `${heightPct}%` }} transition={{ duration: 1.5, delay: idx * 0.1, type: "spring" }} 
                              className={`w-full rounded-sm opacity-80 ${day.total > 0 ? 'bg-gradient-to-t from-payae-accent/5 to-payae-accent/40' : 'bg-gray-800/30'}`} 
                           />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-3 ${isToday ? 'text-payae-accent drop-shadow-md' : 'text-gray-500'}`}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-[320px] bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl relative flex flex-col justify-between group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-payae-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none z-0" />
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <h2 className="text-lg font-bold text-white flex items-center gap-2"><Target className="text-payae-orange w-5 h-5"/> Goal Tracking</h2>
                 <p className="text-xs text-gray-400 mt-1">₹{totalWealth.toFixed(0)} / ₹{goalTarget.toFixed(0)}</p>
              </div>
            </div>
            
            <div className="relative w-32 h-56 mx-auto mt-auto flex flex-col justify-end items-center z-10">
               <div className="w-16 h-3 bg-gray-800 border-2 border-gray-700 rounded-t-md absolute -top-3 z-30" />
               <div className="w-full h-full border-4 border-white/20 rounded-b-3xl rounded-t-lg relative overflow-hidden bg-white/5 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                 
                 {coinsArray.map((coin, i) => {
                   const cols = 4; 
                   const row = Math.floor(i / cols); 
                   const col = i % cols;
                   const rowOffset = row % 2 === 0 ? 0 : 12;
                   const baseLeft = col * 28 + rowOffset; 
                   const randomXJitter = (Math.random() - 0.5) * 4; 
                   const randomYJitter = (Math.random() - 0.5) * 2;
                   const boundedLeft = Math.max(0, Math.min(baseLeft + randomXJitter, 100));
                   const boundedBottom = row * 3.5 + randomYJitter;

                   return (
                     <motion.div 
                       key={coin}
                       initial={{ y: -800, opacity: 0, rotate: (i % 2 === 0 ? 1 : -1) * (Math.random() * 360 + 180) }}
                       animate={{ y: 0, opacity: 1, rotate: Math.random() * 16 - 8 }}
                       transition={{ type: "spring", stiffness: 400, damping: 15, mass: 0.8, delay: i * 0.015 }}
                       className="absolute w-7 h-2.5 bg-gradient-to-b from-yellow-300 to-yellow-600 border border-yellow-700 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20"
                       style={{ bottom: `${boundedBottom}px`, left: `${boundedLeft}px`, zIndex: i }}
                     />
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}