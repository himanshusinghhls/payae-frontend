import { motion } from "framer-motion";

export default function PortfolioChart() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full flex justify-between items-center z-10">
        <h3 className="text-xl font-bold text-white">Wealth Engine</h3>
        <span className="flex items-center gap-2 bg-payae-success/10 text-payae-success px-3 py-1 rounded-full text-xs font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-payae-success animate-pulse" /> Live
        </span>
      </div>

      {/* Dynamic Lottie-style repeating animation built with Framer Motion */}
      <div className="relative w-48 h-48 flex items-center justify-center mt-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-payae-accent/30"
            initial={{ width: 50, height: 50, opacity: 1 }}
            animate={{ width: 250, height: 250, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-tr from-payae-accent to-blue-600 rounded-full shadow-[0_0_40px_rgba(0,229,255,0.4)] flex items-center justify-center z-10"
        >
          <div className="w-16 h-16 bg-payae-card rounded-full flex items-center justify-center">
            <span className="text-2xl font-black text-payae-accent">₹</span>
          </div>
        </motion.div>
      </div>
      
      <p className="text-gray-400 text-sm mt-8 z-10 text-center">
        Your micro-investments are actively processing in the background.
      </p>
    </div>
  );
}