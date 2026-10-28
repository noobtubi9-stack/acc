import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sun, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Hash, 
  Calendar, 
  Receipt,
  Store,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { ReceiptSummary } from '../types/claim';
import { formatRM } from '../utils/formatters';

interface ReceiptViewerProps {
  imageSrc: string;
  isSvg?: boolean;
  receiptSummary?: ReceiptSummary | null;
  onSelectSample?: () => void;
  onCaptureCamera?: () => void;
  isLoading?: boolean;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  imageSrc,
  isSvg = false,
  receiptSummary,
  onSelectSample,
  onCaptureCamera,
  isLoading = false,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert' | 'grayscale'>('normal');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFilterMode('normal');
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'contrast':
        return 'contrast-150 brightness-95';
      case 'grayscale':
        return 'grayscale contrast-125';
      case 'invert':
        return 'invert hue-rotate-180';
      default:
        return '';
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full min-h-[520px] ${
        isFullscreen ? 'p-4' : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Receipt Document Inspector</span>
          {isLoading && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse text-[11px]">
              <Sparkles className="w-3 h-3 animate-spin" />
              Auditing with Gemini 3.8...
            </span>
          )}
        </div>

        {/* Viewer Tools */}
        <div className="flex items-center gap-1">
          {/* Thermal Receipt Readability Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 mr-1">
            <button
              onClick={() => setFilterMode(prev => prev === 'normal' ? 'contrast' : prev === 'contrast' ? 'grayscale' : 'normal')}
              className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                filterMode !== 'normal' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Enhance faded thermal print (High Contrast / Grayscale)"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline capitalize">{filterMode === 'normal' ? 'Enhance' : filterMode}</span>
            </button>
          </div>

          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-slate-400 w-9 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Rotate 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Reset Zoom & Rotation"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-4 select-none min-h-[380px]">
        {imageSrc ? (
          <div 
            className="transition-transform duration-150 ease-out origin-center flex items-center justify-center max-w-full"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            {isSvg ? (
              <div 
                className={`max-w-[420px] shadow-2xl rounded-sm ${getFilterStyle()}`}
                dangerouslySetInnerHTML={{ __html: imageSrc }} 
              />
            ) : (
              <img
                src={imageSrc}
                alt="Uploaded Receipt"
                className={`max-h-[500px] w-auto max-w-full object-contain rounded shadow-2xl ${getFilterStyle()}`}
              />
            )}
          </div>
        ) : (
          <div className="text-center p-6 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-60" />
            <p className="text-sm font-medium text-slate-400">No Receipt Document Loaded</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Upload an image, snap a photo via webcam, or choose one of our verified Malaysian sample receipts.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {onSelectSample && (
                <button
                  onClick={onSelectSample}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/30 transition"
                >
                  Load Sample Receipt
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Extracted Metadata Card Overlay at bottom */}
      {receiptSummary && (
        <div className="bg-slate-950/95 border-t border-slate-800 p-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1 font-semibold">
                <Store className="w-3 h-3 text-amber-400" />
                Merchant
              </span>
              <p className="font-semibold text-slate-100 truncate" title={receiptSummary.merchant_name}>
                {receiptSummary.merchant_name || 'Unknown Vendor'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {receiptSummary.merchant_ssm_or_tax_no ? `SSM: ${receiptSummary.merchant_ssm_or_tax_no}` : 'No SSM/Tax No'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1 font-semibold">
                <Hash className="w-3 h-3 text-amber-400" />
                Invoice / Receipt #
              </span>
              <p className="font-semibold text-slate-100 font-mono truncate">
                {receiptSummary.invoice_receipt_no || 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {receiptSummary.date || 'Unspecified'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Subtotal &amp; Tax
              </span>
              <p className="text-slate-300">
                Subtotal: <span className="font-mono">{formatRM(receiptSummary.receipt_subtotal)}</span>
              </p>
              <p className="text-slate-400 text-[11px]">
                SST: <span className="font-mono">{formatRM(receiptSummary.tax_sst)}</span>
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                Grand Total
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                {formatRM(receiptSummary.receipt_grand_total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
