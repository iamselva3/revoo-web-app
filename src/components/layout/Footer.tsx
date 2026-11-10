import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  CheckCircle,
  Mail,
  Phone,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 lg:pb-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Valuation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Guaranteed AI valuation calculated in under 60 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Doorstep Pickup</h4>
              <p className="text-xs text-slate-400 mt-1">
                Verified personnel arrive right at your home or office.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Certified Data Wipe</h4>
              <p className="text-xs text-slate-400 mt-1">
                100% military-grade data erasure with digital certificate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Bank Payout</h4>
              <p className="text-xs text-slate-400 mt-1">
                Direct UPI or IMPS bank transfer on device handover.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <img
                src="/genie_logo_light.png"
                alt="Genie"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="h-9 w-auto object-contain select-none pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/genie_logo_transparent.png';
                }}
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier circular fintech platform for used smartphones. Sell instantly at top market rates with guaranteed doorstep cash and certified data wipe.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-800/60 w-fit">
              <CheckCircle className="w-4 h-4 text-rose-400" />
              <span>Certified Buyback Marketplace</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Sell Old Devices
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link to="/sell" className="hover:text-rose-400 transition">Sell Apple iPhone</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Sell Samsung Galaxy</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Sell Google Pixel</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Sell OnePlus Phone</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Sell Laptops & MacBooks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Buyback Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link to="/sell" className="hover:text-rose-400 transition">Free Doorstep Pickup</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Instant UPI & Cash Payout</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Certified 100% Data Wipe</Link></li>
              <li><Link to="/sell" className="hover:text-rose-400 transition">Best Market Price Guaranteed</Link></li>
              <li><Link to="/track" className="hover:text-rose-400 transition">Track Pickup Status</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-rose-400 shrink-0" />
              <span>+91 94420 54321 (9 AM - 8 PM IST)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-rose-400 shrink-0" />
              <span>support@genie.in</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Genie. All rights reserved. Circular device re-commerce.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
