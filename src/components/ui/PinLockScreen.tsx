import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Delete, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function PinLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [pinErrorShake, setPinErrorShake] = useState(false); 
  const [correctPin, setCorrectPin] = useState("0000");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const userPinKey = `userPin_${user.email}`;
      setCorrectPin(localStorage.getItem(userPinKey) || "0000");
    }
  }, []);

  const handlePress = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        if (pin === correctPin) {
          onUnlock();
        } else {
          toast.error("Incorrect PIN");
          setPinErrorShake(true);
          setTimeout(() => {
            setPinErrorShake(false);
            setPin("");
          }, 500);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin, correctPin, onUnlock]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
        <div className="w-16 h-16 bg-payae-accent/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
          <Lock className="text-payae-accent w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">App Locked</h2>
        <p className="text-gray-400 text-sm mb-8">Enter your 4-digit PIN to secure your session.</p>

        <motion.div animate={pinErrorShake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                pinErrorShake ? 'border-red-500 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 
                pin.length > i ? 'bg-payae-accent border-payae-accent shadow-[0_0_15px_rgba(0,229,255,0.6)]' : 
                'border-white/20'
              }`} 
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handlePress(num.toString())} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-xl font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {num}
            </button>
          ))}
          <div /> 
          <button onClick={() => handlePress("0")} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-xl font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            0
          </button>
          <button onClick={handleDelete} className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center shadow-lg">
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center bg-white/5 border border-white/10 px-5 py-3 rounded-2xl max-w-xs text-center">
           <div className="flex items-center gap-2 mb-1">
             <Info className="w-3.5 h-3.5 text-payae-accent" />
             <span className="text-gray-300 text-xs font-semibold">Default PIN is <strong className="text-payae-accent tracking-widest ml-1 text-sm">0000</strong></span>
           </div>
           <p className="text-[10px] text-gray-500 font-medium">You can change this anytime from your Profile Settings.</p>
        </div>

      </motion.div>
    </div>
  );
}