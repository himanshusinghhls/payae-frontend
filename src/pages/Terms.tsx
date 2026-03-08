import { motion } from "framer-motion";
import { ChevronLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden flex flex-col selection:bg-payae-accent selection:text-black">
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <nav className="relative z-20 px-6 py-8 max-w-4xl mx-auto w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black">₹</span><span className="text-payae-orange">E</span>
        </h1>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
          <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30">
             <FileText className="text-blue-400 w-8 h-8" />
          </div>
          <div>
             <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
             <p className="text-gray-400">Last updated: March 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the PayAE platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our automated investing and transaction services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">2. Description of Service</h2>
            <p>PayAE is a financial technology application that intercepts standard UPI transactions to calculate and route fractional "round-ups" into simulated or actual investment portfolios (including Liquid Savings, Mutual Funds, and Digital Gold).</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding your account credentials. The simulated "Virtual Balance" provided in development or testing environments holds no real-world monetary value and cannot be withdrawn to external physical banks.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">4. Investment Risks</h2>
            <p>All investments, including Mutual Funds and Digital Gold, carry inherent market risks. Past performance or "Projected Wealth" algorithms shown on our Dashboard are educational estimates, not guarantees of future returns.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}