import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, PieChart, CheckCircle2, Loader2, Plus, Minus, Power, Wallet, TrendingUp, Coins } from "lucide-react";
import toast from "react-hot-toast";

type AllocationSettings = {
  savingsPercent: number;
  mutualFundPercent: number;
  goldPercent: number;
};

type ActiveAssets = {
  savingsPercent: boolean;
  mutualFundPercent: boolean;
  goldPercent: boolean;
};

const fetchSettings = async (): Promise<AllocationSettings> => {
  const response = await api.get("/api/allocation/settings");
  const data = response.data?.data || response.data;
  return data || { savingsPercent: 40, mutualFundPercent: 40, goldPercent: 20 };
};

export default function Settings() {
  const [settings, setSettings] = useState<AllocationSettings>({
    savingsPercent: 40,
    mutualFundPercent: 40,
    goldPercent: 20,
  });

  const [activeAssets, setActiveAssets] = useState<ActiveAssets>({
    savingsPercent: true,
    mutualFundPercent: true,
    goldPercent: true,
  });

  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(() => localStorage.getItem('autoSaveEnabled') !== 'false');

  const { data: initialSettings, isLoading: isFetching } = useQuery({
    queryKey: ['allocationSettings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings({
        savingsPercent: initialSettings.savingsPercent || 0,
        mutualFundPercent: initialSettings.mutualFundPercent || 0,
        goldPercent: initialSettings.goldPercent || 0,
      });
      setActiveAssets({
        savingsPercent: (initialSettings.savingsPercent || 0) > 0,
        mutualFundPercent: (initialSettings.mutualFundPercent || 0) > 0,
        goldPercent: (initialSettings.goldPercent || 0) > 0,
      });
    }
  }, [initialSettings]);

  const toggleMasterSwitch = () => {
    const newValue = !isAutoSaveEnabled;
    setIsAutoSaveEnabled(newValue);
    localStorage.setItem('autoSaveEnabled', String(newValue));
  };

  const handleToggleAsset = (key: keyof AllocationSettings) => {
    const isCurrentlyActive = activeAssets[key];
    const activeCount = Object.values(activeAssets).filter(Boolean).length;

    if (isCurrentlyActive && activeCount === 1) {
      toast.error("At least one investment asset must remain active.");
      return;
    }

    if (isCurrentlyActive) {
      const valToRedistribute = settings[key];
      const otherActive = Object.keys(activeAssets).filter(k => k !== key && activeAssets[k as keyof ActiveAssets]) as Array<keyof AllocationSettings>;

      const newSettings = { ...settings, [key]: 0 };

      if (valToRedistribute > 0) {
        if (otherActive.length === 1) {
          newSettings[otherActive[0]] += valToRedistribute;
        } else if (otherActive.length === 2) {
          const half = Math.floor(valToRedistribute / 2);
          const rem = valToRedistribute % 2;
          newSettings[otherActive[0]] += half + rem;
          newSettings[otherActive[1]] += half;
        }
      }
      setSettings(newSettings);
      setActiveAssets(prev => ({ ...prev, [key]: false }));
    } else {
      setActiveAssets(prev => ({ ...prev, [key]: true }));
    }
  };

  const adjustValue = (key: keyof AllocationSettings, amount: number) => {
    if (!activeAssets[key]) return;

    setSettings(prev => {
      const newValue = prev[key] + amount;
      if (newValue < 0 || newValue > 100) return prev;

      const others = Object.keys(activeAssets).filter(k => k !== key && activeAssets[k as keyof ActiveAssets]) as Array<keyof AllocationSettings>;
      
      if (others.length === 0) return prev; 

      const newSettings = { ...prev, [key]: newValue };

      if (amount > 0) {
        let stolen = 0;
        for (const oKey of others) {
          if (stolen === amount) break;
          const available = newSettings[oKey];
          const toSteal = Math.min(available, amount - stolen);
          newSettings[oKey] -= toSteal;
          stolen += toSteal;
        }
        if (stolen < amount) return prev; 
      } else {
        newSettings[others[0]] += Math.abs(amount);
      }

      return newSettings;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (newSettings: AllocationSettings) => {
      await api.post("/api/allocation/settings", newSettings);
    },
    onSuccess: () => {
      toast.success("Allocation Rules Saved!");
    },
    onError: () => toast.error("Failed to save settings.")
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto mt-4">
        
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
            <SettingsIcon className="text-payae-accent w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Allocation Rules</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Determine how your automated round-ups are distributed.</p>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-payae-accent w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
              
              <div className="bg-gradient-to-r from-white/5 to-transparent p-5 rounded-2xl border border-white/10 flex justify-between items-center mb-6 shadow-inner">
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Power className={`w-4 h-4 ${isAutoSaveEnabled ? 'text-payae-success' : 'text-gray-500'}`} />
                    Master Auto-Save
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Global routing switch</p>
                </div>
                <button 
                  onClick={toggleMasterSwitch} 
                  className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 shadow-inner ${isAutoSaveEnabled ? 'bg-payae-success' : 'bg-gray-700'}`}
                >
                  <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-md" animate={{ x: isAutoSaveEnabled ? 28 : 0 }} />
                </button>
              </div>

              <div className={`space-y-4 ${!isAutoSaveEnabled ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''} transition-all duration-300`}>
                
                <div className={`bg-black/40 border border-white/5 p-4 rounded-2xl transition-opacity duration-300 ${!activeAssets.savingsPercent ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Liquid Savings
                    </label>
                    <button onClick={() => handleToggleAsset('savingsPercent')} className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors shadow-inner ${activeAssets.savingsPercent ? 'bg-[#00E5FF]' : 'bg-gray-700'}`}>
                      <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow-md" animate={{ x: activeAssets.savingsPercent ? 20 : 0 }} />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between bg-black/60 p-1.5 rounded-xl border border-white/5 shadow-inner ${!activeAssets.savingsPercent ? 'pointer-events-none' : ''}`}>
                    <button onClick={() => adjustValue("savingsPercent", -5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-black text-xl w-16 text-center">{settings.savingsPercent}%</span>
                    <button onClick={() => adjustValue("savingsPercent", 5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>

                <div className={`bg-black/40 border border-white/5 p-4 rounded-2xl transition-opacity duration-300 ${!activeAssets.mutualFundPercent ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[#00FF94] text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Mutual Funds
                    </label>
                    <button onClick={() => handleToggleAsset('mutualFundPercent')} className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors shadow-inner ${activeAssets.mutualFundPercent ? 'bg-[#00FF94]' : 'bg-gray-700'}`}>
                      <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow-md" animate={{ x: activeAssets.mutualFundPercent ? 20 : 0 }} />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between bg-black/60 p-1.5 rounded-xl border border-white/5 shadow-inner ${!activeAssets.mutualFundPercent ? 'pointer-events-none' : ''}`}>
                    <button onClick={() => adjustValue("mutualFundPercent", -5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-black text-xl w-16 text-center">{settings.mutualFundPercent}%</span>
                    <button onClick={() => adjustValue("mutualFundPercent", 5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>

                <div className={`bg-black/40 border border-white/5 p-4 rounded-2xl transition-opacity duration-300 ${!activeAssets.goldPercent ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[#f58220] text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Digital Gold
                    </label>
                    <button onClick={() => handleToggleAsset('goldPercent')} className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors shadow-inner ${activeAssets.goldPercent ? 'bg-[#f58220]' : 'bg-gray-700'}`}>
                      <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow-md" animate={{ x: activeAssets.goldPercent ? 20 : 0 }} />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between bg-black/60 p-1.5 rounded-xl border border-white/5 shadow-inner ${!activeAssets.goldPercent ? 'pointer-events-none' : ''}`}>
                    <button onClick={() => adjustValue("goldPercent", -5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-black text-xl w-16 text-center">{settings.goldPercent}%</span>
                    <button onClick={() => adjustValue("goldPercent", 5)} className="p-3 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saveMutation.isPending || !isAutoSaveEnabled} className="w-full mt-6 bg-gradient-to-r from-payae-accent to-blue-600 text-black font-black py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Allocation Rules
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-payae-accent/10 rounded-full blur-[80px] pointer-events-none" />
              
              <PieChart className="text-gray-500 w-12 h-12 mb-4 opacity-50 relative z-10" />
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Live Algorithm Preview</h3>
              <p className="text-xs text-gray-400 mb-10 max-w-xs relative z-10">This is how a standard <span className="text-white font-bold">₹100</span> round-up will be automatically distributed into your portfolio.</p>

              <div className="w-full h-8 bg-gray-900 rounded-full flex overflow-hidden shadow-inner border border-white/5 relative z-10">
                <motion.div className="h-full bg-[#00E5FF] flex items-center justify-center text-[10px] font-bold text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" animate={{ width: `${settings.savingsPercent}%` }} transition={{ type: "spring", stiffness: 100 }}>
                  {settings.savingsPercent > 10 ? `₹${settings.savingsPercent}` : ''}
                </motion.div>
                <motion.div className="h-full bg-[#00FF94] flex items-center justify-center text-[10px] font-bold text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" animate={{ width: `${settings.mutualFundPercent}%` }} transition={{ type: "spring", stiffness: 100 }}>
                  {settings.mutualFundPercent > 10 ? `₹${settings.mutualFundPercent}` : ''}
                </motion.div>
                <motion.div className="h-full bg-[#f58220] flex items-center justify-center text-[10px] font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" animate={{ width: `${settings.goldPercent}%` }} transition={{ type: "spring", stiffness: 100 }}>
                  {settings.goldPercent > 10 ? `₹${settings.goldPercent}` : ''}
                </motion.div>
              </div>

              <div className="w-full flex justify-between mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 relative z-10">
                 <span>0%</span>
                 <span>100%</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}