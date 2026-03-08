import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Plus, Loader2, X, Wallet, TrendingUp, Coins, Activity } from "lucide-react";
import toast from "react-hot-toast";

type DashboardData = { bankBalance: number; totalPayments: number; totalSavings: number; mfUnits: number; goldGrams: number; };

const fetchDashboard = async (): Promise<DashboardData> => {
  const res = await api.get("/api/dashboard"); 
  const data = res.data.data || res.data; 
  return {
    bankBalance: data.bankBalance || 0,
    totalPayments: data.totalInvested || 0,
    totalSavings: data.savingsBalance || data.savings || 0,
    mfUnits: data.mutualFundUnits || data.mf || 0,
    goldGrams: data.goldGrams || data.gold || 0,
  };
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, refetchInterval: 10000 });
  const { data: rawTransactions } = useQuery({ queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }});
  
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);

  const topUpMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/topup", { amount: topUpAmount }),
    onSuccess: () => {
      toast.success(`₹${topUpAmount} added to your virtual wallet!`);
      setShowTopUpModal(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_balance'] });
    },
    onError: () => toast.error("Failed to top up wallet.")
  });

  const weeklyData = useMemo(() => {
    if (!rawTransactions) return [];
    const days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        dateString: d.toISOString().split('T')[0], 
        label: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        total: 0 
      };
    });

    rawTransactions.forEach((tx: any) => {
      if (tx.type === "ROUND_UP") {
        const txDate = tx.timestamp.split('T')[0];
        const dayMatch = days.find(d => d.dateString === txDate);
        if (dayMatch) dayMatch.total += tx.amount;
      }
    });

    return days;
  }, [rawTransactions]);

  const maxDailyValue = Math.max(...weeklyData.map(d => d.total), 50);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateY = useTransform(springX, [-0.5, 0, 0.5], ["-8deg", "0deg", "8deg"]);
  const rotateX = useTransform(springY, [-0.5, 0, 0.5], ["8deg", "0deg", "-8deg"]);

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
  const savPct = totalWealth > 0 ? (data.totalSavings / totalWealth) * 100 : 0;
  const mfPct = totalWealth > 0 ? (data.mfUnits / totalWealth) * 100 : 0;
  const goldPct = totalWealth > 0 ? (goldValue / totalWealth) * 100 : 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 relative mt-2">
        <AnimatePresence>
          {showTopUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTopUpModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-payae-card border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md z-10">
                <button onClick={() => setShowTopUpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Top Up Wallet</h3>
                <p className="text-gray-400 text-xs md:text-sm mb-6">Add virtual funds to continue simulating transactions.</p>
                <div className="mb-6">
                  <div className="flex justify-between text-xs md:text-sm text-gray-400 mb-2">
                    <span>Amount</span><span className="text-white font-bold">₹{topUpAmount}</span>
                  </div>
                  <input type="range" min="100" max="10000" step="100" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="w-full accent-payae-accent" />
                  <div className="flex justify-between text-[10px] md:text-xs text-gray-500 mt-2"><span>₹100</span><span>₹10,000</span></div>
                </div>
                <button onClick={() => topUpMutation.mutate()} disabled={topUpMutation.isPending} className="w-full bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center text-sm md:text-base">
                  {topUpMutation.isPending ? <Loader2 className="animate-spin" /> : `Add ₹${topUpAmount}`}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          <motion.div className="bg-gradient-to-br from-payae-card to-black border border-payae-orange/30 p-5 rounded-2xl shadow-[0_0_30px_rgba(245,130,32,0.1)] relative overflow-hidden group flex flex-col justify-center">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-payae-orange/10 rounded-full blur-2xl transition-all" />
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-widest">Virtual Balance</p>
                <h3 className="text-2xl font-black text-white"><AnimatedNumber value={data.bankBalance} /></h3>
              </div>
              <button onClick={() => setShowTopUpModal(true)} className="w-9 h-9 bg-payae-orange/20 text-payae-orange rounded-xl flex items-center justify-center hover:bg-payae-orange hover:text-black transition-colors shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
          <StatCard title="Total Payments" value={data.totalPayments} prefix="₹" />
          <StatCard title="Liquid Savings" value={data.totalSavings} prefix="₹" highlight />
          <StatCard title="Mutual Fund Units" value={data.mfUnits} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          
          <div style={{ perspective: "1000px" }} className="h-[320px]">
            <motion.div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="bg-gradient-to-br from-black/60 to-black/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl h-full flex flex-col justify-between relative cursor-crosshair overflow-hidden"
            >
              <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-payae-success/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div style={{ transform: "translateZ(30px)" }} className="flex flex-col h-full relative z-10">
                <div>
                  <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-payae-success" /> 7-Day Wealth Engine
                  </h2>
                  <p className="text-gray-400 text-xs mb-4">Live automated investment routing.</p>
                </div>

                <div className="flex items-end justify-between h-40 gap-3 mt-auto w-full px-2">
                  {weeklyData.map((day, idx) => {
                    const heightPct = Math.max((day.total / maxDailyValue) * 100, 8);
                    const isToday = idx === 6;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center w-full group relative">
                        
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/90 border border-white/10 text-white text-xs font-black py-1.5 px-2.5 rounded-lg -top-10 shadow-xl z-30 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                          ₹{day.total.toFixed(2)}
                        </div>

                        <div className="w-full max-w-[20px] md:max-w-[28px] h-32 bg-black/50 rounded-full border border-white/5 relative overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] mb-3 flex flex-col justify-end">
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: `${heightPct}%`, opacity: 1 }}
                             transition={{ duration: 1.5, delay: idx * 0.1, type: "spring", bounce: 0.4 }}
                             className={`w-full rounded-full relative ${isToday ? 'bg-gradient-to-t from-payae-success/30 to-payae-success shadow-[0_0_20px_rgba(0,255,148,0.8)]' : 'bg-gradient-to-t from-blue-500/20 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}
                           >
                             <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[80%] aspect-square bg-white rounded-full mix-blend-overlay shadow-[0_0_10px_white]" />
                           </motion.div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${isToday ? 'text-payae-success shadow-payae-success' : 'text-gray-500 group-hover:text-gray-300'}`}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-xl h-[320px] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-payae-accent animate-pulse" /> Portfolio Distribution
              </h2>
              <p className="text-gray-400 text-xs mb-4">Total Value: <span className="text-white font-bold">₹{totalWealth.toFixed(2)}</span></p>
              <div className="w-full h-3.5 bg-gray-800 rounded-full flex overflow-hidden shadow-inner border border-white/5 mb-5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${savPct}%` }} transition={{ duration: 1 }} className="h-full bg-[#00E5FF]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${mfPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#00FF94]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${goldPct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#f58220]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <Wallet className="text-[#00E5FF] w-5 h-5 mb-1.5" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Savings</p>
                  <p className="text-base font-black text-white">₹{data.totalSavings.toFixed(2)}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <TrendingUp className="text-[#00FF94] w-5 h-5 mb-1.5" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mutual Funds</p>
                  <p className="text-base font-black text-white">₹{data.mfUnits.toFixed(2)}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <Coins className="text-[#f58220] w-5 h-5 mb-1.5" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Digital Gold</p>
                  <p className="text-base font-black text-white">₹{goldValue.toFixed(2)}</p>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}