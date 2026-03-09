import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useIdle } from "react-use";
import PinLockScreen from "../ui/PinLockScreen";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const isIdle = useIdle(45e3);
  const location = useLocation();

  useEffect(() => {
    if (isIdle && !isLocked) {
      setIsLocked(true);
    }
  }, [isIdle, isLocked]);

  return (
    <div className="flex bg-payae-bg min-h-screen text-white overflow-hidden selection:bg-payae-accent selection:text-black">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#0A0F1C', color: '#fff', borderRadius: '16px', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' } 
        }} 
      />

      <AnimatePresence>
        {isLocked && <PinLockScreen onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>

      <div className="hidden md:flex z-20 relative">
        <Sidebar />
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 h-full z-50 md:hidden shadow-2xl"
              onClick={() => setIsMobileMenuOpen(false)} 
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative h-screen z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-payae-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-payae-success/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="p-4 md:p-8 z-10 overflow-y-auto flex-1 pb-24 md:pb-8 relative"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}