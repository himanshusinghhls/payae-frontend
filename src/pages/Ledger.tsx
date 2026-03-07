import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, Store, Wallet, PieChart, XCircle } from "lucide-react";

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

  let availableInvestments = transactions.filter((t: any) => t.type === "INVESTMENT");

  const smartLedger = basePayments.map((payment: any) => {
    const isFailed = payment.type === "PAYMENT_FAILED" || payment.status === "FAILED";

    if (isFailed) {
      return { ...payment, isFailed, linkedRoundups: [], totalRoundupAmount: 0, totalCharge: payment.amount };
    }

    const pTime = new Date(payment.timestamp).getTime();
    
    const linkedRoundups = availableInvestments.filter((r: any) => {
      const rTime = new Date(r.timestamp).getTime();
      return rTime >= pTime && rTime <= pTime + 10000;
    });

    availableInvestments = availableInvestments.filter((r: any) => !linkedRoundups.includes(r));
    const totalRoundupAmount = linkedRoundups.reduce((sum: number, r: any) => sum + r.amount, 0);

    return { 
      ...payment, 
      isFailed: false,
      linkedRoundups, 
      totalRoundupAmount, 
      totalCharge: payment.amount + totalRoundupAmount 
    };
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Smart Ledger</h2>
            <p className="text-sm text-gray-400 mt-1">Your exact micro-investment distribution.</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 hidden md:block backdrop-blur-md">
            <Receipt className="text-white w-6 h-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/10" />)}
          </div>
        ) : isError || smartLedger.length === 0 ? (
          <div className="text-center p-16 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <Receipt className="mx-auto text-gray-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No transactions yet</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {smartLedger.map((payment: any) => {
              const isBaseExpanded = expandedBaseId === payment.id;
              const isWalletExpanded = expandedWalletId === payment.id;

              return (
                <motion.div key={payment.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                  
                  <div className={`p-5 flex items-center justify-between transition-colors ${!payment.isFailed ? 'cursor-pointer hover:bg-white/5' : ''}`} onClick={() => !payment.isFailed && setExpandedBaseId(isBaseExpanded ? null : payment.id)}>
                    <div className="flex items-center gap-4">
                      {payment.isFailed ? (
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><XCircle className="w-5 h-5" /></div>
                      ) : (
                        <div className="p-3 bg-white/10 rounded-xl text-white"><Store className="w-5 h-5" /></div>
                      )}
                      <div>
                        <p className={`font-bold text-lg ${payment.isFailed ? 'text-red-400' : 'text-white'}`}>
                          {payment.isFailed ? 'Failed Transaction' : 'UPI Payment'}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(payment.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-black ${payment.isFailed ? 'text-red-400 line-through opacity-70' : 'text-white'}`}>
                        -₹{payment.totalCharge.toFixed(2)}
                      </div>
                      {!payment.isFailed && <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isBaseExpanded ? 'rotate-180' : ''}`} />}
                    </div>
                  </div>

                  {!payment.isFailed && (
                    <AnimatePresence>
                      {isBaseExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-black/20 border-t border-white/5 overflow-hidden">
                          <div className="p-4 pl-16 flex justify-between items-center border-b border-white/5">
                            <span className="text-gray-400 font-medium text-sm">Sent to Receiver</span>
                            <span className="text-white font-bold">-₹{payment.amount.toFixed(2)}</span>
                          </div>

                          <div className="p-4 pl-16 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => setExpandedWalletId(isWalletExpanded ? null : payment.id)}>
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-payae-accent" />
                              <span className="text-payae-accent font-bold text-sm">PayAE Auto-Invest</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-payae-success font-black">+₹{payment.totalRoundupAmount.toFixed(2)}</span>
                              <ChevronDown className={`w-4 h-4 text-payae-accent transition-transform ${isWalletExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isWalletExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/40 p-4 pl-24 flex flex-col gap-3">
                                {payment.linkedRoundups.length > 0 ? payment.linkedRoundups.map((r: any) => (
                                  <div key={r.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                      <PieChart className="w-3 h-3"/> {r.assetType || 'Liquid Savings'}
                                    </span>
                                    <span className="text-white font-bold">₹{r.amount.toFixed(2)}</span>
                                  </div>
                                )) : (
                                  <span className="text-gray-500 text-xs italic">No investments for this transaction.</span>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}