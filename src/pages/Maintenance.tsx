import { motion } from "framer-motion";
import { ServerCrash, ShieldAlert } from "lucide-react";
import { useMemo } from "react";

export default function Maintenance() {
  const gridItems = useMemo(() => Array.from({ length: 300 }, (_, i) => i), []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-payae-accent selection:text-black">
      <div className="absolute inset-0 z-0 grid grid-cols-8 md:grid-cols-16 lg:grid-cols-24 gap-1 p-2 overflow-hidden opacity-60">
        {gridItems.map((item) => {
          const isBlue = Math.random() > 0.5;
          const activeStyle = {
            rotateY: 180,
            scale: 1.1,
            backgroundColor: isBlue ? "rgba(0, 229, 255, 0.15)" : "rgba(245, 130, 32, 0.15)",
            borderColor: isBlue ? "rgba(0, 229, 255, 0.5)" : "rgba(245, 130, 32, 0.5)",
            boxShadow: isBlue ? "0 0 15px rgba(0, 229, 255, 0.3)" : "0 0 15px rgba(245, 130, 32, 0.3)",
            transition: { duration: 0.2 }
          };

          return (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.random() * 2, duration: 1 }}
              whileHover={activeStyle}
              whileTap={activeStyle}
              className="w-full h-12 md:h-16 border border-white/[0.02] rounded-sm bg-white/[0.01] transition-colors duration-1000"
            />
          );
        })}
      </div>

      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-payae-accent/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-payae-accent/40 animate-pulse shadow-[0_0_20px_#00E5FF] z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-20 text-center max-w-lg w-full pointer-events-none"
      >
        <div className="flex justify-center mb-8 relative">
           <motion.div 
             animate={{ opacity: [1, 0.5, 1, 0.1, 1], x: [0, -2, 2, -1, 0] }} 
             transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2, 0.3, 1] }}
             className="relative"
           >
             <ShieldAlert className="w-20 h-20 text-payae-orange mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,130,32,0.5)]" />
           </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-6 opacity-90 drop-shadow-2xl">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-3xl md:text-4xl drop-shadow-md">₹</span><span className="text-payae-orange">E</span>
        </h1>

        <div className="glitch-wrapper mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white glitch-text uppercase tracking-widest drop-shadow-xl" data-text="SYSTEM OVERRIDE">
            SYSTEM UNDER MAINTENANCE
          </h2>
        </div>

        <div className="bg-black/70 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl text-left w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden pointer-events-auto">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-payae-accent to-payae-success" />
          
          <div className="flex items-center gap-3 mb-4 text-payae-accent font-bold uppercase tracking-widest text-xs">
            <ServerCrash className="w-4 h-4" /> Core Upgrades in progress
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
            Our master routing nodes are currently offline for scheduled infrastructure maintenance. Wealth routing, UPI payments, and portfolio interactions are temporarily disabled.
          </p>
          <div className="bg-payae-success/10 border border-payae-success/30 p-4 rounded-xl flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-payae-success mt-1 animate-pulse shrink-0 drop-shadow-[0_0_8px_#00FF94]" />
            <p className="text-payae-success text-xs font-bold leading-relaxed tracking-wide">
              System Lock Engaged. Your virtual balance, ledger data, and stored assets are deeply encrypted and 100% safe.
            </p>
          </div>
        </div>

        <div className="mt-12 text-payae-accent text-[11px] md:text-xs font-mono uppercase tracking-[0.3em] font-black drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse">
          Estimated Time to Resolve: &lt; 2 Hours
        </div>
      </motion.div>
    </div>
  );
}