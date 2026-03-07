import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  CreditCard, 
  PieChart, 
  Settings, 
  Receipt, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/payment", name: "Make Payment", icon: CreditCard },
    { path: "/ledger", name: "Ledger", icon: Receipt },
    { path: "/portfolio", name: "Portfolio", icon: PieChart },
    { path: "/settings", name: "Allocation Rules", icon: Settings },
  ];

  return (
    <div className="w-72 bg-black/20 backdrop-blur-xl border-r border-payae-border h-screen flex flex-col relative z-20">
      
      <div className="p-8 pb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-1">
          Pay<span className="text-payae-orange">A</span>
          <span className="text-payae-green -ml-1 -mr-1 rotate-[-15deg] font-black text-2xl">₹</span>
          <span className="text-payae-orange">E</span>
        </h1>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">
          Simulation Platform
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-gradient-to-r from-payae-accent/20 to-transparent text-payae-accent border-l-2 border-payae-accent"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-payae-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Secure Logout
        </button>
      </div>
    </div>
  );
}