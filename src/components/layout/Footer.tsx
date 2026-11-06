import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  CheckCircle,
  MapPin,
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
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
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                REV<span className="text-emerald-500">OO</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's smart circular fintech platform for used smartphones. Sell instantly at top market rates or buy certified refurbished devices with a 1-year warranty.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60 w-fit">
              <CheckCircle className="w-4 h-4" />
              <span>Certified Refurbished & Buyback Partner</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Sell Old Devices
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link to="/sell" className="hover:text-emerald-400 transition">Sell Apple iPhone</Link></li>
              <li><Link to="/sell" className="hover:text-emerald-400 transition">Sell Samsung Galaxy</Link></li>
              <li><Link to="/sell" className="hover:text-emerald-400 transition">Sell Google Pixel</Link></li>
              <li><Link to="/sell" className="hover:text-emerald-400 transition">Sell OnePlus Phone</Link></li>
              <li><Link to="/sell" className="hover:text-emerald-400 transition">Sell Laptops & MacBooks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Buy Refurbished
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link to="/buy" className="hover:text-emerald-400 transition">Pristine Grade Phones</Link></li>
              <li><Link to="/buy" className="hover:text-emerald-400 transition">32-Point Quality Inspected</Link></li>
              <li><Link to="/buy" className="hover:text-emerald-400 transition">12-Month REVOO Warranty</Link></li>
              <li><Link to="/buy" className="hover:text-emerald-400 transition">7-Day Replacement Policy</Link></li>
              <li><Link to="/track" className="hover:text-emerald-400 transition">Track Delivery</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+91 94420 54321 (9 AM - 8 PM IST)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>support@revoo.in</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Coimbatore & Chennai Regional Hubs, Tamil Nadu</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} REVOO Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition">E-Waste Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

