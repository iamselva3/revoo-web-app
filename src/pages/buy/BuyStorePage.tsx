import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { RefurbishedProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Search,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  Award,
  Filter,
  Check,
  Zap,
} from 'lucide-react';

export const BuyStorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<RefurbishedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    catalogueApi.getRefurbishedProducts().then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const brands = ['ALL', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = selectedBrand === 'ALL' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchGrade = selectedGrade === 'ALL' || p.grade === selectedGrade;
    return matchSearch && matchBrand && matchGrade;
  });

  const handleQuickAdd = (p: RefurbishedProduct) => {
    addToCart(p);
    setAddedToast(`Added ${p.name} to cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800/40 relative overflow-hidden shadow-xl">
        <div className="max-w-xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Genie Certified Refurbished
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              ⚡ Up to 70% Off MRP
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Smartphones That Feel <span className="text-emerald-400">Brand New</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Every phone undergoes a strict 32-point inspection, comes with a 12-month Genie warranty, and 7-day replacement guarantee.
          </p>
        </div>
      </div>

      {/* Added Toast */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search phones (e.g. Pixel 7 Pro, iPhone 15)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedBrand === b
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading certified store...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <p className="text-sm font-bold text-slate-700">No certified devices found.</p>
          <p className="text-xs text-slate-400">Try adjusting your search or brand filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p, idx) => {
            const savings = p.originalPrice > p.salePrice ? p.originalPrice - p.salePrice : 0;
            return (
              <div
                key={p._id || `product-${idx}`}
                onClick={() => navigate(`/buy/${p._id}`)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-52 bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
                  <img
                    src={resolveImageUrl(p.imageUrl)}
                    alt={p.name}
                    className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                    }}
                  />

                  {/* Overlays */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                      {p.inspectionScore || 96}/100 Inspected
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                      GRADE: {p.grade}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      ⚡ {p.batteryHealth || 95}% Battery
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {p.brand} • {p.storage} • {p.color}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition line-clamp-1 mt-0.5">
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
                    {savings > 0 && (
                      <span className="text-[10px] font-extrabold text-emerald-600">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>12-Month Genie Warranty</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd(p);
                      }}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/buy/${p._id}`);
                      }}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
