import { motion } from "framer-motion";
import { ShieldCheck, Mail, Clock } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-payae-accent selection:text-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-payae-brand/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
        <motion.div 
          animate={{ scale: [1, 1.03, 1], opacity: [0.8, 1, 0.8] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mb-6 flex justify-center"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight flex items-center justify-center gap-1 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-5xl md:text-6xl drop-shadow-md">₹</span><span className="text-payae-orange">E</span>
          </h1>
        </motion.div>

        <div className="flex justify-center gap-3 mb-10">
          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-payae-accent" />
          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-payae-success" />
          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-payae-orange" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          We'll be right back.
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
          PayAE is currently undergoing a scheduled system upgrade to improve your payment experience. 
        </p>

        <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl backdrop-blur-xl w-full text-left shadow-lg">
          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
            <div className="bg-payae-success/20 p-2.5 rounded-full text-payae-success shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Your money is safe</p>
              <p className="text-xs text-gray-400 mt-0.5">All investments and virtual balances are securely locked.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-payae-accent/20 p-2.5 rounded-full text-payae-accent shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Estimated Completion</p>
              <p className="text-xs text-gray-400 mt-0.5">Less than 2 hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 z-20">
        <a 
          href="mailto:payae.in@gmail.com" 
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-300 text-xs font-semibold uppercase tracking-widest px-4 py-2 group"
        >
          <Mail className="w-4 h-4 text-gray-600 group-hover:text-payae-accent transition-colors" />
          Contact Support
        </a>
      </div>

    </div>
  );
}