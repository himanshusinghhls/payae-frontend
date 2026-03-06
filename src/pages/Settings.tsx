import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, PieChart, CheckCircle2, Loader2, Plus, Minus } from "lucide-react";

type AllocationSettings = {
  savingsPercent: number;
  mutualFundPercent: number;
  goldPercent: number;
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

  const [showSuccess, setShowSuccess] = useState(false);

  const { data: initialSettings, isLoading: isFetching } = useQuery({
    queryKey: ['allocationSettings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings({
        savingsPercent: initialSettings.savingsPercent || 40,
        mutualFundPercent: initialSettings.mutualFundPercent || 40,
        goldPercent: initialSettings.goldPercent || 20,
      });
    }
  }, [initialSettings]);

  const adjustValue = (key: keyof AllocationSettings, amount: number) => {
    setSettings(prev => {
      const newValue = prev[key] + amount;
      if (newValue < 0 || newValue > 100) return prev;
      
      const others = Object.keys(prev).filter(k => k !== key) as Array<keyof AllocationSettings>;
      let newSettings = { ...prev, [key]: newValue };
      
      if (amount > 0) {
          if (newSettings[others[0]] >= amount) newSettings[others[0]] -= amount;
          else if (newSettings[others[1]] >= amount) newSettings[others[1]] -= amount;
          else return prev; 
      } else {
          if (newSettings[others[0]] < newSettings[others[1]]) newSettings[others[0]] += Math.abs(amount);
          else newSettings[others[1]] += Math.abs(amount);
      }
      return newSettings;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (newSettings: AllocationSettings) => {
      await api.post("/api/allocation/settings", newSettings);
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: () => alert("Failed to save settings. Please try again.")
  });

  const handleSave = () => saveMutation.mutate(settings);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-payae-border">
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border">
            <SettingsIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Allocation Rules</h2>
            <p className="text-sm text-gray-400 mt-1">Determine how your round-ups are distributed.</p>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-payae-accent w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Interactive Buttons */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 md:p-8 rounded-3xl shadow-2xl">
              <div className="space-y-6">
                
                {/* Savings Control */}
                <div>
                  <label className="text-blue-400 font-semibold flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" /> Liquid Savings
                  </label>
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-payae-border">
                    <button onClick={() => adjustValue("savingsPercent", -5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-bold text-xl">{settings.savingsPercent}%</span>
                    <button onClick={() => adjustValue("savingsPercent", 5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>

                {/* Mutual Fund Control */}
                <div>
                  <label className="text-payae-success font-semibold flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-payae-success" /> Mutual Funds
                  </label>
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-payae-border">
                    <button onClick={() => adjustValue("mutualFundPercent", -5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-bold text-xl">{settings.mutualFundPercent}%</span>
                    <button onClick={() => adjustValue("mutualFundPercent", 5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>

                {/* Gold Control */}
                <div>
                  <label className="text-payae-orange font-semibold flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-payae-orange" /> Digital Gold
                  </label>
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-payae-border">
                    <button onClick={() => adjustValue("goldPercent", -5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Minus size={16}/></button>
                    <span className="text-white font-bold text-xl">{settings.goldPercent}%</span>
                    <button onClick={() => adjustValue("goldPercent", 5)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"><Plus size={16}/></button>
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saveMutation.isPending} className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-70">
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Allocation Rules
              </motion.button>

              {showSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-payae-success/20 border border-payae-success/50 text-payae-success rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Settings Updated!
                </motion.div>
              )}
            </motion.div>

            {/* Right Column: Visual Preview */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-payae-card backdrop-blur-xl border border-payae-border p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center">
              <PieChart className="text-gray-500 w-16 h-16 mb-6 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Live Preview</h3>
              <p className="text-sm text-gray-400 mb-8">How a ₹100 round-up distributes based on your rules.</p>

              <div className="w-full h-12 bg-gray-800 rounded-full flex overflow-hidden shadow-inner border border-white/5">
                <motion.div className="h-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white" animate={{ width: `${settings.savingsPercent}%` }}>
                  {settings.savingsPercent > 10 ? `₹${settings.savingsPercent}` : ''}
                </motion.div>
                <motion.div className="h-full bg-payae-success flex items-center justify-center text-xs font-bold text-black" animate={{ width: `${settings.mutualFundPercent}%` }}>
                  {settings.mutualFundPercent > 10 ? `₹${settings.mutualFundPercent}` : ''}
                </motion.div>
                <motion.div className="h-full bg-payae-orange flex items-center justify-center text-xs font-bold text-white" animate={{ width: `${settings.goldPercent}%` }}>
                  {settings.goldPercent > 10 ? `₹${settings.goldPercent}` : ''}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}