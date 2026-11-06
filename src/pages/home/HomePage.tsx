import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { Brand, Banner, RefurbishedProduct, CustomerReview } from '../../types';
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
  ShoppingBag,
  TrendingUp,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [refurbished, setRefurbished] = useState<RefurbishedProduct[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'phone' | 'laptop' | 'tablet' | 'tv'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerData, brandData, refData, reviewData] = await Promise.all([
          catalogueApi.getBanners(),
          catalogueApi.getBrands(),
          catalogueApi.getRefurbishedProducts(),
          catalogueApi.getReviews('sell'),
        ]);

        if (bannerData.length > 0) setBanners(bannerData);
        if (brandData.length > 0) setBrands(brandData);
        if (refData.length > 0) setRefurbished(refData);
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
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
              >
                <img
                  src={resolveImageUrl(b.imageUrl)}
                  alt={b.title}
                  className="w-full h-full object-cover object-center brightness-90"
                  onError={(e) => {
                    // Fallback gradient if remote banner fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent flex items-center">
                  <div className="max-w-2xl px-6 sm:px-12 py-8 space-y-3 sm:space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5" /> REVOO Direct Buyback
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-emerald-glow transition-all hover:scale-105"
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
                    className={`h-2 rounded-full transition-all ${idx === activeBannerIdx ? 'w-8 bg-emerald-500' : 'w-2 bg-white/40 hover:bg-white/70'
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Tamil Nadu's #1 Device Buyback Platform
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Sell Your Used Phone in <span className="text-emerald-400">60 Seconds</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                Get an instant guaranteed AI valuation, free doorstep pickup across all 38 districts of Tamil Nadu, and direct instant bank transfer on device handover.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/sell"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-emerald-glow transition flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Sell Device & Get Cash</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/buy"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Buy Certified Refurbished</span>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl absolute" />
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
              <Smartphone className="w-5 h-5 text-emerald-600" /> Choose Category to Sell
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
                className={`relative p-4 rounded-3xl text-left border transition-all group overflow-hidden ${isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-emerald-sm ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-300'
                  }`}
              >
                {cat.popular && (
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Highest Demand
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition">
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
              <Award className="w-5 h-5 text-emerald-600" /> Select Brand
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant valuation and doorstep pickup available for all major brands
            </p>
          </div>
          <Link
            to="/sell"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {brands.slice(0, 12).map((brand, idx) => (
            <button
              key={brand._id || brand.slug || `brand-${idx}`}
              onClick={() => navigate(`/sell?brand=${brand.slug || brand._id}`)}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-500/40 hover:-translate-y-1 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition">
                {brand.logoUrl ? (
                  <img
                    src={resolveImageUrl(brand.logoUrl)}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Smartphone className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Sell Now</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Trending Certified Refurbished Phones */}
      {refurbished.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  REVOO Verified
                </span>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ⚡ 1-Year Warranty
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                Certified Refurbished Smartphones
              </h2>
            </div>
            <Link
              to="/buy"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>View Store ({refurbished.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {refurbished.slice(0, 4).map((p, idx) => (
              <div
                key={p._id || `refurb-${idx}`}
                onClick={() => navigate(`/buy/${p._id}`)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col group"
              >
                {/* Product Thumbnail */}
                <div className="relative h-48 bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
                  <img
                    src={resolveImageUrl(p.imageUrl)}
                    alt={p.name}
                    className="max-h-40 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                      {p.inspectionScore || 96}/100 Inspected
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                      {p.batteryHealth || 95}% Battery
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {p.brand} • {p.storage}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                      {p.name}
                    </h3>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">
                        ₹{p.salePrice.toLocaleString('en-IN')}
                      </span>
                      {p.originalPrice > p.salePrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {p.originalPrice > p.salePrice && (
                      <span className="text-[10px] font-extrabold text-emerald-600">
                        Save ₹{(p.originalPrice - p.salePrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/buy/${p._id}`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View & Buy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. 3-Step Simple How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-12 border border-emerald-800/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Zero Stress • 100% Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              How Selling Works on REVOO
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Three simple steps from getting a quote to receiving direct payment in your bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-emerald-sm">
                01
              </div>
              <h3 className="text-base font-extrabold text-white">Get Instant Valuation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your phone, answer a 30-second condition checklist, and view your exact cash value calculated in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-emerald-sm">
                02
              </div>
              <h3 className="text-base font-extrabold text-white">Free Doorstep Pickup</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our verified pickup partner visits your home or office anywhere across Tamil Nadu at your chosen date and slot.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-emerald-sm">
                03
              </div>
              <h3 className="text-base font-extrabold text-white">Instant UPI / Bank Transfer</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                After a quick 2-minute diagnostic verification at your doorstep, money is deposited directly to your bank account or UPI ID.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-emerald-glow transition-all hover:scale-105"
            >
              <span>Calculate Your Phone's Worth Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Section */}
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
            {reviews.slice(0, 3).map((r, idx) => (
              <div
                key={r._id || r.customerName || `review-${idx}`}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < (r.rating || 5)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified {r.type === 'buy' ? 'Buyer' : 'Seller'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{r.customerName}</p>
                    <p className="text-[10px] text-slate-400">📍 {r.city || 'Tamil Nadu'}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {r.deviceModel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
