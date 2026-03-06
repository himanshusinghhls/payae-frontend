import { useQuery } from "@tanstack/react-query"
import api from "../api/client"
import { motion } from "framer-motion"
import AppLayout from "../components/layout/AppLayout"
import StatCard from "../components/ui/StatCard"
import PortfolioChart from "../components/charts/PortfolioChart"
import AllocationPreview from "../components/ui/AllocationPreview"
import ChartCard from "../components/ui/ChartCard"

type DashboardData = {
  totalPayments: number;
  totalSavings: number;
  mfUnits: number;
  goldGrams: number;
  roundup: number;
}

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/api/dashboard");
  const rawData = response.data; 

  return {
    totalPayments: rawData.totalInvested || 0,
    totalSavings: rawData.savings || 0,
    mfUnits: rawData.mf || 0,
    goldGrams: rawData.gold || 0,
    roundup: 0 
  };
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 10000
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-payae-card rounded-2xl border border-payae-border backdrop-blur-md" />
          ))}
        </div>
      </AppLayout>
    )
  }

  if (isError || !data) return <AppLayout><p className="text-red-400 p-8">Failed to load data. Please refresh.</p></AppLayout>

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Payments" value={data.totalPayments} prefix="₹" />
        <StatCard title="Total Savings" value={data.totalSavings} prefix="₹" highlight />
        <StatCard title="MF Units" value={data.mfUnits} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-2xl">
          <PortfolioChart />
        </div>
        <div className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-2xl">
           <h2 className="text-lg font-semibold mb-4 text-payae-accent">Asset Allocation</h2>
           <ChartCard portfolio={{ savingsBalance: data.totalSavings, mfUnits: data.mfUnits, goldGrams: data.goldGrams }} />
        </div>
      </div>

      <div className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-white">Recent Round-Up Activity</h2>
        <p className="text-sm text-gray-400 mb-6">Automated wealth distribution from your last payment.</p>
        <AllocationPreview roundup={data.roundup} />
      </div>
    </AppLayout>
  )
}
