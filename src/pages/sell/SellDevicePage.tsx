import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { Brand, SmartphoneModel, DeviceVariant } from '../../types';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  BatteryMedium,
  Check,
  X,
  Package,
  Cpu,
  ArrowRight,
  Tag,
  Loader2,
  Search,
} from 'lucide-react';

export const SellDevicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  // Condition assessment state (null = unanswered initial state for sequential reveal)
  const [isPhoneWorking, setIsPhoneWorking] = useState<boolean | null>(null);
  const [isTouchscreenWorking, setIsTouchscreenWorking] = useState<boolean | null>(null);
  const [isDisplayOriginal, setIsDisplayOriginal] = useState<boolean>(true);
  const [hasValidWarranty, setHasValidWarranty] = useState<boolean>(false);
  const [backPanelCondition, setBackPanelCondition] = useState<string>('NO_DEFECTS');
  const [sidePanelCondition, setSidePanelCondition] = useState<string>('NO_DEFECTS');
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
  const [hasOriginalBox, setHasOriginalBox] = useState<boolean>(true);
  const [hasOriginalCharger, setHasOriginalCharger] = useState<boolean>(true);
  const [hasValidBill, setHasValidBill] = useState<boolean>(false);

  // Legacy fallback compatibility
  const [displayCondition, setDisplayCondition] = useState<string>('FLAWLESS');
  const [bodyCondition, setBodyCondition] = useState<string>('FLAWLESS');
  const [batteryCondition, setBatteryCondition] = useState<string>('EXCELLENT');
  const [functionalFaults, setFunctionalFaults] = useState<Record<string, boolean>>({
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
    catalogueApi.getBrands().then((data) => {
      setBrands(data);
      setIsLoadingBrands(false);

      const brandParam = searchParams.get('brand');
      if (brandParam) {
        const found = data.find(
          (b) => b.slug === brandParam || b._id === brandParam || b.name.toLowerCase() === brandParam.toLowerCase()
        );
        if (found) {
          handleSelectBrand(found);
        }
      }
    });
  }, [searchParams]);

  // Handle Brand Pick
  const handleSelectBrand = async (brand: Brand) => {
    setSelectedBrand(brand);
    setIsLoadingModels(true);
    setStep(2);
    try {
      const modelData = await catalogueApi.getModelsByBrand(brand._id);
      setModels(modelData);
    } catch {
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Handle Model Pick
  const handleSelectModel = (model: SmartphoneModel) => {
    setSelectedModel(model);
    setEvalSubStep(1);
    setIsPhoneWorking(null);
    setIsTouchscreenWorking(null);
    setIsDisplayOriginal(true);
    setHasValidWarranty(false);
    if (model.variants && model.variants.length > 0) {
      setSelectedVariant(model.variants[0]);
      setStep(3);
    } else {
      setSelectedVariant({ capacity: 'Standard', priceModifier: 0 });
      setStep(4);
    }
  };

  // Handle Variant Pick
  const handleSelectVariant = (variant: DeviceVariant) => {
    setSelectedVariant(variant);
    setEvalSubStep(1);
    setIsPhoneWorking(null);
    setIsTouchscreenWorking(null);
    setIsDisplayOriginal(true);
    setHasValidWarranty(false);
    setStep(4);
  };

  // Trigger Valuation Engine
  const handleCalculateEstimate = async () => {
    if (!selectedModel) return;
    setIsCalculating(true);

    const isWorking = isPhoneWorking !== false;
    const isTouchWorking = isWorking ? (isTouchscreenWorking !== false) : false;
    const isDisplayOrig = isWorking && isTouchWorking ? isDisplayOriginal : false;
    const isBillValid = isWorking && isTouchWorking ? (hasValidBill || hasValidWarranty) : false;

    const conditionsPayload = {
      basicQuestions: {
        isPhoneWorking: isWorking,
        isTouchscreenWorking: isTouchWorking,
        isDisplayOriginal: isDisplayOrig,
        hasValidWarranty: isBillValid,
      },
      backPanelCondition,
      sidePanelCondition,
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
      // Trigger celebration confetti with Genie colors
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#8B5CF6', '#EC4899', '#D97706'],
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
          <span className="text-emerald-700 font-extrabold">
            {step < 4 ? `${step} of 5` : step === 4 ? `4.${evalSubStep} of 5` : '5 of 5'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
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
            <div className="py-20 text-center flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <span className="text-xs font-medium">Loading brands...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brands.map((brand, idx) => (
                <button
                  key={brand._id || brand.slug || `brand-${idx}`}
                  onClick={() => handleSelectBrand(brand)}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-500 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition">
                    {brand.logoUrl ? (
                      <img
                        src={resolveImageUrl(brand.logoUrl)}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition"
                      />
                    ) : (
                      <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition" />
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700 transition">
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
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
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
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              autoFocus
            />
          </div>

          {isLoadingModels ? (
            <div className="py-20 text-center flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <span className="text-xs font-medium">Fetching models...</span>
            </div>
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
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-500 transition-all flex items-center gap-3 text-left group"
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
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition truncate">
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
        <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Models</span>
          </button>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              Select Storage Variant for {selectedModel.name}
            </h2>
            <p className="text-xs text-slate-500">
              Higher storage capacities fetch a bonus payout
            </p>
          </div>

          <div className="space-y-3">
            {selectedModel.variants?.map((v) => (
              <button
                key={v.capacity}
                onClick={() => handleSelectVariant(v)}
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover hover:border-emerald-500 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                      {v.capacity}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Standard Storage Variant
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </button>
            ))}
          </div>
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
                  setStep(selectedModel.variants && selectedModel.variants.length > 0 ? 3 : 2);
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
                <p className="text-[11px] font-semibold text-emerald-700">
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
                      onClick={() => setIsPhoneWorking(true)}
                      className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        isPhoneWorking === true
                          ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${isPhoneWorking === true ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneWorking(false);
                        setIsTouchscreenWorking(false);
                        setIsDisplayOriginal(false);
                        setHasValidWarranty(false);
                      }}
                      className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                        isPhoneWorking === false
                          ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <X className={`w-4 h-4 ${isPhoneWorking === false ? 'text-rose-600' : 'text-slate-400'}`} />
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
                        onClick={() => setIsTouchscreenWorking(true)}
                        className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                          isTouchscreenWorking === true
                            ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Check className={`w-4 h-4 ${isTouchscreenWorking === true ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span>Yes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTouchscreenWorking(false);
                          setIsDisplayOriginal(false);
                          setHasValidWarranty(false);
                        }}
                        className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                          isTouchscreenWorking === false
                            ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <X className={`w-4 h-4 ${isTouchscreenWorking === false ? 'text-rose-600' : 'text-slate-400'}`} />
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
                              ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${isDisplayOriginal === true ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDisplayOriginal(false)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            isDisplayOriginal === false
                              ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <X className={`w-4 h-4 ${isDisplayOriginal === false ? 'text-rose-600' : 'text-slate-400'}`} />
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
                              ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${hasValidWarranty === true ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasValidWarranty(false)}
                          className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                            hasValidWarranty === false
                              ? 'border-2 border-rose-600 bg-rose-50/80 text-rose-700 shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <X className={`w-4 h-4 ${hasValidWarranty === false ? 'text-rose-600' : 'text-slate-400'}`} />
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
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Verification & Accessories</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isTouchscreenWorking === false ? (
                  <button
                    type="button"
                    onClick={() => setEvalSubStep(2)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Body Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isPhoneWorking === true && isTouchscreenWorking === true ? (
                  <button
                    type="button"
                    onClick={() => setEvalSubStep(2)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
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
                {/* Back Panel */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" /> Back Panel Condition
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'NO_DEFECTS', label: 'No defects on back panel', desc: 'Flawless pristine rear surface' },
                      { id: 'MINOR_SCRATCHES', label: 'Minor Scratches (less than 2)', desc: 'Subtle hairline scratches only' },
                      { id: 'HEAVY_SCRATCHES', label: 'Heavy Scratches', desc: 'Noticeable deep scratches' },
                      { id: 'BACK_PANEL_BROKEN', label: 'Back Panel broken', desc: 'Rear glass cracked or shattered' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBackPanelCondition(opt.id)}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                          backPanelCondition === opt.id
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 font-bold'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div>
                          <p className="text-slate-900 font-bold">{opt.label}</p>
                          <p className="text-[11px] text-slate-500">{opt.desc}</p>
                        </div>
                        {backPanelCondition === opt.id && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Side / Center Frame */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" /> Center or Side Panel Condition
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'NO_DEFECTS', label: 'No defects on center panel', desc: 'Like new, pristine metal/plastic edges' },
                      { id: 'MINOR_DENT_OR_SCRATCHES', label: 'Minor dent or scratches', desc: 'Light edge scuffs or small notch' },
                      { id: 'HEAVY_DENT', label: 'Heavy scratches / Heavy dent', desc: 'Deep dent or heavy paint peel' },
                      { id: 'BENT_OR_BROKEN', label: 'Side Panel broken or bent', desc: 'Curved chassis or frame separated' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSidePanelCondition(opt.id)}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                          sidePanelCondition === opt.id
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 font-bold'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div>
                          <p className="text-slate-900 font-bold">{opt.label}</p>
                          <p className="text-[11px] text-slate-500">{opt.desc}</p>
                        </div>
                        {sidePanelCondition === opt.id && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    ))}
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
                  onClick={() => setEvalSubStep(3)}
                  className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2"
                >
                  <span>Next: Hardware & Sensors</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBSTEP 3: HARDWARE & SENSOR FAULTS */}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { key: 'powerButtonNotWorking', label: 'Power Button' },
                    { key: 'volumeButtonNotWorking', label: 'Volume Buttons' },
                    { key: 'chargingPortNotWorking', label: 'Charging Port' },
                    { key: 'earSpeakerNotWorking', label: 'Ear Speaker / Low' },
                    { key: 'proximitySensorNotWorking', label: 'Proximity Sensor' },
                    { key: 'wifiOrBluetoothNotWorking', label: 'WiFi / Bluetooth' },
                    { key: 'vibratorNotWorking', label: 'Vibrator Motor' },
                    { key: 'batteryHealthBelow83', label: 'Battery Health ≤ 83%' },
                    { key: 'frontCameraNotWorking', label: 'Front Camera' },
                    { key: 'backCameraNotWorking', label: 'Rear Camera' },
                    { key: 'cameraGlassBroken', label: 'Camera Glass Broken' },
                    { key: 'networkProblem', label: 'Network / SIM Issue' },
                    { key: 'microphoneNotWorking', label: 'Microphone Faulty' },
                    { key: 'biometricsNotWorking', label: 'Face ID / Fingerprint' },
                  ].map((item) => {
                    const isFaulty = hardwareFaults[item.key];
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
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          isFaulty
                            ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500 font-bold text-rose-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <span className={`text-[11px] font-black shrink-0 ${isFaulty ? 'text-rose-600' : 'text-slate-300'}`}>
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
                  className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2"
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
                      hasOriginalCharger ? 'bg-amber-50 border-amber-500 font-bold text-amber-900 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Original Charger</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹250 bonus)</p>
                    </div>
                    {hasOriginalCharger && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasOriginalBox(!hasOriginalBox)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      hasOriginalBox ? 'bg-amber-50 border-amber-500 font-bold text-amber-900 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Device Box with IMEI</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹150 bonus)</p>
                    </div>
                    {hasOriginalBox && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasValidBill(!hasValidBill)}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      hasValidBill ? 'bg-amber-50 border-amber-500 font-bold text-amber-900 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Valid Bill / Invoice</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Available (+₹210 bonus)</p>
                    </div>
                    {hasValidBill && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
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
                  className="py-4 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm shadow-emerald-glow transition flex items-center gap-2"
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

      {/* STEP 5: Final Quote Screen */}
      {step === 5 && selectedModel && (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-emerald-glow text-center space-y-6 relative overflow-hidden">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Guaranteed Doorstep Buyback Offer
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedModel.name} ({selectedVariant?.capacity})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Condition evaluated with instant doorstep verification
              </p>
            </div>

            {/* Big Price Tag */}
            <div className="py-4 px-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-sm">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200">
                Calculated Valuation
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                ₹{calculatedQuote.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-100 mt-2">
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
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-emerald-sm hover:shadow-emerald-glow transition flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  );
};
