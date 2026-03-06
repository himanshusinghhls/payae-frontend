import { Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="h-20 backdrop-blur-md bg-payae-bg/80 border-b border-payae-border flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* Dynamic Greeting */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Welcome back, {user?.name || "User"}
        </h2>
        <p className="text-sm text-gray-400">
          Here is your wealth overview for today.
        </p>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        
        {/* Search Bar (Visual Only for now) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-black/20 border border-payae-border rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-payae-accent w-64 transition-colors"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute 0 right-0 w-2.5 h-2.5 bg-payae-orange rounded-full border-2 border-payae-bg"></span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-payae-accent to-blue-600 flex items-center justify-center shadow-lg border border-white/10 cursor-pointer">
          <span className="text-white font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>
        </div>

      </div>
    </div>
  );
}