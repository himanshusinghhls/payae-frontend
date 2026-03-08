import { useState } from "react";
import { Bell, Search, LogOut, User as UserIcon, Menu, ArrowUpRight, ArrowDownLeft, X, Lock, Loader2, CheckCircle, QrCode, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import toast from "react-hot-toast";
import { Settings as SettingsIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const fetchProfile = async () => { const response = await api.get("/api/users/me"); return response.data; };
const fetchTransactions = async () => { const res = await api.get("/api/transactions"); return Array.isArray(res.data) ? res.data : res.data?.data || []; };

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPin, setEditPin] = useState(localStorage.getItem("userPin") || "0000");

  const { data: profile } = useQuery({ queryKey: ['userProfile'], queryFn: fetchProfile, staleTime: 300000 });
  const { data: transactions } = useQuery({ queryKey: ['ledger'], queryFn: fetchTransactions });

  const displayEmail = profile?.email || "user@payae.com";
  const actualName = profile?.name || displayEmail.split('@')[0];
  const formattedName = actualName.charAt(0).toUpperCase() + actualName.slice(1);
  const upiString = `upi://pay?pa=${displayEmail}&pn=${encodeURIComponent(actualName)}`;

  const recentActivity = (transactions || []).filter((t: any) => t.type?.includes("PAYMENT")).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
  const unreadCount = recentActivity.length > 0 ? recentActivity.length : 0;

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (editName) payload.name = editName;
      if (editPassword) payload.password = editPassword;
      await api.put("/api/users/profile", payload);
    },
    onSuccess: () => {
      localStorage.setItem("userPin", editPin);
      toast.success("Profile & Security updated!");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setShowEditProfile(false);
      setEditPassword("");
    },
    onError: () => toast.error("Failed to update profile.")
  });

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return { title: `Welcome, ${formattedName}`, sub: "Here is your wealth overview for today." };
      case '/portfolio': return { title: "Wealth Portfolio", sub: "Analyze your asset distribution." };
      case '/payment': return { title: "Secure Checkout", sub: "Send money and auto-invest." };
      case '/ledger': return { title: "Smart Ledger", sub: "Your transaction history." };
      case '/settings': return { title: "Preferences", sub: "Manage your allocation rules." };
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
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="text" placeholder="Search..." className="bg-black/20 border border-payae-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-payae-accent w-64" />
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
            <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="w-10 h-10 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-lg border border-white/10 shrink-0">
              <span className="text-white font-bold text-sm">{formattedName.charAt(0).toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-black/80 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-40 overflow-hidden">
                  <div className="p-3 border-b border-white/10 mb-2">
                    <p className="text-white font-bold text-sm truncate">{formattedName}</p>
                    <p className="text-gray-400 text-xs truncate">{displayEmail}</p>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); setShowQrModal(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-payae-accent hover:bg-payae-accent/10 rounded-lg transition-colors font-semibold">
                    <QrCode className="w-4 h-4" /> Display My QR
                  </button>
                  <button onClick={() => { setEditName(actualName); setShowProfileMenu(false); setShowEditProfile(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <UserIcon className="w-4 h-4" /> Edit Profile
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
              <p className="text-payae-accent text-sm font-bold tracking-widest mb-8 truncate px-2">{displayEmail}</p>
              <div className="bg-white p-4 rounded-3xl inline-block mx-auto shadow-2xl mb-6">
                <QRCodeSVG value={upiString} size={200} level="H" includeMargin={false} />
              </div>
              <p className="text-gray-400 text-xs">Scan using any PayAE camera to directly auto-fill payment details.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProfile(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-black/80 border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-md z-10 backdrop-blur-xl">
              <button onClick={() => setShowEditProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold text-white mb-6">Security & Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-payae-accent outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">App Lock PIN (4-Digits)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input type="text" maxLength={4} value={editPin} onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-payae-accent outline-none tracking-widest font-bold" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input type="password" placeholder="Leave blank to keep current" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-payae-accent outline-none" />
                  </div>
                </div>

                <button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending || editPin.length !== 4} className="w-full mt-4 bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                  {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle className="w-5 h-5"/> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}