import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Coins, Loader2, ArrowDownToLine, X, Building } from "lucide-react";
import toast from "react-hot-toast";
import AnimatedNumber from "../components/ui/AnimatedNumber";

type AssetType = "SAVINGS" | "MF" | "GOLD";

export default function Portfolio() {
  const queryClient = useQueryClient();
  const { data: rawTransactions, isLoading, isError } = useQuery({ queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }});

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetType>("SAVINGS");

  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");

  const { calcSavings, calcMf, calcGold } = useMemo(() => {
    let s = 0, m = 0, g = 0;
    (rawTransactions || []).forEach((tx: any) => {
      const asset = (tx.assetType || "SAVINGS").toUpperCase();
      
      if (tx.type === "INVESTMENT" || tx.type === "ROUND_UP") {
        if (asset.includes("MF") || asset.includes("MUTUAL")) m += tx.amount;
        else if (asset.includes("GOLD")) g += tx.amount;
        else s += tx.amount;
      } 
      else if (tx.type === "LIQUIDATION" || tx.type === "WITHDRAW_ASSET") {
        if (asset.includes("MF") || asset.includes("MUTUAL")) m -= tx.amount;
        else if (asset.includes("GOLD")) g -= tx.amount;
        else s -= tx.amount;
      }
    });
    
    return { calcSavings: Math.max(0, s), calcMf: Math.max(0, m), calcGold: Math.max(0, g) };
  }, [rawTransactions]);

  const totalWealth = calcSavings + calcMf + calcGold;
  const safeGoldGrams = calcGold > 0 ? calcGold / 7500 : 0;
  const maxAmount = selectedAsset === "SAVINGS" ? calcSavings : selectedAsset === "MF" ? calcMf : calcGold;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/users/topup", { amount: Number(withdrawAmount), assetType: selectedAsset });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Successfully liquidated ₹${Number(withdrawAmount).toFixed(2)} from ${selectedAsset}!`);
      setShowWithdraw(false);
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_balance'] }); 
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to liquidate asset. Check backend connection.";
      toast.error(msg);
    }
  });

  const handleTabSwitch = (asset: AssetType) => {
    setSelectedAsset(asset);
    setWithdrawAmount("");
  };

  const handleQuickSelect = (percentage: number) => {
    if (maxAmount > 0) {
      setWithdrawAmount(Math.floor((maxAmount * percentage) * 100) / 100);
    }
  };

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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-payae-card border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-w-md z-10 text-center backdrop-blur-2xl">
              <button onClick={() => setShowWithdraw(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 rounded-full p-2 transition-colors"><X size={20}/></button>
              
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><ArrowDownToLine className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Liquidate Asset</h3>
              <p className="text-gray-400 text-sm mb-6">Withdraw funds back to your Virtual Balance instantly.</p>
              
              <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/10 mb-6 relative">
                <button onClick={() => handleTabSwitch("SAVINGS")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${selectedAsset === "SAVINGS" ? 'text-black' : 'text-gray-400 hover:text-white'}`}>Savings</button>
                <button onClick={() => handleTabSwitch("MF")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${selectedAsset === "MF" ? 'text-black' : 'text-gray-400 hover:text-white'}`}>Funds</button>
                <button onClick={() => handleTabSwitch("GOLD")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${selectedAsset === "GOLD" ? 'text-black' : 'text-gray-400 hover:text-white'}`}>Gold</button>
                <div className="absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] transition-transform duration-300 ease-out z-0 pointer-events-none"
                     style={{ transform: `translateX(${selectedAsset === 'SAVINGS' ? '0%' : selectedAsset === 'MF' ? '100%' : '200%'})` }}>
                  <div className={`w-full h-full rounded-lg ${selectedAsset === 'SAVINGS' ? 'bg-[#00E5FF]' : selectedAsset === 'MF' ? 'bg-[#00FF94]' : 'bg-[#f58220]'}`} />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest px-1">
                    <span>Amount to Liquidate</span>
                    <span>Max: ₹{maxAmount.toFixed(2)}</span>
                </div>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">₹</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-black focus:border-red-500 outline-none transition-colors" 
                  />
                </div>
                
                {maxAmount > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleQuickSelect(0.25)} className="py-2 text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">25%</button>
                        <button onClick={() => handleQuickSelect(0.50)} className="py-2 text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">50%</button>
                        <button onClick={() => handleQuickSelect(1.00)} className="py-2 text-xs font-bold text-payae-accent bg-payae-accent/10 hover:bg-payae-accent/20 rounded-lg transition-colors border border-payae-accent/20">MAX</button>
                    </div>
                )}
              </div>

              <button 
                 onClick={() => withdrawMutation.mutate()} 
                 disabled={withdrawMutation.isPending || maxAmount <= 0 || Number(withdrawAmount) > maxAmount || Number(withdrawAmount) <= 0} 
                 className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                {withdrawMutation.isPending ? <Loader2 className="animate-spin" /> : `Liquidate ₹${Number(withdrawAmount || 0).toFixed(2)}`}
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
            <button onClick={() => setShowWithdraw(true)} className="px-5 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4"/> Liquidate Asset
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-xl border border-white/10 text-center shadow-lg">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Total Value</p>
              <p className="text-xl font-black text-payae-success flex items-center justify-center">
                 <span className="mr-0.5">₹</span><AnimatedNumber value={totalWealth} />
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Allocation Breakdown</h3>
            <div className="w-full h-6 bg-gray-900 rounded-full flex overflow-hidden shadow-inner border border-white/5 mb-3 relative">
              <motion.div initial={{ width: 0 }} animate={{ width: `${savPct}%` }} transition={{ duration: 1 }} className="h-full bg-[#00E5FF] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{savPct > 15 && <span className="text-black font-bold text-[10px] px-2">{savPct.toFixed(0)}%</span>}</motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${mfPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#00FF94] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{mfPct > 15 && <span className="text-black font-bold text-[10px] px-2">{mfPct.toFixed(0)}%</span>}</motion.div>
              <motion.div initial={{ width: 0 }} animate={{ width: `${goldPct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#f58220] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">{goldPct > 15 && <span className="text-white font-bold text-[10px] px-2">{goldPct.toFixed(0)}%</span>}</motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1"><span>0%</span><span>100%</span></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => { handleTabSwitch("SAVINGS"); setShowWithdraw(true); }}
            className="cursor-pointer bg-gradient-to-br from-[#00E5FF]/10 to-black/60 border border-[#00E5FF]/30 p-6 rounded-3xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,229,255,0.05)] hover:shadow-[0_10px_40px_rgba(0,229,255,0.15)] transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8">
                <div className="bg-[#00E5FF]/20 p-3 rounded-xl border border-[#00E5FF]/30"><Wallet className="text-[#00E5FF] w-6 h-6" /></div>
                <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-[#00E5FF]/20">Liquid</span>
            </div>
            <div>
                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Smart Savings</h3>
                <div className="text-3xl font-black text-white flex items-center">
                    <span className="text-gray-500 mr-1 text-2xl">₹</span><AnimatedNumber value={calcSavings} />
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => { handleTabSwitch("MF"); setShowWithdraw(true); }}
            className="cursor-pointer bg-gradient-to-br from-[#00FF94]/10 to-black/60 border border-[#00FF94]/30 p-6 rounded-3xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,255,148,0.05)] hover:shadow-[0_10px_40px_rgba(0,255,148,0.15)] transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8">
                <div className="bg-[#00FF94]/20 p-3 rounded-xl border border-[#00FF94]/30"><Building className="text-[#00FF94] w-6 h-6" /></div>
                <span className="bg-[#00FF94]/10 text-[#00FF94] px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-[#00FF94]/20">Equity</span>
            </div>
            <div>
                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Mutual Funds</h3>
                <div className="text-3xl font-black text-white flex items-center">
                    <span className="text-gray-500 mr-1 text-2xl">₹</span><AnimatedNumber value={calcMf} />
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => { handleTabSwitch("GOLD"); setShowWithdraw(true); }}
            className="cursor-pointer bg-gradient-to-br from-[#f58220]/10 to-black/60 border border-[#f58220]/30 p-6 rounded-3xl flex flex-col justify-between shadow-[0_10px_30px_rgba(245,130,32,0.05)] hover:shadow-[0_10px_40px_rgba(245,130,32,0.15)] transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8">
                <div className="bg-[#f58220]/20 p-3 rounded-xl border border-[#f58220]/30"><Coins className="text-[#f58220] w-6 h-6" /></div>
                <span className="bg-[#f58220]/10 text-[#f58220] px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-[#f58220]/20">Commodity</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                  <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Digital Gold</h3>
                  <div className="text-3xl font-black text-white flex items-center">
                      <span className="text-gray-500 mr-1 text-2xl">₹</span><AnimatedNumber value={calcGold} />
                  </div>
              </div>
              <div className="text-right pb-1">
                  <span className="text-gray-500 text-[10px] block mb-0.5 uppercase tracking-widest">Holdings</span>
                  <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded-lg border border-white/5">{safeGoldGrams.toFixed(3)}g</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <p className="text-center text-gray-500 text-xs mt-8 font-medium tracking-wide">
          Tap any asset card above to quickly liquidate and transfer to Virtual Balance.
        </p>

      </div>
    </AppLayout>
  );
}