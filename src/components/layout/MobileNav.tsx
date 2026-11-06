import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Smartphone, ShoppingBag, Truck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user, openAuthModal } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 gap-1">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isActive('/') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          to="/sell"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isActive('/sell') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className={`w-5 h-5 ${isActive('/sell') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Sell</span>
        </Link>

        <Link
          to="/buy"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isActive('/buy') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${isActive('/buy') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Buy</span>
        </Link>

        <Link
          to="/track"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isActive('/track') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className={`w-5 h-5 ${isActive('/track') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Track</span>
        </Link>

        {user ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              isActive('/profile') ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className={`w-5 h-5 ${isActive('/profile') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-emerald-600 transition"
          >
            <User className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-0.5">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

