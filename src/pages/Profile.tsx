import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, KeyRound, ShieldCheck, Loader2, CheckCircle, AlertTriangle, ShieldAlert, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import toast from "react-hot-toast";

export default function Profile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({ 
    queryKey: ['userProfile'], 
    queryFn: async () => { const res = await api.get("/api/users/me"); return res.data; } 
  });

  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editGoal, setEditGoal] = useState("");
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState("");
  const [pinErrorShake, setPinErrorShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPin(profile.pin || "0000");
      setEditGoal(profile.wealthGoal || "2000");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (editName && editName !== profile?.name) payload.name = editName;
      if (editPassword) payload.password = editPassword;
      if (editPin && editPin !== profile?.pin) payload.pin = editPin; 
      if (editGoal && editGoal !== profile?.wealthGoal) payload.wealthGoal = editGoal;
      
      if (Object.keys(payload).length > 0) {
        await api.put("/api/users/profile", payload);
      }
      return true;
    },
    onSuccess: () => {
      toast.success("Security & Profile updated successfully!");
      setEditPassword("");
      setIsUnlocked(false);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  });

  const handleUnlock = () => {
    if (unlockPinInput === profile?.pin) {
      setIsUnlocked(true);
      setShowUnlockModal(false);
      setUnlockPinInput("");
    } else {
      setPinErrorShake(true);
      setTimeout(() => {
        setPinErrorShake(false);
        setUnlockPinInput("");
      }, 500);
      toast.error("Incorrect PIN");
    }
  };

  const forgotPinMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/forgot-pin"),
    onSuccess: () => {
      setShowUnlockModal(false);
      setShowForgotModal(true);
      toast.success("OTP sent to your email!");
    },
    onError: () => toast.error("Failed to send OTP email.")
  });

  const resetPinMutation = useMutation({
    mutationFn: async () => await api.post("/api/users/reset-pin", { otp: otpInput, newPin: newPinInput }),
    onSuccess: () => {
      toast.success("PIN reset successfully!");
      setShowForgotModal(false);
      setOtpInput("");
      setNewPinInput("");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Invalid OTP")
  });

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        <AnimatePresence>
          {showUnlockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-payae-bg border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                 <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                 <h2 className="text-xl font-bold text-white mb-2">Unlock Security Settings</h2>
                 <p className="text-xs text-gray-400 mb-6">Enter your current 4-digit PIN to make changes.</p>
                 
                 <motion.input 
                    animate={pinErrorShake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}
                    type="password" maxLength={4} value={unlockPinInput} onChange={(e) => setUnlockPinInput(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-4 text-center text-white text-2xl tracking-[1em] focus:border-payae-accent outline-none mb-4" 
                    placeholder="****"
                 />
                 
                 <button onClick={handleUnlock} disabled={unlockPinInput.length !== 4} className="w-full bg-payae-accent text-black font-bold py-3 rounded-xl disabled:opacity-50 mb-3">Verify PIN</button>
                 
                 <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center mb-4">
                   <span className="text-gray-300 text-xs font-semibold">Default PIN is <strong className="text-payae-accent tracking-widest ml-1 text-sm">0000</strong></span>
                 </div>
                 
                 <button onClick={() => forgotPinMutation.mutate()} className="text-xs text-gray-400 hover:text-white underline">Forgot PIN?</button>
                 <button onClick={() => setShowUnlockModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-payae-bg border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                 <h2 className="text-xl font-bold text-white mb-2">Reset PIN</h2>
                 <p className="text-xs text-gray-400 mb-6">Enter the 6-digit OTP sent to {profile?.email}</p>
                 
                 <input type="text" maxLength={6} placeholder="6-Digit OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-center text-white text-lg tracking-[0.5em] mb-4 outline-none focus:border-payae-accent" />
                 <input type="text" maxLength={4} placeholder="New 4-Digit PIN" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-center text-white text-lg tracking-[1em] mb-6 outline-none focus:border-payae-accent" />
                 
                 <button onClick={() => resetPinMutation.mutate()} disabled={otpInput.length !== 6 || newPinInput.length !== 4 || resetPinMutation.isPending} className="w-full bg-payae-accent text-black font-bold py-3 rounded-xl disabled:opacity-50">
                    {resetPinMutation.isPending ? <Loader2 className="animate-spin mx-auto w-5 h-5"/> : "Set New PIN"}
                 </button>
                 <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl mb-8">
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <span className="text-white font-black text-2xl">{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">{profile?.name} <ShieldCheck className="w-5 h-5 text-payae-success"/></h2>
                <p className="text-gray-400 text-sm tracking-widest">{profile?.email}</p>
              </div>
            </div>
            {!isUnlocked && (
               <button onClick={() => setShowUnlockModal(true)} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                  <Lock className="w-3 h-3"/> Unlock to Edit
               </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!isUnlocked} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block flex items-center gap-1">Primary Email <Lock className="w-3 h-3 text-gray-600"/></label>
                <div className="relative">
                  <input type="email" value={profile?.email} disabled className="w-full bg-black/60 border border-white/5 rounded-xl py-4 px-4 text-gray-500 cursor-not-allowed shadow-inner font-semibold" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block flex items-center gap-1">Change Password {!isUnlocked && <Lock className="w-3 h-3 text-gray-600"/>}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input type={isUnlocked ? "password" : "text"} placeholder={isUnlocked ? "Enter new password" : "••••••••••••"} value={isUnlocked ? editPassword : ""} onChange={(e) => setEditPassword(e.target.value)} disabled={!isUnlocked} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none disabled:opacity-50 disabled:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>App Lock PIN</span>
                  {!isUnlocked && <Lock className="w-3 h-3 text-gray-600"/>}
                  {isUnlocked && editPin.length !== 4 && <span className="text-red-400 text-[10px] ml-auto flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Must be 4 digits</span>}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input type={isUnlocked ? "text" : "password"} maxLength={4} value={isUnlocked ? editPin : "1234"} onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ''))} disabled={!isUnlocked} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none tracking-[1em] font-black disabled:opacity-50 disabled:text-gray-500" />
                </div>
              </div>
            </div>
            
            <div className="pt-6 mt-4 border-t border-white/10">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                Target Wealth Goal {!isUnlocked && <Lock className="w-3 h-3 text-gray-600"/>}
              </label>
              <div className="relative max-w-md">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="number" 
                  value={editGoal} 
                  onChange={(e) => setEditGoal(e.target.value)} 
                  disabled={!isUnlocked} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-bold focus:border-payae-accent outline-none disabled:opacity-50 disabled:text-gray-500" 
                  placeholder="e.g. 50000" 
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">This dictates the size of your Coin Jar on the Dashboard.</p>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
            <button 
              onClick={() => updateProfileMutation.mutate()} 
              disabled={!isUnlocked || updateProfileMutation.isPending || (isUnlocked && editPin.length !== 4)} 
              className={`font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all ${isUnlocked ? 'bg-gradient-to-r from-payae-accent to-blue-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'bg-white/10 text-gray-400 cursor-not-allowed'}`}
            >
              {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle className="w-5 h-5"/> Save Security Settings</>}
            </button>
          </div>

        </motion.div>
      </div>
    </AppLayout>
  );
}