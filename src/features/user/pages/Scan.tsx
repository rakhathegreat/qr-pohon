import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import BottomNav from '@features/user/components/BottomNav';
import { Scan as ScanIcon } from 'lucide-react';

const qrcodeRegionId = 'qr-reader';

const Scan = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(qrcodeRegionId);
    const applyFullSizeVideo = () => {
      const root = document.getElementById(qrcodeRegionId);
      if (!root) return;
      root.style.width = '100%';
      root.style.height = '100%';
      const scanRegion = root.querySelector<HTMLElement>('#qr-reader__scan_region');
      if (scanRegion) {
        scanRegion.style.width = '100%';
        scanRegion.style.height = '100%';
        scanRegion.style.display = 'flex';
        scanRegion.style.alignItems = 'center';
        scanRegion.style.justifyContent = 'center';
      }
      const video = root.querySelector<HTMLVideoElement>('video');
      if (video) {
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
      }
    };

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        { fps: 10, aspectRatio: 1.777778 },
        (decodedText) => {
          const id = decodedText.trim();
          window.location.href = `/detail/${encodeURIComponent(id)}`;
        },
        () => {}
      )
      .then(() => {
        scannerRef.current = html5Qrcode;
        applyFullSizeVideo();
        window.addEventListener('resize', applyFullSizeVideo);
      })
      .catch((err) => console.error('Kamera gagal dibuka', err));

    return () => {
      window.removeEventListener('resize', applyFullSizeVideo);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <div className='absolute z-30 left-1/2 top-1/5 -translate-y-1/2 -translate-x-1/2'>
        <span className='py-3 px-6 rounded-xl text-md font-medium bg-black/40 text-white '>Scan Tree QR Code</span>
      </div>
      <ScanIcon strokeWidth={0.5} className="absolute z-30 top-1/2 left-1/2 h-80 w-80 animate-pulse -translate-x-1/2 -translate-y-1/2 text-white" />
      <div id={qrcodeRegionId} className="absolute inset-0 h-full w-full" />
      <BottomNav />
    </div>
  );
};

export default Scan;
