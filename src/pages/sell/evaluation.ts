import { ConditionArtKind } from '../../components/sell/ConditionArt';

/** The four evaluation tabs, in order (mirrors the reference flow). */
export const EVAL_TABS = [
  { id: 'overall', label: 'Overall condition' },
  { id: 'physical', label: 'Physical condition' },
  { id: 'functional', label: 'Functional condition' },
  { id: 'warranty', label: 'Warranty condition' },
] as const;

export type EvalTabId = (typeof EVAL_TABS)[number]['id'];

export type HardwareFaultKey =
  | 'batteryHealthBelow83'
  | 'frontCameraNotWorking'
  | 'backCameraNotWorking'
  | 'cameraGlassBroken'
  | 'networkProblem'
  | 'chargingPortNotWorking'
  | 'wifiOrBluetoothNotWorking'
  | 'earSpeakerNotWorking'
  | 'microphoneNotWorking'
  | 'biometricsNotWorking'
  | 'powerButtonNotWorking'
  | 'volumeButtonNotWorking'
  | 'vibratorNotWorking'
  | 'proximitySensorNotWorking';

export interface EvaluationAnswers {
  // Overall (screening) questions
  isPhoneWorking: boolean | null;
  isTouchscreenWorking: boolean | null;
  isDisplayOriginal: boolean | null;
  hasValidWarranty: boolean | null;
  // Physical
  screenDisplayCondition: string | null;
  touchGlassCondition: string | null;
  backPanelCondition: string | null;
  sidePanelCondition: string | null;
  // Functional
  hardwareFaults: Partial<Record<HardwareFaultKey, boolean>>;
  // Warranty & accessories
  hasValidBill: boolean | null;
  deviceAge: string | null;
  hasOriginalCharger: boolean;
  hasOriginalBox: boolean;
}

export const emptyAnswers = (): EvaluationAnswers => ({
  isPhoneWorking: null,
  isTouchscreenWorking: null,
  isDisplayOriginal: null,
  hasValidWarranty: null,
  screenDisplayCondition: null,
  touchGlassCondition: null,
  backPanelCondition: null,
  sidePanelCondition: null,
  hardwareFaults: {},
  hasOriginalCharger: false,
  hasOriginalBox: false,
  hasValidBill: null,
  deviceAge: null,
});

export interface ScreeningQuestion {
  key: 'isPhoneWorking' | 'isTouchscreenWorking' | 'isDisplayOriginal' | 'hasValidWarranty';
  question: string;
  helper: string;
}

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    key: 'isPhoneWorking',
    question: 'Is the phone in proper working condition?',
    helper: 'It powers on, boots normally and you can make calls.',
  },
  {
    key: 'isTouchscreenWorking',
    question: 'Is the touchscreen on your phone working properly?',
    helper: 'Touch responds everywhere on the screen, with no dead zones or ghost touches.',
  },
  {
    key: 'isDisplayOriginal',
    question: "Is the phone's display original?",
    helper: 'Choose "Yes" if it was never replaced, or replaced only at an authorised service centre.',
  },
  {
    key: 'hasValidWarranty',
    question: 'Is there a valid warranty for your phone?',
    helper: 'The brand warranty is still active (you get a better price).',
  },
];

export interface ConditionOption {
  id: string;
  label: string;
  hint?: string;
  art: ConditionArtKind;
}

export interface PhysicalSection {
  key: 'screenDisplayCondition' | 'touchGlassCondition' | 'backPanelCondition' | 'sidePanelCondition';
  title: string;
  subtitle: string;
  summaryGroup: 'Screen' | 'Body';
  options: ConditionOption[];
}

