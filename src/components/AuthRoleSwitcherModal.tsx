import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { StaffProfile } from '../types/claim';

interface AuthRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  currentRole: 'staff' | 'accounts_admin';
  staffRoster: StaffProfile[];
  onSelectUser: (profile: StaffProfile) => void;
  onCustomEmailLogin: (email: string) => void;
}

export const AuthRoleSwitcherModal: React.FC<AuthRoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  currentRole,
  staffRoster,
  onSelectUser,
  onCustomEmailLogin,
}) => {
  const [emailInput, setEmailInput] = useState<string>(currentUserEmail);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    onCustomEmailLogin(emailInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                EMO Book Services Identity &amp; Role
              </h3>
              <p className="text-xs text-slate-400">
                Email-based authentication &amp; permission switching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          
          {/* Email input form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Sign In with Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. emoacc2@gmail.com or name@emobooks.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin email <code className="text-amber-400">emoacc2@gmail.com</code> unlocks Accounts Admin dashboard</span>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </form>

          {/* Quick Roster Switcher */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Or Switch to Registered Profile:
            </span>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {staffRoster.map((staff) => {
                const isCurrent = staff.email.toLowerCase() === currentUserEmail.toLowerCase();
                const isAdmin = staff.role === 'accounts_admin';

                return (
                  <button
                    key={staff.id}
                    onClick={() => {
                      onSelectUser(staff);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${staff.avatarColor || 'bg-amber-500'}`}>
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-slate-950" /> : staff.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{staff.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                            isAdmin
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isAdmin ? 'Accounts Admin' : 'Staff Claimant'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {staff.email} &bull; {staff.department} ({staff.staffId})
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-amber-400 flex items-center gap-1 font-bold text-xs">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
