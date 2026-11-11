import { BuybackRequest, PayoutDetails, RequestAddress } from '../../types';

export type StatusTone = 'amber' | 'sky' | 'violet' | 'green' | 'red' | 'neutral';

export const STATUS_META: Record<string, { label: string; tone: StatusTone }> = {
  SUBMITTED: { label: 'Pickup requested', tone: 'amber' },
  UNDER_REVIEW: { label: 'Under review', tone: 'amber' },
  COLLECTION_SCHEDULED: { label: 'Pickup scheduled', tone: 'sky' },
  ASSIGNED_FOR_COLLECTION: { label: 'Agent assigned', tone: 'sky' },
  COLLECTED: { label: 'Picked up', tone: 'violet' },
  RECEIVED_AT_INSPECTION_CENTRE: { label: 'At inspection centre', tone: 'violet' },
  UNDER_INSPECTION: { label: 'Under inspection', tone: 'violet' },
  FINAL_OFFER_GENERATED: { label: 'Offer ready', tone: 'violet' },
  AWAITING_CUSTOMER_DECISION: { label: 'Offer ready', tone: 'violet' },
  OFFER_ACCEPTED: { label: 'Offer accepted', tone: 'green' },
  OFFER_REJECTED: { label: 'Offer declined', tone: 'red' },
  PAYMENT_PROCESSING: { label: 'Payment processing', tone: 'green' },
  PAYMENT_COMPLETED: { label: 'Paid', tone: 'green' },
  RETURN_INITIATED: { label: 'Return in progress', tone: 'neutral' },
  RETURNED: { label: 'Returned', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};

export const statusMeta = (status?: string) =>
  STATUS_META[status || ''] || { label: (status || 'Requested').replace(/_/g, ' ').toLowerCase(), tone: 'neutral' as StatusTone };

export const TONE_CLASSES: Record<StatusTone, string> = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20',
  neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700',
};

/** Customer-facing progress: requested → agent assigned → picked up → inspected → paid */
export const PROGRESS_STEPS = ['Requested', 'Agent assigned', 'Picked up', 'Inspected', 'Paid'];

export const progressIndex = (status?: string): number => {
  switch (status) {
    case 'COLLECTION_SCHEDULED':
    case 'ASSIGNED_FOR_COLLECTION':
      return 1;
    case 'COLLECTED':
    case 'RECEIVED_AT_INSPECTION_CENTRE':
      return 2;
    case 'UNDER_INSPECTION':
    case 'FINAL_OFFER_GENERATED':
    case 'AWAITING_CUSTOMER_DECISION':
    case 'OFFER_ACCEPTED':
    case 'PAYMENT_PROCESSING':
      return 3;
    case 'PAYMENT_COMPLETED':
      return 4;
    default:
      return 0;
  }
};

export const isClosed = (status?: string) =>
  ['PAYMENT_COMPLETED', 'OFFER_REJECTED', 'RETURNED', 'CANCELLED'].includes(status || '');

export const isStopped = (status?: string) =>
  ['OFFER_REJECTED', 'RETURN_INITIATED', 'RETURNED', 'CANCELLED'].includes(status || '');

/** "2026-11-12" → "Thu, 12 Nov 2026"; legacy free-text values are returned unchanged. */
export const formatPickupDate = (value?: string) => {
  if (!value) return 'To be confirmed';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  return value;
};

export const formatDateTime = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/** "9845012345" → "+91 98450 12345" */
export const formatPhone = (value?: string) => {
  if (!value || value === 'N/A') return 'Not provided';
  const digits = value.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : value;
};

export const addressLines = (a?: RequestAddress): string[] => {
  if (!a) return [];
  const line1 = a.street || a.addressLine1;
  const line2 = [a.area || a.addressLine2, a.landmark].filter(Boolean).join(', ');
  const line3 = [a.city, a.state].filter(Boolean).join(', ') + (a.pincode ? ` – ${a.pincode}` : '');
  return [line1, line2, line3].filter((l) => l && l.trim() && l.trim() !== '–') as string[];
};

export const payoutLabel = (p?: PayoutDetails): { title: string; detail?: string } => {
  if (!p?.method) return { title: 'To be confirmed at pickup' };
  if (p.method === 'UPI') return { title: 'UPI', detail: p.upiId };
  if (p.method === 'BANK_TRANSFER')
    return { title: 'Bank transfer (IMPS)', detail: [p.accountNumber, p.ifscCode].filter(Boolean).join(' · ') };
  return { title: 'Cash at pickup' };
};

export const deviceTitle = (r: BuybackRequest) =>
  [r.device?.brand && !r.device.modelName?.toLowerCase().startsWith(r.device.brand.toLowerCase()) ? r.device.brand : '', r.device?.modelName]
    .filter(Boolean)
    .join(' ');

export const formatINR = (value?: number) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
