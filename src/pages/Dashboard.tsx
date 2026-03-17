import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Plus, Loader2, X, Target, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import OnboardingTour from "../components/ui/OnboardingTour";

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
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const topUpMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/topup", { amount: topUpAmount }),
    onSuccess: () => {
      toast.success(`₹${topUpAmount} added to your virtual wallet!`);
      setShowTopUpModal(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    }
  });

  const { calcSavings, calcMf, calcGold } = useMemo(() => {
    let s = 0, m = 0, g = 0;
    (rawTransactions || []).forEach((tx: any) => {
      if (tx.type === "INVESTMENT" || tx.type === "ROUND_UP") {
        const asset = (tx.assetType || "SAVINGS").toUpperCase();
        if (asset.includes("MF") || asset.includes("MUTUAL")) m += tx.amount;
        else if (asset.includes("GOLD")) g += tx.amount;
        else s += tx.amount;
      }
    });
    return { calcSavings: s, calcMf: m, calcGold: g };
  }, [rawTransactions]);

  const heatmapDays = useMemo(() => {
    if (!rawTransactions) return [];
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const amount = rawTransactions
         .filter((tx: any) => tx.timestamp.startsWith(dateStr) && (tx.type === 'ROUND_UP' || tx.type === 'INVESTMENT'))
         .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      days.push({ 
          date: dateStr, 
          amount, 
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      });
    }
    return days;
  }, [rawTransactions]);

  const getHeatmapColor = (amount: number) => {
    if (amount === 0) return 'bg-white/5 border-white/5';
    if (amount < 20) return 'bg-[#0e4429] border-[#0e4429]';
    if (amount < 50) return 'bg-[#006d32] border-[#006d32]';
    if (amount < 100) return 'bg-[#26a641] border-[#26a641]';
    return 'bg-[#39d353] border-[#39d353] shadow-[0_0_10px_rgba(57,211,83,0.4)]'; // Bright green
  };

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
  
  if (totalWealth >= 1000 && !localStorage.getItem("milestone1k")) {
    setShowConfetti(true);
    localStorage.setItem("milestone1k", "true");
    setTimeout(() => setShowConfetti(false), 6000);
  }

  const goalTarget = 200;
  const coinsToRender = Math.min(Math.floor(totalWealth), goalTarget);
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
                <h3 className="text-xl font-bold text-white mb-2">Top Up Wallet</h3>
                <div className="mb-6 mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2"><span>Amount</span><span className="text-white font-bold">₹{topUpAmount}</span></div>
                  <input type="range" min="100" max="10000" step="100" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="w-full accent-payae-accent" />
                </div>
                <button onClick={() => topUpMutation.mutate()} disabled={topUpMutation.isPending} className="w-full bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                  {topUpMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : `Add ₹${topUpAmount}`}
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
                <div>
                  <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2"><Activity className="w-5 h-5 text-[#39d353]" /> 12-Week Activity Heatmap</h2>
                  <p className="text-gray-400 text-xs mb-4">Your auto-investment routing consistency.</p>
                </div>
                
                <div className="mt-auto w-full overflow-x-auto pb-2 scrollbar-hide">
                    <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max mx-auto">
                        {heatmapDays.map((day, idx) => (
                           <div 
                              key={idx} 
                              className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-[3px] border transition-all ${getHeatmapColor(day.amount)} hover:ring-2 hover:ring-white group relative cursor-pointer`}
                           >
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 text-white text-[10px] whitespace-nowrap py-1 px-2 rounded-md bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                                  {day.label}: {day.amount > 0 ? `₹${day.amount.toFixed(2)}` : 'No Activity'}
                              </div>
                           </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 font-semibold pr-2">
                        Less
                        <div className="w-3 h-3 rounded-[2px] bg-white/5 border border-white/5"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#0e4429] border-[#0e4429]"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#006d32] border-[#006d32]"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#26a641] border-[#26a641]"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#39d353] border-[#39d353]"></div>
                        More
                    </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-[320px] bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl relative flex flex-col justify-between group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-payae-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none z-0" />
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <h2 className="text-lg font-bold text-white flex items-center gap-2"><Target className="text-payae-orange w-5 h-5"/> Goal Tracking</h2>
                 <p className="text-xs text-gray-400 mt-1">₹{totalWealth.toFixed(0)} / ₹{goalTarget}</p>
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