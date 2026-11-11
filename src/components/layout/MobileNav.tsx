import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Smartphone, Truck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user, openAuthModal } = useAuth();

  // Hide during the sell flow so its own sticky action bar has the full width
  if (location.pathname === '/sell') return null;

  const isActive = (path: string) => location.pathname === path;

  const itemClass = (active: boolean) =>
    `relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors ${
      active ? 'text-ink dark:text-white' : 'text-slate-500 hover:text-ink dark:text-neutral-500 dark:hover:text-neutral-200'
    }`;

  const indicator = (active: boolean) =>
    active ? <span className="absolute top-0 h-[3px] w-8 rounded-full bg-amber-400" /> : null;

  const iconClass = (active: boolean) =>
    `h-[22px] w-[22px] ${active ? 'text-amber-500' : ''}`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-neutral-900 dark:bg-black/90 lg:hidden safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-4">
        <Link to="/" className={itemClass(isActive('/'))}>
          {indicator(isActive('/'))}
          <Home className={iconClass(isActive('/'))} strokeWidth={isActive('/') ? 2.4 : 2} />
          Home
        </Link>
        <Link to="/sell" className={itemClass(isActive('/sell'))}>
          {indicator(isActive('/sell'))}
          <Smartphone className={iconClass(isActive('/sell'))} strokeWidth={isActive('/sell') ? 2.4 : 2} />
          Sell
        </Link>
        <Link to="/track" className={itemClass(isActive('/track'))}>
          {indicator(isActive('/track'))}
          <Truck className={iconClass(isActive('/track'))} strokeWidth={isActive('/track') ? 2.4 : 2} />
          Track
        </Link>
        {user ? (
          <Link to="/profile" className={itemClass(isActive('/profile'))}>
            {indicator(isActive('/profile'))}
            <User className={iconClass(isActive('/profile'))} strokeWidth={isActive('/profile') ? 2.4 : 2} />
            Profile
          </Link>
        ) : (
          <button type="button" onClick={openAuthModal} className={itemClass(false)}>
            <User className={iconClass(false)} strokeWidth={2} />
            Log in
          </button>
        )}
      </div>
    </nav>
  );
};
