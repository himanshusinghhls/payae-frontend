import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, User as UserIcon, Menu, ArrowUpRight, ArrowDownLeft, X, QrCode, Settings as SettingsIcon, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";
import { QRCodeSVG } from "qrcode.react";

const fetchProfile = async () => { const response = await api.get("/api/users/me"); return response.data; };
const fetchTransactions = async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; };

const QUICK_ACTIONS = [
  { id: 1, name: "Make a Payment", path: "/payment", keywords: ["send", "pay", "money", "transfer"] },
  { id: 2, name: "View Smart Ledger", path: "/ledger", keywords: ["history", "transactions", "ledger", "statement"] },
  { id: 3, name: "Asset Portfolio", path: "/portfolio", keywords: ["gold", "mutual funds", "savings", "assets", "wealth"] },
  { id: 4, name: "Allocation Rules", path: "/settings", keywords: ["settings", "rules", "allocations", "preferences"] },
];

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useQuery({ queryKey: ['userProfile'], queryFn: fetchProfile, staleTime: 300000 });
  const { data: transactions } = useQuery({ queryKey: ['ledger'], queryFn: fetchTransactions });
  const displayEmail = profile?.email || "user@payae.com";
  const actualName = profile?.name || displayEmail.split('@')[0];
  const formattedName = actualName.charAt(0).toUpperCase() + actualName.slice(1);
  const usernamePrefix = displayEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const payaeId = `${usernamePrefix}@payae`;
  const upiString = `upi://pay?pa=${payaeId}&pn=${encodeURIComponent(actualName)}`;
  const recentActivity = (transactions || []).filter((t: any) => t.type?.includes("PAYMENT")).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
  const unreadCount = recentActivity.length > 0 ? recentActivity.length : 0;

  const userPinKey = `userPin_${displayEmail}`;
  useEffect(() => {
    if (profile?.pin) {
      localStorage.setItem(userPinKey, profile.pin);
    }
  }, [profile, userPinKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowCommandCenter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredActions = QUICK_ACTIONS.filter(action => 
    action.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    action.keywords.some(k => k.includes(searchQuery.toLowerCase()))
  );

  const executeAction = (path: string) => {
    navigate(path);
    setShowCommandCenter(false);
    setSearchQuery("");
  };

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return { title: `Welcome, ${formattedName}`, sub: "Here is your wealth overview for today." };
      case '/portfolio': return { title: "Wealth Portfolio", sub: "Analyze your asset distribution." };
      case '/payment': return { title: "Secure Checkout", sub: "Send money and auto-invest." };
      case '/ledger': return { title: "Smart Ledger", sub: "Your transaction history." };
      case '/settings': return { title: "Allocation Rules", sub: "Manage your investment splits." };
      case '/profile': return { title: "Security & Profile", sub: "Manage your credentials and PIN." };
      default: return { title: "PayAE Dashboard", sub: "Manage your finances." };
    }
  };

  return (
    <>
      <div className="h-20 backdrop-blur-md bg-payae-bg/80 border-b border-payae-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white transition-colors"><Menu className="w-6 h-6" /></button>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-none">{getPageTitle().title}</h2>
            <p className="text-xs md:text-sm text-gray-400 hidden md:block">{getPageTitle().sub}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <div className="relative hidden lg:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" placeholder="Quick Actions (Cmd+K)" value={searchQuery}
                onFocus={() => setShowCommandCenter(true)} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-payae-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-payae-accent focus:bg-white/5 w-64 transition-all" 
              />
            </div>
            
            <AnimatePresence>
              {showCommandCenter && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-50 overflow-hidden">
                  {filteredActions.length > 0 ? (
                    filteredActions.map((action) => (
                      <button key={action.id} onClick={() => executeAction(action.path)} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-between group">
                        {action.name}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-payae-accent transition-opacity" />
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 p-3 text-center">No actions found</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-payae-orange rounded-full border-2 border-payae-bg"></span>}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-[-40px] md:right-0 mt-4 w-80 bg-black/80 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-40">
                  <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.map((t: any) => (
                      <div key={t.id} className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${t.type === 'PAYMENT_RECEIVED' ? 'bg-payae-success/20 text-payae-success' : t.type === 'PAYMENT_FAILED' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'}`}>
                           {t.type === 'PAYMENT_RECEIVED' ? <ArrowDownLeft className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                         </div>
                         <div>
                           <p className="text-xs font-bold text-white truncate max-w-[200px]">{t.type === 'PAYMENT_RECEIVED' ? 'Received Money' : t.type === 'PAYMENT_FAILED' ? 'Payment Failed' : `Paid ${t.description || t.payeeName || 'User'}`}</p>
                           <p className="text-[10px] text-gray-400">{t.type === 'PAYMENT_RECEIVED' ? '+' : '-'}₹{t.amount.toFixed(2)}</p>
                         </div>
                      </div>
                    )) : <p className="text-sm text-gray-400">All caught up! No new alerts.</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="w-10 h-10 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-lg border border-white/10 shrink-0 hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">{formattedName.charAt(0).toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-black/80 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-40 overflow-hidden">
                  <div className="p-3 border-b border-white/10 mb-2">
                    <p className="text-white font-bold text-sm truncate">{formattedName}</p>
                    <p className="text-gray-400 text-xs truncate">{payaeId}</p>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); setShowQrModal(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-payae-accent hover:bg-payae-accent/10 rounded-lg transition-colors font-semibold">
                    <QrCode className="w-4 h-4" /> Display My QR
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <UserIcon className="w-4 h-4" /> Security & Profile
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <SettingsIcon className="w-4 h-4" /> Allocation Rules
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQrModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-gradient-to-b from-white/10 to-black/80 border border-white/20 p-8 rounded-[40px] shadow-[0_30px_80px_rgba(0,229,255,0.2)] w-full max-w-sm z-10 backdrop-blur-xl text-center">
              <button onClick={() => setShowQrModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20}/></button>
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-payae-accent to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,229,255,0.4)]"><QrCode className="text-black w-8 h-8" /></div>
              <h3 className="text-2xl font-black text-white mb-1">{formattedName}</h3>
              <p className="text-payae-accent text-sm font-bold tracking-widest mb-8 truncate px-2">{payaeId}</p>
              <div className="bg-white p-4 rounded-3xl inline-block mx-auto shadow-2xl mb-6">
                <QRCodeSVG value={upiString} size={200} level="H" includeMargin={false} />
              </div>
              <p className="text-gray-400 text-xs">Scan using any PayAE camera to directly auto-fill payment details.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}