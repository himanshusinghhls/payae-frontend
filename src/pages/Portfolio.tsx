import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion } from "framer-motion";
import { PieChart, Wallet, TrendingUp, Coins, Loader2 } from "lucide-react";
import ChartCard from "../components/charts/AllocationChart";

type PortfolioData = {
  savingsBalance: number;
  mutualFundUnits: number;
  goldGrams: number;
  totalInvested: number;
};

const fetchPortfolio = async (): Promise<PortfolioData> => {
  const response = await api.get("/api/v1/portfolio");
  const data = response.data?.data || response.data;
  return {
    savingsBalance: data.savingsBalance || 0,
    mutualFundUnits: data.mutualFundUnits || 0,
    goldGrams: data.goldGrams || 0,
    totalInvested: data.totalInvested || 0,
  };
};

export default function Portfolio() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  if (isError || !data) return <AppLayout><p className="text-red-400 text-center mt-10">Failed to load Portfolio data.</p></AppLayout>;

  const totalWealth = data.savingsBalance + data.mutualFundUnits + data.goldGrams;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto mt-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-4 border-b border-payae-border gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Wealth Portfolio</h2>
            <p className="text-sm text-gray-400 mt-1">Your automated micro-investments overview.</p>
          </div>
          <div className="bg-payae-card px-6 py-3 rounded-2xl border border-payae-border text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Assets</p>
            <p className="text-2xl font-black text-payae-success">₹{totalWealth.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-1 bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
              <PieChart className="w-5 h-5 text-payae-accent" /> Asset Split
            </h3>
            <div className="flex-1 relative">
              <ChartCard portfolio={{ savingsBalance: data.savingsBalance, mfUnits: data.mutualFundUnits, goldGrams: data.goldGrams }} />
            </div>
          </motion.div>

          {/* Distribution Overview Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-900/40 to-payae-card border border-blue-500/30 p-6 rounded-3xl flex flex-col justify-between hover:border-blue-500/60 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-xl"><Wallet className="text-blue-400 w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-white">Liquid Savings</h3>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">₹{data.savingsBalance.toFixed(2)}</p>
                <p className="text-sm text-blue-400 font-semibold">{totalWealth > 0 ? ((data.savingsBalance / totalWealth) * 100).toFixed(1) : 0}% of Portfolio</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-900/40 to-payae-card border border-green-500/30 p-6 rounded-3xl flex flex-col justify-between hover:border-green-500/60 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-500/20 p-3 rounded-xl"><TrendingUp className="text-payae-success w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-white">Mutual Funds</h3>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">₹{data.mutualFundUnits.toFixed(2)}</p>
                <p className="text-sm text-payae-success font-semibold">{totalWealth > 0 ? ((data.mutualFundUnits / totalWealth) * 100).toFixed(1) : 0}% of Portfolio</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-orange-900/40 to-payae-card border border-orange-500/30 p-6 rounded-3xl flex flex-col justify-between hover:border-orange-500/60 transition-colors sm:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-500/20 p-3 rounded-xl"><Coins className="text-payae-orange w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-white">Digital Gold</h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-white mb-1">₹{data.goldGrams.toFixed(2)}</p>
                  <p className="text-sm text-payae-orange font-semibold">{totalWealth > 0 ? ((data.goldGrams / totalWealth) * 100).toFixed(1) : 0}% of Portfolio</p>
                </div>
                <div className="text-left sm:text-right bg-black/30 p-3 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Equivalent Gold</p>
                  <p className="text-lg font-bold text-gray-200">{(data.goldGrams / 7500).toFixed(4)} Grams</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}