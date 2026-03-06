import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/client";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, PieChart, CheckCircle2, Loader2 } from "lucide-react";

type AllocationSettings = {
  savingsPercent: number;
  mutualFundPercent: number;
  goldPercent: number;
};

const fetchSettings = async (): Promise<AllocationSettings> => {
  const { data } = await api.get("/api/allocation/settings");
  return data.data || { savingsPercent: 40, mutualFundPercent: 40, goldPercent: 20 };
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
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleSliderChange = (key: keyof AllocationSettings, newValue: number) => {
    const others = Object.keys(settings).filter((k) => k !== key) as Array<keyof AllocationSettings>;
    const remaining = 100 - newValue;

    const newSettings = { ...settings, [key]: newValue };
    if (settings[others[0]] + settings[others[1]] === 0) {
      newSettings[others[0]] = Math.floor(remaining / 2);
      newSettings[others[1]] = Math.ceil(remaining / 2);
    } else {
      const ratio = settings[others[0]] / (settings[others[0]] + settings[others[1]]);
      newSettings[others[0]] = Math.round(remaining * ratio);
      newSettings[others[1]] = remaining - newSettings[others[0]];
    }

    setSettings(newSettings);
  };

  const saveMutation = useMutation({
    mutationFn: async (newSettings: AllocationSettings) => {
      await api.post("/api/allocation/settings", newSettings);
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to save settings. Please try again.");
    }
  });

  const handleSave = () => {
    const total = settings.savingsPercent + settings.mutualFundPercent + settings.goldPercent;
    if (total !== 100) {
      alert("Allocations must equal exactly 100%");
      return;
    }
    saveMutation.mutate(settings);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6">
        
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-payae-border">
          <div className="bg-payae-card p-3 rounded-xl border border-payae-border">
            <SettingsIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Allocation Rules</h2>
            <p className="text-sm text-gray-400 mt-1">Determine how your round-ups are distributed.</p>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-payae-accent w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Interactive Sliders */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-payae-card backdrop-blur-xl border border-payae-border p-8 rounded-3xl shadow-2xl"
            >
              <div className="space-y-8">
                
                {/* Savings Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-blue-400 font-semibold flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" /> Liquid Savings
                    </label>
                    <span className="text-white font-bold">{settings.savingsPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={settings.savingsPercent}
                    onChange={(e) => handleSliderChange("savingsPercent", Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Mutual Fund Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-payae-success font-semibold flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-payae-success" /> Mutual Funds
                    </label>
                    <span className="text-white font-bold">{settings.mutualFundPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={settings.mutualFundPercent}
                    onChange={(e) => handleSliderChange("mutualFundPercent", Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-payae-success"
                  />
                </div>

                {/* Gold Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-payae-orange font-semibold flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-payae-orange" /> Digital Gold
                    </label>
                    <span className="text-white font-bold">{settings.goldPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={settings.goldPercent}
                    onChange={(e) => handleSliderChange("goldPercent", Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-payae-orange"
                  />
                </div>

              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full mt-10 bg-white text-black font-bold py-4 px-4 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-70"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Allocation Rules
              </motion.button>

              {/* Success Feedback */}
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-payae-success/20 border border-payae-success/50 text-payae-success rounded-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Settings Updated!
                </motion.div>
              )}
            </motion.div>

            {/* Right Column: Visual Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-payae-card backdrop-blur-xl border border-payae-border p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center"
            >
              <PieChart className="text-gray-500 w-16 h-16 mb-6 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Live Preview</h3>
              <p className="text-sm text-gray-400 mb-8">
                Here is how a ₹100 round-up will be distributed automatically based on your new rules.
              </p>

              {/* Dynamic Stacked Bar */}
              <div className="w-full h-12 bg-gray-800 rounded-full flex overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  className="h-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                  animate={{ width: `${settings.savingsPercent}%` }}
                >
                  {settings.savingsPercent > 10 ? `₹${settings.savingsPercent}` : ''}
                </motion.div>
                <motion.div 
                  className="h-full bg-payae-success flex items-center justify-center text-xs font-bold text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                  animate={{ width: `${settings.mutualFundPercent}%` }}
                >
                  {settings.mutualFundPercent > 10 ? `₹${settings.mutualFundPercent}` : ''}
                </motion.div>
                <motion.div 
                  className="h-full bg-payae-orange flex items-center justify-center text-xs font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                  animate={{ width: `${settings.goldPercent}%` }}
                >
                  {settings.goldPercent > 10 ? `₹${settings.goldPercent}` : ''}
                </motion.div>
              </div>
              
              <div className="w-full flex justify-between mt-4 text-xs font-semibold text-gray-500">
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