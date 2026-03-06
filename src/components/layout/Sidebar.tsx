import { Link } from "react-router-dom"

export default function Sidebar(){

  return(

    <div className="w-60 bg-white border-r h-screen p-6">

      <h1 className="text-xl font-bold mb-8">
        PayAE
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/">Dashboard</Link>
        <Link to="/payment">Payment</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/settings">Settings</Link>

      </nav>

    </div>

  )

}