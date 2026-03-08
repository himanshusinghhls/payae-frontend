import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, Store, Wallet, PieChart, XCircle, ArrowDownLeft, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const formatTimeIST = (timestamp: string) => {
  if (!timestamp) return "";
  const utcDate = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
  return new Date(utcDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Ledger() {
  const { data: rawTransactions, isLoading, isError } = useQuery({
    queryKey: ['ledger'], queryFn: async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; }
  });

  const [expandedBaseId, setExpandedBaseId] = useState<number | null>(null);
  const [expandedWalletId, setExpandedWalletId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const smartLedger = useMemo(() => {
    const transactions = rawTransactions || [];
    const basePayments = transactions.filter((t: any) => t.type?.includes("PAYMENT")).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let availableInvestments = transactions.filter((t: any) => t.type === "INVESTMENT");

    return basePayments.map((payment: any) => {
      const isFailed = payment.type === "PAYMENT_FAILED" || payment.status === "FAILED";
      const isReceived = payment.type === "PAYMENT_RECEIVED";
      if (isFailed || isReceived) return { ...payment, isFailed, isReceived, linkedRoundups: [], totalRoundupAmount: 0, totalCharge: payment.amount };

      const pTime = new Date(payment.timestamp).getTime();
      const linkedRoundups = availableInvestments.filter((r: any) => { const rTime = new Date(r.timestamp).getTime(); return rTime >= pTime && rTime <= pTime + 10000; });
      availableInvestments = availableInvestments.filter((r: any) => !linkedRoundups.includes(r));
      const totalRoundupAmount = linkedRoundups.reduce((sum: number, r: any) => sum + r.amount, 0);

      return { ...payment, isFailed: false, isReceived: false, linkedRoundups, totalRoundupAmount, totalCharge: payment.amount + totalRoundupAmount };
    });
  }, [rawTransactions]);

  const visibleLedger = smartLedger.slice(0, visibleCount);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
    
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(245, 130, 32);
      doc.text("Pay", 14, 22);
      doc.setTextColor(0, 166, 81);
      doc.text("A", 26, 22);
      doc.text("E", 34, 22);
      doc.setTextColor(100, 100, 100);
      doc.text(" Statement", 41, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      let totalSpent = 0;
      let totalReceived = 0;

      const tableData = smartLedger.map((t: any) => {
        if (t.isReceived) totalReceived += t.amount;
        else if (!t.isFailed) totalSpent += t.totalCharge;

        return [
          new Date(t.timestamp).toLocaleDateString(),
          t.isFailed ? "Failed" : t.isReceived ? "Received" : "Sent",
          t.description || t.payeeName || "UPI Payment",
          `Rs. ${t.amount.toFixed(2)}`,
          t.totalRoundupAmount > 0 ? `+ Rs. ${t.totalRoundupAmount.toFixed(2)}` : "-",
          `Rs. ${t.totalCharge.toFixed(2)}`
        ];
      });

      tableData.push(["", "", "", "", "", ""]);
      tableData.push(["", "", "", "", "Total Spent:", `Rs. ${totalSpent.toFixed(2)}`]);
      tableData.push(["", "", "", "", "Total Received:", `Rs. ${totalReceived.toFixed(2)}`]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Type', 'Description', 'Amount', 'Auto-Invest', 'Total Charge']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [28, 49, 102] }
      });

      doc.save("PayAE_Statement.pdf");
      toast.success("Statement Downloaded!");
    } catch (error) {
      toast.error("Failed to generate PDF.");
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottom && visibleCount < smartLedger.length) setVisibleCount(prev => prev + 10);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-4 h-full flex flex-col" onScroll={handleScroll} style={{ overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Smart Ledger</h2>
            <p className="text-xs text-gray-400 mt-1">Your exact transaction history.</p>
          </div>
          <button onClick={downloadPDF} className="bg-white/5 hover:bg-white/10 text-payae-accent border border-payae-accent/30 p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold backdrop-blur-md">
            <FileDown className="w-5 h-5" /> <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse flex-1">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />)}
          </div>
        ) : isError || smartLedger.length === 0 ? (
          <div className="text-center p-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex-1">
            <Receipt className="mx-auto text-gray-500 w-10 h-10 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No transactions yet</h3>
          </div>
        ) : (
          <div className="space-y-3 pb-10">
            {visibleLedger.map((payment: any) => {
              const isBaseExpanded = expandedBaseId === payment.id;
              const isWalletExpanded = expandedWalletId === payment.id;
              const displayName = payment.description || payment.payeeName || "UPI Payment";
              const isInteractive = !payment.isFailed && !payment.isReceived;

              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={payment.id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-lg backdrop-blur-xl">
                  <div className={`p-4 flex items-center justify-between transition-colors ${isInteractive ? 'cursor-pointer hover:bg-white/5' : ''}`} onClick={() => isInteractive && setExpandedBaseId(isBaseExpanded ? null : payment.id)}>
                    <div className="flex items-center gap-3">
                      {payment.isFailed ? <div className="p-2.5 bg-red-500/10 rounded-lg text-red-500"><XCircle className="w-5 h-5" /></div> : payment.isReceived ? <div className="p-2.5 bg-payae-success/10 rounded-lg text-payae-success"><ArrowDownLeft className="w-5 h-5" /></div> : <div className="p-2.5 bg-white/10 rounded-lg text-white"><Store className="w-5 h-5" /></div>}
                      <div>
                        <p className={`font-bold text-base ${payment.isFailed ? 'text-red-400' : payment.isReceived ? 'text-payae-success' : 'text-white'}`}>{payment.isFailed ? 'Failed Transaction' : payment.isReceived ? 'Received Money' : displayName}</p>
                        <p className="text-[11px] text-gray-400">{payment.isReceived ? `${displayName} • ${formatTimeIST(payment.timestamp)}` : formatTimeIST(payment.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-black ${payment.isFailed ? 'text-red-400 line-through opacity-70' : payment.isReceived ? 'text-payae-success' : 'text-white'}`}>{payment.isReceived ? '+' : '-'}₹{payment.totalCharge.toFixed(2)}</div>
                      {isInteractive && <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isBaseExpanded ? 'rotate-180' : ''}`} />}
                    </div>
                  </div>

                  {isInteractive && (
                    <AnimatePresence>
                      {isBaseExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-black/20 border-t border-white/5 overflow-hidden">
                          <div className="p-3 pl-14 flex justify-between items-center border-b border-white/5"><span className="text-gray-400 font-medium text-xs">Sent to Receiver</span><span className="text-white font-bold text-sm">-₹{payment.amount.toFixed(2)}</span></div>
                          <div className="p-3 pl-14 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => setExpandedWalletId(isWalletExpanded ? null : payment.id)}>
                            <div className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5 text-payae-accent" /><span className="text-payae-accent font-bold text-xs">PayAE Auto-Invest</span></div>
                            <div className="flex items-center gap-2"><span className="text-payae-success font-black text-sm">+₹{payment.totalRoundupAmount.toFixed(2)}</span><ChevronDown className={`w-4 h-4 text-payae-accent transition-transform ${isWalletExpanded ? 'rotate-180' : ''}`} /></div>
                          </div>
                          <AnimatePresence>
                            {isWalletExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/40 p-3 pl-20 flex flex-col gap-2">
                                {payment.linkedRoundups.length > 0 ? payment.linkedRoundups.map((r: any) => (
                                  <div key={r.id} className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><PieChart className="w-3 h-3"/> {r.assetType || 'Liquid Savings'}</span><span className="text-white font-bold">₹{r.amount.toFixed(2)}</span>
                                  </div>
                                )) : <span className="text-gray-500 text-[11px] italic">No investments for this transaction.</span>}
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
            {visibleCount < smartLedger.length && (
               <button onClick={() => setVisibleCount(prev => prev + 10)} className="w-full py-4 text-gray-400 text-sm font-bold hover:text-white transition-colors">Load More Transactions</button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}