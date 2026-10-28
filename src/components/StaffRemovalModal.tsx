import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  UserX, 
  AlertTriangle, 
  Check, 
  ShieldAlert, 
  UserPlus, 
  Building2, 
  Mail, 
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { StaffProfile, AuditedReceiptRecord } from '../types/claim';
import { formatRM } from '../utils/formatters';

interface StaffRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffProfile[];
  claims: AuditedReceiptRecord[];
  onRemoveStaff: (staffId: string, removeClaims: boolean) => void;
  onAddStaff: (newStaff: StaffProfile) => void;
}

export const StaffRemovalModal: React.FC<StaffRemovalModalProps> = ({
  isOpen,
  onClose,
  staffList,
  claims,
  onRemoveStaff,
  onAddStaff,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [removeAssociatedClaims, setRemoveAssociatedClaims] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isAddMode, setIsAddMode] = useState<boolean>(false);

  // New staff form state
  const [newName, setNewName] = useState<string>('');
  const [newStaffId, setNewStaffId] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newDept, setNewDept] = useState<string>('Sales & Marketing');

  if (!isOpen) return null;

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);
  const staffClaims = selectedStaff ? claims.filter(c => c.claimantStaffId === selectedStaff.staffId || c.claimantName === selectedStaff.name) : [];
  const staffClaimsTotal = staffClaims.reduce((sum, c) => sum + (c.auditResult.claim_total_rm || 0), 0);

  const handleConfirmRemoval = () => {
    if (!selectedStaff) return;
    if (selectedStaff.role === 'accounts_admin') {
      alert('Cannot remove the primary Accounts Admin account.');
      return;
    }
    if (confirmationText.toLowerCase() !== 'remove') {
      alert('Please type "REMOVE" to confirm staff deletion.');
      return;
    }
    onRemoveStaff(selectedStaff.id, removeAssociatedClaims);
    setSelectedStaffId('');
    setConfirmationText('');
    onClose();
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newStaffId || !newEmail) {
      alert('Please fill in all staff details.');
      return;
    }
    const newProfile: StaffProfile = {
      id: `staff-${Date.now()}`,
      name: newName,
      staffId: newStaffId,
      email: newEmail,
      department: newDept,
      role: 'staff',
      active: true,
      avatarColor: 'bg-indigo-500',
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    onAddStaff(newProfile);
    setIsAddMode(false);
    setNewName('');
    setNewStaffId('');
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <UserX className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                EMO Staff Roster Management &amp; Removal
              </h3>
              <p className="text-xs text-slate-400">
                Accounts Admin control to manage active staff profiles and remove departed employees
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              {isAddMode ? 'Register New Staff Member' : 'Select Staff Member to Remove'}
            </span>
            <button
              onClick={() => setIsAddMode(!isAddMode)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              {isAddMode ? 'Back to Removal Roster' : '+ Add New Staff Profile'}
            </button>
          </div>

          {isAddMode ? (
            <form onSubmit={handleCreateStaff} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ahmad Firdaus bin Rosli"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Staff ID</label>
                  <input
                    type="text"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    placeholder="e.g. EMO-STF-105"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Sales & Marketing">Sales &amp; Marketing</option>
                    <option value="Editorial & Publishing">Editorial &amp; Publishing</option>
                    <option value="Warehouse & Dispatch">Warehouse &amp; Dispatch</option>
                    <option value="Operations & Retail">Operations &amp; Retail</option>
                    <option value="Finance & Administration">Finance &amp; Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. firdaus@emobooks.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMode(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Staff Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {/* Staff List Grid */}
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                {staffList.map((staff) => {
                  const isSelected = staff.id === selectedStaffId;
                  const isPrimaryAdmin = staff.role === 'accounts_admin';
                  const cCount = claims.filter(c => c.claimantStaffId === staff.staffId || c.claimantName === staff.name).length;

                  return (
                    <div 
                      key={staff.id} 
                      onClick={() => !isPrimaryAdmin && setSelectedStaffId(staff.id)}
                      className={`p-3 flex items-center justify-between transition cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-950/30 border-l-4 border-l-rose-500' 
                          : isPrimaryAdmin
                          ? 'bg-slate-900/30 opacity-60 cursor-not-allowed'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${staff.avatarColor || 'bg-amber-500'}`}>
                          {staff.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{staff.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {staff.staffId}
                            </span>
                            {isPrimaryAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                Primary Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{staff.department}</span>
                            <span>&bull;</span>
                            <span>{staff.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {cCount} {cCount === 1 ? 'claim' : 'claims'}
                        </span>
                        {!isPrimaryAdmin && (
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-rose-400' : 'text-slate-500'}`}>
                            {isSelected ? 'Selected for Removal' : 'Select to Remove'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Staff Removal Options & Confirmation */}
              {selectedStaff && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-300 text-sm">
                        Confirm Staff Removal: {selectedStaff.name} ({selectedStaff.staffId})
                      </h4>
                      <p className="text-xs text-rose-200/80 mt-1">
                        Removing this staff profile will revoke their claim submission privileges and remove them from the active claimant directory.
                      </p>
                    </div>
                  </div>

                  {/* Associated Claims Cascade Option */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Associated Monthly Claims ({staffClaims.length} records &bull; {formatRM(staffClaimsTotal)})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {removeAssociatedClaims 
                          ? 'Permanently delete all historical claim records submitted by this staff member' 
                          : 'Preserve existing submitted claims in Accounts Admin records for historical audit'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={removeAssociatedClaims}
                        onChange={(e) => setRemoveAssociatedClaims(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {/* Type REMOVE to confirm */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Type <strong>REMOVE</strong> below to confirm deletion:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder='Type "REMOVE"'
                      className="w-full bg-slate-950 border border-rose-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>

          {!isAddMode && selectedStaff && (
            <button
              onClick={handleConfirmRemoval}
              disabled={confirmationText.toLowerCase() !== 'remove'}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirm &amp; Remove Staff</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
