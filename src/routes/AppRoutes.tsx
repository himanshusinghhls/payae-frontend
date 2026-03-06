import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Payment from "../pages/Payment";
import Settings from "../pages/Settings";
import ProtectedRoute from "./ProtectedRoute";
import React from "react";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Auth Route */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Redirect old register links to our new unified auth screen */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Protected Application Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* Catch-All / 404 Route: Send unknown URLs back to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}