import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function BarcodeScanner({ onResult }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectedRef = useRef(false);

  const [supported, setSupported] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [looking, setLooking] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const lookupBarcode = async (code) => {
    setLooking(true);
    setNotFound(false);
    try {
      const { data } = await api.get(`/foods/barcode/${code}`);
      onResult(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
        detectedRef.current = false;
        setScanning(true);
        // restart scanning loop
        startScanLoop(streamRef.current);
      } else {
        setCameraError('Barcode lookup failed. Try again.');
        detectedRef.current = false;
        setScanning(true);
        startScanLoop(streamRef.current);
      }
    } finally {
      setLooking(false);
    }
  };

  const startScanLoop = (stream) => {
    if (!stream) return;
    let detector;
    try {
      detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
      });
    } catch {
      setSupported(false);
      return;
    }

    const scan = async () => {
      if (detectedRef.current || !videoRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0 && !detectedRef.current) {
          detectedRef.current = true;
          setScanning(false);
          stopCamera();
          lookupBarcode(barcodes[0].rawValue);
          return;
        }
      } catch {}
      rafRef.current = requestAnimationFrame(scan);
    };
    rafRef.current = requestAnimationFrame(scan);
  };

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setSupported(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        startScanLoop(stream);
      })
      .catch(() => {
        setCameraError('Camera access denied. Please allow camera permission and try again.');
      });

    return () => stopCamera();
  }, []);

  if (!supported) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-2xl">📷</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Browser not supported</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Barcode scanning requires Chrome or the CalorieAI Android app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cameraError && (
        <p className="text-red-500 text-sm text-center">{cameraError}</p>
      )}

      <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* scanning frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-56 h-36">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-md" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-md" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-md" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-md" />
            {scanning && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-primary-400 opacity-80 animate-scan" />
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        {looking && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            Looking up product...
          </div>
        )}
        {notFound && !looking && (
          <p className="text-sm text-yellow-500">Product not found — try another barcode</p>
        )}
        {scanning && !looking && !notFound && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Point camera at a product barcode</p>
        )}
      </div>
    </div>
  );
}
