/**
 * EMO Book Services Sdn Bhd - Corporate Claims & Receipt Auditor
 * Main Application Component
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import { 
  AuditResult, 
  AuditedReceiptRecord, 
  ClaimEntry, 
  ReceiptSummary 
} from './types/claim';
import { SAMPLE_RECEIPTS, SampleReceipt } from './data/sampleReceipts';
import { formatRM, downloadJson, downloadCsv } from './utils/formatters';
import { Header } from './components/Header';
import { ReceiptViewer } from './components/ReceiptViewer';
import { ClaimLedgerTable } from './components/ClaimLedgerTable';
import { AuditFlagsPanel } from './components/AuditFlagsPanel';
import { MonthlyBatchView } from './components/MonthlyBatchView';
import { OfficialVoucherModal } from './components/OfficialVoucherModal';
import { COAExplorerModal } from './components/COAExplorerModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { SampleReceiptsModal } from './components/SampleReceiptsModal';

const STORAGE_KEY = 'emo_book_services_claims_records_v1';

export default function App() {
  // Navigation & Profile State
  const [currentTab, setCurrentTab] = useState<'audit' | 'batch' | 'codebook'>('audit');
  const [staffName, setStaffName] = useState<string>('Mohd Haziq bin Ismail');
  const [staffId, setStaffId] = useState<string>('EMO-STF-084');
  const [department, setDepartment] = useState<string>('Sales & Marketing');
  const [claimMonth, setClaimMonth] = useState<string>('2026-10');

  // Active Receipt Audit State
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isSvg, setIsSvg] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [claimantNotes, setClaimantNotes] = useState<string>('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedToBatch, setIsSavedToBatch] = useState<boolean>(false);

  // Batch Records State
  const [batchRecords, setBatchRecords] = useState<AuditedReceiptRecord[]>([]);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isCodebookOpen, setIsCodebookOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved batch or seed initial samples on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBatchRecords(parsed);
          // Set first record as active
          loadRecordIntoWorkspace(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading stored claims:', e);
    }

    // If no stored data, initialize with verified sample receipts
    initInitialSamples();
  }, []);

  // Save batch records to localStorage
  const saveBatchToStorage = (records: AuditedReceiptRecord[]) => {
    setBatchRecords(records);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error persisting batch records:', e);
    }
  };

  const initInitialSamples = () => {
    const seeded: AuditedReceiptRecord[] = SAMPLE_RECEIPTS.map((s, idx) => ({
      id: `seeded-${s.id}-${idx}`,
      createdAt: new Date().toISOString(),
      claimantName: staffName,
      claimantStaffId: staffId,
      department: department,
      claimMonth: claimMonth,
      imagePreviewUrl: s.imageSvg,
      fileName: `${s.name.replace(/\s+/g, '_')}.svg`,
      fileSizeBytes: 2048,
      status: 'verified',
      auditResult: s.expectedAudit,
      notes: s.description,
    }));
    saveBatchToStorage(seeded);
    loadRecordIntoWorkspace(seeded[0]);
  };

  const loadRecordIntoWorkspace = (record: AuditedReceiptRecord) => {
    setActiveRecordId(record.id);
    setImageSrc(record.imagePreviewUrl);
    setIsSvg(record.imagePreviewUrl.startsWith('<svg'));
    setFileName(record.fileName);
    setFileSizeBytes(record.fileSizeBytes);
    setClaimantNotes(record.notes || '');
    setAuditResult(record.auditResult);
    setIsSavedToBatch(true);
    setErrorMessage(null);
  };

  const handleSelectSample = (sample: SampleReceipt) => {
    const newRecordId = `rec-${Date.now()}`;
    setActiveRecordId(newRecordId);
    setImageSrc(sample.imageSvg);
    setIsSvg(true);
    setFileName(`${sample.name.replace(/\s+/g, '_')}.svg`);
    setFileSizeBytes(1800);
    setClaimantNotes(sample.description);
    setAuditResult(sample.expectedAudit);
    setIsSavedToBatch(false);
    setErrorMessage(null);
    setCurrentTab('audit');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSizeBytes(file.size);
    setIsSvg(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImageSrc(dataUrl);
      setIsSavedToBatch(false);
      // Auto-trigger audit
      await runAudit(dataUrl, file.type, file.name);
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-upload same file if desired
    e.target.value = '';
  };

  const handleCameraCapture = async (dataUrl: string) => {
    setImageSrc(dataUrl);
    setIsSvg(false);
    setFileName(`Receipt_Capture_${new Date().toISOString().slice(0, 10)}.jpg`);
    setFileSizeBytes(dataUrl.length);
    setIsSavedToBatch(false);
    await runAudit(dataUrl, 'image/jpeg', 'camera_capture.jpg');
  };

  // Run audit with server-side Gemini 3.8 Flash
  const runAudit = async (imgData: string, mimeType: string, fName: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // If it's an SVG string, convert to standard raster image canvas or send as is
      let base64ToSend = imgData;
      if (imgData.startsWith('<svg')) {
        // Convert SVG to dataURL via offscreen canvas
        const blob = new Blob([imgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 800, 1360);
          base64ToSend = canvas.toDataURL('image/jpeg', 0.9);
        }
        URL.revokeObjectURL(url);
      }

      const response = await fetch('/api/audit-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ToSend,
          mimeType: 'image/jpeg',
          claimantNotes,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Server failed to audit receipt.');
      }

      const result: AuditResult = json.data;
      setAuditResult(result);
      setIsSavedToBatch(false);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setErrorMessage(
        err.message || 'Failed to complete receipt audit. Please verify the image readability and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBatch = () => {
    if (!auditResult) return;

    const recordId = activeRecordId || `rec-${Date.now()}`;
    const newRecord: AuditedReceiptRecord = {
      id: recordId,
      createdAt: new Date().toISOString(),
      claimantName: staffName,
      claimantStaffId: staffId,
      department: department,
      claimMonth: claimMonth,
      imagePreviewUrl: imageSrc,
      fileName: fileName || 'Receipt.jpg',
      fileSizeBytes: fileSizeBytes || 1024,
      status: 'verified',
      auditResult: auditResult,
      notes: claimantNotes,
    };

    // Update existing or add new
    const existingIndex = batchRecords.findIndex((r) => r.id === recordId);
    let updatedBatch: AuditedReceiptRecord[];
    if (existingIndex >= 0) {
      updatedBatch = [...batchRecords];
      updatedBatch[existingIndex] = newRecord;
    } else {
      updatedBatch = [newRecord, ...batchRecords];
    }

    saveBatchToStorage(updatedBatch);
    setActiveRecordId(recordId);
    setIsSavedToBatch(true);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = batchRecords.filter((r) => r.id !== id);
    saveBatchToStorage(updated);
    if (activeRecordId === id) {
      if (updated.length > 0) {
        loadRecordIntoWorkspace(updated[0]);
      } else {
        resetWorkspace();
      }
    }
  };

  const resetWorkspace = () => {
    setActiveRecordId(null);
    setImageSrc('');
    setIsSvg(false);
    setFileName('');
    setFileSizeBytes(0);
    setClaimantNotes('');
    setAuditResult(null);
    setIsSavedToBatch(false);
    setErrorMessage(null);
    setCurrentTab('audit');
  };

  const handleDownloadSingleJson = () => {
    if (!auditResult) return;
    const vendorSlug = (auditResult.receipt_summary.merchant_name || 'receipt')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    downloadJson(auditResult, `EMO_Audit_${vendorSlug}_${auditResult.receipt_summary.date || 'claim'}.json`);
  };

  const handleDownloadSingleCsv = () => {
    if (!auditResult) return;
    const summary = auditResult.receipt_summary;
    const headers = [
      'Merchant Name',
      'SSM / Tax No',
      'Invoice / Receipt No',
      'Date',
      'Account Code',
      'Details / Particulars',
      'Amount (RM)',
      'Remark',
      'Receipt Grand Total (RM)',
    ];
    const rows = auditResult.claim_entries.map((e) => [
      summary.merchant_name,
      summary.merchant_ssm_or_tax_no || '',
      summary.invoice_receipt_no || '',
      summary.date,
      e.code,
      e.details,
      Number(e.amount_rm).toFixed(2),
      e.remark || '',
      Number(summary.receipt_grand_total).toFixed(2),
    ]);
    downloadCsv(rows, headers, `EMO_Claim_${summary.invoice_receipt_no || 'audit'}.csv`);
  };

  const batchTotalRm = batchRecords.reduce((sum, r) => sum + (r.auditResult.claim_total_rm || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Corporate Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        staffName={staffName}
        setStaffName={setStaffName}
        staffId={staffId}
        setStaffId={setStaffId}
        department={department}
        setDepartment={setDepartment}
        claimMonth={claimMonth}
        setClaimMonth={setClaimMonth}
        batchCount={batchRecords.length}
        batchTotal={batchTotalRm}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenCodebook={() => setIsCodebookOpen(true)}
        onNewAudit={resetWorkspace}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* TAB 1: AUDIT WORKSPACE */}
        {currentTab === 'audit' && (
          <div className="space-y-4">
            
            {/* Upload & Quick Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Upload className="w-4 h-4 text-slate-950" />
                    <span>Upload Receipt (PNG/JPG)</span>
                  </button>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Live Camera</span>
                  </button>

                  <button
                    onClick={() => setIsSampleModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Malaysian Test Receipts (5)</span>
                  </button>

                  {imageSrc && (
                    <button
                      onClick={() => runAudit(imageSrc, 'image/jpeg', fileName)}
                      disabled={isLoading}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Auditing with Gemini 3.8...' : 'Re-Audit Document'}</span>
                    </button>
                  )}
                </div>

                {/* Optional Claimant Notes */}
                <div className="flex-1 max-w-lg">
                  <input
                    type="text"
                    value={claimantNotes}
                    onChange={(e) => setClaimantNotes(e.target.value)}
                    placeholder="Claimant remarks (e.g., book fair booth setup, Penang branch trip, urgent courier)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Side-by-Side Dual Pane Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left Column: Receipt Document Viewer (5 cols) */}
              <div className="lg:col-span-5 h-[620px] sticky top-24">
                <ReceiptViewer
                  imageSrc={imageSrc}
                  isSvg={isSvg}
                  receiptSummary={auditResult?.receipt_summary}
                  onSelectSample={() => setIsSampleModalOpen(true)}
                  onCaptureCamera={() => setIsCameraOpen(true)}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Column: Claims Ledger Schedule & Rule Compliance (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {auditResult ? (
                  <>
                    {/* Compliance & Audit Flags */}
                    <AuditFlagsPanel
                      flags={auditResult.audit_flags || []}
                      claimEntries={auditResult.claim_entries || []}
                    />

                    {/* Claims Ledger Table */}
                    <ClaimLedgerTable
                      entries={auditResult.claim_entries || []}
                      onChangeEntries={(newEntries) => {
                        const newTotal = newEntries.reduce(
                          (sum, e) => sum + (Number(e.amount_rm) || 0),
                          0
                        );
                        setAuditResult({
                          ...auditResult,
                          claim_entries: newEntries,
                          claim_total_rm: Math.round(newTotal * 100) / 100,
                        });
                        setIsSavedToBatch(false);
                      }}
                      receiptSummary={auditResult.receipt_summary}
                      onSaveToBatch={handleSaveToBatch}
                      onDownloadJson={handleDownloadSingleJson}
                      onDownloadCsv={handleDownloadSingleCsv}
                      onOpenCodebook={() => setIsCodebookOpen(true)}
                      isSaved={isSavedToBatch}
                    />
                  </>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 min-h-[400px] flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-600 mb-3 opacity-60" />
                    <h3 className="text-base font-bold text-slate-200">
                      EMO Claims Audit Engine Ready
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5 mb-5 leading-relaxed">
                      Upload an employee receipt or select a preloaded Malaysian test receipt above. The auditor will automatically extract the invoice, separate multi-item expenditures, check accommodation states, split petrol mart items, and map to EMO official account codes.
                    </p>
                    <button
                      onClick={() => setIsSampleModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Load Sample Test Receipt</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MONTHLY BATCH STATEMENT */}
        {currentTab === 'batch' && (
          <MonthlyBatchView
            records={batchRecords}
            claimMonth={claimMonth}
            staffName={staffName}
            staffId={staffId}
            department={department}
            onEditRecord={(record) => {
              loadRecordIntoWorkspace(record);
              setCurrentTab('audit');
            }}
            onDeleteRecord={handleDeleteRecord}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onNewAudit={resetWorkspace}
            onLoadSamples={initInitialSamples}
          />
        )}

        {/* TAB 3: COA CODEBOOK */}
        {currentTab === 'codebook' && (
          <div className="space-y-4">
            <COAExplorerModal
              isOpen={true}
              onClose={() => setCurrentTab('audit')}
              onSelectCode={(code) => {
                if (auditResult && auditResult.claim_entries.length > 0) {
                  const updated = [...auditResult.claim_entries];
                  updated[0].code = code;
                  setAuditResult({ ...auditResult, claim_entries: updated });
                }
                setCurrentTab('audit');
              }}
            />
          </div>
        )}

      </main>

      {/* Modals */}
      <OfficialVoucherModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        records={batchRecords}
        staffName={staffName}
        staffId={staffId}
        department={department}
        claimMonth={claimMonth}
      />

      {currentTab !== 'codebook' && (
        <COAExplorerModal
          isOpen={isCodebookOpen}
          onClose={() => setIsCodebookOpen(false)}
        />
      )}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <SampleReceiptsModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EMO Book Services Sdn Bhd (1249821-M) &bull; Corporate Claims &amp; Accounts Payable</span>
          <span>Powered by Gemini 3.8 Flash Vision Audit Engine</span>
        </div>
      </footer>
    </div>
  );
}
