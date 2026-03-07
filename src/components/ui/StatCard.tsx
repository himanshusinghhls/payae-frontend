import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  highlight?: boolean;
}

export default function StatCard({ title, value, prefix = "", highlight = false }: StatCardProps) {
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const displayValue = useTransform(springValue, (current) => 
    `${prefix}${current % 1 === 0 ? current.toLocaleString() : current.toFixed(2)}`
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative p-6 rounded-2xl border backdrop-blur-xl overflow-hidden ${
        highlight 
          ? 'bg-gradient-to-br from-payae-card to-payae-success/10 border-payae-success/30 shadow-[0_0_30px_rgba(0,255,148,0.1)]' 
          : 'bg-payae-card border-payae-border'
      }`}
    >
      <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mb-2">
        {title}
      </p>
      <motion.h2 className={`text-2xl font-bold tracking-tight ${highlight ? 'text-payae-success' : 'text-white'}`}>
        {displayValue}
      </motion.h2>
    </motion.div>
  )
}