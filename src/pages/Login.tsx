import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage("");
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, { email: data.email, name: data.name || "User" });
      navigate("/dashboard");
    },
    onError: () => {
      setErrorMessage("Invalid email or password. Please try again.");
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/register", { name, email, password });
      return response.data;
    },
    onSuccess: () => {
      setIsLogin(true);
      setErrorMessage("");
      alert("Account created! Please log in.");
    },
    onError: () => {
      setErrorMessage("Registration failed. Email might already be in use.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-payae-brand flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-payae-green/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-payae-orange/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
          Pay<span className="text-payae-orange">A</span>
          <span className="text-payae-green -ml-2 -mr-1 rotate-[-15deg] font-black text-4xl">₹</span>
          <span className="text-payae-orange">E</span>
        </h1>
        <p className="text-gray-300 mt-3 font-medium tracking-wide">
          A Little Extra Today. A Lot Tomorrow
        </p>
      </div>

      <motion.div layout className="w-full max-w-md bg-payae-card backdrop-blur-xl border border-payae-border rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {errorMessage}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full bg-black/20 border border-payae-border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-payae-orange transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/20 border border-payae-border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-payae-orange transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/20 border border-payae-border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-payae-orange transition-colors"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-payae-orange to-[#ff9b44] text-white font-bold py-3 px-4 rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Get Started"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-black/20 p-6 text-center border-t border-payae-border">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={toggleAuthMode}
              className="ml-2 text-payae-green font-semibold hover:underline"
            >
              {isLogin ? "Register here" : "Sign in instead"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}