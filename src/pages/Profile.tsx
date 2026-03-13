import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { motion } from "framer-motion";
import { User, Lock, KeyRound, ShieldCheck, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
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
  const [editPin, setEditPin] = useState("0000");

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPin(profile.pin || "0000");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (editName && editName !== profile?.name) payload.name = editName;
      if (editPassword) payload.password = editPassword;
      if (editPin && editPin !== profile?.pin) payload.pin = editPin; 
      
      if (Object.keys(payload).length > 0) {
        await api.put("/api/users/profile", payload);
      }
      return true;
    },
    onSuccess: () => {
      toast.success("Security & Profile updated successfully!");
      setEditPassword("");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  });

  if (isLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-payae-accent" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <span className="text-white font-black text-2xl">{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">{profile?.name} <ShieldCheck className="w-5 h-5 text-payae-success"/></h2>
              <p className="text-gray-400 text-sm tracking-widest">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none focus:bg-white/10 transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block flex items-center gap-1">Primary Email <Lock className="w-3 h-3 text-gray-600"/></label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={profile?.email} 
                    disabled 
                    className="w-full bg-black/60 border border-white/5 rounded-xl py-4 px-4 text-gray-500 cursor-not-allowed shadow-inner font-semibold" 
                  />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Change Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep current" 
                    value={editPassword} 
                    onChange={(e) => setEditPassword(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none focus:bg-white/10 transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>App Lock PIN</span>
                  {editPin.length !== 4 && <span className="text-red-400 text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Must be 4 digits</span>}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    maxLength={4} 
                    value={editPin} 
                    onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-payae-accent outline-none tracking-[1em] font-black focus:bg-white/10 transition-colors" 
                  />
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
            <button 
              onClick={() => updateProfileMutation.mutate()} 
              disabled={updateProfileMutation.isPending || editPin.length !== 4} 
              className="bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle className="w-5 h-5"/> Save Security Settings</>}
            </button>
          </div>

        </motion.div>
      </div>
    </AppLayout>
  );
}