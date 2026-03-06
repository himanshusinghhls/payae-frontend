import { BrowserRouter,Routes,Route } from "react-router-dom"

import Login from "../pages/Login.tsx"
import Register from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import Portfolio from "../pages/Portfolio"
import Payment from "../pages/Payment"
import Settings from "../pages/Settings"

export default function AppRoutes(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        <Route path="/" element={<Dashboard/>} />
        <Route path="/portfolio" element={<Portfolio/>} />
        <Route path="/payment" element={<Payment/>} />
        <Route path="/settings" element={<Settings/>} />

      </Routes>

    </BrowserRouter>

  )

}