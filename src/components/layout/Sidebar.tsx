import {Home,Wallet,BarChart3,Settings} from "lucide-react"
import { Link } from "react-router-dom"

export default function Sidebar(){

  return(

    <div className="w-64 bg-white shadow-lg">

      <div className="p-6 font-bold text-xl text-indigo-600">
        PayAE
      </div>

      <nav className="space-y-2 px-4">

        <Link to="/" className="flex items-center gap-3 p-3 rounded hover:bg-gray-100">
          <Home size={18}/> Dashboard
        </Link>

        <Link to="/payment" className="flex items-center gap-3 p-3 rounded hover:bg-gray-100">
          <Wallet size={18}/> Payment
        </Link>

        <Link to="/portfolio" className="flex items-center gap-3 p-3 rounded hover:bg-gray-100">
          <BarChart3 size={18}/> Portfolio
        </Link>

        <Link to="/settings" className="flex items-center gap-3 p-3 rounded hover:bg-gray-100">
          <Settings size={18}/> Settings
        </Link>

      </nav>

    </div>

  )

}