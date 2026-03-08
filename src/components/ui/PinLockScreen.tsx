import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Delete, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function PinLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const correctPin = localStorage.getItem("userPin") || "0000";

  const handlePress = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleUnlock = () => {
    if (pin === correctPin) {
      onUnlock();
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  if (pin.length === 4) {
    setTimeout(handleUnlock, 200);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
        <div className="w-16 h-16 bg-payae-accent/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
          <Lock className="text-payae-accent w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">App Locked</h2>
        <p className="text-gray-400 text-sm mb-8">Enter your 4-digit PIN to secure your session.</p>

        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${pin.length > i ? 'bg-payae-accent border-payae-accent shadow-[0_0_15px_rgba(0,229,255,0.6)]' : 'border-white/20'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handlePress(num.toString())} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-xl font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center">
              {num}
            </button>
          ))}
          <div /> 
          <button onClick={() => handlePress("0")} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-xl font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center">
            0
          </button>
          <button onClick={handleDelete} className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center">
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}