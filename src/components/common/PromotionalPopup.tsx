import React, { useEffect, useState } from 'react';
import { catalogueApi } from '../../api/catalogue';
import { AppPopup } from '../../types';
import { resolveImageUrl } from '../../api/client';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PromotionalPopup: React.FC = () => {
  const [popup, setPopup] = useState<AppPopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show once per session to avoid annoying the user
    const hasSeen = sessionStorage.getItem('revoo_has_seen_popup');
    if (hasSeen) return;

    catalogueApi.getAppPopup().then((data) => {
      if (data && data.isActive) {
        setPopup(data);
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('revoo_has_seen_popup', 'true');
        }, 1200);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  if (!isOpen || !popup) return null;

  const handleAction = () => {
    setIsOpen(false);
    if (popup.ctaLink) {
      if (popup.ctaLink.startsWith('http')) {
        window.open(popup.ctaLink, '_blank');
      } else {
        navigate(popup.ctaLink);
      }
    } else {
      navigate('/sell');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Popup Image */}
        {popup.imageUrl ? (
          <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
            <img
              src={resolveImageUrl(popup.imageUrl)}
              alt={popup.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback image if remote breaks
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-sm">
                <Sparkles className="w-3 h-3" /> Special Promo
              </span>
            </div>
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-200" /> Exclusive Offer
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center space-y-3">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {popup.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {popup.description}
          </p>

          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={handleAction}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-bold text-sm shadow-brand-glow transition-all flex items-center justify-center gap-2 group"
            >
              <span>{popup.ctaText || 'Claim Offer Now'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

