import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, X } from 'lucide-react';

/**
 * Full-screen camera that reads the booking QR. Uses the browser's own QR reader when it has one
 * (Chrome on Android), and a small decoder otherwise (iPhone Safari). Calls onResult once.
 */
export const QrScanner: React.FC<{ onResult: (text: string) => void; onClose: () => void }> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let cancelled = false;
    const canvas = document.createElement('canvas');

    const finish = (text: string) => {
      if (doneRef.current || !text) return;
      doneRef.current = true;
      navigator.vibrate?.(60);
      onResult(text);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser can’t open the camera. Type the booking number instead.');
        setStarting(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera permission is off. Allow the camera for this site in your browser settings, or type the booking number.'
            : 'Couldn’t open the camera. Type the booking number instead.'
        );
        setStarting(false);
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setStarting(false);

      const Detector = (window as any).BarcodeDetector;
      let detector: any = null;
      if (Detector) {
        try {
          const formats: string[] = (await Detector.getSupportedFormats?.()) ?? ['qr_code'];
          if (formats.includes('qr_code')) detector = new Detector({ formats: ['qr_code'] });
        } catch {
          detector = null;
        }
      }
      const jsQR = detector ? null : (await import('jsqr')).default;

      const scan = async () => {
        if (cancelled || doneRef.current) return;
        if (video.readyState >= 2 && video.videoWidth) {
          try {
            if (detector) {
              const codes = await detector.detect(video);
              if (codes?.[0]?.rawValue) return finish(codes[0].rawValue);
            } else if (jsQR) {
              // Centre square, downscaled: fast enough on low-end phones
              const side = Math.min(video.videoWidth, video.videoHeight);
              const size = Math.min(640, side);
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
              ctx.drawImage(video, (video.videoWidth - side) / 2, (video.videoHeight - side) / 2, side, side, 0, 0, size, size);
              const img = ctx.getImageData(0, 0, size, size);
              const code = jsQR(img.data, size, size, { inversionAttempts: 'dontInvert' });
              if (code?.data) return finish(code.data);
            }
          } catch {
            // a frame that can't be read: try the next one
          }
        }
        timer = window.setTimeout(scan, 180);
      };
      scan();
    };

    start();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Scan the booking QR">
      <div className="flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] text-white">
        <p className="text-sm font-semibold">Scan the QR on the customer’s booking</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Close the camera"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        {!error && (
          <div className="relative h-64 w-64 max-w-[75vw] max-h-[75vw]">
            {/* Corner marks */}
            {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'].map((c) => (
              <span key={c} className={`absolute h-10 w-10 border-amber-400 ${c}`} />
            ))}
            <span className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse bg-amber-400/80" />
          </div>
        )}
        {starting && !error && <p className="absolute bottom-10 text-sm text-white/80">Opening the camera…</p>}
        {error && (
          <div className="relative mx-6 max-w-sm rounded-3xl bg-white p-6 text-center dark:bg-neutral-950">
            <CameraOff className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm text-slate-700 dark:text-neutral-200">{error}</p>
            <button type="button" onClick={onClose} className="btn-genie mt-5 w-full">
              Type the number
            </button>
          </div>
        )}
      </div>
      {!error && (
        <p className="px-6 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 text-center text-xs text-white/70">
          The customer finds it in Genie → Profile → their booking. You can also scan it with the phone’s camera app.
        </p>
      )}
    </div>
  );
};
