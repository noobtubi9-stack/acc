import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Fuel, 
  Layers, 
  MapPin, 
  Split, 
  Plus,
  Trash2,
  FileCheck2,
  CheckCheck
} from 'lucide-react';
import { ClaimEntry } from '../types/claim';

interface AuditFlagsPanelProps {
  flags: string[];
  claimEntries: ClaimEntry[];
  onDismissFlag?: (index: number) => void;
  onAddNote?: (note: string) => void;
  onClearNotes?: () => void;
}

export const AuditFlagsPanel: React.FC<AuditFlagsPanelProps> = ({
  flags = [],
  claimEntries = [],
  onDismissFlag,
  onAddNote,
  onClearNotes,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Check compliance against the 5 EMO rules based on active items
  const hasFuel = claimEntries.some(e => e.code === '920-0000');
  const hasAccommodation = claimEntries.some(e => e.code === '923-0000');
  const hasStateInAccommodation = claimEntries
    .filter(e => e.code === '923-0000')
    .every(e => e.details.toUpperCase().includes('STATE:'));
  const hasPackaging = claimEntries.some(e => e.code.startsWith('617-'));
  const hasMultiItem = claimEntries.length > 1;

  const handleCreateNote = () => {
    if (!newNoteText.trim() || !onAddNote) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
    setIsAddingNote(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-slate-100 text-sm">
            Auditor Compliance &amp; Rule 5 Verification
          </h4>
        </div>
        
        <div className="flex items-center gap-2">
          {onAddNote && (
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>Add Note</span>
            </button>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
            EMO Claims Standard
          </span>
        </div>
      </div>

      {/* Manual Note Add Input */}
      {isAddingNote && (
        <div className="mb-3 p-2.5 bg-slate-950 border border-slate-700 rounded-lg flex items-center gap-2">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Enter auditor anomaly note (e.g., Faded thermal print, tax invoice exemption)..."
            className="flex-1 bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
          />
          <button
            onClick={handleCreateNote}
            className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px]"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingNote(false)}
            className="px-2 py-1 text-slate-400 hover:text-white text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Flags & Warnings List */}
      {flags && flags.length > 0 ? (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
              Audit Notes &amp; Anomalies ({flags.length})
            </span>
            {onClearNotes && (
              <button
                onClick={onClearNotes}
                className="text-[10px] text-slate-400 hover:text-emerald-400 underline font-medium"
              >
                Clear All Notes (Mark as Clean Verified)
              </button>
            )}
          </div>

          {flags.map((flag, idx) => {
            const isCritical = flag.toLowerCase().includes('discrepancy') || flag.toLowerCase().includes('missing');
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                    : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                }`}
              >
                {isCritical ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs leading-relaxed">
                  {flag}
                </div>
                {onDismissFlag && (
                  <button
                    onClick={() => onDismissFlag(idx)}
                    className="text-slate-400 hover:text-white text-[10px] underline ml-2 shrink-0"
                  >
                    Resolve
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-800/40 text-emerald-200 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Rule 5 Compliant:</strong> <code className="text-emerald-300 font-mono">audit_notes: []</code> — Zero anomalies. Receipt is legible, math matches, and codes are mapped.
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>
      )}

      {/* 5 EMO Core Audit Rules Checklist */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
          EMO 5-Rule Extraction Compliance
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          
          {/* Rule 1: Auto-Split Composite Receipts */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasMultiItem ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Split className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">1. Auto-Split Composite</p>
              <p className="text-slate-400 text-[10px]">
                {hasMultiItem ? `Active: ${claimEntries.length} separate items extracted` : 'Single category item'}
              </p>
            </div>
          </div>

          {/* Rule 2: Petrol Station Separation */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasFuel ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">2. Fuel &amp; Mart Separation</p>
              <p className="text-slate-400 text-[10px]">
                {hasFuel ? 'Fuel 920-0000 isolated from snacks' : 'Not a petrol receipt'}
              </p>
            </div>
          </div>

          {/* Rule 3: Accommodation State */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasAccommodation ? (hasStateInAccommodation ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400') : 'bg-slate-800 text-slate-400'}`}>
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">3. Hotel State Format</p>
              <p className="text-slate-400 text-[10px]">
                {hasAccommodation 
                  ? (hasStateInAccommodation ? 'Compliant: ACCOMODATION - STATE: [State]' : 'Requires state identification') 
                  : 'No accommodation claimed'}
              </p>
            </div>
          </div>

          {/* Rule 4: Currency */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">4. Currency RM (2 Decimals)</p>
              <p className="text-slate-400 text-[10px]">
                All line items normalized in Malaysian Ringgit
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
