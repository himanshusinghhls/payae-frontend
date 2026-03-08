import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Target, PieChart, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  {
    id: "welcome",
    title: "Welcome to PayAE",
    description: "The future of micro-investing. Let's take a quick tour to see how your daily spending turns into passive wealth.",
    icon: Sparkles,
    color: "text-payae-accent",
    bg: "bg-[#00E5FF]/10",
    glow: "bg-[#00E5FF]"
  },
  {
    id: "engine",
    title: "The Auto-Invest Engine",
    description: "Every time you make a UPI payment, we round up the spare change and automatically route it into your portfolio.",
    icon: Zap,
    color: "text-payae-orange",
    bg: "bg-[#f58220]/10",
    glow: "bg-[#f58220]"
  },
  {
    id: "goals",
    title: "Track Your Goals",
    description: "Watch your 3D Neon Goal Jar fill up in real-time as your fractional investments compound day by day.",
    icon: Target,
    color: "text-payae-success",
    bg: "bg-[#00FF94]/10",
    glow: "bg-[#00FF94]"
  },
  {
    id: "portfolio",
    title: "Total Control",
    description: "Manage your asset allocation between Liquid Savings, Mutual Funds, and Digital Gold right from your Settings.",
    icon: PieChart,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    glow: "bg-blue-500"
  }
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
          className="bg-gradient-to-b from-white/10 to-black/80 border border-white/20 p-8 rounded-[40px] max-w-md w-full text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          <div className={`absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-30 ${steps[currentStep].glow}`} />

          <div className="relative z-10">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5 ${steps[currentStep].bg}`}>
                <CurrentIcon className={`w-10 h-10 ${steps[currentStep].color}`} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-3">{steps[currentStep].title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-10 h-16">
                {steps[currentStep].description}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? `w-8 ${steps[currentStep].glow}` : 'w-2 bg-white/20'}`} 
                    />
                  ))}
                </div>

                <button 
                  onClick={nextStep}
                  className="bg-white text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg hover:scale-105 active:scale-95"
                >
                  {currentStep === steps.length - 1 ? (
                    <>Let's Go <CheckCircle2 className="w-4 h-4" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}