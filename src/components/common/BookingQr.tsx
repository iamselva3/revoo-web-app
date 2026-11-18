import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { QrCode } from 'lucide-react';

/** The link a pickup partner's scan opens (also works with the phone's own camera app). */
export const partnerLinkFor = (requestNumber: string) => `https://genietn.in/partner?r=${encodeURIComponent(requestNumber)}`;

/** QR code as an SVG (black on white with a quiet zone, readable in dark mode too). */
export const QrSvg: React.FC<{ text: string; className?: string; title?: string }> = ({ text, className = '', title }) => {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 4},${y + 4}h1v1h-1z`;
    }
    return { size: n + 8, path: d };
  }, [text]);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={title ?? 'QR code'} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
};

/**
 * "Show this to our pickup partner": the booking's QR, so the partner opens the booking in one scan
 * when they arrive (they can also type the number).
 */
export const BookingQr: React.FC<{ requestNumber: string; className?: string }> = ({ requestNumber, className = '' }) => {
  const number = requestNumber.replace(/^REV-/i, 'GENIE-');
  return (
    <div className={`flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 ${className}`}>
      <QrSvg text={partnerLinkFor(number)} title={`QR code for booking ${number}`} className="h-28 w-28 shrink-0 rounded-xl" />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-white">
          <QrCode className="h-4 w-4 text-amber-600 dark:text-amber-300" /> Show this to our pickup partner
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">
          They scan it to open your booking and check your device. Booking number:
        </p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-ink dark:text-white">{number}</p>
      </div>
    </div>
  );
};
