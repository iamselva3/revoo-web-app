import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { Brand, SmartphoneModel, DeviceVariant } from '../../types';
import { usePageLoading } from '../../context/PageLoadingContext';
import { PageLoadingSkeleton } from '../../components/common/PageLoadingSkeleton';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Check,
  X,
  Cpu,
  ArrowRight,
  Loader2,
  Search,
  Wifi,
  Mic,
  Volume2,
  Power,
  Battery,
  Fingerprint,
  Camera,
  Radio,
  Zap,
  Activity,
  UserCheck,
} from 'lucide-react';
import { BackPanelIllustration, SidePanelIllustration } from '../../components/sell/DeviceConditionIllustrations';

// Helper to normalize and add RAM to storage variants when missing
export const normalizeCapacityWithRam = (cap: string, modelName: string): string => {
  if (cap.includes('/')) return cap; // Already has RAM/ROM
  const lower = modelName.toLowerCase();
  const isLaptop =
    lower.includes('macbook') ||
    lower.includes('xps') ||
    lower.includes('spectre') ||
    lower.includes('thinkpad') ||
    lower.includes('laptop') ||
    lower.includes('zenbook') ||
    lower.includes('omen') ||
    lower.includes('envy');
  const isTv =
    lower.includes('tv') ||
    lower.includes('bravia') ||
    lower.includes('oled') ||
    lower.includes('qled') ||
    lower.includes('crystal');
  if (isLaptop || isTv) return cap;

  const clean = cap.replace(/\s+/g, '').toUpperCase();
  if (clean === '64GB') return '4GB / 64GB';
  if (clean === '128GB') return '8GB / 128GB';
  if (clean === '256GB') return '8GB / 256GB';
  if (clean === '512GB') return '12GB / 512GB';
  if (clean === '1TB') return '16GB / 1TB';
  if (clean === '2TB') return '16GB / 2TB';
  return cap;
};

// Helper to resolve comprehensive storage capacities per device category
export const getFallbackVariantsForDevice = (modelName: string): DeviceVariant[] => {
  const lower = modelName.toLowerCase();
  const isLaptop =
    lower.includes('macbook') ||
    lower.includes('xps') ||
    lower.includes('spectre') ||
    lower.includes('thinkpad') ||
    lower.includes('laptop') ||
    lower.includes('zenbook') ||
    lower.includes('omen') ||
    lower.includes('envy');
  const isTv =
    lower.includes('tv') ||
    lower.includes('bravia') ||
    lower.includes('oled') ||
    lower.includes('qled') ||
    lower.includes('crystal');
  const isTablet = lower.includes('ipad') || lower.includes('tab') || lower.includes('pad');

  if (isTv) {
    return [
      { capacity: '43" 4K UHD / Google TV', priceModifier: 0 },
      { capacity: '55" 4K QLED / OLED 120Hz', priceModifier: 12000 },
      { capacity: '65" 4K Cinema Mini-LED / OLED', priceModifier: 26000 },
      { capacity: '75" 4K Master Series', priceModifier: 42000 },
    ];
  }

  if (isLaptop) {
    return [
      { capacity: '8GB RAM / 256GB SSD', priceModifier: 0 },
      { capacity: '16GB RAM / 512GB SSD', priceModifier: 8000 },
      { capacity: '32GB RAM / 1TB SSD', priceModifier: 18000 },
      { capacity: '64GB RAM / 2TB SSD', priceModifier: 28000 },
    ];
  }

  if (isTablet) {
    return [
      { capacity: '6GB / 128GB Wi-Fi', priceModifier: 0 },
      { capacity: '8GB / 256GB Wi-Fi', priceModifier: 4000 },
      { capacity: '8GB / 512GB (Wi-Fi + 5G)', priceModifier: 10000 },
      { capacity: '16GB / 1TB (Wi-Fi + 5G)', priceModifier: 16000 },
      { capacity: '16GB / 2TB (Wi-Fi + 5G)', priceModifier: 24000 },
    ];
  }

  // Smartphones / Mobiles: 6GB/128GB, 8GB/128GB, 8GB/256GB, 12GB/256GB, 12GB/512GB, 16GB/512GB, 16GB/1TB
  return [
    { capacity: '6GB / 128GB', priceModifier: 0 },
    { capacity: '8GB / 128GB', priceModifier: 0 },
    { capacity: '8GB / 256GB', priceModifier: 3500 },
    { capacity: '12GB / 256GB', priceModifier: 5000 },
    { capacity: '12GB / 512GB', priceModifier: 8000 },
    { capacity: '16GB / 512GB', priceModifier: 11000 },
    { capacity: '16GB / 1TB', priceModifier: 16000 },
  ];
};

