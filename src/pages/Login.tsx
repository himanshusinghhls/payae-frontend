import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIsLogin(location.pathname !== "/register");
  }, [location.pathname]);

  const toggleAuthMode = () => {
    navigate(isLogin ? "/register" : "/login");
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, { email: data.email, name: data.name || "User" });
      toast.success("Welcome!!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Invalid email or password.")
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/register", { name, email, password });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account created! Please log in.");
      navigate("/login");
    },
    onError: () => toast.error("Registration failed. Email might be in use.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) loginMutation.mutate();
    else registerMutation.mutate();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-payae-accent selection:text-black">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-payae-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-3">
          Pay<span className="text-payae-orange">A</span>
          <span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-4xl">₹</span>
          <span className="text-payae-orange">E</span>
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-payae-accent" /> A Little Extra Today, A Lot Tomorrow
        </div>
      </div>

      <motion.div layout className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-10">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "register"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 20 : -20 }} transition={{ duration: 0.3 }}>
              
              <h2 className="text-2xl font-bold text-white mb-6">
                {isLogin ? "Welcome!!" : "Create your account"}
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent focus:bg-white/10 outline-none transition-all" />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent focus:bg-white/10 outline-none transition-all" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent focus:bg-white/10 outline-none transition-all" />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full mt-6 bg-gradient-to-r from-payae-accent to-blue-600 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? "Sign In" : "Start Investing"} <ArrowRight size={18} /></>}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-white/5 p-6 text-center border-t border-white/10">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={toggleAuthMode} className="ml-2 text-payae-accent font-bold hover:underline">
              {isLogin ? "Register here" : "Sign in instead"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}