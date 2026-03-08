import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, Code2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeveloperCard = ({ name, role, email, github, linkedin, leetcode, delay }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay }}
      className="relative w-full max-w-sm h-[480px] perspective-[1500px]"
      onMouseMove={(e: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
    >
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full h-full bg-gradient-to-b from-white/10 to-black/80 border border-white/20 rounded-[40px] backdrop-blur-3xl p-8 flex flex-col items-center text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)] cursor-crosshair"
      >
        <div style={{ transform: "translateZ(50px)" }} className="w-28 h-28 bg-gradient-to-tr from-payae-accent to-blue-500 rounded-full mb-6 p-1 shadow-[0_0_30px_rgba(0,229,255,0.4)]">
           <div className="w-full h-full bg-[#0A0F1C] rounded-full flex items-center justify-center overflow-hidden">
             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-payae-accent to-white">{name.charAt(0)}</span>
           </div>
        </div>

        <h2 style={{ transform: "translateZ(40px)" }} className="text-2xl font-black text-white mb-1">{name}</h2>
        <p style={{ transform: "translateZ(30px)" }} className="text-sm font-bold text-payae-accent uppercase tracking-widest mb-6">{role}</p>

        <p style={{ transform: "translateZ(20px)" }} className="text-gray-400 text-sm mb-auto">
          Passionate about architecting seamless fintech solutions and pushing the boundaries of web development.
        </p>

        <div style={{ transform: "translateZ(50px)" }} className="flex items-center gap-4 mt-6">
          <a href={github} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/20 hover:text-white transition-colors text-gray-400"><Github className="w-5 h-5"/></a>
          <a href={linkedin} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-[#0A66C2] hover:text-white transition-colors text-gray-400"><Linkedin className="w-5 h-5"/></a>
          <a href={leetcode} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-[#FFA116] hover:text-white transition-colors text-gray-400"><Code2 className="w-5 h-5"/></a>
          <a href={`mailto:${email}`} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-payae-accent hover:text-black transition-colors text-gray-400"><Mail className="w-5 h-5"/></a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-payae-accent/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <nav className="relative z-20 px-6 py-8 max-w-7xl mx-auto w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black">₹</span><span className="text-payae-orange">E</span>
        </h1>
      </nav>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-payae-accent to-blue-500">Builders</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto">We are building the future of micro-investing. Connect with us to talk code, design, or finance.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
          <DeveloperCard 
            name="Anjali Rani" 
            role="Founder & Lead Engineer" 
            email="anjali@example.com"
            github="#" 
            linkedin="#" 
            leetcode="#"
            delay={0.1}
          />
          <DeveloperCard 
            name="Partner / Co-Founder" 
            role="Operations & Strategy" 
            email="cofounder@example.com"
            github="#" 
            linkedin="#" 
            leetcode="#"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
}