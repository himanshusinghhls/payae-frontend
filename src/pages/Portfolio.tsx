import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import AllocationChart from "../components/charts/AllocationChart";
import { motion } from "framer-motion";
import { PiggyBank, TrendingUp, Coins, Loader2, Briefcase } from "lucide-react";

type PortfolioData = {
  savingsBalance: number;
  mfUnits: number;
  goldGrams: number;
};

const fetchPortfolio = async (): Promise<PortfolioData> => {
  const { data } = await api.get("/api/v1/portfolio");
  return data; 
};

export default function Portfolio() {
  const { data: portfolio, isLoading, isError } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-payae-accent w-12 h-12" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !portfolio) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-red-400">Failed to load portfolio data.</div>
      </AppLayout>
    );
  }

  const assetCards = [
    {
      title: "Cash Vault",
      value: `₹${portfolio.savingsBalance.toFixed(2)}`,
      subtitle: "Liquid Savings",
      icon: PiggyBank,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30"
    },
    {
      title: "Mutual Funds",
      value: `${portfolio.mfUnits.toFixed(4)}`,
      subtitle: "Accumulated Units",
      icon: TrendingUp,
      color: "from-payae-success/20 to-payae-success/5",
      iconColor: "text-payae-success",
      borderColor: "border-payae-success/30"
    },
    {
      title: "Digital Gold",
      value: `${portfolio.goldGrams.toFixed(4)}g`,
      subtitle: "24K Equivalent",
      icon: Coins,
      color: "from-payae-orange/20 to-payae-orange/5",
      iconColor: "text-payae-orange",
      borderColor: "border-payae-orange/30"
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto mt-6">
        
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-payae-border">
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border">
            <Briefcase className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Your Wealth Portfolio</h2>
            <p className="text-sm text-gray-400 mt-1">Your micro-savings, automatically diversified.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Asset Breakdown Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {assetCards.map((asset, index) => (
              <motion.div
                key={asset.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${asset.color} border ${asset.borderColor} p-6 rounded-3xl backdrop-blur-xl flex items-center justify-between shadow-lg`}
              >
                <div>
                  <p className="text-gray-400 font-medium mb-1">{asset.title}</p>
                  <h3 className="text-3xl font-bold text-white mb-1">{asset.value}</h3>
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-70 {asset.iconColor}">
                    {asset.subtitle}
                  </p>
                </div>
                <div className={`p-4 rounded-full bg-black/20 ${asset.iconColor}`}>
                  <asset.icon className="w-8 h-8" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Allocation Chart Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 bg-payae-card border border-payae-border p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Distribution Overview
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              {/* Ensure your AllocationChart component has transparent backgrounds and white text configurations! */}
              <AllocationChart portfolio={portfolio} />
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}