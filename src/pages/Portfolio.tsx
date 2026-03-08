import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, Coins, Loader2, PieChart, ArrowDownToLine, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Portfolio() {
  const queryClient = useQueryClient();
  const { data: rawTransactions, isLoading, isError } = useQuery({ queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }});
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(100);

  const { calcSavings, calcMf, calcGold } = useMemo(() => {
    let s = 0, m = 0, g = 0;
    (rawTransactions || []).forEach((tx: any) => {
      if (tx.type === "INVESTMENT" || tx.type === "ROUND_UP") {
        const asset = (tx.assetType || "SAVINGS").toUpperCase();
        if (asset.includes("MF") || asset.includes("MUTUAL")) m += tx.amount;
        else if (asset.includes("GOLD")) g += tx.amount;
        else s += tx.amount;
      }
    });
    return { calcSavings: s, calcMf: m, calcGold: g };
  }, [rawTransactions]);

  const totalWealth = calcSavings + calcMf + calcGold;
  const safeGoldGrams = calcGold > 0 ? calcGold / 7500 : 0;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/users/topup", { amount: withdrawAmount });
    },
    onSuccess: () => {
      toast.success(`Successfully liquidated ₹${withdrawAmount}`);
      setShowWithdraw(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    }
  });

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  if (isError) return <AppLayout><p className="text-red-400 text-center mt-10">Failed to load Portfolio data.</p></AppLayout>;

  const savPct = totalWealth > 0 ? (calcSavings / totalWealth) * 100 : 0;
  const mfPct = totalWealth > 0 ? (calcMf / totalWealth) * 100 : 0;
  const goldPct = totalWealth > 0 ? (calcGold / totalWealth) * 100 : 0;

  return (
    <AppLayout>
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdraw(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-payae-card border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 text-center">
              <button onClick={() => setShowWithdraw(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><ArrowDownToLine className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Liquidate Assets</h3>
              <p className="text-gray-400 text-sm mb-6">Withdraw portfolio funds back to your Virtual Balance instantly.</p>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2"><span>Amount</span><span className="text-white font-bold">₹{withdrawAmount}</span></div>
                <input type="range" min="100" max={Math.max(totalWealth, 100)} step="10" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} className="w-full accent-red-500" />
                <div className="text-right text-[10px] text-gray-500 mt-1">Max: ₹{totalWealth.toFixed(0)}</div>
              </div>

              <button onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending || totalWealth < withdrawAmount} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex justify-center items-center">
                {withdrawMutation.isPending ? <Loader2 className="animate-spin" /> : `Withdraw ₹${withdrawAmount}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Wealth Portfolio</h2>
            <p className="text-sm text-gray-400 mt-1">Deep dive into your exact asset distribution.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setShowWithdraw(true)} className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4"/> Liquidate
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 text-center shadow-lg">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Total Value</p>
              <p className="text-xl font-black text-payae-success">₹{totalWealth.toFixed(2)}</p>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl mb-8">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><PieChart className="text-payae-accent w-5 h-5" /> Distribution Breakdown</h3>
            <div className="w-full h-8 bg-gray-900 rounded-full flex overflow-hidden shadow-inner border border-white/5 mb-3 relative">
              <motion.div initial={{ width: 0 }} animate={{ width: `${savPct}%` }} transition={{ duration: 1 }} className="h-full bg-[#00E5FF] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{savPct > 10 && <span className="text-black font-bold text-[10px] px-2">Savings</span>}</motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${mfPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#00FF94] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{mfPct > 10 && <span className="text-black font-bold text-[10px] px-2">Funds</span>}</motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${goldPct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#f58220] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{goldPct > 10 && <span className="text-white font-bold text-[10px] px-2">Gold</span>}</motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2"><span>0%</span><span>100%</span></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-[#00E5FF]/10 to-black/40 border border-[#00E5FF]/30 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between mb-6"><div className="bg-[#00E5FF]/20 p-2.5 rounded-lg"><Wallet className="text-[#00E5FF] w-5 h-5" /></div><span className="text-[#00E5FF] font-bold text-[10px] uppercase tracking-widest">Invested</span></div>
            <div><h3 className="text-gray-400 font-bold uppercase tracking-wider text-[11px] mb-1">Liquid Savings</h3><p className="text-3xl font-black text-white">₹{calcSavings.toFixed(2)}</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-[#00FF94]/10 to-black/40 border border-[#00FF94]/30 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between mb-6"><div className="bg-[#00FF94]/20 p-2.5 rounded-lg"><TrendingUp className="text-[#00FF94] w-5 h-5" /></div><span className="text-[#00FF94] font-bold text-[10px] uppercase tracking-widest">Invested</span></div>
            <div><h3 className="text-gray-400 font-bold uppercase tracking-wider text-[11px] mb-1">Mutual Funds</h3><p className="text-3xl font-black text-white">₹{calcMf.toFixed(2)}</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-[#f58220]/10 to-black/40 border border-[#f58220]/30 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between mb-6"><div className="bg-[#f58220]/20 p-2.5 rounded-lg"><Coins className="text-[#f58220] w-5 h-5" /></div><span className="text-[#f58220] font-bold text-[10px] uppercase tracking-widest">Invested</span></div>
            <div className="flex justify-between items-end">
              <div><h3 className="text-gray-400 font-bold uppercase tracking-wider text-[11px] mb-1">Digital Gold</h3><p className="text-3xl font-black text-white">₹{calcGold.toFixed(2)}</p></div>
              <div className="text-right"><span className="text-gray-500 text-[10px] block mb-0.5 uppercase tracking-wider">Holdings</span><span className="text-white font-bold text-sm">{safeGoldGrams.toFixed(4)}g</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}