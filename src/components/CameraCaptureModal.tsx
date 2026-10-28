import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, SwitchCamera, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera error:', err);
        setCameraError(err.message || 'Unable to access device camera.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleSnap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(dataUrl);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-slate-100">Live Receipt Camera Capture</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas */}
        <div className="relative bg-black aspect-[3/4] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-rose-300">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-400" />
              <p className="font-semibold text-sm">Camera Unavailable</p>
              <p className="text-xs text-rose-400/80 mt-1 max-w-xs">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Receipt framing guide overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-amber-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="bg-black/50 backdrop-blur px-2.5 py-1 rounded text-[11px] text-amber-300 font-medium">
                  Align receipt within border
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-around">
          <button
            onClick={toggleCameraFacing}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Switch front / rear camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>

          <button
            onClick={handleSnap}
            disabled={!!cameraError}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border-4 border-slate-900 shadow-lg shadow-amber-500/30 flex items-center justify-center active:scale-95 transition disabled:opacity-50"
            title="Take snapshot"
          >
            <div className="w-6 h-6 rounded-full bg-slate-950" />
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
