import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden flex flex-col selection:bg-payae-accent selection:text-black">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-payae-accent/10 rounded-full blur-[150px] pointer-events-none" />
      
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
          <div className="bg-payae-green/20 p-4 rounded-2xl border border-payae-green/30">
             <ShieldCheck className="text-payae-green w-8 h-8" />
          </div>
          <div>
             <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
             <p className="text-gray-400">Last updated: March 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">1. Data We Collect</h2>
            <p>At PayAE, we believe your financial data belongs to you. We collect only the essential information required to process your UPI transactions and automate your micro-investments. This includes your basic profile data, linked UPI handles, and transaction history generated through our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">2. How We Use Your Data</h2>
            <p>Your transaction data is strictly used to calculate round-ups and route capital into your chosen asset allocations (Savings, Mutual Funds, Digital Gold). We use advanced algorithms to analyze spending velocity, which is displayed solely on your personal dashboard.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">3. Security & Encryption</h2>
            <p>All sensitive data, including passwords and transaction ledgers, are encrypted at rest using AES-256 standards. Our API communication is secured via TLS 1.3. We do not store full bank account credentials or direct banking PINs on our servers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b border-white/5 pb-2 mb-4">4. Third-Party Sharing</h2>
            <p>We do not sell your personal data to advertisers. Information is only shared with verified financial partners (e.g., Razorpay, NPCI frameworks) strictly for the purpose of executing your requested transactions and investments.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}