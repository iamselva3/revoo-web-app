import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { catalogueApi } from '../../api/catalogue';
import { usePageLoading } from '../../context/PageLoadingContext';
import { Brand, DeviceVariant, ModelWithVariants, SmartphoneModel } from '../../types';
import { BrandPicker, CATEGORY_NOUN, SELL_CATEGORIES } from './components/BrandPicker';
import { ModelPicker } from './components/ModelPicker';
import { VariantPicker } from './components/VariantPicker';
import { EvaluationFlow } from './components/EvaluationFlow';
import { QuoteLine, QuoteResult } from './components/QuoteResult';
import { formatCapacity } from './components/shared';
import { EvaluationAnswers, buildConditionPayload, buildSummary, emptyAnswers } from './evaluation';

const PENDING_BOOKING_KEY = 'revoo_pending_booking';
const answersKey = (modelId: string, variantId: string) => `genie_eval:${modelId}:${variantId}`;

const readAnswers = (key: string): EvaluationAnswers => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? { ...emptyAnswers(), ...JSON.parse(raw) } : emptyAnswers();
  } catch {
    return emptyAnswers();
  }
};

interface QuoteState {
  amount: number;
  maxPrice: number;
  breakdown: QuoteLine[];
  conditions: ReturnType<typeof buildConditionPayload>;
}

