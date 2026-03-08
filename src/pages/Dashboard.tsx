import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Plus, Loader2, X, Target, Sparkles, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import OnboardingTour from "../components/ui/OnboardingTour";

type DashboardData = { bankBalance: number; totalPayments: number; totalSavings: number; mfUnits: number; goldGrams: number; };

const fetchDashboard = async (): Promise<DashboardData> => {
  const res = await api.get("/api/dashboard"); 
  const data = res.data.data || res.data; 
  return { 
    bankBalance: Number(data.bankBalance || 0), 
    totalPayments: Number(data.totalInvested || 0), 
    totalSavings: Number(data.savingsBalance || data.savings || 0), 
    mfUnits: Number(data.mutualFundUnits || data.mf || 0), 
    goldGrams: Number(data.goldGrams || data.gold || 0)
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, refetchInterval: 10000 });
  const { data: rawTransactions } = useQuery({ queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }});
  
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      setShowOnboarding(true);
      localStorage.setItem("hasSeenTour", "true");
    }
  }, []);

  const topUpMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/topup", { amount: topUpAmount }),
    onSuccess: () => {
      toast.success(`₹${topUpAmount} added to your virtual wallet!`);
      setShowTopUpModal(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const weeklyData = useMemo(() => {
    if (!rawTransactions) return [];
    const days = Array.from({length: 7}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { dateString: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }), total: 0 };
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

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  if (isError || !data) return <AppLayout><p className="text-red-400 p-8">Failed to load data.</p></AppLayout>;

  const goldValue = data.goldGrams * 7500;
  const totalWealth = data.totalSavings + data.mfUnits + goldValue;
  
  if (totalWealth >= 1000 && !localStorage.getItem("milestone1k")) {
    setShowConfetti(true);
    localStorage.setItem("milestone1k", "true");
    setTimeout(() => setShowConfetti(false), 6000);
  }

  // 👈 NEW: Coin Physics Logic
  const goalTarget = 5000;
  const goalProgress = Math.min((totalWealth / goalTarget) * 100, 100);
  const maxCoins = 45; // Max coins that fit in the jar
  const coinsToRender = Math.floor((goalProgress / 100) * maxCoins);
  const coinsArray = Array.from({ length: coinsToRender }, (_, i) => i);

  return (
    <AppLayout>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#00E5FF', '#00FF94', '#f58220']} className="z-[100]" />}
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}

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
                <h3 className="text-2xl font-black text-white"><AnimatedNumber value={data.bankBalance} /></h3>
              </div>
              <button onClick={() => setShowTopUpModal(true)} className="w-9 h-9 bg-payae-orange/20 text-payae-orange rounded-xl flex items-center justify-center hover:bg-payae-orange hover:text-black transition-colors shrink-0"><Plus className="w-4 h-4" /></button>
            </div>
          </motion.div>
          <StatCard title="Total Payments" value={data.totalPayments} prefix="₹" />
          <StatCard title="Liquid Savings" value={data.totalSavings} prefix="₹" highlight />
          <StatCard title="Mutual Fund Units" value={data.mfUnits} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div style={{ perspective: "1000px" }} className="h-[320px] lg:col-span-2">
            <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="bg-gradient-to-br from-black/60 to-black/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl h-full flex flex-col justify-between relative cursor-crosshair">
              <div style={{ transform: "translateZ(30px)" }} className="flex flex-col h-full">
                <div>
                  <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2"><Activity className="w-5 h-5 text-payae-success" /> 7-Day Wealth Engine</h2>
                  <p className="text-gray-400 text-xs mb-4">Live automated investment routing.</p>
                </div>
                <div className="flex items-end justify-between h-40 gap-3 mt-auto w-full px-2">
                  {weeklyData.map((day, idx) => {
                    const heightPct = Math.max((day.total / maxDailyValue) * 100, 8);
                    const isToday = idx === 6;
                    return (
                      <div key={idx} className="flex flex-col items-center w-full group relative">
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-all bg-black/90 border border-white/10 text-white text-xs font-black py-1.5 px-2.5 rounded-lg -top-10 z-30 pointer-events-none">₹{day.total.toFixed(2)}</div>
                        <div className="w-full max-w-[20px] md:max-w-[28px] h-32 bg-black/50 rounded-full border border-white/5 relative overflow-hidden mb-3 flex flex-col justify-end">
                           <motion.div initial={{ height: 0 }} animate={{ height: `${heightPct}%` }} transition={{ duration: 1.5, delay: idx * 0.1, type: "spring" }} className={`w-full rounded-full ${isToday ? 'bg-gradient-to-t from-payae-success/30 to-payae-success' : 'bg-gradient-to-t from-blue-500/20 to-blue-400'}`} />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isToday ? 'text-payae-success' : 'text-gray-500'}`}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-[320px] bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute inset-0 bg-gradient-to-t from-payae-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <h2 className="text-lg font-bold text-white flex items-center gap-2"><Target className="text-payae-orange w-5 h-5"/> Dream Setup Goal</h2>
                 <p className="text-xs text-gray-400 mt-1">₹{totalWealth.toFixed(0)} / ₹{goalTarget}</p>
              </div>
            </div>
            
            <div className="relative w-32 h-44 mx-auto mt-auto flex flex-col justify-end items-center">
               <div className="w-16 h-3 bg-gray-800 border-2 border-gray-700 rounded-t-md absolute -top-3 z-20" />
               <div className="w-full h-full border-4 border-white/20 rounded-b-3xl rounded-t-lg relative overflow-hidden bg-white/5 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
                 
                 {coinsArray.map((coin, i) => {
                   const row = Math.floor(i / 3); 
                   const col = i % 3;
                   const offset = row % 2 === 0 ? 0 : 8;
                   
                   return (
                     <motion.div 
                       key={coin}
                       initial={{ y: -200, opacity: 0, rotate: Math.random() * 40 - 20 }}
                       animate={{ y: 0, opacity: 1, rotate: Math.random() * 10 - 5 }}
                       transition={{ type: "spring", bounce: 0.5, delay: i * 0.05 }}
                       className="absolute w-8 h-2.5 bg-gradient-to-b from-yellow-300 to-yellow-600 border border-yellow-700 rounded-full shadow-lg"
                       style={{ 
                         bottom: `${row * 5 + 4}px`, 
                         left: `${col * 30 + offset + 8}px`,
                         zIndex: i
                       }}
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