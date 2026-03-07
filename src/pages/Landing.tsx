import { useState, useEffect } from "react";
import { motion, Transition, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Sparkles, Building2, Calculator, ArrowUpRight, Lock } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const monthlyInvested = monthlySpend * 0.08;
  const yearlyProjection = (monthlyInvested * 12) * 1.10;

  useEffect(() => { 
    const timer = setTimeout(() => setLoading(false), 1500); 
    return () => clearTimeout(timer); 
  }, []);

  const floatMainTransition: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };
  const floatFastTransition: Transition = { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 };
  const floatSlowTransition: Transition = { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const rotateY = useTransform(springX, [-0.5, 0, 0.5], ["-25deg", "-15deg", "-5deg"]);
  const rotateX = useTransform(springY, [-0.5, 0, 0.5], ["20deg", "10deg", "0deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="w-16 h-16 border-4 border-payae-accent border-t-transparent rounded-full animate-spin" />
         </motion.div>
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-payae-accent font-bold tracking-widest uppercase text-sm">Initializing PayAE</motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white overflow-hidden relative selection:bg-payae-accent selection:text-black">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-payae-accent/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-payae-success/10 rounded-full blur-[150px] pointer-events-none" />

      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md bg-black/10 rounded-b-3xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-1">
            Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-xl">₹</span><span className="text-payae-orange">E</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">Login</button>
          <button onClick={() => navigate('/register')} className="bg-payae-accent/10 text-payae-accent hover:bg-payae-accent hover:text-black border border-payae-accent/20 px-5 py-2 rounded-full text-sm font-bold transition-all backdrop-blur-md">Register</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-16">
        
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-payae-accent/10 border border-payae-accent/20 text-payae-accent text-sm font-bold mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Sparkles className="w-4 h-4" /> The Future of Micro-Investing
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            Turn every <br className="hidden lg:block"/> payment into a <br className="hidden lg:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-payae-accent to-payae-green">micro-investment.</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
            PayAE automatically rounds up your daily UPI transactions and smartly distributes the spare change into Digital Gold, Mutual Funds, and Liquid Savings.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-payae-accent to-blue-600 text-black font-black text-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              Start Investing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-semibold text-gray-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-payae-green"/> Bank-Level Security</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-payae-orange"/> Instant UPI Routing</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1 }} 
          className="flex-1 relative w-full h-[600px] hidden lg:flex items-center justify-center" 
          style={{ perspective: "1200px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          
          <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }} className="absolute w-80 h-80 border border-payae-accent/20 rounded-full z-0 pointer-events-none" />
          <motion.div animate={{ scale: [1, 1.8], opacity: [0.3, 0] }} transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeOut" }} className="absolute w-80 h-80 border border-payae-success/20 rounded-full z-0 pointer-events-none" />

          <motion.div animate={{ y: [0, -20, 0] }} transition={floatMainTransition} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(0,229,255,0.4)" }}
              className="w-80 h-[420px] bg-gradient-to-b from-white/10 to-black/60 border border-white/20 rounded-[40px] backdrop-blur-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] pointer-events-auto cursor-crosshair transition-shadow duration-300" 
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="text-sm font-bold text-gray-300">UPI Payment</span>
                <span className="text-xl font-black text-white">₹250.00</span>
              </div>
              <div className="space-y-5">
                <div className="h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 justify-between shadow-inner">
                  <span className="text-sm text-gray-400">Auto-Invest</span>
                  <span className="text-payae-success font-bold text-lg">+₹5.00</span>
                </div>
                <div className="h-32 bg-gradient-to-tr from-payae-accent/10 to-blue-500/10 rounded-2xl border border-payae-accent/30 p-5 relative overflow-hidden">
                  <p className="text-xs text-payae-accent uppercase font-bold tracking-wider mb-4 relative z-10">Portfolio Routing</p>
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden flex relative z-10 shadow-inner">
                    <div className="h-full bg-blue-500 w-[40%]" />
                    <div className="h-full bg-payae-success w-[40%]" />
                    <div className="h-full bg-payae-orange w-[20%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div animate={{ y: [0, -15, 0] }} transition={floatFastTransition} className="absolute top-[20%] left-[10%] xl:left-[18%] z-30">
            <motion.div whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,255,148,0.5)" }} className="bg-black/80 border border-payae-green/30 backdrop-blur-xl p-4 rounded-3xl shadow-2xl flex items-center gap-4 cursor-pointer">
               <div className="bg-payae-green/20 p-3 rounded-2xl"><Lock className="text-payae-green w-5 h-5" /></div>
               <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secured</p>
                  <p className="text-sm font-bold text-white">256-bit Encryption</p>
               </div>
            </motion.div>
          </motion.div>

          <motion.div animate={{ y: [0, 25, 0] }} transition={floatSlowTransition} className="absolute bottom-[20%] right-[10%] xl:right-[15%] z-30">
             <motion.div whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(245,130,32,0.5)" }} className="bg-black/80 border border-payae-accent/30 backdrop-blur-xl p-4 rounded-3xl shadow-2xl flex items-center gap-4 cursor-pointer">
               <div className="bg-payae-accent/20 p-3 rounded-2xl"><TrendingUp className="text-payae-accent w-5 h-5" /></div>
               <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Growth</p>
                  <p className="text-xl font-black text-white">+12.4%</p>
               </div>
             </motion.div>
          </motion.div>

        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
         <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 w-full">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-payae-success/10 rounded-xl"><Calculator className="text-payae-success w-6 h-6" /></div>
                 <h2 className="text-2xl font-bold">Wealth Predictor</h2>
               </div>
               <p className="text-gray-400 mb-8">Drag to see how your daily spending turns into passive wealth over 1 year.</p>
               <div className="mb-2 flex justify-between text-sm font-bold">
                 <span className="text-gray-400">Monthly UPI Spend</span>
                 <span className="text-payae-accent">₹{monthlySpend.toLocaleString()}</span>
               </div>
               <input type="range" min="1000" max="50000" step="1000" value={monthlySpend} onChange={(e) => setMonthlySpend(Number(e.target.value))} className="w-full accent-payae-success h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex-1 w-full bg-gradient-to-br from-payae-card to-black p-8 rounded-3xl border border-white/5 text-center shadow-inner">
               <p className="text-sm text-gray-400 font-semibold mb-2 uppercase tracking-widest">Projected 1-Year Wealth</p>
               <h3 className="text-5xl font-black text-white mb-2 flex justify-center items-center gap-2">
                 ₹{yearlyProjection.toLocaleString(undefined, { maximumFractionDigits: 0 })} <ArrowUpRight className="text-payae-success w-8 h-8" />
               </h3>
               <p className="text-xs text-gray-500 mt-4">*Based on an 8% average algorithmic routing and 10% expected returns.</p>
            </div>
         </div>
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

      <footer className="bg-[#050810] py-12 border-t border-white/10 text-center relative z-10">
         <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-gray-500 font-medium">
            <span>&copy; {new Date().getFullYear()} PayAE Inc.</span>
            <span className="hidden md:block text-gray-800">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
         </div>
      </footer>
    </div>
  );
}