export const PHYSICAL_SECTIONS: PhysicalSection[] = [
  {
    key: 'screenDisplayCondition',
    title: 'Screen condition',
    subtitle: 'Look at the display on a white screen. Any spots, patches or lines?',
    summaryGroup: 'Screen',
    options: [
      { id: 'NO_SPOT', label: 'No spot', hint: 'Clear, uniform display', art: 'display-clean' },
      { id: 'MINOR_SPOTS', label: '1–2 minor spots', hint: 'Small spots, hardly noticeable', art: 'display-minor-spots' },
      { id: 'MAJOR_SPOTS_OR_LINES', label: 'Major spots or lines', hint: 'Big patches, dead pixels or lines', art: 'display-major-spots' },
    ],
  },
  {
    key: 'touchGlassCondition',
    title: 'Touch glass condition',
    subtitle: 'Check the front glass with the screen switched off.',
    summaryGroup: 'Screen',
    options: [
      { id: 'NO_SCRATCH', label: 'No scratch or crack', hint: 'Looks like new', art: 'glass-clean' },
      { id: 'MINOR_SCRATCHES', label: 'Minor scratches', hint: '1–2 light scratches', art: 'glass-minor-scratches' },
      { id: 'HEAVY_SCRATCHES', label: 'Heavy scratches', hint: 'Many or deep scratches', art: 'glass-heavy-scratches' },
      { id: 'CRACKED_GLASS', label: 'Cracked or broken glass', hint: 'Cracks, chips or shattered', art: 'glass-cracked' },
    ],
  },
  {
    key: 'backPanelCondition',
    title: 'Back panel condition',
    subtitle: 'Check the back glass or cover.',
    summaryGroup: 'Body',
    options: [
      { id: 'NO_DEFECTS', label: 'No defects on back panel', hint: 'Flawless', art: 'back-clean' },
      { id: 'MINOR_SCRATCHES', label: 'Minor scratches', hint: 'Fewer than 2 light scratches', art: 'back-minor-scratches' },
      { id: 'HEAVY_SCRATCHES', label: 'Heavy scratches', hint: 'Deep or many scratches', art: 'back-heavy-scratches' },
      { id: 'BACK_PANEL_BROKEN', label: 'Back panel broken', hint: 'Cracked or shattered', art: 'back-broken' },
    ],
  },
  {
    key: 'sidePanelCondition',
    title: 'Center / side panel condition',
    subtitle: 'Check the metal or plastic frame around the phone.',
    summaryGroup: 'Body',
    options: [
      { id: 'NO_DEFECTS', label: 'No defects on center panel', hint: 'Clean edges', art: 'frame-clean' },
      { id: 'MINOR_DENT_OR_SCRATCHES', label: 'Minor dent or scratches', hint: 'Light scuffs, small nick', art: 'frame-minor' },
      { id: 'HEAVY_DENT', label: 'Heavy dents or scratches', hint: 'Deep dents, paint peeled', art: 'frame-heavy-dent' },
      { id: 'BENT_OR_BROKEN', label: 'Bent or broken frame', hint: 'Frame bent or separated', art: 'frame-bent' },
    ],
  },
];

export interface FunctionalIssue {
  key: HardwareFaultKey;
  label: string;
  art: ConditionArtKind;
}

export const FUNCTIONAL_ISSUES: FunctionalIssue[] = [
  { key: 'batteryHealthBelow83', label: 'Battery health is 83% & below 83%', art: 'battery' },
  { key: 'frontCameraNotWorking', label: 'Front camera not working', art: 'front-camera' },
  { key: 'backCameraNotWorking', label: 'Back camera not working', art: 'back-camera' },
  { key: 'cameraGlassBroken', label: 'Camera glass broken', art: 'camera-glass' },
  { key: 'networkProblem', label: 'Network / SIM issue', art: 'network' },
  { key: 'chargingPortNotWorking', label: 'Charging port not working', art: 'charging-port' },
  { key: 'wifiOrBluetoothNotWorking', label: 'Wi-Fi or Bluetooth not working', art: 'wifi' },
  { key: 'earSpeakerNotWorking', label: 'Speaker not working', art: 'speaker' },
  { key: 'microphoneNotWorking', label: 'Microphone not working', art: 'microphone' },
  { key: 'biometricsNotWorking', label: 'Face ID / Fingerprint not working', art: 'biometrics' },
  { key: 'powerButtonNotWorking', label: 'Power button not working', art: 'power-button' },
  { key: 'volumeButtonNotWorking', label: 'Volume button not working', art: 'volume-button' },
  { key: 'vibratorNotWorking', label: 'Vibration not working', art: 'vibration' },
  { key: 'proximitySensorNotWorking', label: 'Proximity sensor not working', art: 'proximity' },
];

/** iPhones report battery health as a percentage; Android phones and other devices don't. */
export const isIphoneModel = (modelName?: string) => /\biphone\b/i.test(modelName || '');

const BATTERY_LABEL_NON_IPHONE = 'Battery changed or battery problem';

/**
 * Functional issues worded for the selected device. Same keys (and therefore the same price
 * deduction) for every device; only the battery label differs.
 */
export const functionalIssuesFor = (modelName?: string): FunctionalIssue[] =>
  isIphoneModel(modelName)
    ? FUNCTIONAL_ISSUES
    : FUNCTIONAL_ISSUES.map((issue) =>
        issue.key === 'batteryHealthBelow83' ? { ...issue, label: BATTERY_LABEL_NON_IPHONE } : issue
      );

export const ACCESSORIES: Array<{ key: 'hasOriginalCharger' | 'hasOriginalBox'; label: string; hint: string; art: ConditionArtKind }> = [
  { key: 'hasOriginalCharger', label: 'Original charger', hint: 'Brand charger / cable', art: 'charger' },
  { key: 'hasOriginalBox', label: 'Box with same IMEI', hint: 'Original retail box', art: 'box' },
];

export const DEVICE_AGE_OPTIONS = [
  { id: 'BELOW_3_MONTHS', label: 'Below 3 months' },
  { id: '3_TO_6_MONTHS', label: '3 to 6 months' },
  { id: '6_TO_11_MONTHS', label: '6 to 11 months' },
  { id: 'ABOVE_11_MONTHS', label: 'Above 11 months' },
];

