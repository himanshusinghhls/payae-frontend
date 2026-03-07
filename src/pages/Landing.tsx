import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Sparkles, Building2 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const floatAnimation = {
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="w-16 h-16 border-4 border-payae-accent border-t-transparent rounded-full animate-spin" />
         </motion.div>
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-payae-accent font-bold tracking-widest uppercase text-sm">
           Initializing PayAE
         </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white overflow-hidden relative selection:bg-payae-accent selection:text-black">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-payae-accent/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-payae-success/10 rounded-full blur-[150px] pointer-events-none" />

      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md bg-black/10 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-1">
            Pay<span className="text-payae-orange">A</span>
            <span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-xl">₹</span>
            <span className="text-payae-orange">E</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Login
          </button>
          <button onClick={() => navigate('/login')} className="bg-payae-accent/10 text-payae-accent hover:bg-payae-accent hover:text-black border border-payae-accent/20 px-5 py-2 rounded-full text-sm font-bold transition-all backdrop-blur-md">
            Register
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20 flex flex-col lg:flex-row items-center gap-16 min-h-[calc(100vh-200px)]">
        
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-payae-accent/10 border border-payae-accent/20 text-payae-accent text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> The Future of Micro-Investing
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            Turn every <br className="hidden lg:block"/> payment into a <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-payae-accent to-payae-green">
              micro-investment.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
            PayAE automatically rounds up your daily UPI transactions and smartly distributes the spare change into Digital Gold, Mutual Funds, and Liquid Savings.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-payae-accent to-blue-600 text-black font-black text-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              Start Investing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex-1 relative w-full max-w-md lg:max-w-none h-[500px] hidden md:block perspective-1000">
          <motion.div animate={floatAnimation} className="absolute top-10 left-10 lg:left-20 w-72 h-96 bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-3xl backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20" style={{ transformStyle: "preserve-3d", transform: "rotateY(-15deg) rotateX(10deg)" }}>
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <span className="text-sm font-bold text-gray-300">UPI Payment</span>
              <span className="text-lg font-black text-white">₹145.00</span>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 justify-between">
                <span className="text-sm text-gray-400">Round-Up</span>
                <span className="text-payae-success font-bold">+₹5.00</span>
              </div>
              <div className="h-24 bg-gradient-to-tr from-payae-accent/20 to-blue-500/20 rounded-xl border border-payae-accent/30 p-4">
                <p className="text-xs text-payae-accent uppercase font-bold tracking-wider mb-2">Routing to Portfolio</p>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 w-[40%]" />
                  <div className="h-full bg-payae-success w-[40%]" />
                  <div className="h-full bg-payae-orange w-[20%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="bg-black/40 py-24 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-6" />
           <h2 className="text-3xl font-bold mb-6">About PayAE</h2>
           <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
             We believe that wealth generation shouldn't require a master's degree in finance. By intercepting the friction of daily spending, PayAE creates a seamless bridge between consumption and investment. Built for the modern digital economy, we ensure your money never sits idle.
           </p>
        </div>
      </div>

      <footer className="bg-[#050810] py-8 border-t border-white/10 text-center relative z-10">
         <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-500 font-medium">
            <span>&copy; {new Date().getFullYear()} PayAE Inc.</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
         </div>
      </footer>
    </div>
  );
}