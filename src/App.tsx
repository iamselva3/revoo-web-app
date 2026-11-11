import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PageLoadingProvider } from './context/PageLoadingContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/common/ScrollToTop';

// Pages
import { HomePage } from './pages/home/HomePage';
import { SellDevicePage } from './pages/sell/SellDevicePage';
import { DoorstepPickupPage } from './pages/pickup/DoorstepPickupPage';
import { BuyStorePage } from './pages/buy/BuyStorePage';
import { ProductDetailPage } from './pages/buy/ProductDetailPage';
import { TrackOrderPage } from './pages/tracking/TrackOrderPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
          <CartProvider>
            <BrowserRouter>
              <PageLoadingProvider>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="sell" element={<SellDevicePage />} />
                    <Route path="pickup" element={<DoorstepPickupPage />} />
                    <Route path="buy" element={<BuyStorePage />} />
                    <Route path="buy/:id" element={<ProductDetailPage />} />
                    <Route path="track" element={<TrackOrderPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="privacy" element={<PrivacyPolicyPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </PageLoadingProvider>
            </BrowserRouter>
          </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

