import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { motion } from "framer-motion"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-payae-bg min-h-screen text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        {/* Subtle ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-payae-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-payae-success/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Topbar />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8 z-10 overflow-y-auto h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}