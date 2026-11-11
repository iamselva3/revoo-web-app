import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { PromotionalPopup } from '../common/PromotionalPopup';
import { AuthModal } from '../common/AuthModal';
import { LocationPicker, LocationPrompt } from '../location/LocationPicker';
import { usePageLoading } from '../../context/PageLoadingContext';

export const Layout: React.FC = () => {
  const { isPageLoading } = usePageLoading();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-black">
        <Outlet />
      </main>
      {/* Hide footer completely while body is loading data from the backend */}
      {!isPageLoading && <Footer />}
      <MobileNav />
      <PromotionalPopup />
      <AuthModal />
      <LocationPicker />
      <LocationPrompt />
    </div>
  );
};
