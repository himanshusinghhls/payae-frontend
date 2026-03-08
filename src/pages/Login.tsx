import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => { setIsLogin(location.pathname !== "/register"); }, [location.pathname]);

  const toggleAuthMode = () => navigate(isLogin ? "/register" : "/login");

  const loginMutation = useMutation({
    mutationFn: async () => await api.post("/auth/login", { email, password }),
    onSuccess: (res) => {
      login(res.data.token, { email, name: "User" });
      toast.success("Welcome back!!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Invalid email or password.")
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => await api.post("/auth/send-otp", { email }),
    onSuccess: () => {
      toast.success("OTP sent to your email!");
      setShowOtpModal(true);
    },
    onError: () => toast.error("Failed. Email might already be in use.")
  });

  const registerMutation = useMutation({
    mutationFn: async () => await api.post(`/auth/register?otp=${otp}`, { name, email, password }),
    onSuccess: () => {
      toast.success("Account verified and created! Please log in.");
      setShowOtpModal(false);
      navigate("/login");
    },
    onError: () => toast.error("Invalid OTP.")
  });

  const googleAuthMutation = useMutation({
    mutationFn: async (token: string) => await api.post("/auth/google", { token }),
    onSuccess: (res) => {
      login(res.data.token, { email: "Google User", name: "User" });
      toast.success("Secured via Google!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Google authentication failed.")
  });

  const handleGoogleClick = useGoogleLogin({
    onSuccess: (res) => googleAuthMutation.mutate(res.access_token),
    onError: () => toast.error('Google Sign-In Failed')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) loginMutation.mutate();
    else sendOtpMutation.mutate();
  };

  const isLoading = loginMutation.isPending || sendOtpMutation.isPending || googleAuthMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-payae-accent selection:text-black">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-payae-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-black/80 border border-white/10 p-8 rounded-3xl shadow-[0_30px_80px_rgba(0,229,255,0.2)] w-full max-w-sm z-10 backdrop-blur-xl text-center">
              <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h3 className="text-2xl font-black text-white mb-2">Verify Email</h3>
              <p className="text-gray-400 text-sm mb-6">Enter the 6-digit code sent to <span className="text-payae-accent">{email}</span></p>
              
              <input type="text" maxLength={6} placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 text-center text-3xl font-black text-white focus:border-payae-accent outline-none tracking-[1em] mb-6" />
              
              <button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending || otp.length !== 6} className="w-full bg-gradient-to-r from-payae-accent to-blue-500 text-black font-bold py-4 rounded-xl disabled:opacity-50 flex justify-center items-center">
                {registerMutation.isPending ? <Loader2 className="animate-spin" /> : "Verify & Create Account"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-3">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-4xl">₹</span><span className="text-payae-orange">E</span>
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-payae-accent" /> A Little Extra Today, A Lot Tomorrow
        </div>
      </div>

      <motion.div layout className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-10">
        <div className="p-8">
          
          <button onClick={() => handleGoogleClick()} disabled={isLoading} className="w-full bg-white text-black font-bold py-3.5 rounded-xl mb-6 hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.13v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.13C1.43 8.55 1 10.22 1 12s.43 3.45 1.13 4.93l3.71-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.13 7.07l3.71 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
             Continue with Google
          </button>
          
          <div className="flex items-center gap-4 mb-6">
             <div className="flex-1 h-px bg-white/10" /><span className="text-xs text-gray-500 font-bold uppercase tracking-widest">OR</span><div className="flex-1 h-px bg-white/10" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "register"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 20 : -20 }} transition={{ duration: 0.3 }}>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent outline-none transition-all" />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent outline-none transition-all" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-payae-accent outline-none transition-all" />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full mt-6 bg-gradient-to-r from-payae-accent to-blue-600 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-70">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? "Sign In" : "Request OTP"} <ArrowRight size={18} /></>}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-white/5 p-6 text-center border-t border-white/10">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={toggleAuthMode} className="ml-2 text-payae-accent font-bold hover:underline">{isLogin ? "Register here" : "Sign in instead"}</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}