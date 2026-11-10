import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { RefurbishedProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { usePageLoading } from '../../context/PageLoadingContext';
import { PageLoadingSkeleton } from '../../components/common/PageLoadingSkeleton';
import {
  ShieldCheck,
  BatteryMedium,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Zap,
  Truck,
  RotateCcw,
  Star,
  Check,
  Share2,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setIsPageLoading } = usePageLoading();

  const [product, setProduct] = useState<RefurbishedProduct | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsPageLoading(true);
    catalogueApi.getRefurbishedProducts().then((list) => {
      const match = list.find((p) => p._id === id);
      if (match) {
        setProduct(match);
      }
      setIsLoading(false);
      setIsPageLoading(false);
    }).catch(() => {
      setIsLoading(false);
      setIsPageLoading(false);
    });

    return () => setIsPageLoading(false);
  }, [id, setIsPageLoading]);

  if (isLoading) {
    return (
      <PageLoadingSkeleton
        title="Loading Device Specifications..."
        subtitle="Retrieving diagnostic score, battery health, and warranty coverage"
        type="details"
      />
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <button
          onClick={() => navigate('/buy')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Certified Store
        </button>
      </div>
    );
  }

  // Authoritative photo gallery list: Primary cover photo followed by any additional gallery angles
  const galleryList: string[] = [
    product.imageUrl,
    ...(product.galleryImages || []),
  ].filter(Boolean) as string[];

  if (galleryList.length === 0) {
    galleryList.push(product.imageUrl || '/uploads/devices/pixel-7a.png');
  }

  const activeImage = galleryList[Math.min(selectedImageIdx, galleryList.length - 1)] || product.imageUrl;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setToastMsg('Link copied to clipboard!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/pickup?mode=buy');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/buy')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Photo Carousel & Multi-Angle Thumbnails */}
        <div className="space-y-4">
          <div className="relative h-[340px] sm:h-[440px] bg-white rounded-3xl border border-slate-200/90 shadow-card flex items-center justify-center p-8 overflow-hidden">
            <img
              src={resolveImageUrl(activeImage)}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
              }}
            />

            {/* Quality Score Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-emerald-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{product.inspectionScore || 96}/100 Inspected</span>
              </span>
            </div>
          </div>

          {/* Thumbnails Row (displayed when multiple photos exist) */}
          {galleryList.length > 1 && (
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
              {galleryList.map((img, idx) => {
                const isSelected = selectedImageIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-2xl bg-white border p-1.5 flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img)}
                      alt={`Angle ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Badges, Highlights & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                GRADE: {product.grade}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                ⚡ {product.batteryHealth || 95}% Battery Health
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.name} ({product.storage})
            </h1>

            <p className="text-xs text-slate-500">
              Color: <strong>{product.color}</strong> • Brand: <strong>{product.brand}</strong>
            </p>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.salePrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.originalPrice > product.salePrice && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700">
                  Save ₹{(product.originalPrice - product.salePrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Includes 18% GST invoice & free insured doorstep shipping</span>
            </p>
          </div>

          {/* Warranty & Guarantee Card */}
          <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {product.warrantyMonths || 12}-Month Genie Warranty
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Comprehensive hardware & software coverage with doorstep repair or replacement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-emerald-200/60">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  7-Day Replacement Policy
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Not 100% satisfied? Instant free replacement with zero questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Key Device Highlights
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                addToCart(product);
                setToastMsg('Added to cart!');
                setTimeout(() => setToastMsg(null), 3000);
              }}
              className="flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-sm transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-emerald-sm hover:shadow-emerald-glow transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Instant Doorstep Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
