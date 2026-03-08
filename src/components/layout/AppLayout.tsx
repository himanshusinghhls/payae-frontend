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
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const isIdle = useIdle(300e3);
  const location = useLocation();

  useEffect(() => {
    if (isIdle && !isLocked) setIsLocked(true);
  }, [isIdle, isLocked]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="flex min-h-screen overflow-hidden selection:bg-payae-accent selection:text-black">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          className: "bg-white text-gray-900 border border-gray-200 dark:bg-[#0A0F1C] dark:text-white dark:border-white/20 shadow-2xl rounded-2xl"
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
              className="fixed top-0 left-0 h-full z-50 md:hidden shadow-2xl bg-white dark:bg-payae-bg"
              onClick={() => setIsMobileMenuOpen(false)} 
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative h-screen z-10 transition-colors duration-500 bg-slate-50 dark:bg-transparent">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-payae-accent/20 dark:bg-payae-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-payae-success/20 dark:bg-payae-success/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} theme={theme} toggleTheme={toggleTheme} />
        
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