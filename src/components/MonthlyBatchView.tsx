import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Search,
  Filter,
  Receipt,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';
import { AuditedReceiptRecord, EMO_ACCOUNT_CODES } from '../types/claim';
import { formatRM, formatDate, downloadJson, downloadCsv } from '../utils/formatters';

interface MonthlyBatchViewProps {
  records: AuditedReceiptRecord[];
  claimMonth: string;
  staffName: string;
  staffId: string;
  department: string;
  onEditRecord: (record: AuditedReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenPrintModal: () => void;
  onNewAudit: () => void;
  onLoadSamples: () => void;
}

export const MonthlyBatchView: React.FC<MonthlyBatchViewProps> = ({
  records,
  claimMonth,
  staffName,
  staffId,
  department,
  onEditRecord,
  onDeleteRecord,
  onOpenPrintModal,
  onNewAudit,
  onLoadSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.auditResult.receipt_summary.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.auditResult.claim_entries.some(e => e.details.toLowerCase().includes(searchTerm.toLowerCase()) || e.code.includes(searchTerm));
    
    if (selectedCategory === 'all') return matchesSearch;
    const matchesCat = rec.auditResult.claim_entries.some(e => {
      const coa = EMO_ACCOUNT_CODES.find(c => c.code === e.code);
      return coa?.category === selectedCategory;
    });
    return matchesSearch && matchesCat;
  });

  const totalBatchRm = records.reduce((sum, r) => sum + (r.auditResult.claim_total_rm || 0), 0);

  // Group expenditures by category
  const categoryTotals: Record<string, number> = {};
  records.forEach(r => {
    r.auditResult.claim_entries.forEach(e => {
      const coa = EMO_ACCOUNT_CODES.find(c => c.code === e.code);
      const cat = coa?.category || 'Others';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount_rm) || 0);
    });
  });

  const handleExportBatchCsv = () => {
    const headers = [
      'Claim Month',
      'Staff Name',
      'Staff ID',
      'Department',
      'Receipt Date',
      'Merchant Name',
      'SSM / Tax No',
      'Invoice / Receipt No',
      'COA Code',
      'COA Description',
      'Particulars',
      'Amount (RM)',
      'Remark',
      'Receipt Total (RM)'
    ];

    const rows: (string | number)[][] = [];
    records.forEach(r => {
      const summary = r.auditResult.receipt_summary;
      r.auditResult.claim_entries.forEach(e => {
        const coa = EMO_ACCOUNT_CODES.find(c => c.code === e.code);
        rows.push([
          claimMonth,
          staffName,
          staffId,
          department,
          summary.date || '',
          summary.merchant_name || '',
          summary.merchant_ssm_or_tax_no || '',
          summary.invoice_receipt_no || '',
          e.code,
          coa?.details || '',
          e.details,
          Number(e.amount_rm).toFixed(2),
          e.remark || '',
          Number(summary.receipt_grand_total).toFixed(2)
        ]);
      });
    });

    downloadCsv(rows, headers, `EMO_Staff_Claims_${claimMonth}_${staffId || 'batch'}.csv`);
  };

  const handleExportBatchJson = () => {
    const exportPayload = {
      company: 'EMO Book Services Sdn Bhd',
      ssm_registration: '1249821-M',
      claimant: {
        name: staffName,
        staff_id: staffId,
        department,
        claim_month: claimMonth,
      },
      batch_total_rm: totalBatchRm,
      total_receipts: records.length,
      audited_records: records.map(r => ({
        id: r.id,
        date_audited: r.createdAt,
        receipt_summary: r.auditResult.receipt_summary,
        claim_entries: r.auditResult.claim_entries,
        claim_total_rm: r.auditResult.claim_total_rm,
        audit_flags: r.auditResult.audit_flags,
      })),
    };
    downloadJson(exportPayload, `EMO_Monthly_Claims_${claimMonth}.json`);
  };

  return (
    <div className="space-y-4">
      {/* Top Batch Header & Statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Monthly Staff Claims Batch: {claimMonth}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                {records.length} {records.length === 1 ? 'Receipt' : 'Receipts'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Claimant: <span className="text-slate-200 font-medium">{staffName}</span> ({staffId}) • Dept: <span className="text-slate-200 font-medium">{department}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onNewAudit}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Audit Another Receipt
            </button>
            <button
              onClick={onOpenPrintModal}
              disabled={records.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                records.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Voucher
            </button>
            <button
              onClick={handleExportBatchCsv}
              disabled={records.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                records.length > 0
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={handleExportBatchJson}
              disabled={records.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                records.length > 0
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Monthly Claims
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
              {formatRM(totalBatchRm)}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Vouchers Audited
            </span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">
              {records.length}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Claim Items
            </span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">
              {records.reduce((cnt, r) => cnt + r.auditResult.claim_entries.length, 0)}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Audit Status
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for Voucher
            </span>
          </div>
        </div>

        {/* Category Breakdown Chips */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
              Expenditure by COA Category
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryTotals).map(([cat, amount]) => (
                <div
                  key={cat}
                  className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                >
                  <span className="text-slate-300 font-medium">{cat}:</span>
                  <span className="font-mono text-amber-300 font-semibold">{formatRM(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, receipt number, account code or item..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            <option value="Purchases">Purchases (Resell Books)</option>
            <option value="Travel & Transport">Travel &amp; Transport / Fuel</option>
            <option value="Logistics & Packaging">Logistics &amp; Packaging</option>
            <option value="Admin & Office">Admin &amp; Office</option>
            <option value="Staff & Welfare">Staff &amp; Welfare</option>
            <option value="Promotions & Marketing">Promotions &amp; Marketing</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      {/* Records List Table */}
      {filteredRecords.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Receipt / Vendor</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Claim Items Extracted</th>
                  <th className="py-2.5 px-3 text-right">Receipt Total</th>
                  <th className="py-2.5 px-3 text-right">Claim Total (RM)</th>
                  <th className="py-2.5 px-3 text-center">Audit Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record) => {
                  const summary = record.auditResult.receipt_summary;
                  const flags = record.auditResult.audit_flags || [];
                  const hasDiscrepancy = Math.abs(summary.receipt_grand_total - record.auditResult.claim_total_rm) > 0.01;

                  return (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-100">
                          {summary.merchant_name || 'Vendor Unnamed'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {summary.invoice_receipt_no ? `#${summary.invoice_receipt_no}` : 'No receipt #'}
                          {summary.merchant_ssm_or_tax_no && ` • SSM: ${summary.merchant_ssm_or_tax_no}`}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {formatDate(summary.date)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1 max-w-md">
                          {record.auditResult.claim_entries.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-mono px-1 py-0.2 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                                {entry.code}
                              </span>
                              <span className="text-slate-300 truncate">{entry.details}</span>
                              <span className="text-slate-400 font-mono ml-auto">
                                {formatRM(entry.amount_rm)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {formatRM(summary.receipt_grand_total)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                        {formatRM(record.auditResult.claim_total_rm)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {hasDiscrepancy ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Discrepancy
                          </span>
                        ) : flags.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {flags.length} Notes
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Inspect & Edit in Auditor"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                            title="Remove from batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <Receipt className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-60" />
          <h3 className="text-base font-semibold text-slate-300">No Audited Receipts in Current Batch</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Upload new employee claim receipts in the Auditor workspace, or pre-populate with realistic Malaysian sample receipts to test the official claim voucher.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onNewAudit}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Audit a Receipt
            </button>
            <button
              onClick={onLoadSamples}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Load All Sample Receipts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
