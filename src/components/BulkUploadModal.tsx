import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Trash2, 
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import { AuditedReceiptRecord, AuditResult, normalizeAuditResult } from '../types/claim';
import { formatRM } from '../utils/formatters';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatchRecords: (records: AuditedReceiptRecord[]) => void;
  staffName: string;
  staffId: string;
  department: string;
  claimMonth: string;
}

interface QueuedItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'auditing' | 'completed' | 'failed';
  result?: AuditResult;
  errorMessage?: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onAddBatchRecords,
  staffName,
  staffId,
  department,
  claimMonth,
}) => {
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueuedItem[] = Array.from(files).map((file, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const processQueue = async () => {
    setIsProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      // Update status to auditing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'auditing' } : q))
      );

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        const cleanBase64 = base64.replace(/^data:[a-zA-Z0-9\/+-]+;base64,/, '');

        const response = await fetch('/api/audit-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: cleanBase64,
            mimeType: item.file.type || 'image/jpeg',
            claimantNotes: `Bulk upload: ${item.file.name}`,
          }),
        });

        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Audit failed');
        }

        const normalized = normalizeAuditResult(json.data);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'completed', result: normalized } : q
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'failed', errorMessage: err.message || 'Audit failed' }
              : q
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleCommitAll = () => {
    const completedItems = queue.filter((q) => q.status === 'completed' && q.result);
    if (completedItems.length === 0) return;

    const newRecords: AuditedReceiptRecord[] = completedItems.map((q) => ({
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      claimantName: staffName,
      claimantStaffId: staffId,
      department: department,
      claimMonth: claimMonth,
      imagePreviewUrl: q.previewUrl,
      fileName: q.file.name,
      fileSizeBytes: q.file.size,
      status: q.result?.audit_notes && q.result.audit_notes.length > 0 ? 'needs_review' : 'verified',
      auditResult: q.result!,
      notes: `Batch processed from ${q.file.name}`,
    }));

    onAddBatchRecords(newRecords);
    onClose();
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Multi-Receipt Bulk Upload Queue
              </h3>
              <p className="text-xs text-slate-400">
                Upload multiple outstation/monthly receipts to automatically audit and add to your claim batch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50 group">
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 transition mb-1" />
            <p className="text-xs font-semibold text-slate-200">
              Click or drag multiple receipt photos here
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports PNG, JPG, JPEG, WEBP (Batch processing powered by Gemini 3.8 Flash)
            </p>
          </label>
        </div>

        {/* Queue Items List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.previewUrl}
                  alt="Thumb"
                  className="w-12 h-12 object-cover rounded border border-slate-800 shrink-0 bg-slate-900"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{item.file.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </p>
                  {item.result && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-amber-300 font-bold">
                        {formatRM(item.result.claim_total_rm)}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        • {item.result.receipt_info.merchant_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {item.result.claim_items.length} items
                      </span>
                    </div>
                  )}
                  {item.errorMessage && (
                    <p className="text-[11px] text-rose-400 mt-0.5">{item.errorMessage}</p>
                  )}
                </div>
              </div>

              {/* Status pill & remove */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'pending' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
                {item.status === 'auditing' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Auditing...
                  </span>
                )}
                {item.status === 'completed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Audited
                  </span>
                )}
                {item.status === 'failed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                )}

                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isProcessing}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {queue.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No files added to bulk queue yet.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            {completedCount} of {queue.length} receipts audited
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>

            {queue.some((q) => q.status === 'pending' || q.status === 'failed') && (
              <button
                onClick={processQueue}
                disabled={isProcessing || queue.length === 0}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Auditing Batch...' : 'Start Audit Queue'}</span>
              </button>
            )}

            {completedCount > 0 && (
              <button
                onClick={handleCommitAll}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Add {completedCount} to Monthly Batch</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
