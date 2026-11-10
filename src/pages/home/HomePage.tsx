import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { Brand, Banner, CustomerReview } from '../../types';
import {
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'phone' | 'laptop' | 'tablet' | 'tv'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerData, brandData, reviewData] = await Promise.all([
          catalogueApi.getBanners(),
          catalogueApi.getBrands(),
          catalogueApi.getReviews('sell'),
        ]);

        if (bannerData.length > 0) setBanners(bannerData);
        if (brandData.length > 0) setBrands(brandData);
        if (reviewData.length > 0) setReviews(reviewData);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Banner auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Promotional Banner Carousel */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {banners.length > 0 ? (
          <div className="relative h-[280px] sm:h-[380px] lg:h-[460px] w-full max-w-7xl mx-auto">
            {banners.map((b, idx) => (
              <div
                key={b._id || b.title || `banner-${idx}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={resolveImageUrl(b.imageUrl)}
                  alt={b.title}
                  className="w-full h-full object-cover object-center brightness-90"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent flex items-center">
                  <div className="max-w-2xl px-6 sm:px-12 py-8 space-y-3 sm:space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Genie Direct Buyback
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      {b.title}
                    </h1>
                    {b.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 max-w-lg line-clamp-2">
                        {b.subtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <Link
                        to={b.ctaLink || '/sell'}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-black text-xs sm:text-sm shadow-brand-glow transition-all hover:scale-105"
                      >
                        <span>{b.ctaText || 'Sell Your Phone Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Banner Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeBannerIdx ? 'w-8 bg-gradient-to-r from-rose-500 to-violet-500' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Hero if no banners returned */
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Tamil Nadu's #1 Device Buyback Platform
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Sell Your Used Phone in{' '}
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                  60 Seconds
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                Get an instant guaranteed AI valuation, free doorstep pickup across all 38 districts of Tamil Nadu, and direct instant bank transfer on device handover.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/sell"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-black text-sm shadow-brand-glow transition flex items-center gap-2 hover:scale-105"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Sell Device & Get Cash</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-rose-500/20 blur-3xl absolute" />
              <img
                src="/uploads/devices/pixel-8-pro.png"
                alt="Smartphone Buyback"
                className="relative z-10 w-72 object-contain drop-shadow-2xl animate-pulse-subtle"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* 2. Device Category Selector Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-rose-600" /> Choose Category to Sell
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your gadget to check instant exchange or buyback valuation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'phone', label: 'Mobile Phones', sub: 'iPhone, Galaxy, Pixel & more', icon: Smartphone, count: '100+ Models', popular: true },
            { id: 'laptop', label: 'Laptops', sub: 'MacBook, Dell, HP, Lenovo', icon: Laptop, count: '40+ Models' },
            { id: 'tablet', label: 'Tablets & iPads', sub: 'iPad Pro, Air, Galaxy Tab', icon: Tablet, count: '25+ Models' },
            { id: 'tv', label: 'Smart TVs', sub: 'Sony Bravia, LG OLED, Samsung', icon: Tv, count: '15+ Models' },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  navigate(`/sell?category=${cat.id}`);
                }}
                className={`relative p-4 rounded-3xl text-left border transition-all group overflow-hidden ${
                  isSelected
                    ? 'bg-rose-50/80 border-rose-500 shadow-brand-sm ring-2 ring-rose-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-rose-300'
                }`}
              >
                {cat.popular && (
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-2xs">
                    Popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-violet-600 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-600 transition">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.sub}</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 font-mono">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Brands Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-rose-600" /> Select Brand
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant valuation and doorstep pickup available for all major brands
            </p>
          </div>
          <Link
            to="/sell"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.slice(0, 12).map((b) => (
            <button
              key={b._id}
              onClick={() => navigate(`/sell?brand=${b.slug}`)}
              className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-rose-400 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 group-hover:scale-110 transition">
                <img
                  src={resolveImageUrl(b.logoUrl)}
                  alt={b.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition">
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. 3-Step Simple How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 text-white rounded-3xl p-6 sm:p-12 border border-violet-900/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto space-y-2 mb-10 relative z-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Zero Stress • 100% Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              How Selling Works on Genie
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Three simple steps from getting a quote to receiving direct payment in your bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black flex items-center justify-center text-sm shadow-brand-sm">
                01
              </div>
              <h3 className="text-base font-extrabold text-white">Get Instant Valuation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your phone, answer a 30-second condition checklist, and view your exact cash value calculated in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black flex items-center justify-center text-sm shadow-brand-sm">
                02
              </div>
              <h3 className="text-base font-extrabold text-white">Free Doorstep Pickup</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our verified pickup partner visits your home or office anywhere across Tamil Nadu at your chosen date and slot.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black flex items-center justify-center text-sm shadow-brand-sm">
                03
              </div>
              <h3 className="text-base font-extrabold text-white">Instant UPI / Bank Transfer</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                After a quick 2-minute diagnostic verification at your doorstep, money is deposited directly to your bank account or UPI ID.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center relative z-10">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-black text-sm shadow-brand-glow transition-all hover:scale-105"
            >
              <span>Calculate Your Phone's Worth Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Experiences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real feedback from customers across Chennai, Coimbatore, Madurai & Tamil Nadu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((r, idx) => {
              const customerName = r.customerName || (r as any).name || 'Verified Customer';
              const comment = r.comment || (r as any).quote || 'Fast, reliable doorstep buyback experience!';
              const deviceModel = r.deviceModel || (r as any).device || 'Smartphone';
              const city = r.city || 'Tamil Nadu';
              const amount = (r as any).amount;

              return (
                <div
                  key={r._id || `review-${customerName}-${idx}`}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3 flex flex-col justify-between hover:shadow-card-hover transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (r.rating || 5)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Verified Seller
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {customerName[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 leading-tight">{customerName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">📍 {city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        {deviceModel}
                      </span>
                      {amount && (
                        <span className="text-[10px] font-extrabold text-rose-600">
                          ₹{amount.toLocaleString('en-IN')} paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