export const SellDevicePage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal, isAuthModalOpen } = useAuth();
  const { setIsPageLoading } = usePageLoading();

  const category = SELL_CATEGORIES.some((c) => c.id === params.get('category')) ? (params.get('category') as string) : 'phone';
  const brandParam = params.get('brand');
  const modelParam = params.get('model');
  const variantParam = params.get('variant');
  const step = params.get('step');

  // ---------- Data ----------
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [models, setModels] = useState<SmartphoneModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelData, setModelData] = useState<ModelWithVariants | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    catalogueApi
      .getBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => {
        setIsLoadingBrands(false);
        setIsPageLoading(false);
      });
    return () => setIsPageLoading(false);
  }, [setIsPageLoading]);

  const selectedBrand = useMemo(() => {
    if (!brandParam) return null;
    const p = brandParam.toLowerCase();
    return brands.find((b) => b.slug === p || b._id === brandParam || b.name.toLowerCase() === p) || null;
  }, [brands, brandParam]);

  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setIsLoadingModels(true);
    catalogueApi
      .getModelsByBrand(selectedBrand._id, category)
      .then((data) => !cancelled && setModels(data))
      .catch(() => !cancelled && setModels([]))
      .finally(() => !cancelled && setIsLoadingModels(false));
    return () => {
      cancelled = true;
    };
  }, [selectedBrand?._id, category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!modelParam) {
      setModelData(null);
      return;
    }
    let cancelled = false;
    setIsLoadingModel(true);
    catalogueApi
      .getModelWithVariants(modelParam)
      .then((data) => {
        if (cancelled) return;
        if (!data) return setModelData(null);
        // Models without configured variants are sold as a single "Standard" variant
        const variants = data.variants.length
          ? data.variants
          : [{ capacity: 'Standard', priceModifier: 0, price: data.model.basePrice }];
        setModelData({ ...data, variants });
      })
      .catch(() => !cancelled && setModelData(null))
      .finally(() => !cancelled && setIsLoadingModel(false));
    return () => {
      cancelled = true;
    };
  }, [modelParam]);

  const model = modelData?.model ?? null;
  const variants = modelData?.variants ?? [];
  const selectedVariant: DeviceVariant | null = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find((v) => v._id === variantParam || v.capacity === variantParam) ||
      variants[0] // turncash-style: the first variant is pre-selected
    );
  }, [variants, variantParam]);

  const brandName =
    selectedBrand?.name || (model && typeof model.brandId === 'object' ? model.brandId?.name : undefined);

  // ---------- Evaluation answers (kept per device for this session) ----------
  const variantKey = selectedVariant?._id || selectedVariant?.capacity || '';
  const storageKey = model && variantKey ? answersKey(model._id, variantKey) : null;
  const [answers, setAnswers] = useState<EvaluationAnswers>(emptyAnswers);

  useEffect(() => {
    setAnswers(storageKey ? readAnswers(storageKey) : emptyAnswers());
  }, [storageKey]);

  const updateAnswers = (next: EvaluationAnswers) => {
    setAnswers(next);
    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  };

  // ---------- Navigation (URL is the source of truth so Back works) ----------
  const go = useCallback(
    (next: Record<string, string | null>, replace = false) => {
      const merged = new URLSearchParams(params);
      Object.entries(next).forEach(([k, v]) => (v === null ? merged.delete(k) : merged.set(k, v)));
      setParams(merged, { replace });
      if (!replace) window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [params, setParams]
  );

  // ---------- Quote ----------
  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const pendingCalc = useRef(false);

  useEffect(() => setQuote(null), [storageKey]);

  // A refreshed quote URL without a computed quote goes back to the questions
  useEffect(() => {
    if (step === 'quote' && !quote && model && selectedVariant) go({ step: 'evaluate' }, true);
  }, [step, quote, model, selectedVariant]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculate = useCallback(async () => {
    if (!model || !selectedVariant) return;
    if (!user) {
      pendingCalc.current = true;
      setCalcError('Log in to see your exact price. It only takes a moment.');
      openAuthModal();
      return;
    }
    pendingCalc.current = false;
    setCalcError(null);
    setIsCalculating(true);
    const conditions = buildConditionPayload(answers);
    try {
      const res = await catalogueApi.calculateEstimate({
        modelId: model._id,
        variantId: selectedVariant._id,
        variantCapacity: selectedVariant.capacity,
        modelName: model.name,
        brandName,
        declaredCondition: conditions,
        ...conditions,
      });
      if (!res.indicativeValuation || res.indicativeValuation <= 0) throw new Error('empty quote');
      const breakdown: QuoteLine[] = Array.isArray(res.breakdown)
        ? res.breakdown.map((b: any) => ({ component: b.component, description: b.description, adjustment: Number(b.adjustment) || 0 }))
        : [];
      setQuote({
        amount: res.indicativeValuation,
        maxPrice: selectedVariant.price ?? res.basePrice ?? model.basePrice,
        breakdown,
        conditions,
      });
      go({ step: 'quote' });
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.45 }, colors: ['#f59e0b', '#fbbf24', '#ec4899', '#8b5cf6'] });
    } catch (err: any) {
      setCalcError(err?.response?.data?.message || "We couldn't calculate your price right now. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  }, [model, selectedVariant, user, answers, brandName, openAuthModal, go]);

  // Continue automatically once the customer signs in from the price gate
  useEffect(() => {
    if (user && pendingCalc.current) calculate();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthModalOpen && !user) pendingCalc.current = false;
  }, [isAuthModalOpen, user]);

  const handleBook = () => {
    if (!model || !selectedVariant || !quote) return;
    const booking = {
      device: {
        brand: brandName,
        modelName: model.name,
        modelId: model._id,
        variant: selectedVariant.capacity,
        variantId: selectedVariant._id,
        imageUrl: model.imageUrl,
        slug: model.slug,
      },
      conditions: { ...quote.conditions, summary: buildSummary(answers, model.name) },
      indicativeValuation: quote.amount,
      maxPrice: quote.maxPrice,
    };
    sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(booking));
    navigate('/pickup');
  };

  // ---------- Which screen ----------
  const screen: 'brand' | 'model' | 'variant' | 'evaluate' | 'quote' = !modelParam
    ? selectedBrand
      ? 'model'
      : 'brand'
    : step === 'quote' && quote
          ? 'quote'
          : step === 'evaluate' && model && selectedVariant
            ? 'evaluate'
            : 'variant';

  const crumbs: Array<{ label: string; onClick?: () => void }> = [
    { label: `Sell ${CATEGORY_NOUN[category] || 'device'}`, onClick: () => go({ brand: null, model: null, variant: null, step: null }) },
  ];
  if (brandName) crumbs.push({ label: brandName, onClick: () => go({ model: null, variant: null, step: null }) });
  if (model) crumbs.push({ label: model.name, onClick: () => go({ step: null }) });
  if (screen === 'evaluate' || screen === 'quote') crumbs.push({ label: formatCapacity(selectedVariant?.capacity || '') });

  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 ${screen === 'evaluate' ? '' : 'pb-24 lg:pb-10'}`}>
      <nav className="no-scrollbar mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[13px]" aria-label="Breadcrumb">
        <Link to="/" className="flex items-center text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white" aria-label="Home">
          <Home className="h-4 w-4" />
        </Link>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={`${c.label}-${i}`}>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-neutral-700" />
              {last || !c.onClick ? (
                <span className={last ? 'font-semibold text-ink dark:text-white' : 'text-slate-500 dark:text-neutral-400'}>{c.label}</span>
              ) : (
                <button type="button" onClick={c.onClick} className="text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                  {c.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {screen === 'brand' && (
        <BrandPicker
          brands={brands}
          isLoading={isLoadingBrands}
          category={category}
          onCategoryChange={(c) => go({ category: c }, true)}
          onSelect={(b) => go({ brand: b.slug, model: null, variant: null, step: null })}
        />
      )}

      {screen === 'model' && selectedBrand && (
        <ModelPicker
          brand={selectedBrand}
          models={models}
          isLoading={isLoadingModels}
          onSelect={(m) => go({ model: m._id, variant: null, step: null })}
        />
      )}

      {screen === 'variant' &&
        (isLoadingModel && !model ? (
          <div className="surface grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-[5fr_7fr]" aria-busy="true">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-neutral-900 md:h-80" />
            <div className="flex flex-col items-center justify-center space-y-4 py-4 sm:items-start">
              <div className="h-7 w-3/4 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-900" />
              <div className="h-12 w-1/2 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-900" />
              <div className="flex justify-center gap-3 sm:justify-start">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 w-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-neutral-900" />
                ))}
              </div>
            </div>
          </div>
        ) : model ? (
          <VariantPicker
            brandName={brandName}
            model={model}
            variants={variants}
            selected={selectedVariant}
            maxPrice={modelData?.maxPrice ?? 0}
            isLoading={isLoadingModel}
            onSelect={(v) => go({ variant: v._id || v.capacity }, true)}
            onContinue={() => selectedVariant && go({ variant: selectedVariant._id || selectedVariant.capacity, step: 'evaluate' })}
          />
        ) : (
          <div className="surface mx-auto max-w-md p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-neutral-300">This model is no longer available.</p>
            <button type="button" className="btn-genie mt-4" onClick={() => go({ model: null, variant: null, step: null })}>
              Choose another model
            </button>
          </div>
        ))}

      {screen === 'evaluate' && model && selectedVariant && (
        <EvaluationFlow
          brandName={brandName}
          model={model}
          variant={selectedVariant}
          answers={answers}
          onChange={updateAnswers}
          onBack={() => go({ step: null })}
          onSubmit={calculate}
          isSubmitting={isCalculating}
          submitError={calcError}
        />
      )}

      {screen === 'quote' && model && selectedVariant && quote && (
        <QuoteResult
          brandName={brandName}
          model={model}
          variant={selectedVariant}
          quote={quote.amount}
          maxPrice={quote.maxPrice}
          breakdown={quote.breakdown}
          onBook={handleBook}
          onRecheck={() => go({ step: 'evaluate' })}
        />
      )}
    </div>
  );
};
