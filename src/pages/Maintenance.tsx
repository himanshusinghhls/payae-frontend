import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ServerCrash, ShieldAlert, Mail } from "lucide-react";

export default function Maintenance() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const xPct = clientX / window.innerWidth - 0.5;
    const yPct = clientY / window.innerHeight - 0.5;
    
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      className="min-h-screen bg-[#060A14] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-payae-accent selection:text-black"
      style={{ perspective: "1200px" }}
    >

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-50 opacity-40" />
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-end justify-center">
        <motion.div
          animate={{ backgroundPosition: ['0px 0px', '0px 60px'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-[200vw] h-[70vh] absolute bottom-[-10%]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 229, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 229, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(600px) rotateX(75deg)',
            transformOrigin: 'top center',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
          }}
        />
      </div>

      <div className="absolute top-[10%] w-[80%] h-[40%] bg-payae-accent/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-payae-accent/50 animate-pulse shadow-[0_0_30px_#00E5FF] z-10" />

      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="z-20 text-center max-w-lg w-full flex flex-col items-center justify-center min-h-[80vh] cursor-crosshair"
      >
        <div style={{ transform: "translateZ(60px)" }} className="flex justify-center mb-8 w-full">
           <motion.div 
             animate={{ opacity: [1, 0.7, 1, 0.4, 1], scale: [1, 0.98, 1, 1.02, 1] }} 
             transition={{ repeat: Infinity, duration: 3, times: [0, 0.2, 0.4, 0.5, 1] }}
           >
             <ShieldAlert className="w-24 h-24 text-payae-orange mx-auto mb-4 drop-shadow-[0_0_30px_rgba(245,130,32,0.9)]" />
           </motion.div>
        </div>

        <h1 style={{ transform: "translateZ(40px)" }} className="text-4xl md:text-6xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-4 opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Pay<span className="text-payae-orange">A</span><span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-4xl md:text-5xl drop-shadow-md">₹</span><span className="text-payae-orange">E</span>
        </h1>

        <div style={{ transform: "translateZ(50px)" }} className="glitch-wrapper mb-10 w-full">
          <h2 className="text-2xl md:text-4xl font-black text-white glitch-text uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" data-text="SYSTEM OVERRIDE">
            UNDER MAINTENANCE
          </h2>
        </div>

        <div style={{ transform: "translateZ(20px)" }} className="bg-black/40 border border-white/20 p-6 md:p-8 rounded-3xl backdrop-blur-2xl text-left w-full shadow-[0_30px_60px_rgba(0,229,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-payae-accent to-payae-success" />
          
          <div className="flex items-center gap-3 mb-4 text-payae-accent font-bold uppercase tracking-widest text-xs">
            <ServerCrash className="w-4 h-4" /> Core Upgrades in progress
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
            Our master routing nodes are currently offline for scheduled infrastructure maintenance. Wealth routing, UPI payments, and portfolio interactions are temporarily disabled.
          </p>
          <div className="bg-payae-success/10 border border-payae-success/40 p-4 rounded-2xl flex items-start gap-3 shadow-[inset_0_0_20px_rgba(0,255,148,0.05)]">
            <div className="w-2.5 h-2.5 rounded-full bg-payae-success mt-1 animate-pulse shrink-0 drop-shadow-[0_0_10px_#00FF94]" />
            <p className="text-payae-success text-xs font-bold leading-relaxed tracking-wide">
              System Lock Engaged. Your virtual balance, ledger data, and stored assets are deeply encrypted and 100% safe.
            </p>
          </div>
        </div>

        <div style={{ transform: "translateZ(30px)" }} className="mt-10 text-payae-accent text-[12px] md:text-sm font-mono uppercase tracking-[0.3em] font-black drop-shadow-[0_0_12px_rgba(0,229,255,0.9)] animate-pulse">
          Estimated Time to Resolve: &lt; 2 Hours
        </div>
      </motion.div>

      <div className="absolute bottom-8 z-30">
        <a 
          href="mailto:payae.in@gmail.com" 
          className="flex items-center gap-2 text-gray-400 hover:text-payae-accent transition-colors duration-300 text-xs font-bold uppercase tracking-widest bg-black/60 px-5 py-2.5 rounded-full border border-white/10 hover:border-payae-accent/50 backdrop-blur-xl group shadow-lg"
        >
          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Contact Support
        </a>
      </div>

    </div>
  );
}