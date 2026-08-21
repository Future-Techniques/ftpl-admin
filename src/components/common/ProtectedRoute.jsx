import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center">
        {/* Animated Brand Emblem - Smooth Gliding Pulse */}
        <div className="relative">
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#574B66]/30 via-[#D6969D]/40 to-[#574B66]/30 rounded-3xl blur-xl opacity-75 animate-pulse" />

          {/* Logo Card with Smooth Float / Glide */}
          <div className="relative p-6 rounded-2xl bg-[#574B66] shadow-2xl border border-white/15 flex items-center justify-center transform transition-all duration-700 animate-bounce">
            <img
              src="/logo-white.png"
              alt="FTPL"
              className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
