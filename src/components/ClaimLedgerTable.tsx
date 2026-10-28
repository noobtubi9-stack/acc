import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  FileCheck2, 
  DollarSign, 
  Sparkles, 
  Download, 
  Save, 
  HelpCircle,
  Scissors,
  Merge,
  Fuel,
  Info
} from 'lucide-react';
import { ClaimEntry, EMO_ACCOUNT_CODES, ReceiptSummary } from '../types/claim';
import { formatRM, formatNumber } from '../utils/formatters';

interface ClaimLedgerTableProps {
  entries: ClaimEntry[];
  onChangeEntries: (newEntries: ClaimEntry[]) => void;
  receiptSummary: ReceiptSummary;
  onSaveToBatch: () => void;
  onDownloadJson: () => void;
  onDownloadCsv: () => void;
  onOpenCodebook: () => void;
  isSaved?: boolean;
}

const MALAYSIAN_STATES = [
  'JOHOR', 'KEDAH', 'KELANTAN', 'MELAKA', 'NEGERI SEMBILAN', 
  'PAHANG', 'PENANG', 'PERAK', 'PERLIS', 'SABAH', 
  'SARAWAK', 'SELANGOR', 'TERENGGANU', 'WP KUALA LUMPUR', 'WP LABUAN', 'WP PUTRAJAYA'
];

