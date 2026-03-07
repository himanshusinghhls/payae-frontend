import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, bounce: 0.4, duration: 0.8 }
    }
  };

  const floatAnimation = {
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white overflow-hidden relative selection:bg-payae-accent selection:text-black">
      
      {/* Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-payae-accent/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-payae-success/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
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
          <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-full text-sm font-bold transition-all backdrop-blur-md">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16 min-h-[calc(100vh-100px)]">
        
        {/* Left Column: Copy & CTAs */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 text-center lg:text-left">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-payae-accent/10 border border-payae-accent/20 text-payae-accent text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> The Future of Micro-Investing
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            Turn every <br className="hidden lg:block"/> payment into a <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-payae-accent to-payae-green">
              micro-investment.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
            PayAE automatically rounds up your daily UPI transactions and smartly distributes the spare change into Digital Gold, Mutual Funds, and Liquid Savings.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-payae-accent to-blue-600 text-black font-black text-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              Start Investing <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-colors">
              Sign In to Account
            </button>
          </motion.div>

          {/* Feature Ticks */}
          <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-semibold text-gray-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-payae-green"/> Bank-Level Security</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-payae-orange"/> Instant UPI Routing</span>
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-payae-accent"/> Smart Allocations</span>
          </motion.div>
        </motion.div>

        {/* Right Column: Floating 3D Assets */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex-1 relative w-full max-w-md lg:max-w-none h-[500px] hidden md:block">
          
          {/* Central Phone Mockup / Main Card */}
          <motion.div animate={floatAnimation} className="absolute top-10 left-10 lg:left-20 w-72 h-96 bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-3xl backdrop-blur-xl p-6 shadow-2xl z-20">
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

          {/* Floating Asset Card 1 */}
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-10 right-0 lg:-right-10 bg-black/40 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-payae-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-payae-success" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mutual Funds</p>
              <p className="text-xl font-black text-white">+₹2.00</p>
            </div>
          </motion.div>

          {/* Floating Asset Card 2 */}
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-10 lg:right-0 bg-black/40 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-payae-orange/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-payae-orange" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Digital Gold</p>
              <p className="text-lg font-black text-white">+₹1.00</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}