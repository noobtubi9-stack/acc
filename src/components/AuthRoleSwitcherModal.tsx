import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Check, 
  LogIn, 
  Building2, 
  Key, 
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Hash,
  Send,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { StaffProfile } from '../types/claim';

export type AuthView = 'signin' | 'signup' | 'forgot';

interface AuthRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  currentRole: 'staff' | 'accounts_admin';
  staffRoster: StaffProfile[];
  onSelectUser: (profile: StaffProfile) => void;
  onCustomEmailLogin: (email: string) => void;
  onRegisterStaff?: (profile: StaffProfile) => void;
  initialView?: AuthView;
}

const DEPARTMENTS = [
  'Sales & Marketing',
  'Editorial & Publishing',
  'Warehouse & Dispatch',
  'Operations & Retail',
  'Finance & Administration',
  'IT & Digital Infrastructure',
  'Human Resources & Admin',
  'Management'
];

export const AuthRoleSwitcherModal: React.FC<AuthRoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  currentRole,
  staffRoster,
  onSelectUser,
  onCustomEmailLogin,
  onRegisterStaff,
  initialView = 'signin',
}) => {
  const [view, setView] = useState<AuthView>(initialView);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState<string>(currentUserEmail || 'emoacc2@gmail.com');
  const [signInPassword, setSignInPassword] = useState<string>('••••••••');
  const [showSignInPassword, setShowSignInPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form State
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newStaffId, setNewStaffId] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<string>('Sales & Marketing');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newConfirmPassword, setNewConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState<string>(currentUserEmail || 'emoacc2@gmail.com');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'done'>('request');
  const [resetCodeInput, setResetCodeInput] = useState<string>('124982');
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  // Sync initial view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setSignInEmail(currentUserEmail || 'emoacc2@gmail.com');
      setSignInError(null);
      setSignUpError(null);
      setSignUpSuccess(null);
      setForgotStep('request');
      setForgotMessage(null);
    }
  }, [isOpen, initialView, currentUserEmail]);

  if (!isOpen) return null;

  // Auto-generate next staff ID
  const generateSuggestedStaffId = () => {
    const existingNums = staffRoster
      .map(s => {
        const match = s.staffId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
    return `EMO-STF-${String(nextNum).padStart(3, '0')}`;
  };

  // Sign In submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const trimmed = signInEmail.trim().toLowerCase();
    if (!trimmed) {
      setSignInError('Please enter a valid corporate email address.');
      return;
    }

    const matchedProfile = staffRoster.find(s => s.email.toLowerCase() === trimmed);
    if (matchedProfile) {
      onSelectUser(matchedProfile);
    } else {
      onCustomEmailLogin(trimmed);
    }
    onClose();
  };

  // Sign Up submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!newName.trim()) {
      setSignUpError('Please enter employee full name.');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setSignUpError('Please enter a valid corporate email address.');
      return;
    }
    if (!newStaffId.trim()) {
      setSignUpError('Please provide a Staff ID (e.g. EMO-STF-099).');
      return;
    }
    if (newPassword && newPassword !== newConfirmPassword) {
      setSignUpError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setSignUpError('Please accept the EMO Expense Compliance policy.');
      return;
    }

    // Check if email already registered
    const exists = staffRoster.some(s => s.email.toLowerCase() === newEmail.trim().toLowerCase());
    if (exists) {
      setSignUpError('An account with this email is already registered. Please sign in instead.');
      return;
    }

    const avatarColors = [
      'bg-amber-500', 
      'bg-emerald-500', 
      'bg-blue-500', 
      'bg-purple-500', 
      'bg-rose-500', 
      'bg-teal-500', 
      'bg-indigo-500'
    ];
    const chosenColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const isNewAdmin = newEmail.trim().toLowerCase() === 'emoacc2@gmail.com' || newDepartment === 'Finance & Administration';

    const newProfile: StaffProfile = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      staffId: newStaffId.trim().toUpperCase(),
      email: newEmail.trim().toLowerCase(),
      department: newDepartment,
      role: isNewAdmin ? 'accounts_admin' : 'staff',
      active: true,
      avatarColor: chosenColor,
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    if (onRegisterStaff) {
      onRegisterStaff(newProfile);
    } else {
      onSelectUser(newProfile);
    }

    setSignUpSuccess(`Account created for ${newProfile.name} (${newProfile.staffId})! Logging in...`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // Forgot Password handler
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMessage('Please provide your corporate email address.');
      return;
    }
    setForgotStep('verify');
    setForgotMessage(`A 6-digit corporate verification OTP has been dispatched to ${forgotEmail.trim()}.`);
  };

  const handleVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCodeInput.trim() || resetCodeInput.trim().length < 4) {
      setForgotMessage('Please enter the 6-digit verification code.');
      return;
    }
    setForgotStep('done');
    setForgotMessage('Your credentials have been securely updated. You can now sign in.');
    setTimeout(() => {
      setView('signin');
      setSignInEmail(forgotEmail);
    }, 1200);
  };

  // Role detection helper for email input preview
  const isInputAdmin = signInEmail.trim().toLowerCase() === 'emoacc2@gmail.com' || signInEmail.trim().toLowerCase().includes('admin');
  const matchedRosterProfile = staffRoster.find(s => s.email.toLowerCase() === signInEmail.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Corporate Branding */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  EMO Book Services
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  SSM: 1249821-M
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Staff Claims &amp; Accounts Payable Corporate Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => { setView('signin'); setSignInError(null); }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
              view === 'signin'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { 
              setView('signup'); 
              setSignUpError(null);
              if (!newStaffId) setNewStaffId(generateSuggestedStaffId());
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
              view === 'signup'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Staff (Sign Up)</span>
          </button>

          <button
            onClick={() => { setView('forgot'); setForgotStep('request'); setForgotMessage(null); }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
              view === 'forgot'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Forgot Password</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* ============================================================== */}
          {/* VIEW 1: SIGN IN VIEW */}
          {/* ============================================================== */}
          {view === 'signin' && (
            <div className="space-y-4">
              
              {/* Form Card */}
              <form onSubmit={handleSignInSubmit} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Corporate Credentials
                  </span>
                  
                  {/* Dynamic Role Badge Preview */}
                  {isInputAdmin ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" /> Accounts Admin
                    </span>
                  ) : matchedRosterProfile ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                      Staff Claimant ({matchedRosterProfile.department})
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Standard Claimant
                    </span>
                  )}
                </div>

                {signInError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{signInError}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Corporate Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. emoacc2@gmail.com or name@emobooks.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-400">Corporate Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] text-amber-400 hover:text-amber-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignInPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Sign In button */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Remember this workstation</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Portal</span>
                  </button>
                </div>
              </form>

              {/* Instant Access Demo Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick-Switch Registered Profiles
                  </span>
                  <span className="text-[10px] text-slate-500">1-click demo access</span>
                </div>

                {/* Accounts Admin Spotlight Card */}
                <div className="mb-2">
                  <button
                    onClick={() => {
                      const admin = staffRoster.find(s => s.role === 'accounts_admin') || {
                        id: 'user-admin-1',
                        name: 'Accounts Executive',
                        staffId: 'EMO-ACC-001',
                        email: 'emoacc2@gmail.com',
                        department: 'Finance & Administration',
                        role: 'accounts_admin',
                        active: true,
                      };
                      onSelectUser(admin);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      currentUserEmail.toLowerCase() === 'emoacc2@gmail.com'
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/60 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">Accounts Admin</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Full AP &amp; Audit Authority
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          emoacc2@gmail.com &bull; Finance &amp; Administration
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {currentUserEmail.toLowerCase() === 'emoacc2@gmail.com' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Active Admin
                        </span>
                      ) : (
                        <span className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1 font-semibold">
                          Log In <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                </div>

                {/* Staff Claimant Cards */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {staffRoster
                    .filter(s => s.role !== 'accounts_admin')
                    .map((staff) => {
                      const isCurrent = staff.email.toLowerCase() === currentUserEmail.toLowerCase();
                      return (
                        <button
                          key={staff.id}
                          onClick={() => {
                            onSelectUser(staff);
                            onClose();
                          }}
                          className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${staff.avatarColor || 'bg-slate-500'}`}>
                              {staff.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white text-xs">{staff.name}</span>
                                <span className="text-[10px] text-slate-500">({staff.staffId})</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {staff.email} &bull; {staff.department}
                              </div>
                            </div>
                          </div>

                          {isCurrent ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold text-xs">
                              <Check className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="text-slate-500 hover:text-slate-300 text-xs">
                              Select &rarr;
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Need to register a new employee? </span>
                <button
                  onClick={() => { setView('signup'); setSignUpError(null); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  Create Staff Account
                </button>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: SIGN UP / REGISTER STAFF VIEW */}
          {/* ============================================================== */}
          {view === 'signup' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Staff Claim Enrollment:</span> Registering an employee profile adds them to the EMO Book Services monthly expense roster, enabling receipt OCR auto-mapping and corporate claim voucher generation.
                </div>
              </div>

              {signUpError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{signUpError}</span>
                </div>
              )}

              {signUpSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{signUpSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                {/* Staff Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Employee Full Name (per NRIC)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Mohd Daniel bin Razali"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                {/* Email & Staff ID Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="name@emobooks.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">Staff ID</label>
                      <button
                        type="button"
                        onClick={() => setNewStaffId(generateSuggestedStaffId())}
                        className="text-[10px] text-amber-400 hover:text-amber-300"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newStaffId}
                        onChange={(e) => setNewStaffId(e.target.value.toUpperCase())}
                        placeholder="e.g. EMO-STF-095"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Assigned Department</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 appearance-none"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-slate-900 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Account Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        value={newConfirmPassword}
                        onChange={(e) => setNewConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance agreement */}
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400 select-none pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>
                    I confirm this employee account is authorized to file monthly expenditure claims per EMO Book Services Sdn Bhd Chart of Accounts guidelines.
                  </span>
                </label>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setView('signin')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    &larr; Back to Sign In
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create &amp; Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: FORGOT PASSWORD VIEW */}
          {/* ============================================================== */}
          {view === 'forgot' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Key className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">EMO Corporate Password Recovery:</span> Verify your registered email address to receive a secure 6-digit one-time code to reset your terminal password.
                </div>
              </div>

              {forgotMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  forgotStep === 'done' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                }`}>
                  {forgotStep === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <InfoIcon className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                  )}
                  <span>{forgotMessage}</span>
                </div>
              )}

              {forgotStep === 'request' && (
                <form onSubmit={handleRequestCode} className="space-y-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Registered Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. emoacc2@gmail.com or name@emobooks.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setView('signin')}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      &larr; Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Code</span>
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'verify' && (
                <form onSubmit={handleVerifyAndReset} className="space-y-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">Security Verification Code (6-Digits)</label>
                      <span className="text-[10px] text-amber-400 font-mono">Demo OTP: 124982</span>
                    </div>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={resetCodeInput}
                        onChange={(e) => setResetCodeInput(e.target.value)}
                        placeholder="124982"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Enter New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="New corporate password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      &larr; Resend Code
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Credentials Reset Successful</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Your password has been updated. You can now log into your EMO workstation.
                    </p>
                  </div>
                  <button
                    onClick={() => setView('signin')}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold inline-flex items-center gap-1.5 text-xs transition"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer with Security Note */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Corporate SSL Encrypted Session</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      className="w-4 h-4 text-amber-400 flex-shrink-0"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </svg>
  );
}
