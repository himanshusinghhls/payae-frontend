import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { motion, Variants } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import PortfolioChart from "../components/charts/PortfolioChart";
import AllocationPreview from "../components/ui/AllocationPreview";
import ChartCard from "../components/charts/AllocationChart"; 


type DashboardData = {
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
    totalPayments: rawData.totalInvested || 0,
    totalSavings: rawData.savings || 0,
    mfUnits: rawData.mf || 0,
    goldGrams: rawData.gold || 0,
    roundup: 0 
  };
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-payae-card rounded-3xl border border-payae-border animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-payae-card rounded-3xl border border-payae-border animate-pulse" />
      </AppLayout>
    );
  }

  if (isError || !data) return <AppLayout><p className="text-red-400 p-8">Failed to load data. Please refresh.</p></AppLayout>;

  return (
    <AppLayout>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all">
            <StatCard title="Total Payments" value={data.totalPayments} prefix="₹" />
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
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-payae-accent/5 rounded-full blur-[80px] pointer-events-none" />
            <PortfolioChart />
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-3xl shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-payae-accent flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-payae-accent animate-pulse" />
              Asset Allocation
            </h2>
            <ChartCard portfolio={{ savingsBalance: data.totalSavings, mfUnits: data.mfUnits, goldGrams: data.goldGrams }} />
          </motion.div>
        </div>

        {/* Bottom Activity Row */}
        <motion.div variants={itemVariants} className="bg-payae-card backdrop-blur-xl border border-payae-border p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -left-20 top-0 w-40 h-full bg-payae-success/5 blur-[50px] pointer-events-none" />
          <h2 className="text-xl font-bold mb-2 text-white">Recent Round-Up Activity</h2>
          <p className="text-sm text-gray-400 mb-8">Automated wealth distribution across your portfolio channels.</p>
          <AllocationPreview roundup={data.roundup} />
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}