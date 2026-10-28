import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  UserCheck, 
  UserX, 
  Building2, 
  Layers, 
  Calendar, 
  DollarSign, 
  ArrowUpDown, 
  RefreshCw,
  PlusCircle,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  AuditedReceiptRecord, 
  StaffProfile, 
  ClaimStatus 
} from '../types/claim';
import { formatRM, downloadCsv, downloadJson } from '../utils/formatters';

interface AdminDashboardProps {
  claims: AuditedReceiptRecord[];
  staffList: StaffProfile[];
  adminEmail: string;
  onOpenReviewModal: (record: AuditedReceiptRecord) => void;
  onOpenStaffRemovalModal: () => void;
  onVerifyRecord: (record: AuditedReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: AuditedReceiptRecord) => void;
  onSwitchToStaffAudit: (staffProfile?: StaffProfile) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  claims,
  staffList,
  adminEmail,
  onOpenReviewModal,
  onOpenStaffRemovalModal,
  onVerifyRecord,
  onDeleteRecord,
  onPrintRecord,
  onSwitchToStaffAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'claimant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // KPI Metrics
  const totalClaimsCount = claims.length;
  const totalClaimsAmount = claims.reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);
  
  const pendingCount = claims.filter(c => c.status === 'needs_review' || c.status === 'flagged').length;
  const pendingAmount = claims.filter(c => c.status === 'needs_review' || c.status === 'flagged')
    .reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);

  const verifiedCount = claims.filter(c => c.status === 'verified').length;
  const verifiedAmount = claims.filter(c => c.status === 'verified')
    .reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);

  const approvedCount = claims.filter(c => c.status === 'approved').length;
  const approvedAmount = claims.filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);

  // Filtered Claims
  const filteredClaims = claims.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      c.claimantName.toLowerCase().includes(term) ||
      c.claimantStaffId.toLowerCase().includes(term) ||
      c.auditResult.receipt_info.merchant_name.toLowerCase().includes(term) ||
      (c.auditResult.receipt_info.receipt_no || '').toLowerCase().includes(term) ||
      c.auditResult.claim_items.some(item => item.details.toLowerCase().includes(term) || item.code.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || c.department === departmentFilter;
    const matchesStaff = staffFilter === 'all' || c.claimantStaffId === staffFilter || c.claimantName === staffFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesStaff;
  });

  // Sorted Claims
  filteredClaims.sort((a, b) => {
    if (sortBy === 'amount') {
      const diff = (a.auditResult.claim_total_rm || 0) - (b.auditResult.claim_total_rm || 0);
      return sortOrder === 'desc' ? -diff : diff;
    }
    if (sortBy === 'claimant') {
      return sortOrder === 'desc' 
        ? b.claimantName.localeCompare(a.claimantName) 
        : a.claimantName.localeCompare(b.claimantName);
    }
    // Date
    const dateA = new Date(a.auditResult.receipt_info.date || a.createdAt).getTime();
    const dateB = new Date(b.auditResult.receipt_info.date || b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const uniqueDepartments = Array.from(new Set(claims.map(c => c.department).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Accounts Admin Operations Dashboard
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Logged in as {adminEmail}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              EMO Book Services Sdn Bhd (SSM: 1249821-M) &bull; Audit, Editable Amounts, COA Reclassification &amp; Verification
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenStaffRemovalModal}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Manage and remove staff members"
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Manage &amp; Remove Staff</span>
          </button>

          <button
            onClick={() => onSwitchToStaffAudit()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            title="Switch to Staff receipt upload & scanning workspace"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Audit / Scan New Receipt</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Claims */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Claims</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white font-mono">
            {formatRM(totalClaimsAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {totalClaimsCount} total submitted receipts
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>Needs Review / Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-300 font-mono">
            {formatRM(pendingAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {pendingCount} claims requiring verification
          </div>
        </div>

        {/* Verified Clean */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Verified Clean</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-300 font-mono">
            {formatRM(verifiedAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {verifiedCount} claims verified with 0 discrepancies
          </div>
        </div>

        {/* Approved for Payment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-400 text-xs">
            <span>Approved for Payment</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-300 font-mono">
            {formatRM(approvedAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {approvedCount} claims authorized by Director
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by claimant name, staff ID, merchant, receipt #, or COA code..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalClaimsCount})
            </button>
            <button
              onClick={() => setStatusFilter('needs_review')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'needs_review'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'approved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>

        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>Filter by:</span>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Staff */}
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Staff Claimants</option>
              {staffList.map(st => (
                <option key={st.id} value={st.staffId}>{st.name} ({st.staffId})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('date'); setSortOrder('desc'); }
              }}
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                sortBy === 'date' ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('amount'); setSortOrder('desc'); }
              }}
              className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                sortBy === 'amount' ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              onClick={() => {
                const headers = [
                  'Claimant Name',
                  'Staff ID',
                  'Department',
                  'Receipt Date',
                  'Claim Month',
                  'Merchant Name',
                  'Receipt No',
                  'COA Code',
                  'Item Details',
                  'Amount (RM)',
                  'Status',
                  'Verified By',
                ];
                const rows: (string | number)[][] = [];
                filteredClaims.forEach(record => {
                  const receipt = record.auditResult.receipt_info;
                  record.auditResult.claim_items.forEach(item => {
                    rows.push([
                      record.claimantName,
                      record.claimantStaffId,
                      record.department,
                      receipt.date,
                      record.claimMonth,
                      receipt.merchant_name,
                      receipt.receipt_no || '',
                      item.code,
                      item.details,
                      Number(item.amount_rm).toFixed(2),
                      record.status,
                      record.verifiedBy || 'Pending',
                    ]);
                  });
                });
                downloadCsv(rows, headers, `EMO-Admin-Claims-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claims Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Date / Month</th>
                <th className="py-3 px-4">Claimant Profile</th>
                <th className="py-3 px-4">Merchant &amp; Receipt</th>
                <th className="py-3 px-4">Item Details &amp; COA</th>
                <th className="py-3 px-4 text-right">Claim Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No claim records match your current filters.</p>
                    <p className="text-xs mt-1">Try clearing your search term or filter settings.</p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((record) => {
                  const receiptInfo = record.auditResult.receipt_info;
                  const items = record.auditResult.claim_items;
                  const firstItem = items[0];

                  return (
                    <tr key={record.id} className="hover:bg-slate-950/40 transition">
                      
                      {/* Date & Claim Month */}
                      <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                        <div className="font-semibold text-white">{receiptInfo.date}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{record.claimMonth}</div>
                      </td>

                      {/* Claimant Profile */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{record.claimantName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-amber-400/90">{record.claimantStaffId}</span>
                          <span>&bull;</span>
                          <span>{record.department}</span>
                        </div>
                      </td>

                      {/* Merchant & Receipt */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate max-w-xs" title={receiptInfo.merchant_name}>
                          {receiptInfo.merchant_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {receiptInfo.receipt_no ? `Rec: ${receiptInfo.receipt_no}` : 'No Rec #'}
                          {receiptInfo.merchant_ssm_or_tax_no ? ` • SSM: ${receiptInfo.merchant_ssm_or_tax_no}` : ''}
                        </div>
                      </td>

                      {/* Items & Primary COA */}
                      <td className="py-3 px-4">
                        {firstItem && (
                          <div>
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold text-[10px] mr-1.5">
                              {firstItem.code}
                            </span>
                            <span className="text-slate-300 truncate max-w-xs inline-block align-middle" title={firstItem.details}>
                              {firstItem.details}
                            </span>
                          </div>
                        )}
                        {items.length > 1 && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            +{items.length - 1} more split {items.length - 1 === 1 ? 'item' : 'items'}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-amber-400 font-mono text-sm">
                          {formatRM(record.auditResult.claim_total_rm)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          record.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : record.status === 'approved'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : record.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {record.status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {record.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenReviewModal(record)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                            title="Review, edit amounts, and reclassify COA"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Review &amp; Edit</span>
                          </button>

                          {record.status !== 'verified' && (
                            <button
                              onClick={() => onVerifyRecord(record)}
                              className="p-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition"
                              title="Quick Verify"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onPrintRecord(record)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            title="Print Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove claim from ${record.claimantName} (${formatRM(record.auditResult.claim_total_rm)})?`)) {
                                onDeleteRecord(record.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Remove Claim"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
