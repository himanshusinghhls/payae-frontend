import { motion } from "framer-motion";
import { ServerCrash, ShieldAlert, Mail } from "lucide-react";
import { useMemo } from "react";

export default function Maintenance() {
  const gridItems = useMemo(() => Array.from({ length: 300 }, (_, i) => i), []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-payae-accent selection:text-black">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-50 opacity-50" />
      <div className="absolute inset-0 z-0 grid grid-cols-8 md:grid-cols-16 lg:grid-cols-24 gap-1 p-2 overflow-hidden opacity-100">
        {gridItems.map((item) => {
          const isBlue = Math.random() > 0.5;
          const randomXFlip = Math.random() > 0.5 ? 180 : 0;
          
          return (
            <motion.div
              key={item}
              initial={{ 
                opacity: 0,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(255, 255, 255, 0.05)"
              }}
              animate={{ 
                opacity: 1,
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 0px rgba(0,0,0,0)"
              }}
              transition={{ delay: Math.random() * 1.5, duration: 0.5 }}
              whileHover={{ 
                rotateY: 180, 
                rotateX: randomXFlip,
                scale: 1.2,
                backgroundColor: isBlue ? "rgba(0, 229, 255, 0.2)" : "rgba(245, 130, 32, 0.2)",
                borderColor: isBlue ? "rgba(0, 229, 255, 0.8)" : "rgba(245, 130, 32, 0.8)",
                boxShadow: isBlue ? "0 0 20px rgba(0, 229, 255, 0.8)" : "0 0 20px rgba(245, 130, 32, 0.8)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ 
                rotateY: 180, 
                rotateX: randomXFlip,
                scale: 1.2,
                backgroundColor: isBlue ? "rgba(0, 229, 255, 0.3)" : "rgba(245, 130, 32, 0.3)",
                borderColor: isBlue ? "rgba(0, 229, 255, 1)" : "rgba(245, 130, 32, 1)",
                boxShadow: isBlue ? "0 0 25px rgba(0, 229, 255, 1)" : "0 0 25px rgba(245, 130, 32, 1)",
                transition: { type: "spring", stiffness: 400, damping: 10 } 
              }}
              className="w-full h-12 md:h-16 border rounded-sm relative z-0 hover:z-10"
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
        className="z-20 text-center max-w-lg w-full pointer-events-none flex flex-col items-center justify-center min-h-[80vh]"
      >
        <div className="flex justify-center mb-8 relative">
           <motion.div 
             animate={{ opacity: [1, 0.5, 1, 0.1, 1], x: [0, -2, 2, -1, 0] }} 
             transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2, 0.3, 1] }}
             className="relative"
           >
             <ShieldAlert className="w-20 h-20 text-payae-orange mx-auto mb-4 drop-shadow-[0_0_20px_rgba(245,130,32,0.8)]" />
           </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-6 opacity-90 drop-shadow-2xl">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-3xl md:text-4xl drop-shadow-md">₹</span><span className="text-payae-orange">E</span>
        </h1>

        <div className="glitch-wrapper mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white glitch-text uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" data-text="SYSTEM OVERRIDE">
            UNDER MAINTENANCE
          </h2>
        </div>

        <div className="bg-black/80 border border-white/20 p-6 md:p-8 rounded-2xl backdrop-blur-xl text-left w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden pointer-events-auto">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-payae-accent to-payae-success" />
          
          <div className="flex items-center gap-3 mb-4 text-payae-accent font-bold uppercase tracking-widest text-xs">
            <ServerCrash className="w-4 h-4" /> Core Upgrades in progress
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
            Our master routing nodes are currently offline for scheduled infrastructure maintenance. Wealth routing, UPI payments, and portfolio interactions are temporarily disabled.
          </p>
          <div className="bg-payae-success/10 border border-payae-success/40 p-4 rounded-xl flex items-start gap-3 shadow-[inset_0_0_20px_rgba(0,255,148,0.05)]">
            <div className="w-2.5 h-2.5 rounded-full bg-payae-success mt-1 animate-pulse shrink-0 drop-shadow-[0_0_10px_#00FF94]" />
            <p className="text-payae-success text-xs font-bold leading-relaxed tracking-wide">
              System Lock Engaged. Your virtual balance, ledger data, and stored assets are deeply encrypted and 100% safe.
            </p>
          </div>
        </div>

        <div className="mt-12 text-payae-accent text-[12px] md:text-sm font-mono uppercase tracking-[0.3em] font-black drop-shadow-[0_0_12px_rgba(0,229,255,0.9)] animate-pulse">
          Estimated Time to Resolve: &lt; 2 Hours
        </div>
      </motion.div>

      <div className="absolute bottom-8 z-30 pointer-events-auto">
        <a 
          href="mailto:payae.in@gmail.com" 
          className="flex items-center gap-2 text-gray-500 hover:text-payae-orange transition-colors duration-300 text-xs font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full border border-white/5 hover:border-payae-orange/50 backdrop-blur-md group"
        >
          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Contact Emergency Support
        </a>
      </div>
    </div>
  );
}