import {
  ACCESSORIES,
  DEVICE_AGE_OPTIONS,
  EvaluationAnswers,
  HardwareFaultKey,
  PHYSICAL_SECTIONS,
  SCREENING_QUESTIONS,
  emptyAnswers,
  functionalIssuesFor,
  underWarranty,
} from '../pages/sell/evaluation';

/**
 * The customer's stored answers (a booking from the website or the app) as the evaluation's
 * answers, so the partner starts from exactly what the customer said and only changes what differs.
 */
export const answersFromCondition = (c: any): EvaluationAnswers => {
  const a = emptyAnswers();
  if (!c || typeof c !== 'object') return a;
  const bq = c.basicQuestions || {};
  const working = bq.isPhoneWorking !== false;
  a.isPhoneWorking = working;
  if (!working) return a;
  a.isTouchscreenWorking = bq.isTouchscreenWorking !== false;
  if (a.isTouchscreenWorking) {
    a.isDisplayOriginal = bq.isDisplayOriginal !== false;
    if (a.isDisplayOriginal) a.hasValidWarranty = bq.hasValidWarranty === true;
  }
  const valid = (key: (typeof PHYSICAL_SECTIONS)[number]['key'], value: unknown) =>
    PHYSICAL_SECTIONS.find((s) => s.key === key)!.options.some((o) => o.id === value) ? (value as string) : null;
  a.screenDisplayCondition = valid('screenDisplayCondition', c.screenDisplayCondition) ?? 'NO_SPOT';
  a.touchGlassCondition = valid('touchGlassCondition', c.touchGlassCondition) ?? 'NO_SCRATCH';
  a.backPanelCondition = valid('backPanelCondition', c.backPanelCondition) ?? 'NO_DEFECTS';
  a.sidePanelCondition = valid('sidePanelCondition', c.sidePanelCondition) ?? 'NO_DEFECTS';
  const faults: Partial<Record<HardwareFaultKey, boolean>> = {};
  for (const [key, value] of Object.entries(c.hardwareFaults || {})) if (value === true) faults[key as HardwareFaultKey] = true;
  a.hardwareFaults = faults;
  a.hasOriginalCharger = c.hasOriginalCharger === true;
  a.hasOriginalBox = c.hasOriginalBox === true;
  a.hasValidBill = c.hasValidBill === true;
  a.deviceAge = DEVICE_AGE_OPTIONS.some((o) => o.id === c.deviceAge) ? c.deviceAge : underWarranty(a) ? 'ABOVE_11_MONTHS' : null;
  return a;
};

/** What the customer said for one question, when the partner's answer is different (null = same). */
export interface AnswerDiff {
  question: string;
  customer: string;
  partner: string;
}

const yn = (v: boolean | null) => (v === null ? 'Not asked' : v ? 'Yes' : 'No');

/** Every question where the partner's answer differs from the customer's, in the order asked. */
export const answerDiffs = (customer: EvaluationAnswers, partner: EvaluationAnswers, modelName?: string): AnswerDiff[] => {
  const diffs: AnswerDiff[] = [];
  for (const q of SCREENING_QUESTIONS) {
    if (customer[q.key] !== partner[q.key] && !(customer[q.key] === null && partner[q.key] === null)) {
      diffs.push({ question: q.question, customer: yn(customer[q.key]), partner: yn(partner[q.key]) });
    }
  }
  if (partner.isPhoneWorking === false) return diffs;
  for (const s of PHYSICAL_SECTIONS) {
    if (customer[s.key] !== partner[s.key] && partner[s.key] !== null) {
      const label = (id: string | null) => s.options.find((o) => o.id === id)?.label ?? 'Not asked';
      diffs.push({ question: s.title, customer: label(customer[s.key]), partner: label(partner[s.key]) });
    }
  }
  for (const f of functionalIssuesFor(modelName)) {
    const c = Boolean(customer.hardwareFaults[f.key]);
    const p = Boolean(partner.hardwareFaults[f.key]);
    if (c !== p) diffs.push({ question: f.label, customer: c ? 'Has this issue' : 'No issue', partner: p ? 'Has this issue' : 'No issue' });
  }
  for (const acc of [...ACCESSORIES, { key: 'hasValidBill' as const, label: 'Bill with same IMEI' }]) {
    const c = Boolean(customer[acc.key]);
    const p = Boolean(partner[acc.key]);
    if (c !== p) diffs.push({ question: acc.label, customer: c ? 'Included' : 'Not included', partner: p ? 'Included' : 'Not included' });
  }
  if (underWarranty(partner) && customer.deviceAge !== partner.deviceAge) {
    const label = (id: string | null) => DEVICE_AGE_OPTIONS.find((o) => o.id === id)?.label ?? 'Not asked';
    diffs.push({ question: 'Device age', customer: label(customer.deviceAge), partner: label(partner.deviceAge) });
  }
  return diffs;
};

/** Shrinks a camera photo (often 4–12 MB) to a quick-to-send JPEG, longest side 1600 px. */
export const shrinkPhoto = async (file: File, maxSide = 1600): Promise<File> => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    return blob ? new File([blob], 'check.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
};
