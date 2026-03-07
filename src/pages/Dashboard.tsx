import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import PortfolioChart from "../components/charts/PortfolioChart";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import { Plus, Loader2, X, Wallet, TrendingUp, Coins } from "lucide-react";
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

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  if (isError || !data) return <AppLayout><p className="text-red-400 p-8">Failed to load data.</p></AppLayout>;

  const goldValue = data.goldGrams * 7500;
  const totalWealth = data.totalSavings + data.mfUnits + goldValue;
  const savPct = totalWealth > 0 ? (data.totalSavings / totalWealth) * 100 : 0;
  const mfPct = totalWealth > 0 ? (data.mfUnits / totalWealth) * 100 : 0;
  const goldPct = totalWealth > 0 ? (goldValue / totalWealth) * 100 : 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        <AnimatePresence>
          {showTopUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTopUpModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-payae-card border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md z-10">
                <button onClick={() => setShowTopUpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-2xl font-bold text-white mb-2">Top Up Wallet</h3>
                <p className="text-gray-400 text-sm mb-6">Add virtual funds to continue simulating transactions.</p>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Amount</span>
                    <span className="text-white font-bold">₹{topUpAmount}</span>
                  </div>
                  <input type="range" min="100" max="10000" step="100" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="w-full accent-payae-accent" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2"><span>₹100</span><span>₹10,000</span></div>
                </div>

                <button onClick={() => topUpMutation.mutate()} disabled={topUpMutation.isPending} className="w-full bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center">
                  {topUpMutation.isPending ? <Loader2 className="animate-spin" /> : `Add ₹${topUpAmount}`}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <motion.div className="bg-gradient-to-br from-payae-card to-black border border-payae-orange/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(245,130,32,0.1)] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-payae-orange/10 rounded-full blur-2xl transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm text-gray-400 font-semibold mb-1">Virtual Bank Balance</p>
                <h3 className="text-3xl font-black text-white"><AnimatedNumber value={data.bankBalance} /></h3>
              </div>
              <button onClick={() => setShowTopUpModal(true)} className="w-10 h-10 bg-payae-orange/20 text-payae-orange rounded-xl flex items-center justify-center hover:bg-payae-orange hover:text-black transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
          <StatCard title="Total Payments" value={data.totalPayments} prefix="₹" />
          <StatCard title="Liquid Savings" value={data.totalSavings} prefix="₹" highlight />
          <StatCard title="Mutual Fund Units" value={data.mfUnits} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden h-[400px] flex flex-col">
            <PortfolioChart />
          </motion.div>
          
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-payae-accent animate-pulse" /> Portfolio Distribution
              </h2>
              <p className="text-gray-400 text-sm mb-6">Total Value: <span className="text-white font-bold">₹{totalWealth.toFixed(2)}</span></p>
              <div className="w-full h-6 bg-gray-800 rounded-full flex overflow-hidden shadow-inner border border-white/5 mb-8">
                <motion.div initial={{ width: 0 }} animate={{ width: `${savPct}%` }} transition={{ duration: 1 }} className="h-full bg-[#00E5FF]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${mfPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#00FF94]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${goldPct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#f58220]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Wallet className="text-[#00E5FF] w-6 h-6 mb-2" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Savings</p>
                  <p className="text-lg font-black text-white">₹{data.totalSavings.toFixed(2)}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <TrendingUp className="text-[#00FF94] w-6 h-6 mb-2" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mutal Funds</p>
                  <p className="text-lg font-black text-white">₹{data.mfUnits.toFixed(2)}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Coins className="text-[#f58220] w-6 h-6 mb-2" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Digital Gold</p>
                  <p className="text-lg font-black text-white">₹{goldValue.toFixed(2)}</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}