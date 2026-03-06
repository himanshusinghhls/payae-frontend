import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Receipt, ChevronDown } from "lucide-react";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  assetType?: string;
  timestamp: string;
};

const fetchLedger = async (): Promise<Transaction[]> => {
  const response = await api.get("/api/transactions"); 
  return Array.isArray(response.data) ? response.data : response.data?.data || [];
};

export default function Ledger() {
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['ledger'],
    queryFn: fetchLedger,
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-payae-border">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Transaction History</h2>
            <p className="text-sm text-gray-400 mt-1">Click a transaction to view distribution details.</p>
          </div>
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border hidden md:block">
            <Receipt className="text-payae-accent w-6 h-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-payae-card rounded-xl border border-payae-border" />)}
          </div>
        ) : isError ? (
          <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            Failed to load transactions.
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center p-16 bg-payae-card border border-payae-border rounded-2xl">
            <Receipt className="mx-auto text-gray-600 w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No transactions yet</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sort newest first */}
            {[...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((t, i) => {
              const typeStr = t.type || ""; 
              const isExpense = typeStr.includes("PAYMENT");
              const Icon = isExpense ? ArrowUpRight : ArrowDownLeft;
              const isExpanded = expandedId === (t.id || i);
              
              return (
                <motion.div key={t.id || i} className="bg-payae-card border border-payae-border rounded-xl overflow-hidden transition-colors hover:border-gray-600 cursor-pointer" onClick={() => toggleExpand(t.id || i)}>
                  
                  {/* Compact Header Row */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isExpense ? 'bg-gray-800 text-gray-300' : 'bg-payae-success/10 text-payae-success'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-md">
                          {isExpense ? 'UPI Payment Sent' : 'Auto-Invested Round-Up'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold ${isExpense ? 'text-white' : 'text-payae-success'}`}>
                        {isExpense ? '-' : '+'}₹{(t.amount || 0).toFixed(2)}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/40 border-t border-payae-border p-4 px-16">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 block mb-1">Transaction ID</span>
                            <span className="text-gray-300 font-mono text-xs">TXN-{t.id || 'PENDING'}</span>
                          </div>
                          {t.assetType && !isExpense && (
                            <div>
                              <span className="text-gray-500 block mb-1">Asset Allocation</span>
                              <span className="text-payae-accent font-bold uppercase">{t.assetType}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 block mb-1">Exact Time</span>
                            <span className="text-gray-300">{new Date(t.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}