import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Receipt, Loader2 } from "lucide-react";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  assetType?: string;
  timestamp: string;
};

const fetchLedger = async (): Promise<Transaction[]> => {
  const { data } = await api.get("/api/ledger"); 
  return data.data || data;
};

export default function Ledger() {
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['ledger'],
    queryFn: fetchLedger,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto mt-6">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-payae-border">
          <div>
            <h2 className="text-3xl font-bold text-white">Transaction History</h2>
            <p className="text-sm text-gray-400 mt-1">Track your payments and automated wealth allocations.</p>
          </div>
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border">
            <Receipt className="text-payae-accent w-6 h-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-payae-card rounded-2xl border border-payae-border" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center p-10 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            Failed to load transactions. Please try again.
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center p-16 bg-payae-card border border-payae-border rounded-3xl">
            <Receipt className="mx-auto text-gray-600 w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No transactions yet</h3>
            <p className="text-gray-400">Make your first payment to see your auto-savings here!</p>
          </div>
        ) : (
          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="space-y-4"
          >
            {transactions.map((t, i) => {
              const isExpense = t.type.includes("PAYMENT");
              const Icon = isExpense ? ArrowUpRight : ArrowDownLeft;
              
              return (
                <motion.div 
                  key={t.id || i} 
                  variants={item}
                  className="bg-payae-card backdrop-blur-xl border border-payae-border p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isExpense ? 'bg-red-500/10 text-red-400' : 'bg-payae-success/10 text-payae-success'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {isExpense ? 'UPI Payment' : 'Auto Round-Up'}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span>{new Date(t.timestamp).toLocaleDateString()}</span>
                        {t.assetType && (
                          <>
                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                            <span className="text-payae-accent uppercase text-xs font-bold tracking-wider">{t.assetType}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={`text-xl font-bold ${isExpense ? 'text-white' : 'text-payae-success'}`}>
                    {isExpense ? '-' : '+'}₹{t.amount.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}