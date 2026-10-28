import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Edit3, 
  Plus, 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  FileCheck, 
  ShieldCheck, 
  UserCheck, 
  DollarSign, 
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
  ChevronDown,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { 
  AuditedReceiptRecord, 
  ClaimItem, 
  EMO_ACCOUNT_CODES, 
  ReceiptInfo,
  ClaimStatus 
} from '../types/claim';
import { formatRM } from '../utils/formatters';

interface AdminClaimReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AuditedReceiptRecord | null;
  onSaveRecord: (updated: AuditedReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: AuditedReceiptRecord) => void;
  adminEmail: string;
}

export const AdminClaimReviewModal: React.FC<AdminClaimReviewModalProps> = ({
  isOpen,
  onClose,
  record,
  onSaveRecord,
  onDeleteRecord,
  onPrintRecord,
  adminEmail,
}) => {
  if (!isOpen || !record) return null;

  // Local editable draft state
  const [items, setItems] = useState<ClaimItem[]>([...record.auditResult.claim_items]);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo>({ ...record.auditResult.receipt_info });
  const [status, setStatus] = useState<ClaimStatus>(record.status);
  const [adminNote, setAdminNote] = useState<string>(record.adminAuditNote || '');
  const [rejectionReason, setRejectionReason] = useState<string>(record.rejectionReason || '');
  const [activeTab, setActiveTab] = useState<'review' | 'image' | 'audit_trail'>('review');

  // Thermal image controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [contrastFilter, setContrastFilter] = useState<'normal' | 'high_contrast' | 'invert'>('normal');
  const [rotation, setRotation] = useState<number>(0);

  // Math recalculations
  const calculatedSum = items.reduce((sum, item) => sum + (Number(item.amount_rm) || 0), 0);
  const roundedSum = Math.round(calculatedSum * 100) / 100;
  const receiptTotal = Number(receiptInfo.total_amount_rm) || 0;
  const variance = Math.abs(roundedSum - receiptTotal);
  const isBalanced = variance < 0.05;

  // Handle row edits
  const handleItemChange = (index: number, field: keyof ClaimItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: ClaimItem = {
      id: `item-manual-${Date.now()}`,
      code: 'OTHERS',
      details: 'Additional business expenditure',
      amount_rm: 0.0,
      remark: 'Manually added by Accounts Admin',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A claim must have at least one line item.');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  // One-click Verification
  const handleVerify = () => {
    const now = new Date().toISOString();
    const updated: AuditedReceiptRecord = {
      ...record,
      status: 'verified',
      verifiedBy: adminEmail,
      verifiedAt: now,
      adminAuditNote: adminNote || 'Verified and reconciled by Accounts Admin.',
      auditResult: {
        ...record.auditResult,
        receipt_info: receiptInfo,
        claim_items: items,
        claim_total_rm: roundedSum,
        audit_notes: isBalanced ? [] : [`Admin Note: Minor rounding adjustment (${formatRM(variance)})`],
      },
    };
    onSaveRecord(updated);
    setStatus('verified');
  };

  // Full Save Changes
  const handleSaveAll = () => {
    const updated: AuditedReceiptRecord = {
      ...record,
      status,
      adminAuditNote: adminNote,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      auditResult: {
        ...record.auditResult,
        receipt_info: receiptInfo,
        claim_items: items,
        claim_total_rm: roundedSum,
        audit_notes: isBalanced ? [] : [`Discrepancy: Variance of ${formatRM(variance)} between items and receipt total.`],
      },
    };
    onSaveRecord(updated);
    onClose();
  };

  // Quick State change
  const handleQuickApprove = () => {
    const now = new Date().toISOString();
    const updated: AuditedReceiptRecord = {
      ...record,
      status: 'approved',
      approvedBy: adminEmail,
      approvedAt: now,
      verifiedBy: record.verifiedBy || adminEmail,
      verifiedAt: record.verifiedAt || now,
      auditResult: {
        ...record.auditResult,
        receipt_info: receiptInfo,
        claim_items: items,
        claim_total_rm: roundedSum,
      },
    };
    onSaveRecord(updated);
    setStatus('approved');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Accounts Admin Claim Review &amp; Reconciliation
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : status === 'approved'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Claimant: <strong>{record.claimantName}</strong> ({record.claimantStaffId})</span>
                <span>•</span>
                <span>Dept: {record.department}</span>
                <span>•</span>
                <span>Claim Month: {record.claimMonth}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintRecord(record)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print official EMO claim form"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Bar */}
        <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'review'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Claim Ledger &amp; Reclassification
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'image'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receipt Image Audit ({record.fileName || 'Document'})
            </button>
            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'audit_trail'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail &amp; Sign-off
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Items Sum: <strong className="text-white">{formatRM(roundedSum)}</strong></span>
            <span className="text-slate-400">Receipt Total: <strong className="text-white">{formatRM(receiptTotal)}</strong></span>
            {isBalanced ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Balanced
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Diff: {formatRM(variance)}
              </span>
            )}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'review' && (
            <div className="space-y-4">
              
              {/* Receipt Metadata Header Editor */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={receiptInfo.merchant_name}
                    onChange={(e) => setReceiptInfo({ ...receiptInfo, merchant_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    SSM / Tax Registration
                  </label>
                  <input
                    type="text"
                    value={receiptInfo.merchant_ssm_or_tax_no || ''}
                    onChange={(e) => setReceiptInfo({ ...receiptInfo, merchant_ssm_or_tax_no: e.target.value })}
                    placeholder="e.g. 198201004128"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Receipt / Invoice No
                  </label>
                  <input
                    type="text"
                    value={receiptInfo.receipt_no || ''}
                    onChange={(e) => setReceiptInfo({ ...receiptInfo, receipt_no: e.target.value })}
                    placeholder="e.g. INV-8841"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Receipt Grand Total (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={receiptInfo.total_amount_rm || 0}
                    onChange={(e) => setReceiptInfo({ ...receiptInfo, total_amount_rm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Editable Itemized Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Itemized Claims &amp; Account Code Reclassification
                    </span>
                    <span className="text-xs text-slate-400">({items.length} entries)</span>
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 w-64">COA Code &amp; Category</th>
                        <th className="py-2.5 px-3">Expenditure Details</th>
                        <th className="py-2.5 px-3 w-32 text-right">Amount (RM)</th>
                        <th className="py-2.5 px-3 w-48">Audit Remark</th>
                        <th className="py-2.5 px-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {items.map((item, idx) => {
                        const currentCoa = EMO_ACCOUNT_CODES.find(c => c.code === item.code);
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-900/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                              {idx + 1}
                            </td>
                            {/* Searchable / Selectable COA Code */}
                            <td className="py-2 px-3">
                              <select
                                value={item.code}
                                onChange={(e) => {
                                  const newCode = e.target.value;
                                  const coa = EMO_ACCOUNT_CODES.find(c => c.code === newCode);
                                  handleItemChange(idx, 'code', newCode);
                                  // Suggest details if empty or accommodation
                                  if (newCode === '923-0000' && !item.details.includes('STATE:')) {
                                    handleItemChange(idx, 'details', 'ACCOMODATION - STATE: SELANGOR');
                                  }
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono font-bold focus:border-amber-400 focus:outline-none"
                              >
                                {EMO_ACCOUNT_CODES.map((coa) => (
                                  <option key={coa.code} value={coa.code}>
                                    {coa.code} &mdash; {coa.details.slice(0, 32)}
                                  </option>
                                ))}
                              </select>
                              {currentCoa && (
                                <span className="block mt-1 text-[10px] text-amber-400/80 truncate">
                                  {currentCoa.category} &bull; {currentCoa.criteria.slice(0, 45)}...
                                </span>
                              )}
                            </td>
                            {/* Editable Details */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.details}
                                onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-amber-400 focus:outline-none"
                                placeholder="Expenditure details..."
                              />
                            </td>
                            {/* Editable Amount */}
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount_rm}
                                onChange={(e) => handleItemChange(idx, 'amount_rm', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-amber-400 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                              />
                            </td>
                            {/* Editable Remark */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.remark || ''}
                                onChange={(e) => handleItemChange(idx, 'remark', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:border-amber-400 focus:outline-none"
                                placeholder="Audit remarks..."
                              />
                            </td>
                            {/* Delete Action */}
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Remove line item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900/90 font-bold border-t border-slate-700 text-xs">
                        <td colSpan={3} className="py-2.5 px-3 text-right text-slate-300 uppercase tracking-wider">
                          Reconciled Claim Total (RM):
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-mono text-sm">
                          {formatRM(roundedSum)}
                        </td>
                        <td colSpan={2} className="py-2.5 px-3">
                          {isBalanced ? (
                            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Balanced with receipt
                            </span>
                          ) : (
                            <span className="text-rose-400 text-xs font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Variance of {formatRM(variance)}
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Admin Notes & Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    Accounts Admin Audit Note
                  </label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter audit reconciliation notes, verification approvals, or adjustment reasons..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Logged under Accounts Admin: <strong className="text-slate-300">{adminEmail}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                      Claim Status Management
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStatus('verified')}
                        className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                          status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Clean
                      </button>

                      <button
                        onClick={() => setStatus('approved')}
                        className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                          status === 'approved'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Approved
                      </button>

                      <button
                        onClick={() => setStatus('needs_review')}
                        className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                          status === 'needs_review'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Needs Review
                      </button>

                      <button
                        onClick={() => setStatus('rejected')}
                        className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                          status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Claim
                      </button>
                    </div>
                  </div>

                  {status === 'rejected' && (
                    <div>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Specify rejection reason for claimant..."
                        className="w-full bg-slate-900 border border-rose-500/50 rounded-lg px-2.5 py-1.5 text-xs text-rose-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-3">
              {/* Image Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Thermal Filters:</span>
                  <button
                    onClick={() => setContrastFilter('normal')}
                    className={`px-2 py-1 rounded text-xs ${
                      contrastFilter === 'normal' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setContrastFilter('high_contrast')}
                    className={`px-2 py-1 rounded text-xs ${
                      contrastFilter === 'high_contrast' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    High Contrast
                  </button>
                  <button
                    onClick={() => setContrastFilter('invert')}
                    className={`px-2 py-1 rounded text-xs ${
                      contrastFilter === 'invert' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Invert B/W
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-400">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex items-center gap-1"
                    title="Rotate 90deg"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>{rotation}°</span>
                  </button>
                </div>
              </div>

              {/* Receipt Canvas Viewer */}
              <div className="h-[480px] bg-slate-950 rounded-xl border border-slate-800 overflow-auto flex items-center justify-center p-4">
                {record.imagePreviewUrl.startsWith('<svg') ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: record.imagePreviewUrl }} 
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease',
                      filter: contrastFilter === 'high_contrast' ? 'contrast(200%) grayscale(100%)' : contrastFilter === 'invert' ? 'invert(100%)' : 'none',
                    }}
                    className="w-80 shadow-2xl rounded"
                  />
                ) : (
                  <img
                    src={record.imagePreviewUrl}
                    alt={record.fileName}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease',
                      filter: contrastFilter === 'high_contrast' ? 'contrast(200%) grayscale(100%)' : contrastFilter === 'invert' ? 'invert(100%)' : 'none',
                    }}
                    className="max-h-full max-w-full object-contain rounded shadow-2xl"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit_trail' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Verification &amp; Approvals Audit Trail
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Claimant Submission:</span>
                    <span className="text-slate-200 font-mono">
                      {record.claimantName} &bull; {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Verified By (Accounts Admin):</span>
                    <span className="text-slate-200 font-mono">
                      {record.verifiedBy ? `${record.verifiedBy} on ${new Date(record.verifiedAt || '').toLocaleString()}` : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Approved By (Director):</span>
                    <span className="text-slate-200 font-mono">
                      {record.approvedBy ? `${record.approvedBy} on ${new Date(record.approvedAt || '').toLocaleString()}` : 'Pending Director Approval'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Audit Notes Raw */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Gemini Multimodal Extraction Flags &amp; Rule 5 Status
                </h4>
                {record.auditResult.audit_notes.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                    <strong>Rule 5 Verified Clean:</strong> No critical anomalies or discrepancies detected.
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {record.auditResult.audit_notes.map((note, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to remove/delete this claim record?')) {
                onDeleteRecord(record.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Claim</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerify}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Reconcile and sign off this claim"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify &amp; Sign Off</span>
            </button>

            <button
              onClick={handleQuickApprove}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Directly approve claim for payment"
            >
              <FileCheck className="w-4 h-4" />
              <span>Approve Claim</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
