import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { motion } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import PortfolioChart from "../components/charts/PortfolioChart";
import AllocationPreview from "../components/ui/AllocationPreview";
import ChartCard from "../components/charts/AllocationChart"; 

type DashboardData = {
  bankBalance: number;
  totalPayments: number;
  totalSavings: number;
  mfUnits: number;
  goldGrams: number;
  roundup: number;
};

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/api/dashboard"); 
  const rawData = response.data.data || response.data; 
  
  return {
    bankBalance: rawData.bankBalance || 0,
    totalPayments: rawData.totalInvested || 0,
    totalSavings: rawData.savingsBalance || rawData.savings || 0,
    mfUnits: rawData.mutualFundUnits || rawData.mf || 0,
    goldGrams: rawData.goldGrams || rawData.gold || 0,
    roundup: 0 
  };
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-payae-card rounded-3xl border border-payae-border animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  if (isError || !data) return <AppLayout><p className="text-red-400 p-8">Failed to load data.</p></AppLayout>;

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Stats Row - Now 4 Columns to fit the Bank Balance! */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Virtual Bank Account Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all shadow-[0_0_30px_rgba(245,130,32,0.1)] rounded-3xl">
            <StatCard title="Virtual Bank Balance" value={data.bankBalance} prefix="₹" />
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
            <StatCard title="Total Payments Made" value={data.totalPayments} prefix="₹" />
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all shadow-[0_0_30px_rgba(0,229,255,0.1)] rounded-3xl">
            <StatCard title="Liquid Savings" value={data.totalSavings} prefix="₹" highlight />
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
            <StatCard title="Mutual Fund Units" value={data.mfUnits} />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FIX: Added strict height h-[400px] and flex-col to contain the chart! */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-3xl shadow-2xl relative overflow-hidden h-[400px] flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-payae-accent/5 rounded-full blur-[80px] pointer-events-none" />
            <PortfolioChart />
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-payae-accent flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-payae-accent animate-pulse" />
              Asset Allocation
            </h2>
            <div className="flex-1 relative">
              <ChartCard portfolio={{ savingsBalance: data.totalSavings, mfUnits: data.mfUnits, goldGrams: data.goldGrams }} />
            </div>
          </motion.div>
        </div>

      </motion.div>
    </AppLayout>
  );
}