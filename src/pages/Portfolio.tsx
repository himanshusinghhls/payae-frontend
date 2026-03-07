import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Coins, Loader2, PieChart } from "lucide-react";

type PortfolioData = { savingsBalance: number; mutualFundUnits: number; goldGrams: number; };

const fetchPortfolio = async (): Promise<PortfolioData> => {
  const response = await api.get("/api/v1/portfolio");
  const data = response.data?.data || response.data;
  return {
    savingsBalance: data.savingsBalance || 0,
    mutualFundUnits: data.mutualFundUnits || data.mfUnits || data.mf || 0,
    goldGrams: data.goldGrams || data.gold || 0,
  };
};

export default function Portfolio() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['portfolio'], queryFn: fetchPortfolio });

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  if (isError || !data) return <AppLayout><p className="text-red-400 text-center mt-10">Failed to load Portfolio data.</p></AppLayout>;

  const goldValueInRupees = data.goldGrams * 7500;
  const totalWealth = data.savingsBalance + data.mutualFundUnits + goldValueInRupees;

  const savPct = totalWealth > 0 ? (data.savingsBalance / totalWealth) * 100 : 0;
  const mfPct = totalWealth > 0 ? (data.mutualFundUnits / totalWealth) * 100 : 0;
  const goldPct = totalWealth > 0 ? (goldValueInRupees / totalWealth) * 100 : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto mt-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-4 border-b border-white/10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Wealth Portfolio</h2>
            <p className="text-sm text-gray-400 mt-1">Deep dive into your exact asset distribution.</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center shadow-lg">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Liquid Value</p>
            <p className="text-2xl font-black text-payae-success">₹{totalWealth.toFixed(2)}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="text-payae-accent w-6 h-6" /> Distribution Bar
            </h3>
            
            <div className="w-full h-12 bg-gray-900 rounded-full flex overflow-hidden shadow-inner border border-white/5 mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${savPct}%` }} transition={{ duration: 1 }} className="h-full bg-[#00E5FF] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                 {savPct > 10 && <span className="text-black font-bold text-xs truncate px-2">Savings</span>}
              </motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${mfPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#00FF94] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                 {mfPct > 10 && <span className="text-black font-bold text-xs truncate px-2">Funds</span>}
              </motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${goldPct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#f58220] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                 {goldPct > 10 && <span className="text-white font-bold text-xs truncate px-2">Gold</span>}
              </motion.div>
            </div>
            
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest px-4">
               <span>0%</span>
               <span>100%</span>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-[#00E5FF]/10 to-black/40 border border-[#00E5FF]/30 p-6 rounded-3xl flex flex-col justify-between hover:border-[#00E5FF]/60 transition-colors shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#00E5FF]/20 p-3 rounded-xl"><Wallet className="text-[#00E5FF] w-6 h-6" /></div>
              <span className="text-[#00E5FF] font-bold text-xl">{savPct.toFixed(1)}%</span>
            </div>
            <div>
              <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Liquid Savings</h3>
              <p className="text-4xl font-black text-white">₹{data.savingsBalance.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-[#00FF94]/10 to-black/40 border border-[#00FF94]/30 p-6 rounded-3xl flex flex-col justify-between hover:border-[#00FF94]/60 transition-colors shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#00FF94]/20 p-3 rounded-xl"><TrendingUp className="text-[#00FF94] w-6 h-6" /></div>
              <span className="text-[#00FF94] font-bold text-xl">{mfPct.toFixed(1)}%</span>
            </div>
            <div>
              <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Mutual Funds</h3>
              <p className="text-4xl font-black text-white">₹{data.mutualFundUnits.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-[#f58220]/10 to-black/40 border border-[#f58220]/30 p-6 rounded-3xl flex flex-col justify-between hover:border-[#f58220]/60 transition-colors shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#f58220]/20 p-3 rounded-xl"><Coins className="text-[#f58220] w-6 h-6" /></div>
              <span className="text-[#f58220] font-bold text-xl">{goldPct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Digital Gold</h3>
                <p className="text-4xl font-black text-white">₹{goldValueInRupees.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-xs block mb-1">Holdings</span>
                <span className="text-white font-bold">{data.goldGrams.toFixed(4)}g</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}