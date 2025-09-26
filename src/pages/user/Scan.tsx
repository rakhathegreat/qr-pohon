import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '../../components/Navbar';

const qrcodeRegionId = 'qr-reader';

const Scan = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(qrcodeRegionId);

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.777778 },
        (decodedText) => {
          const id = decodedText.trim();
          window.location.href = `/detail/${encodeURIComponent(id)}`;
        },
        () => {}
      )
      .then(() => (scannerRef.current = html5Qrcode))
      .catch((err) => console.error('Kamera gagal dibuka', err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div id={qrcodeRegionId} className="absolute inset-0 w-full h-full object-cover" />
      <Navbar />
    </div>
  );
};

export default Scan;