export const SellDevicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { setIsPageLoading } = usePageLoading();

  // Step flow: 1=Brand, 2=Model, 3=Variant, 4=Condition (with 4 sub-steps like mobile app), 5=Quote
  const [step, setStep] = useState<number>(1);
  const [evalSubStep, setEvalSubStep] = useState<number>(1);

  // Selections
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [models, setModels] = useState<SmartphoneModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SmartphoneModel | null>(null);
  const [searchModelQuery, setSearchModelQuery] = useState('');

  const [selectedVariant, setSelectedVariant] = useState<DeviceVariant | null>(null);
  const [availableVariants, setAvailableVariants] = useState<DeviceVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState<boolean>(false);

  // Condition assessment state (null = unanswered initial state for sequential reveal)
  const [isPhoneWorking, setIsPhoneWorking] = useState<boolean | null>(null);
  const [isTouchscreenWorking, setIsTouchscreenWorking] = useState<boolean | null>(null);
  const [isDisplayOriginal, setIsDisplayOriginal] = useState<boolean | null>(null);
  const [hasValidWarranty, setHasValidWarranty] = useState<boolean | null>(null);
  const [backPanelCondition, setBackPanelCondition] = useState<string | null>(null);
  const [sidePanelCondition, setSidePanelCondition] = useState<string | null>(null);
  const [hardwareFaults, setHardwareFaults] = useState<Record<string, boolean>>({
    powerButtonNotWorking: false,
    volumeButtonNotWorking: false,
    chargingPortNotWorking: false,
    earSpeakerNotWorking: false,
    proximitySensorNotWorking: false,
    wifiOrBluetoothNotWorking: false,
    vibratorNotWorking: false,
    batteryHealthBelow83: false,
    frontCameraNotWorking: false,
    backCameraNotWorking: false,
    cameraGlassBroken: false,
    networkProblem: false,
    microphoneNotWorking: false,
    biometricsNotWorking: false,
  });
  const [hasOriginalBox, setHasOriginalBox] = useState<boolean>(false);
  const [hasOriginalCharger, setHasOriginalCharger] = useState<boolean>(false);
  const [hasValidBill, setHasValidBill] = useState<boolean>(false);

  // Legacy fallback compatibility
  const [displayCondition] = useState<string>('FLAWLESS');
  const [bodyCondition] = useState<string>('FLAWLESS');
  const [batteryCondition] = useState<string>('EXCELLENT');
  const [functionalFaults] = useState<Record<string, boolean>>({
    frontCameraFaulty: false,
    backCameraFaulty: false,
    faceIdOrFingerprintFaulty: false,
    speakerOrMicFaulty: false,
    chargingPortFaulty: false,
    wirelessOrBluetoothFaulty: false,
  });

  // Calculated valuation
  const [calculatedQuote, setCalculatedQuote] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState<boolean>(true);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // 1. Initial Load of Brands
  useEffect(() => {
    setIsPageLoading(true);
    catalogueApi.getBrands().then((data) => {
      setBrands(data);
      setIsLoadingBrands(false);
      setIsPageLoading(false);

      const brandParam = searchParams.get('brand');
      if (brandParam) {
        const found = data.find(
          (b) => b.slug === brandParam || b._id === brandParam || b.name.toLowerCase() === brandParam.toLowerCase()
        );
        if (found) {
          handleSelectBrand(found);
        }
      }
    }).catch(() => {
      setIsLoadingBrands(false);
      setIsPageLoading(false);
    });

    return () => setIsPageLoading(false);
  }, [searchParams, setIsPageLoading]);

  // Handle Brand Pick
  const handleSelectBrand = async (brand: Brand) => {
    setSelectedBrand(brand);
    setIsLoadingModels(true);
    setIsPageLoading(true);
    setStep(2);
    try {
      const modelData = await catalogueApi.getModelsByBrand(brand._id);
      setModels(modelData);
    } catch {
      setModels([]);
    } finally {
      setIsLoadingModels(false);
      setIsPageLoading(false);
    }
  };

  // Handle Model Pick
  const handleSelectModel = async (model: SmartphoneModel) => {
    setSelectedModel(model);
    setEvalSubStep(1);
    setIsPhoneWorking(null);
    setIsTouchscreenWorking(null);
    setIsDisplayOriginal(null);
    setHasValidWarranty(null);
    setBackPanelCondition(null);
    setSidePanelCondition(null);
    setSelectedVariant(null);
    setIsLoadingVariants(true);
    setIsPageLoading(true);
    setStep(3); // Always show Step 3 (Variant / Storage selection)

    try {
      const details = await catalogueApi.getModelDetails(model._id);
      const apiVariants = details?.variants || (details as any)?.data?.variants;
      const fallback = getFallbackVariantsForDevice(model.name);

      if (Array.isArray(apiVariants) && apiVariants.length > 0) {
        const dbVariants: DeviceVariant[] = apiVariants.map((v: any) => ({
          _id: v._id,
          capacity: normalizeCapacityWithRam(v.capacity, model.name),
          priceModifier: v.priceModifier || 0,
        }));

        // Merge DB variants and add any missing standard higher capacities (e.g. 512GB, 1TB, 2TB)
        const existingCapacities = new Set(
          dbVariants.map((v) => v.capacity.replace(/\s+/g, '').toLowerCase())
        );

        const merged = [...dbVariants];
        for (const fb of fallback) {
          const norm = fb.capacity.replace(/\s+/g, '').toLowerCase();
          if (!existingCapacities.has(norm)) {
            merged.push(fb);
          }
        }
        setAvailableVariants(merged);
      } else {
        setAvailableVariants(fallback);
      }
    } catch {
      setAvailableVariants(getFallbackVariantsForDevice(model.name));
    } finally {
      setIsLoadingVariants(false);
      setIsPageLoading(false);
    }
  };

  // Handle Variant Pick
  const handleSelectVariant = (variant: DeviceVariant) => {
    setSelectedVariant(variant);
    setEvalSubStep(1);
    setIsPhoneWorking(null);
    setIsTouchscreenWorking(null);
    setIsDisplayOriginal(null);
    setHasValidWarranty(null);
    setBackPanelCondition(null);
    setSidePanelCondition(null);
    setStep(4);
  };

  // Trigger Valuation Engine
  const handleCalculateEstimate = async () => {
    if (!selectedModel) return;

    // Check if user is logged in before calculating / displaying price
    if (!user) {
      openAuthModal();
      return;
    }

    setIsCalculating(true);

    const isWorking = isPhoneWorking !== false;
    const isTouchWorking = isWorking ? (isTouchscreenWorking !== false) : false;
    const isDisplayOrig = isWorking && isTouchWorking ? Boolean(isDisplayOriginal) : false;
    const isBillValid = isWorking && isTouchWorking ? (hasValidBill || Boolean(hasValidWarranty)) : false;
    const backPanel = backPanelCondition || 'NO_DEFECTS';
    const sidePanel = sidePanelCondition || 'NO_DEFECTS';

    const conditionsPayload = {
      basicQuestions: {
        isPhoneWorking: isWorking,
        isTouchscreenWorking: isTouchWorking,
        isDisplayOriginal: isDisplayOrig,
        hasValidWarranty: isBillValid,
      },
      backPanelCondition: backPanel,
      sidePanelCondition: sidePanel,
      hardwareFaults,
      hasOriginalBox,
      hasOriginalCharger,
      hasValidBill: isBillValid,
      bill_same_imei: isBillValid,
      box_same_imei: hasOriginalBox,
      original_charger: hasOriginalCharger,
      isPhoneWorking: isWorking,
      isTouchscreenWorking: isTouchWorking,
      isDisplayOriginal: isDisplayOrig,
      hasValidWarranty: isBillValid,
      ...hardwareFaults,
      // Legacy fallback
      display: displayCondition,
      body: bodyCondition,
      battery: batteryCondition,
      functional: functionalFaults,
    };

    try {
      const res = await catalogueApi.calculateEstimate({
        modelId: selectedModel._id,
        variantId: (selectedVariant as any)?._id,
        modelName: selectedModel.name,
        brandName: selectedBrand?.name,
        variantCapacity: selectedVariant?.capacity || 'Standard',
        basePrice: (selectedModel.basePrice || 22000) + (selectedVariant?.priceModifier || 0),
        declaredCondition: conditionsPayload,
        ...conditionsPayload,
      });

      let quote = res.indicativeValuation || 0;
      if (quote <= 0 && selectedModel.basePrice) {
        // DOFY fallback calculation with exact percentages
        const bp = (selectedModel.basePrice || 22000) + (selectedVariant?.priceModifier || 0);
        let pen = 0;
        if (!isPhoneWorking) pen += bp * 0.60;
        if (!isTouchscreenWorking) pen += bp * 0.15;
        if (!isDisplayOriginal) pen += bp * 0.10;
        if (!hasValidWarranty) pen += bp * 0.05;

        if (backPanelCondition === 'MINOR_SCRATCHES') pen += bp * 0.03;
        else if (backPanelCondition === 'HEAVY_SCRATCHES') pen += bp * 0.08;
        else if (backPanelCondition === 'BACK_PANEL_BROKEN') pen += bp * 0.15;

        if (sidePanelCondition === 'MINOR_DENT_OR_SCRATCHES') pen += bp * 0.03;
        else if (sidePanelCondition === 'HEAVY_DENT') pen += bp * 0.08;
        else if (sidePanelCondition === 'BENT_OR_BROKEN') pen += bp * 0.12;

        if (hardwareFaults.powerButtonNotWorking) pen += bp * 0.05;
        if (hardwareFaults.volumeButtonNotWorking) pen += bp * 0.03;
        if (hardwareFaults.chargingPortNotWorking) pen += bp * 0.08;
        if (hardwareFaults.earSpeakerNotWorking) pen += bp * 0.03;
        if (hardwareFaults.proximitySensorNotWorking) pen += bp * 0.03;
        if (hardwareFaults.wifiOrBluetoothNotWorking) pen += bp * 0.05;
        if (hardwareFaults.vibratorNotWorking) pen += bp * 0.02;

        let bonus = 0;
        if (hasOriginalCharger) bonus += 500;
        if (hasOriginalBox) bonus += 500;

        quote = Math.max(1000, Math.round(bp - pen + bonus));
      }
      setCalculatedQuote(quote);
      setStep(5);
      // Trigger celebration confetti with brand colors
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#8B5CF6', '#EC4899', '#F59E0B'],
      });
    } catch {
      const bp = selectedModel.basePrice || 22000;
      setCalculatedQuote(Math.round(bp * 0.74));
      setStep(5);
    } finally {
      setIsCalculating(false);
    }
  };

  // Proceed to Doorstep Pickup Booking
  const handleProceedToPickup = () => {
    if (!selectedModel || !selectedBrand) return;
    const bookingState = {
      device: {
        brand: selectedBrand.name,
        modelName: selectedModel.name,
        modelId: selectedModel._id,
        variant: selectedVariant?.capacity || 'Standard',
        imageUrl: selectedModel.imageUrl || `/uploads/devices/${selectedModel.slug}.png`,
      },
      conditions: {
        basicQuestions: {
          isPhoneWorking,
          isTouchscreenWorking,
          isDisplayOriginal,
          hasValidWarranty,
        },
        backPanelCondition,
        sidePanelCondition,
        hardwareFaults,
        hasOriginalBox,
        hasOriginalCharger,
        display: displayCondition,
        body: bodyCondition,
        battery: batteryCondition,
        functional: functionalFaults,
      },
      indicativeValuation: calculatedQuote,
    };

    sessionStorage.setItem('revoo_pending_booking', JSON.stringify(bookingState));
    navigate('/pickup');
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchModelQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Step Indicator Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>
            {step === 1 && 'Step 1: Select Brand'}
            {step === 2 && `Step 2: Choose ${selectedBrand?.name || 'Device'} Model`}
            {step === 3 && 'Step 3: Select Storage Capacity'}
            {step === 4 && (
              evalSubStep === 1 ? 'Step 4 (1/4): Basic Working Condition' :
              evalSubStep === 2 ? 'Step 4 (2/4): Body & Frame Condition' :
              evalSubStep === 3 ? 'Step 4 (3/4): Hardware & Sensor Faults' :
              'Step 4 (4/4): Original Accessories Bonus'
            )}
            {step === 5 && 'Step 5: Guaranteed Valuation'}
          </span>
          <span className="text-rose-600 font-extrabold">
            {step < 4 ? `${step} of 5` : step === 4 ? `4.${evalSubStep} of 5` : '5 of 5'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 h-full rounded-full transition-all duration-300"
            style={{
              width: `${
                step === 1 ? 20 :
                step === 2 ? 40 :
                step === 3 ? 60 :
                step === 4 ? 60 + (evalSubStep / 4) * 20 :
                100
              }%`
            }}
          />
        </div>
      </div>

      {/* STEP 1: Select Brand */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Phone's Brand
            </h1>
            <p className="text-xs text-slate-500">
              Pick your device brand to see all eligible buyback models
            </p>
          </div>

          {isLoadingBrands ? (
            <PageLoadingSkeleton
              title="Loading Smartphone Brands..."
              subtitle="Fetching verified manufacturers eligible for instant buyback"
              type="brands"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brands.map((brand, idx) => (
                <button
                  key={brand._id || brand.slug || `brand-${idx}`}
                  onClick={() => handleSelectBrand(brand)}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-rose-500 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition">
                    {brand.logoUrl ? (
                      <img
                        src={resolveImageUrl(brand.logoUrl)}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition"
                      />
                    ) : (
                      <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-rose-600 transition" />
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-rose-600 transition">
                    {brand.name}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Explore Models</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Select Model */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Brands</span>
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              Brand: {selectedBrand?.name}
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder={`Search ${selectedBrand?.name || ''} model (e.g. Pixel 8, iPhone 15)...`}
              value={searchModelQuery}
              onChange={(e) => setSearchModelQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
              autoFocus
            />
          </div>

          {isLoadingModels ? (
            <PageLoadingSkeleton
              title={`Loading ${selectedBrand?.name || 'Device'} Models...`}
              subtitle="Fetching eligible smartphone models with verified buyback values"
              type="models"
            />
          ) : filteredModels.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              No models found matching "{searchModelQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredModels.map((m, idx) => (
                <button
                  key={m._id || m.slug || `model-${idx}`}
                  onClick={() => handleSelectModel(m)}
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-rose-500 transition-all flex items-center gap-3 text-left group"
                >
                  <div className="w-16 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0 overflow-hidden group-hover:scale-105 transition">
                    <img
                      src={resolveImageUrl(m.imageUrl, m.slug)}
                      alt={m.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-600 transition truncate">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Year {m.releaseYear} • Instant Doorstep
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      Instant Doorstep Valuation
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Select Variant / Storage */}
      {step === 3 && selectedModel && (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Models</span>
          </button>

          {/* Model Summary Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
              <img
                src={resolveImageUrl(selectedModel.imageUrl, selectedModel.slug)}
                alt={selectedModel.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                }}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {selectedBrand?.name || 'Device'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-1">
                {selectedModel.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Year {selectedModel.releaseYear} • Select your exact storage capacity
              </p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              Select Device Variant
            </h2>
            <p className="text-xs text-slate-500">
              Choose your device's exact RAM and internal storage configuration
            </p>
          </div>

          {isLoadingVariants ? (
            <PageLoadingSkeleton
              title="Loading Device Configurations..."
              subtitle="Retrieving RAM & ROM capacities for valuation"
              type="generic"
            />
          ) : (
            <div className="space-y-3">
              {availableVariants.map((v) => {
                const isSelected = selectedVariant?.capacity === v.capacity;

                return (
                  <button
                    key={v.capacity}
                    onClick={() => handleSelectVariant(v)}
                    className={`w-full p-4 rounded-2xl border transition flex items-center justify-between text-left group ${
                      isSelected
                        ? 'bg-rose-50/80 border-2 border-rose-600 shadow-brand-sm'
                        : 'bg-white border-slate-200 hover:border-rose-500 hover:shadow-card shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600'
                        }`}
                      >
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition">
                          {v.capacity}
                        </h4>
                        <span className="text-xs font-semibold text-slate-400">
                          RAM & Storage Configuration
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-600 to-violet-600 border-rose-600 text-white shadow-2xs'
                            : 'border-slate-300 text-transparent group-hover:border-rose-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Condition Diagnostic Assessment (Multi-step flow exactly like Mobile App) */}
      {step === 4 && selectedModel && (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
          {/* Header Summary Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (evalSubStep === 1) {
                  setStep(3);
                } else if (evalSubStep === 2) {
                  setEvalSubStep(1);
                } else if (evalSubStep === 3) {
                  setEvalSubStep(2);
                } else if (evalSubStep === 4) {
                  setEvalSubStep(isPhoneWorking ? 3 : 1);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
                <img
                  src={resolveImageUrl(selectedModel.imageUrl, selectedModel.slug)}
                  alt={selectedModel.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                  }}
                />
              </div>
              <div className="text-right sm:text-left">
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                  {selectedModel.name}
                </h3>
                <p className="text-[11px] font-semibold text-rose-600">
                  {selectedVariant?.capacity || 'Standard'} •{' '}
                  <span className="text-slate-500">
                    {evalSubStep === 1 && 'Step 1 of 4: Basic Health'}
                    {evalSubStep === 2 && 'Step 2 of 4: Body & Frame'}
                    {evalSubStep === 3 && 'Step 3 of 4: Hardware & Sensors'}
                    {evalSubStep === 4 && 'Step 4 of 4: Original Accessories'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* SUBSTEP 1: BASIC WORKING CONDITION (Sequential reveal matching mobile app) */}
          {evalSubStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Basic Working Condition
                </h2>
                <p className="text-xs text-slate-500">
                  Answer quick questions to confirm phone power & touch functionality
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Phone Working Condition (Gatekeeper Question) */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      1. Is the phone in proper working condition?
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check if the phone powers on and confirm that it is in working condition
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneWorking(true);
                        setIsTouchscreenWorking(null);
                        setIsDisplayOriginal(null);
                        setHasValidWarranty(null);
                      }}
                      className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        isPhoneWorking === true
                          ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white font-extrabold shadow-brand-sm border-2 border-rose-600'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${isPhoneWorking === true ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                      <span>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneWorking(false);
                        setIsTouchscreenWorking(null);
                        setIsDisplayOriginal(null);
                        setHasValidWarranty(null);
                      }}
                      className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        isPhoneWorking === false
                          ? 'bg-slate-900 text-white font-extrabold shadow-sm border-2 border-slate-900'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <X className={`w-4 h-4 ${isPhoneWorking === false ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                      <span>No</span>
                    </button>
                  </div>
                </div>

                {/* Gatekeeper notice: ONLY shown if Point 1 is NO */}
                {isPhoneWorking === false && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 animate-fade-in shadow-2xs">
                    <p className="font-extrabold flex items-center gap-1.5 text-rose-900 text-xs sm:text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      Gatekeeper Rule: Phone Does Not Power On
                    </p>
                    <p className="text-[11px] sm:text-xs text-rose-700 leading-relaxed">
                      Since the phone does not turn on, defect deductions are skipped. Your device will be evaluated directly at the minimum scrap floor value with accessory bonuses.
                    </p>
                  </div>
                )}

                {/* 2. Touchscreen: ONLY shown if Point 1 is YES */}
                {isPhoneWorking === true && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3 animate-fade-in">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        2. Is the touchscreen on your phone working properly?
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check the touch screen functionality across the entire display
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTouchscreenWorking(true);
                          setIsDisplayOriginal(null);
                          setHasValidWarranty(null);
                        }}
                        className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                          isTouchscreenWorking === true
                            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white font-extrabold shadow-brand-sm border-2 border-rose-600'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Check className={`w-4 h-4 ${isTouchscreenWorking === true ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                        <span>Yes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTouchscreenWorking(false);
                          setIsDisplayOriginal(null);
                          setHasValidWarranty(null);
                        }}
                        className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                          isTouchscreenWorking === false
                            ? 'bg-slate-900 text-white font-extrabold shadow-sm border-2 border-slate-900'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <X className={`w-4 h-4 ${isTouchscreenWorking === false ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Touchscreen Defect Notice: ONLY shown if Point 1 is YES and Point 2 is NO */}
                {isPhoneWorking === true && isTouchscreenWorking === false && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 animate-fade-in shadow-2xs">
                    <p className="font-extrabold flex items-center gap-1.5 text-rose-900 text-xs sm:text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      Touchscreen Defect Detected
                    </p>
                    <p className="text-[11px] sm:text-xs text-rose-700 leading-relaxed">
                      Touchscreen not working requires full display assembly replacement and voids manufacturer warranty. Proceeding to body condition assessment.
                    </p>
                  </div>
                )}

                {/* 3 & 4. Display & Warranty: ONLY shown if Point 1 is YES and Point 2 is YES */}
                {isPhoneWorking === true && isTouchscreenWorking === true && (
                  <>
                    {/* 3. Display Original */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3 animate-fade-in">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          3. Is the phone's display original?
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select "Yes" if never replaced or changed by Authorized Service Center
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsDisplayOriginal(true)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            isDisplayOriginal === true
                              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white font-extrabold shadow-brand-sm border-2 border-rose-600'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${isDisplayOriginal === true ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDisplayOriginal(false)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            isDisplayOriginal === false
                              ? 'bg-slate-900 text-white font-extrabold shadow-sm border-2 border-slate-900'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <X className={`w-4 h-4 ${isDisplayOriginal === false ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                          <span>No</span>
                        </button>
                      </div>
                    </div>

                    {/* 4. Valid Warranty */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3 animate-fade-in">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          4. Is there a valid warranty for your phone?
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          You'll get a better price if your device has an active manufacturer warranty with invoice
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setHasValidWarranty(true)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            hasValidWarranty === true
                              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white font-extrabold shadow-brand-sm border-2 border-rose-600'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${hasValidWarranty === true ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasValidWarranty(false)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            hasValidWarranty === false
                              ? 'bg-slate-900 text-white font-extrabold shadow-sm border-2 border-slate-900'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <X className={`w-4 h-4 ${hasValidWarranty === false ? 'text-white stroke-[3]' : 'text-slate-400'}`} />
                          <span>No</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Action Button based on choices */}
              <div className="pt-2 flex justify-end">
                {isPhoneWorking === false ? (
                  <button
                    type="button"
                    onClick={() => setEvalSubStep(4)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-brand-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Verification & Accessories</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isTouchscreenWorking === false ? (
                  <button
                    type="button"
                    onClick={() => setEvalSubStep(2)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-brand-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Body Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isPhoneWorking === true && isTouchscreenWorking === true ? (
                  <button
                    type="button"
                    disabled={isDisplayOriginal === null || hasValidWarranty === null}
                    onClick={() => setEvalSubStep(2)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-brand-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Next: Body & Frame Condition</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* SUBSTEP 2: PHYSICAL CONDITION (Back Panel & Side Panel) */}
          {evalSubStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Body & Frame Condition
                </h2>
                <p className="text-xs text-slate-500">
                  Select the cosmetic state of your back glass and side outer frame
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Back Panel Condition */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Back Panel Condition
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'NO_DEFECTS', label: 'No defects on back panel', desc: 'Flawless pristine rear surface' },
                      { id: 'MINOR_SCRATCHES', label: 'Minor Scratches (less than 2)', desc: 'Subtle hairline scratches only' },
                      { id: 'HEAVY_SCRATCHES', label: 'Heavy Scratches', desc: 'Noticeable deep scratches' },
                      { id: 'BACK_PANEL_BROKEN', label: 'Back Panel broken', desc: 'Rear glass cracked or shattered' },
                    ].map((opt) => {
                      const isSelected = backPanelCondition === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBackPanelCondition(opt.id)}
                          className={`p-3 sm:p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between relative group ${
                            isSelected
                              ? 'bg-rose-50/80 border-2 border-rose-600 shadow-brand-sm'
                              : 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-2xs'
                          }`}
                        >
                          <div className="h-24 flex items-center justify-center pt-1">
                            <BackPanelIllustration condition={opt.id} />
                          </div>
                          <div className="w-full mt-2">
                            <p className={`text-xs font-extrabold leading-tight ${isSelected ? 'text-rose-700' : 'text-slate-900'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Side / Center Frame */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Center or Side Panel Condition
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'NO_DEFECTS', label: 'No defects on center panel', desc: 'Like new, pristine metal/plastic edges' },
                      { id: 'MINOR_DENT_OR_SCRATCHES', label: 'Minor dent or scratches', desc: 'Light edge scuffs or small notch' },
                      { id: 'HEAVY_DENT', label: 'Heavy scratches / Heavy dent', desc: 'Deep dent or heavy paint peel' },
                      { id: 'BENT_OR_BROKEN', label: 'Side Panel broken or bent', desc: 'Curved chassis or frame separated' },
                    ].map((opt) => {
                      const isSelected = sidePanelCondition === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSidePanelCondition(opt.id)}
                          className={`p-3 sm:p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between relative group ${
                            isSelected
                              ? 'bg-rose-50/80 border-2 border-rose-600 shadow-brand-sm'
                              : 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-2xs'
                          }`}
                        >
                          <div className="h-24 flex items-center justify-center pt-1">
                            <SidePanelIllustration condition={opt.id} />
                          </div>
                          <div className="w-full mt-2">
                            <p className={`text-xs font-extrabold leading-tight ${isSelected ? 'text-rose-700' : 'text-slate-900'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEvalSubStep(1)}
                  className="py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  ← Back to Basic Health
                </button>
                <button
                  type="button"
                  disabled={!backPanelCondition || !sidePanelCondition}
                  onClick={() => setEvalSubStep(3)}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-brand-sm transition flex items-center gap-2"
                >
                  <span>Next: Hardware & Sensors</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBSTEP 3: HARDWARE & SENSOR FAULTS (Untruncated labels matching mobile) */}
          {evalSubStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Hardware & Sensor Faults
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any component that is faulty or not functioning properly:
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'powerButtonNotWorking', label: 'Power Button', icon: Power },
                    { key: 'volumeButtonNotWorking', label: 'Volume Buttons', icon: Volume2 },
                    { key: 'chargingPortNotWorking', label: 'Charging Port', icon: Zap },
                    { key: 'earSpeakerNotWorking', label: 'Ear Speaker / Low Volume', icon: Volume2 },
                    { key: 'proximitySensorNotWorking', label: 'Proximity Sensor', icon: Radio },
                    { key: 'wifiOrBluetoothNotWorking', label: 'WiFi / Bluetooth', icon: Wifi },
                    { key: 'vibratorNotWorking', label: 'Vibrator Motor', icon: Activity },
                    { key: 'batteryHealthBelow83', label: 'Battery Health ≤ 83%', icon: Battery },
                    { key: 'frontCameraNotWorking', label: 'Front Camera', icon: Camera },
                    { key: 'backCameraNotWorking', label: 'Rear Camera', icon: Camera },
                    { key: 'cameraGlassBroken', label: 'Camera Glass Broken', icon: ShieldAlert },
                    { key: 'networkProblem', label: 'Network / SIM Issue', icon: Radio },
                    { key: 'microphoneNotWorking', label: 'Microphone Faulty', icon: Mic },
                    { key: 'biometricsNotWorking', label: 'Face ID / Fingerprint', icon: Fingerprint },
                  ].map((item) => {
                    const isFaulty = hardwareFaults[item.key];
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setHardwareFaults((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 ${
                          isFaulty
                            ? 'bg-rose-50/90 border-2 border-rose-600 font-bold text-rose-900 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <IconComponent className={`w-4 h-4 shrink-0 ${isFaulty ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-semibold leading-tight text-slate-800 break-words">{item.label}</span>
                        </div>
                        <span className={`text-[11px] font-black shrink-0 px-2 py-0.5 rounded-full ${isFaulty ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-400'}`}>
                          {isFaulty ? '✕ Fault' : '✓ OK'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEvalSubStep(2)}
                  className="py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  ← Back to Body Condition
                </button>
                <button
                  type="button"
                  onClick={() => setEvalSubStep(4)}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-brand-sm transition flex items-center gap-2"
                >
                  <span>Next: Original Accessories</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBSTEP 4: ORIGINAL ACCESSORIES BONUS */}
          {evalSubStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Original Accessories (+Cash Bonus)
                </h2>
                <p className="text-xs text-slate-500">
                  Include authentic accessories to maximize your guaranteed payout:
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setHasOriginalCharger(!hasOriginalCharger)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      hasOriginalCharger
                        ? 'bg-rose-50 border-2 border-rose-500 font-bold text-rose-950 shadow-brand-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Original Charger</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹250 bonus)</p>
                    </div>
                    {hasOriginalCharger && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasOriginalBox(!hasOriginalBox)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      hasOriginalBox
                        ? 'bg-rose-50 border-2 border-rose-500 font-bold text-rose-950 shadow-brand-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Device Box with IMEI</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹150 bonus)</p>
                    </div>
                    {hasOriginalBox && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasValidBill(!hasValidBill)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      hasValidBill
                        ? 'bg-rose-50 border-2 border-rose-500 font-bold text-rose-950 shadow-brand-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Valid Bill / Invoice</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹210 bonus)</p>
                    </div>
                    {hasValidBill && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEvalSubStep(isPhoneWorking ? 3 : 1)}
                  className="py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleCalculateEstimate}
                  disabled={isCalculating}
                  className="py-4 px-10 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 disabled:opacity-60 text-white font-black text-sm shadow-brand-glow hover:shadow-brand-glow transition-all flex items-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Calculating Guaranteed Value...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Calculate Instant Price</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Final Quote Screen (Login Gated) */}
      {step === 5 && selectedModel && (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          {!user ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-brand-glow text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-brand-sm">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Please Log In to View Your Guaranteed Quote
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Sign in or create an account to view your instant doorstep valuation for {selectedModel.name}
                </p>
              </div>
              <button
                onClick={openAuthModal}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-black text-sm shadow-brand-glow transition flex items-center justify-center gap-2"
              >
                <span>Log In / Sign Up to View Price</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-brand-glow text-center space-y-6 relative overflow-hidden">
              <div className="w-20 h-24 mx-auto bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center">
                <img
                  src={resolveImageUrl(selectedModel.imageUrl, selectedModel.slug)}
                  alt={selectedModel.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/devices/pixel-7a.png';
                  }}
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Guaranteed Doorstep Buyback Offer
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedModel.name} ({selectedVariant?.capacity})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Condition evaluated with instant doorstep verification
                </p>
              </div>

              {/* Big Price Tag */}
              <div className="py-5 px-6 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 text-white shadow-brand-glow">
                <span className="text-xs uppercase tracking-widest font-extrabold text-rose-100">
                  Calculated Valuation
                </span>
                <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                  ₹{calculatedQuote.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-rose-100 mt-2">
                  ⚡ Direct Bank Transfer or UPI upon pickup
                </p>
              </div>

              {/* Guarantee points */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block font-bold text-slate-800">Free Pickup</span>
                  <span className="text-[10px] text-slate-400">At your doorstep</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block font-bold text-slate-800">100% Data Wipe</span>
                  <span className="text-[10px] text-slate-400">Certificate given</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block font-bold text-slate-800">Instant Cash</span>
                  <span className="text-[10px] text-slate-400">Zero wait time</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleProceedToPickup}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-black text-sm shadow-brand-glow transition flex items-center justify-center gap-2"
                >
                  <span>Book Free Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Re-adjust Condition Diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
