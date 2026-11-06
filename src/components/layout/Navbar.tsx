import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Smartphone,
  ShoppingBag,
  Truck,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { totalCount } = useCart();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & City Chip */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-emerald-sm group-hover:shadow-emerald-glow transition">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/revoo_logo.png"
                    alt="REVOO Logo"
                    className="w-7 h-7 object-contain drop-shadow"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Smartphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  REV<span className="text-emerald-600">OO</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 -mt-1">
                  Fintech Buyback
                </span>
              </div>
            </Link>

            {/* Service Location Pill (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Doorstep Pickup Across Tamil Nadu</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            <Link
              to="/sell"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/sell')
                  ? 'bg-emerald-600 text-white shadow-emerald-sm'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-white/80'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Sell Used Phone</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black uppercase">
                60s
              </span>
            </Link>

            <Link
              to="/buy"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/buy')
                  ? 'bg-emerald-600 text-white shadow-emerald-sm'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-white/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Certified</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                1-Yr War.
              </span>
            </Link>

            <Link
              to="/track"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/track')
                  ? 'bg-emerald-600 text-white shadow-emerald-sm'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-white/80'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
          </nav>

          {/* Actions: Cart & Profile / Login */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <Link
              to="/buy#cart"
              className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:block">
                    {user.fullName || user.phone}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-slide-up">
                    <div className="p-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.fullName || 'REVOO Customer'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        +91 {user.phone}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Requests & Orders</span>
                      </Link>
                      <Link
                        to="/track"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                      >
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span>Track Doorstep Pickup</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="py-2 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log In</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              {isMobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-slide-up">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 mb-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Doorstep Pickup Across Tamil Nadu</span>
          </div>

          <Link
            to="/sell"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-900 font-bold text-sm border border-emerald-200"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <span>Sell Used Phone</span>
            </div>
            <span className="text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              Instant Price
            </span>
          </Link>

          <Link
            to="/buy"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              <span>Buy Certified Phones</span>
            </div>
            <span className="text-[11px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
              Warranty
            </span>
          </Link>

          <Link
            to="/track"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200"
          >
            <Truck className="w-5 h-5 text-slate-700" />
            <span>Track Pickup Request</span>
          </Link>
        </div>
      )}
    </header>
  );
};

