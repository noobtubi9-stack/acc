import React, { useRef } from 'react';
import { Printer, X, Download, BookOpen, CheckCircle, Building } from 'lucide-react';
import { AuditedReceiptRecord, EMO_ACCOUNT_CODES } from '../types/claim';
import { formatRM, formatDate, generateVoucherId, downloadCsv } from '../utils/formatters';

interface OfficialVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AuditedReceiptRecord[];
  staffName: string;
  staffId: string;
  department: string;
  claimMonth: string;
}

export const OfficialVoucherModal: React.FC<OfficialVoucherModalProps> = ({
  isOpen,
  onClose,
  records,
  staffName,
  staffId,
  department,
  claimMonth,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const voucherNo = generateVoucherId(claimMonth);
  const totalAmount = records.reduce((sum, r) => sum + (r.auditResult.claim_total_rm || 0), 0);

  // Group by Account Code
  const coaSummary: Record<string, { details: string; total: number; count: number }> = {};
  records.forEach(r => {
    r.auditResult.claim_entries.forEach(e => {
      const coa = EMO_ACCOUNT_CODES.find(c => c.code === e.code);
      const desc = coa?.details || e.details || 'General';
      if (!coaSummary[e.code]) {
        coaSummary[e.code] = { details: desc, total: 0, count: 0 };
      }
      coaSummary[e.code].total += Number(e.amount_rm) || 0;
      coaSummary[e.code].count += 1;
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              EMO Official Staff Monthly Claim Voucher
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto font-sans text-xs flex-1 bg-white">
          
          {/* Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
                  <span className="p-1.5 bg-slate-950 text-white rounded">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  EMO BOOK SERVICES SDN BHD
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  (Company Registration No: 1249821-M) • GST/SST: W10-1808-32000041
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No. 15, Jalan Teknologi 3/4, Kota Damansara, 47810 Petaling Jaya, Selangor Darul Ehsan, Malaysia
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: +603-6150 8820 | Email: accounts@emobooks.com.my | Web: www.emobooks.com.my
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block border-2 border-slate-900 bg-slate-50 p-2 rounded text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Voucher No</span>
                  <span className="text-sm font-mono font-extrabold text-slate-950">{voucherNo}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Date: {new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                STAFF MONTHLY CLAIM FORM / PAYMENT VOUCHER
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-800 text-[11px]">
                Month: {claimMonth}
              </span>
            </div>
          </div>

          {/* Claimant Information Box */}
          <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Staff Name</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{staffName || 'Mohd Haziq bin Ismail'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Staff ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{staffId || 'EMO-STF-084'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Department</span>
                <span className="font-medium text-slate-800 text-xs">{department || 'Sales & Marketing'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Currency</span>
                <span className="font-bold text-slate-900 text-xs">MYR (Ringgit Malaysia)</span>
              </div>
            </div>
          </div>

          {/* Itemized Claim Schedule Table */}
          <div className="mb-5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Itemized Claims Schedule
            </h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[10px] uppercase">
                    <th className="py-2 px-2 text-center w-8 border-r border-slate-300">#</th>
                    <th className="py-2 px-2 w-20 border-r border-slate-300">Date</th>
                    <th className="py-2 px-2 w-32 border-r border-slate-300">Receipt / Inv #</th>
                    <th className="py-2 px-2 w-44 border-r border-slate-300">Merchant / Vendor</th>
                    <th className="py-2 px-2 w-24 border-r border-slate-300">COA Code</th>
                    <th className="py-2 px-2 border-r border-slate-300">Expenditure Particulars</th>
                    <th className="py-2 px-2 text-right w-24">Amount (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.length > 0 ? (
                    (() => {
                      let itemCounter = 0;
                      return records.map((record) => {
                        const sum = record.auditResult.receipt_summary;
                        return record.auditResult.claim_entries.map((entry, eIdx) => {
                          itemCounter += 1;
                          return (
                            <tr key={`${record.id}-${eIdx}`} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[10px] border-r border-slate-200">
                                {itemCounter}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-slate-700 text-[11px] border-r border-slate-200">
                                {sum.date || '-'}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-slate-700 text-[11px] border-r border-slate-200 truncate">
                                {sum.invoice_receipt_no || '-'}
                              </td>
                              <td className="py-1.5 px-2 font-semibold text-slate-900 text-[11px] border-r border-slate-200">
                                {sum.merchant_name}
                              </td>
                              <td className="py-1.5 px-2 font-mono font-bold text-slate-950 text-[11px] border-r border-slate-200">
                                {entry.code}
                              </td>
                              <td className="py-1.5 px-2 text-slate-800 text-[11px] border-r border-slate-200">
                                <div>{entry.details}</div>
                                {entry.remark && (
                                  <div className="text-[10px] text-slate-500 italic mt-0.5">
                                    Remark: {entry.remark}
                                  </div>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-950 text-[11px]">
                                {Number(entry.amount_rm).toFixed(2)}
                              </td>
                            </tr>
                          );
                        });
                      });
                    })()
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No receipts added to this claim voucher.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-950 text-xs">
                    <td colSpan={6} className="py-2 px-3 text-right uppercase tracking-wider">
                      TOTAL STAFF MONTHLY CLAIM AMOUNT (MYR):
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-sm font-black text-slate-950">
                      {formatRM(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Account Ledger Posting Summary (AutoCount / SQL Format) */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-300 rounded p-3 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Accounts Ledger Summary (COA Allocation)
              </h4>
              <div className="space-y-1.5 text-[11px]">
                {Object.entries(coaSummary).map(([code, item]) => (
                  <div key={code} className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <div className="truncate pr-2">
                      <span className="font-mono font-bold text-slate-950 mr-1.5">{code}</span>
                      <span className="text-slate-600 truncate">{item.details}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-950 shrink-0">
                      {formatRM(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-300 rounded p-3 bg-slate-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Auditor Audit Certification
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I hereby certify that all receipts have been audited against EMO Book Services Sdn Bhd official account codes. Items have been partitioned for multi-item expenditure, accommodation state captured, fuel isolated from mart purchases, and valid invoices retained.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Audit Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Passed Corporate Claims Audit
                </span>
              </div>
            </div>
          </div>

          {/* Authorization & Signatures Grid */}
          <div className="border-t-2 border-slate-900 pt-5 mt-6">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              
              {/* Claimant */}
              <div className="flex flex-col justify-between h-28 border border-slate-200 rounded p-2.5 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Claimant Staff
                </span>
                <div className="border-b border-slate-400 mx-4" />
                <div>
                  <p className="font-bold text-slate-900">{staffName || 'Claimant Signature'}</p>
                  <p className="text-[10px] text-slate-500">Date: _______________</p>
                </div>
              </div>

              {/* Head of Department */}
              <div className="flex flex-col justify-between h-28 border border-slate-200 rounded p-2.5 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Head of Department (HOD)
                </span>
                <div className="border-b border-slate-400 mx-4" />
                <div>
                  <p className="font-bold text-slate-900">Verified &amp; Recommended</p>
                  <p className="text-[10px] text-slate-500">Date: _______________</p>
                </div>
              </div>

              {/* Accounts Payable / Finance */}
              <div className="flex flex-col justify-between h-28 border border-slate-200 rounded p-2.5 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Accounts Payable / Finance
                </span>
                <div className="border-b border-slate-400 mx-4" />
                <div>
                  <p className="font-bold text-slate-900">Passed for Payment</p>
                  <p className="text-[10px] text-slate-500">Date: _______________</p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            EMO Book Services Sdn Bhd • Confidential Staff Monthly Claims Voucher • Generated via EMO AP Claims Auditor
          </div>
        </div>

      </div>
    </div>
  );
};