export const ClaimLedgerTable: React.FC<ClaimLedgerTableProps> = ({
  entries,
  onChangeEntries,
  receiptSummary,
  onSaveToBatch,
  onDownloadJson,
  onDownloadCsv,
  onOpenCodebook,
  isSaved = false,
}) => {
  const [selectedStateIndex, setSelectedStateIndex] = useState<number | null>(null);
  const [splittingRowIndex, setSplittingRowIndex] = useState<number | null>(null);
  const [splitPart1Amount, setSplitPart1Amount] = useState<number>(0);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  const calculateSum = () => {
    return entries.reduce((acc, curr) => acc + (Number(curr.amount_rm) || 0), 0);
  };

  const claimTotal = Math.round(calculateSum() * 100) / 100;
  const receiptTotal = Number(receiptSummary?.total_amount_rm ?? receiptSummary?.receipt_grand_total ?? 0);
  const variance = Math.round((claimTotal - receiptTotal) * 100) / 100;
  const isBalanced = Math.abs(variance) < 0.01;

  const handleUpdateRow = (index: number, field: keyof ClaimEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChangeEntries(updated);
  };

  const handleAddRow = () => {
    const newRow: ClaimEntry = {
      code: '910-0000',
      details: 'PRINTING & STATIONERY',
      amount_rm: 0.0,
      remark: 'General expense claim',
    };
    onChangeEntries([...entries, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (entries.length <= 1) return;
    const updated = entries.filter((_, idx) => idx !== index);
    onChangeEntries(updated);
  };

  const handleDuplicateRow = (index: number) => {
    const source = entries[index];
    const cloned: ClaimEntry = { ...source };
    const updated = [...entries];
    updated.splice(index + 1, 0, cloned);
    onChangeEntries(updated);
  };

  const handleAutoBalance = () => {
    if (entries.length === 0 || isBalanced) return;
    const diff = receiptTotal - claimTotal;
    const updated = [...entries];
    const target = updated[updated.length - 1];
    target.amount_rm = Math.round((Number(target.amount_rm) + diff) * 100) / 100;
    target.remark = `${target.remark ? target.remark + ' ' : ''}(Reconciled with receipt total)`;
    onChangeEntries(updated);
  };

  const handleCodeChange = (index: number, newCode: string) => {
    const def = EMO_ACCOUNT_CODES.find(c => c.code === newCode);
    let defaultDetails = def ? def.details : '';
    if (newCode === '923-0000' && !defaultDetails.includes('STATE:')) {
      defaultDetails = 'ACCOMODATION - STATE: ';
    }
    const updated = [...entries];
    updated[index] = {
      ...updated[index],
      code: newCode,
      details: defaultDetails,
    };
    onChangeEntries(updated);
  };

  const applyStateToAccommodation = (index: number, stateName: string) => {
    const updated = [...entries];
    updated[index] = {
      ...updated[index],
      details: `ACCOMODATION - STATE: ${stateName.toUpperCase()}`,
      remark: updated[index].remark || `Outstation hotel stay in ${stateName}`
    };
    onChangeEntries(updated);
    setSelectedStateIndex(null);
  };

  // Quick Split Tool (Rule 1 & Rule 2)
  const openSplitModal = (index: number) => {
    const current = entries[index];
    setSplittingRowIndex(index);
    setSplitPart1Amount(Math.round((Number(current.amount_rm) / 2) * 100) / 100);
  };

  const applySplit = (mode: 'custom' | 'petrol_pantry') => {
    if (splittingRowIndex === null) return;
    const original = entries[splittingRowIndex];
    const total = Number(original.amount_rm) || 0;

    let part1: ClaimEntry;
    let part2: ClaimEntry;

    if (mode === 'petrol_pantry') {
      const fuelAmount = Math.max(0, Math.round((total * 0.85) * 100) / 100);
      const snackAmount = Math.round((total - fuelAmount) * 100) / 100;
      part1 = {
        code: '920-0000',
        details: 'PETROL-RON95/DIESEL (Vehicle Fuel)',
        amount_rm: fuelAmount,
        remark: 'Fuel portion isolated per Rule #2',
      };
      part2 = {
        code: '926-0000',
        details: 'STAFF WELFARE (Pantry Drinks / Snacks)',
        amount_rm: snackAmount,
        remark: 'Mart snacks split from petrol receipt',
      };
    } else {
      const p1 = Math.min(total, Math.max(0, splitPart1Amount));
      const p2 = Math.round((total - p1) * 100) / 100;
      part1 = {
        ...original,
        amount_rm: p1,
        remark: `${original.remark ? original.remark + ' ' : ''}(Part 1)`,
      };
      part2 = {
        code: 'OTHERS',
        details: `${original.details} (Part 2)`,
        amount_rm: p2,
        remark: 'Split item remainder',
      };
    }

    const updated = [...entries];
    updated.splice(splittingRowIndex, 1, part1, part2);
    onChangeEntries(updated);
    setSplittingRowIndex(null);
  };

  // Merge selected rows
  const handleToggleSelectRow = (idx: number) => {
    setSelectedRowIds(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleMergeSelected = () => {
    if (selectedRowIds.length < 2) return;
    const sorted = [...selectedRowIds].sort((a, b) => a - b);
    const selectedRows = sorted.map(i => entries[i]);
    const mergedAmount = selectedRows.reduce((sum, r) => sum + Number(r.amount_rm), 0);
    const primaryCode = selectedRows[0].code;
    const mergedDetails = selectedRows.map(r => r.details).join(' + ');

    const mergedEntry: ClaimEntry = {
      code: primaryCode,
      details: mergedDetails,
      amount_rm: Math.round(mergedAmount * 100) / 100,
      remark: `Merged from ${selectedRows.length} items`,
    };

    // Remove merged rows and insert single row
    const remaining = entries.filter((_, idx) => !selectedRowIds.includes(idx));
    const insertAt = Math.min(...sorted);
    remaining.splice(insertAt, 0, mergedEntry);
    onChangeEntries(remaining);
    setSelectedRowIds([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      {/* Top Banner / Form Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-tight">
              Staff Monthly Claim Ledger Schedule
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {entries.length} {entries.length === 1 ? 'Row' : 'Rows'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strictly mapped to EMO Book Services Official Account Codes (COA)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRowIds.length >= 2 && (
            <button
              onClick={handleMergeSelected}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              title="Merge selected items into one line"
            >
              <Merge className="w-3.5 h-3.5" />
              <span>Merge ({selectedRowIds.length})</span>
            </button>
          )}

          <button
            onClick={handleAddRow}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
          <button
            onClick={onOpenCodebook}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition"
            title="Browse all 31 EMO Account Codes"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">COA Guide</span>
          </button>
        </div>
      </div>

      {/* Quick Split Modal Dialog */}
      {splittingRowIndex !== null && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Auto-Split Line #{splittingRowIndex + 1}</strong> (Total: {formatRM(entries[splittingRowIndex]?.amount_rm)}):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applySplit('petrol_pantry')}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Split Fuel 920 &amp; Pantry 926</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5">
              <span className="text-slate-400">Part 1 RM:</span>
              <input
                type="number"
                step="0.01"
                value={splitPart1Amount}
                onChange={(e) => setSplitPart1Amount(parseFloat(e.target.value) || 0)}
                className="w-16 bg-slate-950 text-white font-mono px-1 rounded border border-slate-700 text-right"
              />
            </div>

            <button
              type="button"
              onClick={() => applySplit('custom')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
            >
              Apply Split
            </button>

            <button
              type="button"
              onClick={() => setSplittingRowIndex(null)}
              className="px-2 py-1 rounded text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ledger Table Container */}
      <div className="flex-1 overflow-x-auto p-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
              <th className="py-2 px-1 w-6 text-center"></th>
              <th className="py-2 px-2 w-8 text-center">#</th>
              <th className="py-2 px-2 w-48 sm:w-56">Account Code</th>
              <th className="py-2 px-2 min-w-[200px]">Details / Particulars</th>
              <th className="py-2 px-2 w-28 text-right">Amount (RM)</th>
              <th className="py-2 px-2 min-w-[160px]">Audit Remark</th>
              <th className="py-2 px-1 w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.map((entry, idx) => {
              const matchedCOA = EMO_ACCOUNT_CODES.find(c => c.code === entry.code);
              const isAccommodation = entry.code === '923-0000';
              const isFuel = entry.code === '920-0000';
              const isPackaging = entry.code.startsWith('617-');
              const isSelected = selectedRowIds.includes(idx);

              return (
                <tr 
                  key={idx} 
                  className={`group transition ${isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'}`}
                >
                  {/* Select Checkbox for merge */}
                  <td className="py-2.5 px-1 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectRow(idx)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                      title="Select to merge rows"
                    />
                  </td>

                  {/* Row number */}
                  <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* COA Code Selector */}
                  <td className="py-2.5 px-2 align-top">
                    <select
                      value={entry.code}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 font-mono text-xs focus:border-amber-400 focus:outline-none"
                    >
                      {EMO_ACCOUNT_CODES.map((coa) => (
                        <option key={coa.code} value={coa.code}>
                          {coa.code} - {coa.details}
                        </option>
                      ))}
                    </select>

                    {/* Quick Category badge */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-sans">
                        {matchedCOA?.category || 'General'}
                      </span>
                      {isFuel && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Fuel Only
                        </span>
                      )}
                      {isPackaging && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          Packaging
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Details Field */}
                  <td className="py-2.5 px-2 align-top">
                    <input
                      type="text"
                      value={entry.details}
                      onChange={(e) => handleUpdateRow(idx, 'details', e.target.value)}
                      placeholder="Enter claim item details..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-amber-400 focus:outline-none text-xs"
                    />

                    {/* Special helper for Accommodation State rule */}
                    {isAccommodation && (
                      <div className="mt-1.5">
                        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Rule #3 Required: Must append State (e.g. PENANG, SELANGOR)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {MALAYSIAN_STATES.slice(0, 7).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => applyStateToAccommodation(idx, st)}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 transition"
                            >
                              {st}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setSelectedStateIndex(selectedStateIndex === idx ? null : idx)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          >
                            More States...
                          </button>
                        </div>
                        {selectedStateIndex === idx && (
                          <div className="mt-1.5 p-2 bg-slate-950 border border-slate-700 rounded-lg grid grid-cols-3 gap-1 shadow-lg">
                            {MALAYSIAN_STATES.map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => applyStateToAccommodation(idx, st)}
                                className="px-1.5 py-1 rounded text-[10px] text-left hover:bg-amber-500/20 hover:text-amber-300 text-slate-300"
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Amount Field */}
                  <td className="py-2.5 px-2 align-top text-right">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-slate-500 text-xs">RM</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={entry.amount_rm}
                        onChange={(e) => handleUpdateRow(idx, 'amount_rm', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-slate-100 font-mono text-right text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </td>

                  {/* Remark Field */}
                  <td className="py-2.5 px-2 align-top">
                    <input
                      type="text"
                      value={entry.remark}
                      onChange={(e) => handleUpdateRow(idx, 'remark', e.target.value)}
                      placeholder="Audit remark, SST notes, etc."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </td>

                  {/* Action icons */}
                  <td className="py-2.5 px-1 align-top text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openSplitModal(idx)}
                        className="p-1 rounded text-amber-400/80 hover:text-amber-300 hover:bg-slate-800 transition"
                        title="Split Item (Rule 1 & 2)"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRow(idx)}
                        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                        title="Duplicate row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        disabled={entries.length <= 1}
                        className={`p-1 rounded transition ${
                          entries.length <= 1
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'text-rose-400/80 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title="Delete row"
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

      {/* Accounting Reconciliation Footer */}
      <div className="bg-slate-950 border-t border-slate-800 p-3 sm:p-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Variance Status */}
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs">
                  Balanced: Sum of items matches Receipt Total exactly
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold">
                    Variance: RM {Math.abs(variance).toFixed(2)} {variance > 0 ? 'over' : 'under'} receipt total
                  </span>
                  <button
                    onClick={handleAutoBalance}
                    className="ml-2 underline font-medium text-amber-400 hover:text-amber-300 text-xs"
                  >
                    Auto-Adjust Difference
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Receipt Grand Total
              </span>
              <span className="font-mono text-slate-300 font-semibold text-sm">
                {formatRM(receiptTotal)}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">
                Audited Claim Total
              </span>
              <span className="font-mono text-white font-extrabold text-base">
                {formatRM(claimTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Batch Save & Exports */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveToBatch}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isSaved
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-sm'
              }`}
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved in Monthly Batch' : 'Commit to Monthly Batch'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadJson}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              title="Download strictly formatted JSON per specification"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onDownloadCsv}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              title="Download CSV for AutoCount/SQL Accounting"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
