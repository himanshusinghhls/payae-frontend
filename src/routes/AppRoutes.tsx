import { BrowserRouter,Routes,Route } from "react-router-dom"

import Login from "../pages/Login"
import Register from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import Portfolio from "../pages/Portfolio"
import Payment from "../pages/Payment"
import Settings from "../pages/Settings"

import ProtectedRoute from "./ProtectedRoute"

export default function AppRoutes(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }/>

        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio/>
          </ProtectedRoute>
        }/>

        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment/>
          </ProtectedRoute>
        }/>

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings/>
          </ProtectedRoute>
        }/>

      </Routes>

    </BrowserRouter>

  )

}