/**
 * Physical questions shown to the customer. Screen + touch-glass are always asked (also when the
 * touchscreen is dead) so the inspection team gets the full picture; the backend simply doesn't
 * stack those deductions on top of the dead-touchscreen price.
 */
export const visiblePhysicalSections = (_a: EvaluationAnswers): PhysicalSection[] => PHYSICAL_SECTIONS;

export const isTabComplete = (tab: EvalTabId, a: EvaluationAnswers): boolean => {
  switch (tab) {
    case 'overall':
      if (a.isPhoneWorking === false) return true;
      if (a.isPhoneWorking !== true) return false;
      if (a.isTouchscreenWorking === false) return true;
      return a.isTouchscreenWorking === true && a.isDisplayOriginal !== null && a.hasValidWarranty !== null;
    case 'physical':
      return visiblePhysicalSections(a).every((s) => a[s.key] !== null);
    case 'functional':
      return true; // no issues is a valid answer
    case 'warranty':
      // Phone age is asked only when the warranty is valid, and then it's required (it changes the price)
      return a.hasValidBill !== null && (a.hasValidWarranty !== true || a.deviceAge !== null);
  }
};

/**
 * Tabs that apply: a phone that doesn't power on skips the physical and functional checks and goes
 * straight to warranty & accessories.
 */
export const applicableTabs = (a: EvaluationAnswers): EvalTabId[] =>
  a.isPhoneWorking === false ? ['overall', 'warranty'] : ['overall', 'physical', 'functional', 'warranty'];

export interface SummaryGroup {
  title: string;
  items: string[];
}

const yesNo = (v: boolean | null, q: string) => (v === null ? null : `${v ? 'Yes' : 'No'}, ${q}`);

/** Human-readable answers for the "Device evaluation · Summary" panel. */
export const buildSummary = (a: EvaluationAnswers, modelName?: string): SummaryGroup[] => {
  const groups: SummaryGroup[] = [];

  const screening = SCREENING_QUESTIONS.map((q) => yesNo(a[q.key], q.question)).filter(Boolean) as string[];
  if (screening.length) groups.push({ title: 'Screening questions', items: screening });

  for (const group of ['Screen', 'Body'] as const) {
    const items = PHYSICAL_SECTIONS.filter((s) => s.summaryGroup === group)
      .map((s) => s.options.find((o) => o.id === a[s.key])?.label)
      .filter(Boolean) as string[];
    if (items.length) groups.push({ title: group, items });
  }

  const faults = functionalIssuesFor(modelName).filter((f) => a.hardwareFaults[f.key]).map((f) => f.label);
  if (faults.length) groups.push({ title: 'Functional issues', items: faults });

  // Same order as the Warranty condition step: accessories, then bill, then device age
  const accessories = ACCESSORIES.filter((x) => a[x.key]).map((x) => x.label);
  if (accessories.length) groups.push({ title: 'Accessories', items: accessories });

  const warranty: string[] = [];
  if (a.hasValidBill !== null) warranty.push(a.hasValidBill ? 'Valid bill with same IMEI' : 'No valid bill');
  const age = a.hasValidWarranty === true ? DEVICE_AGE_OPTIONS.find((o) => o.id === a.deviceAge)?.label : undefined;
  if (age) warranty.push(`Device age: ${age}`);
  if (warranty.length) groups.push({ title: 'Warranty', items: warranty });

  return groups;
};

/** Payload for POST /catalogue/estimate and the stored request conditions. */
export const buildConditionPayload = (a: EvaluationAnswers) => {
  const working = a.isPhoneWorking !== false;
  const touch = working ? a.isTouchscreenWorking !== false : false;
  const showScreen = working && touch;
  const hardwareFaults = working ? { ...a.hardwareFaults } : {};
  const hasValidBill = a.hasValidBill === true;

  const basicQuestions = {
    isPhoneWorking: working,
    isTouchscreenWorking: touch,
    isDisplayOriginal: showScreen ? a.isDisplayOriginal !== false : false,
    hasValidWarranty: showScreen ? a.hasValidWarranty === true : false,
  };

  return {
    basicQuestions,
    ...(working
      ? {
          screenDisplayCondition: a.screenDisplayCondition || 'NO_SPOT',
          touchGlassCondition: a.touchGlassCondition || 'NO_SCRATCH',
        }
      : {}),
    backPanelCondition: working ? a.backPanelCondition || 'NO_DEFECTS' : undefined,
    sidePanelCondition: working ? a.sidePanelCondition || 'NO_DEFECTS' : undefined,
    hardwareFaults,
    hasOriginalCharger: a.hasOriginalCharger,
    hasOriginalBox: a.hasOriginalBox,
    hasValidBill,
    bill_same_imei: hasValidBill,
    box_same_imei: a.hasOriginalBox,
    original_charger: a.hasOriginalCharger,
    // Only sent when the age question was shown (valid warranty), so a stale answer never changes the price
    deviceAge: basicQuestions.hasValidWarranty ? a.deviceAge || undefined : undefined,
  };
};
