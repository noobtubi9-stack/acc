import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Layers, 
  Building2, 
  Database,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AuditedReceiptRecord, EMO_ACCOUNT_CODES } from '../types/claim';
import { formatRM } from '../utils/formatters';

interface AccountingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: AuditedReceiptRecord[];
  claimMonth: string;
}

export const AccountingExportModal: React.FC<AccountingExportModalProps> = ({
  isOpen,
  onClose,
  claims,
  claimMonth,
}) => {
  const [targetSoftware, setTargetSoftware] = useState<'autocount' | 'sql_accounting' | 'custom_gl'>('autocount');
  const [includeAllStatus, setIncludeAllStatus] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter verified / approved claims unless user checks all
  const exportableClaims = includeAllStatus 
    ? claims 
    : claims.filter(c => c.status === 'verified' || c.status === 'approved');

  const totalAmount = exportableClaims.reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);

  // Generate AutoCount CSV Format
  const generateAutoCountCsv = () => {
    const headers = [
      'BatchNo',
      'DocDate',
      'DocNo',
      'AccountNo',
      'AccountName',
      'Description',
      'RefNo',
      'DebitRM',
      'CreditRM',
      'TaxCode',
      'EmployeeEmail',
      'Department',
    ];

    const rows: string[][] = [];
    const batchNo = `EMO-CLM-${claimMonth.replace(/[^a-zA-Z0-9]/g, '')}`;

    exportableClaims.forEach((claim, cIdx) => {
      const docNo = `PV-${claimMonth.replace(/[^a-zA-Z0-9]/g, '')}-${String(cIdx + 1).padStart(3, '0')}`;
      const docDate = claim.auditResult.receipt_info.date || new Date(claim.createdAt).toISOString().slice(0, 10);
      const merchant = claim.auditResult.receipt_info.merchant_name;
      const refNo = claim.auditResult.receipt_info.receipt_no || `REC-${claim.id.slice(-5)}`;

      // Debit line for each claim item
      claim.auditResult.claim_items.forEach((item) => {
        const coa = EMO_ACCOUNT_CODES.find(c => c.code === item.code);
        const coaName = coa?.details || item.code;
        rows.push([
          `"${batchNo}"`,
          `"${docDate}"`,
          `"${docNo}"`,
          `"${item.code}"`,
          `"${coaName.replace(/"/g, '""')}"`,
          `"${merchant} - ${item.details.replace(/"/g, '""')}"`,
          `"${refNo}"`,
          Number(item.amount_rm).toFixed(2),
          '0.00',
          '"NR"', // Non-taxable / Standard
          `"${claim.claimantEmail || ''}"`,
          `"${claim.department}"`,
        ]);
      });

      // Credit line for Bank / Staff Payable
      rows.push([
        `"${batchNo}"`,
        `"${docDate}"`,
        `"${docNo}"`,
        '"300-00"', // Staff Reimbursement Payable
        '"STAFF CLAIMS PAYABLE - REIMBURSEMENT"',
        `"Reimbursement to ${claim.claimantName.replace(/"/g, '""')} (${claim.claimMonth})"`,
        `"${refNo}"`,
        '0.00',
        Number(claim.auditResult.claim_total_rm).toFixed(2),
        '"NR"',
        `"${claim.claimantEmail || ''}"`,
        `"${claim.department}"`,
      ]);
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  // Generate SQL Accounting CSV Format
  const generateSqlAccountingCsv = () => {
    const headers = [
      'DocDate',
      'DocType',
      'DocNo',
      'Payee',
      'GLAccount',
      'Description',
      'PaymentMethod',
      'ChequeNo',
      'Amount',
      'Reference',
      'Project',
      'Department',
    ];

    const rows: string[][] = [];
    exportableClaims.forEach((claim, cIdx) => {
      const docNo = `PV${claimMonth.replace(/[^a-zA-Z0-9]/g, '')}${String(cIdx + 1).padStart(3, '0')}`;
      const docDate = claim.auditResult.receipt_info.date || new Date(claim.createdAt).toISOString().slice(0, 10);
      const merchant = claim.auditResult.receipt_info.merchant_name;
      const refNo = claim.auditResult.receipt_info.receipt_no || claim.id;

      claim.auditResult.claim_items.forEach((item) => {
        rows.push([
          `"${docDate}"`,
          '"PV"',
          `"${docNo}"`,
          `"${claim.claimantName.replace(/"/g, '""')}"`,
          `"${item.code}"`,
          `"${merchant}: ${item.details.replace(/"/g, '""')}"`,
          '"ONLINE_TRANSFER"',
          '""',
          Number(item.amount_rm).toFixed(2),
          `"${refNo}"`,
          '"EMO-HQ"',
          `"${claim.department}"`,
        ]);
      });
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  // Generate GL Summary JSON
  const generateGlSummaryJson = () => {
    const accountTotals: Record<string, { code: string; name: string; amount: number; count: number }> = {};
    
    exportableClaims.forEach(claim => {
      claim.auditResult.claim_items.forEach(item => {
        const coa = EMO_ACCOUNT_CODES.find(c => c.code === item.code);
        if (!accountTotals[item.code]) {
          accountTotals[item.code] = {
            code: item.code,
            name: coa?.details || item.code,
            amount: 0,
            count: 0,
          };
        }
        accountTotals[item.code].amount += Number(item.amount_rm) || 0;
        accountTotals[item.code].count += 1;
      });
    });

    const exportPayload = {
      entity: 'EMO BOOK SERVICES SDN BHD',
      registration_no: '1249821-M',
      export_date: new Date().toISOString(),
      claim_month: claimMonth,
      target_system: targetSoftware,
      total_claims_count: exportableClaims.length,
      grand_total_rm: totalAmount,
      chart_of_accounts_posting: Object.values(accountTotals).map(a => ({
        account_code: a.code,
        account_name: a.name,
        total_debit_rm: Math.round(a.amount * 100) / 100,
        transactions_count: a.count,
      })),
      entries: exportableClaims.map(c => ({
        claim_id: c.id,
        claimant: c.claimantName,
        email: c.claimantEmail,
        staff_id: c.claimantStaffId,
        department: c.department,
        merchant: c.auditResult.receipt_info.merchant_name,
        date: c.auditResult.receipt_info.date,
        total_rm: c.auditResult.claim_total_rm,
        status: c.status,
        verified_by: c.verifiedBy,
        items: c.auditResult.claim_items,
      })),
    };

    return JSON.stringify(exportPayload, null, 2);
  };

  const getExportData = () => {
    if (targetSoftware === 'autocount') return generateAutoCountCsv();
    if (targetSoftware === 'sql_accounting') return generateSqlAccountingCsv();
    return generateGlSummaryJson();
  };

  const handleDownload = () => {
    const content = getExportData();
    const isJson = targetSoftware === 'custom_gl';
    const ext = isJson ? 'json' : 'csv';
    const mime = isJson ? 'application/json' : 'text/csv;charset=utf-8;';
    const filename = `EMO_${targetSoftware.toUpperCase()}_Claims_${claimMonth.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(getExportData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Export to Accounting Software
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AutoCount &bull; SQL Accounting
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                EMO Book Services Sdn Bhd (1249821-M) &bull; Official COA Ledger Posting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Target Software Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Select Accounting System Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setTargetSoftware('autocount')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  targetSoftware === 'autocount'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">AutoCount</span>
                    {targetSoftware === 'autocount' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Payment Voucher &amp; GL Batch CSV format with Debit / Credit double-entry.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-mono text-amber-400 font-semibold">.CSV (AutoCount GL)</span>
              </button>

              <button
                onClick={() => setTargetSoftware('sql_accounting')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  targetSoftware === 'sql_accounting'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">SQL Accounting</span>
                    {targetSoftware === 'sql_accounting' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Cash Book Payment Voucher import format with official EMO account codes.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-mono text-amber-400 font-semibold">.CSV (SQL AP/GL)</span>
              </button>

              <button
                onClick={() => setTargetSoftware('custom_gl')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  targetSoftware === 'custom_gl'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">Universal JSON / API</span>
                    {targetSoftware === 'custom_gl' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Structured JSON with full metadata, verification trails, and COA totals.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-mono text-amber-400 font-semibold">.JSON (REST API)</span>
              </button>
            </div>
          </div>

          {/* Filter & Scope Options */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeAllStatus"
                checked={includeAllStatus}
                onChange={(e) => setIncludeAllStatus(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="includeAllStatus" className="text-slate-300 font-medium cursor-pointer">
                Include unverified / pending claims (Default: Verified Clean &amp; Approved only)
              </label>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Ready for Export:</span>
              <strong className="text-amber-400 font-mono text-sm">
                {exportableClaims.length} records ({formatRM(totalAmount)})
              </strong>
            </div>
          </div>

          {/* Data Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Export Data Preview
              </span>
              <button
                onClick={handleCopyClipboard}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 max-h-48 overflow-auto whitespace-pre leading-relaxed">
              {getExportData().slice(0, 1500)}
              {getExportData().length > 1500 ? '\n... (truncated preview)' : ''}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Complies with EMO Chart of Accounts standards (31 categories).
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download {targetSoftware === 'custom_gl' ? 'JSON' : 'CSV'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
