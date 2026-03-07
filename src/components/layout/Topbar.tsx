import { useState } from "react";
import { Bell, Search, LogOut, User as UserIcon, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";

const fetchProfile = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: profile } = useQuery({ queryKey: ['userProfile'], queryFn: fetchProfile, staleTime: 300000 });

  const displayEmail = profile?.email || "user@payae.com";
  const actualName = profile?.name || displayEmail.split('@')[0];
  const formattedName = actualName.charAt(0).toUpperCase() + actualName.slice(1);

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return { title: `Welcome back, ${formattedName}`, sub: "Here is your wealth overview for today." };
      case '/portfolio': return { title: "Wealth Portfolio", sub: "Analyze your asset distribution." };
      case '/payment': return { title: "Secure Checkout", sub: "Send money and auto-invest." };
      case '/ledger': return { title: "Smart Ledger", sub: "Your transaction history." };
      case '/settings': return { title: "Preferences", sub: "Manage your allocation rules." };
      default: return { title: "PayAE Dashboard", sub: "Manage your finances." };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="h-20 backdrop-blur-md bg-payae-bg/80 border-b border-payae-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-none">
            {pageInfo.title}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 hidden md:block">{pageInfo.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 relative">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input type="text" placeholder="Search..." className="bg-black/20 border border-payae-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-payae-accent w-64" />
        </div>

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-payae-orange rounded-full border-2 border-payae-bg"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-[-40px] md:right-0 mt-4 w-72 bg-black/60 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-40">
                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Notifications</h3>
                <p className="text-sm text-gray-400">All caught up! No new alerts.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-lg border border-white/10 shrink-0">
            <span className="text-white font-bold text-sm">{formattedName.charAt(0).toUpperCase()}</span>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-black/60 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-40 overflow-hidden">
                <div className="p-3 border-b border-white/10 mb-2">
                  <p className="text-white font-bold text-sm truncate">{formattedName}</p>
                  <p className="text-gray-400 text-xs truncate">{displayEmail}</p>
                </div>
                <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <UserIcon className="w-4 h-4" /> Allocation Settings
                </button>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}