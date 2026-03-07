import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, Store, Wallet, PieChart } from "lucide-react";

export default function Ledger() {
  const { data: rawTransactions, isLoading, isError } = useQuery({
    queryKey: ['ledger'],
    queryFn: async () => {
      const res = await api.get("/api/transactions");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    }
  });

  const [expandedBaseId, setExpandedBaseId] = useState<number | null>(null);
  const [expandedWalletId, setExpandedWalletId] = useState<number | null>(null);

  const transactions = rawTransactions || [];
  
  const basePayments = transactions
    .filter((t: any) => t.type?.includes("PAYMENT"))
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let availableRoundups = transactions.filter((t: any) => !t.type?.includes("PAYMENT"));

  const smartLedger = basePayments.map((payment: any) => {
    const pTime = new Date(payment.timestamp).getTime();
    
    const linkedRoundups = availableRoundups.filter((r: any) => {
      const rTime = new Date(r.timestamp).getTime();
      return rTime >= pTime && rTime <= pTime + 10000;
    });

    availableRoundups = availableRoundups.filter((r: any) => !linkedRoundups.includes(r));
    
    const totalRoundupAmount = linkedRoundups.reduce((sum: number, r: any) => sum + r.amount, 0);

    return { 
      ...payment, 
      linkedRoundups, 
      totalRoundupAmount, 
      totalCharge: payment.amount + totalRoundupAmount 
    };
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-payae-border">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Smart Ledger</h2>
            <p className="text-sm text-gray-400 mt-1">Drill down into your automated wealth distribution.</p>
          </div>
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border hidden md:block">
            <Receipt className="text-payae-accent w-6 h-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-payae-card rounded-xl border border-payae-border" />)}
          </div>
        ) : isError || smartLedger.length === 0 ? (
          <div className="text-center p-16 bg-payae-card border border-payae-border rounded-2xl">
            <Receipt className="mx-auto text-gray-600 w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No transactions yet</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {smartLedger.map((payment: any) => {
              const isBaseExpanded = expandedBaseId === payment.id;
              const isWalletExpanded = expandedWalletId === payment.id;

              return (
                <motion.div key={payment.id} className="bg-payae-card border border-payae-border rounded-xl overflow-hidden shadow-lg">
                  
                  {/* TIER 1: Total Deducted */}
                  <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedBaseId(isBaseExpanded ? null : payment.id)}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg text-white"><Store className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-white text-lg">UPI Payment</p>
                        <p className="text-xs text-gray-400">{new Date(payment.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-black text-white">-₹{payment.totalCharge.toFixed(2)}</div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isBaseExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* TIER 2: Split */}
                  <AnimatePresence>
                    {isBaseExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-black/40 border-t border-payae-border overflow-hidden">
                        <div className="p-4 pl-16 flex justify-between items-center border-b border-white/5">
                          <span className="text-gray-300 font-medium text-sm">Sent to Receiver</span>
                          <span className="text-gray-300 font-bold">-₹{payment.amount.toFixed(2)}</span>
                        </div>

                        <div className="p-4 pl-16 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => setExpandedWalletId(isWalletExpanded ? null : payment.id)}>
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-payae-accent" />
                            <span className="text-payae-accent font-bold text-sm">Routed to PayAE Wallet</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-payae-success font-black">+₹{payment.totalRoundupAmount.toFixed(2)}</span>
                            <ChevronDown className={`w-4 h-4 text-payae-accent transition-transform ${isWalletExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* TIER 3: Assets */}
                        <AnimatePresence>
                          {isWalletExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/60 p-4 pl-24 flex flex-col gap-2">
                              {payment.linkedRoundups.length > 0 ? payment.linkedRoundups.map((r: any) => (
                                <div key={r.id} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <PieChart className="w-3 h-3"/> {r.assetType || 'Liquid Savings'}
                                  </span>
                                  <span className="text-white font-bold">₹{r.amount.toFixed(2)}</span>
                                </div>
                              )) : (
                                <span className="text-gray-500 text-xs italic">No round-up for this transaction.</span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

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