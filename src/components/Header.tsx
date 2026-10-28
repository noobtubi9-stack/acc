import React from 'react';
import { 
  BookOpen, 
  FileSpreadsheet, 
  Printer, 
  HelpCircle, 
  Layers, 
  PlusCircle, 
  CheckCircle2, 
  Building2,
  Calendar,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Key,
  User
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'audit' | 'batch' | 'admin' | 'codebook';
  setCurrentTab: (tab: 'audit' | 'batch' | 'admin' | 'codebook') => void;
  staffName: string;
  setStaffName: (val: string) => void;
  staffId: string;
  setStaffId: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  claimMonth: string;
  setClaimMonth: (val: string) => void;
  batchCount: number;
  batchTotal: number;
  pendingAdminCount?: number;
  currentUserEmail?: string;
  currentRole?: 'staff' | 'accounts_admin';
  onOpenAuthModal?: () => void;
  onOpenPrintModal: () => void;
  onOpenCodebook: () => void;
  onOpenPromptModal?: () => void;
  onNewAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  staffName,
  setStaffName,
  staffId,
  setStaffId,
  department,
  setDepartment,
  claimMonth,
  setClaimMonth,
  batchCount,
  batchTotal,
  pendingAdminCount = 0,
  currentUserEmail = 'emoacc2@gmail.com',
  currentRole = 'accounts_admin',
  onOpenAuthModal,
  onOpenPrintModal,
  onOpenCodebook,
  onOpenPromptModal,
  onNewAudit,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Corporate Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Entity Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  EMO Book Services
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    Sdn Bhd
                  </span>
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">• SSM: 1249821-M</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Corporate Claims &amp; Accounts Payable Auditor
              </p>
            </div>
          </div>

          {/* Right Side: Identity Switcher & Claimant Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Identity Switcher Button */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs transition"
                title="Switch User / Role"
              >
                <div className={`w-2 h-2 rounded-full ${currentRole === 'accounts_admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white max-w-[140px] truncate">{currentUserEmail}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      currentRole === 'accounts_admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {currentRole === 'accounts_admin' ? 'Admin' : 'Staff'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Switch user / role</span>
                </div>
              </button>
            )}

            {/* Claimant Profile & Claim Month Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Claimant Name"
                  className="bg-transparent border-b border-slate-600 focus:border-amber-400 focus:outline-none text-white font-medium w-28 sm:w-32 py-0.5"
                  title="Staff Claimant Name"
                />
              </div>
              <div className="text-slate-600">|</div>
              <input
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Staff ID"
                className="bg-transparent border-b border-slate-600 focus:border-amber-400 focus:outline-none text-slate-300 w-16 py-0.5"
                title="Staff ID (e.g. EMO-STF-084)"
              />
              <div className="text-slate-600 hidden sm:inline">|</div>
              <div className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="month"
                  value={claimMonth}
                  onChange={(e) => setClaimMonth(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 text-xs focus:outline-none focus:border-amber-400"
                  title="Claim Month"
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-t border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 gap-2">
          
          {/* Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Accounts Admin Operations Tab */}
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Operations</span>
              {pendingAdminCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  currentTab === 'admin' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                }`}>
                  {pendingAdminCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Receipt Auditor
            </button>

            <button
              onClick={() => setCurrentTab('batch')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'batch'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Monthly Batch</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'batch' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'
              }`}>
                {batchCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('codebook')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'codebook'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              COA Codebook (31)
            </button>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              <span className="text-slate-400">Batch Total:</span>
              <span className="font-bold text-amber-400">
                RM {batchTotal.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={onNewAudit}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 font-medium transition"
              title="Start a new receipt audit"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              New Receipt
            </button>

            <button
              onClick={onOpenPrintModal}
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 shadow-sm transition"
              title="Generate Official Staff Monthly Claim Form Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Claim Voucher</span>
            </button>

            {onOpenPromptModal && (
              <button
                onClick={onOpenPromptModal}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-medium transition"
                title="View and copy Google AI Studio System Prompt & Settings"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">AI Studio Prompt</span>
              </button>
            )}

            <button
              onClick={onOpenCodebook}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              title="View EMO Chart of Accounts Policy"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
