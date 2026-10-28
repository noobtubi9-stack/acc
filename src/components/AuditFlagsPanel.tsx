import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Fuel, 
  Layers, 
  MapPin, 
  Split, 
  CheckCheck
} from 'lucide-react';
import { ClaimEntry } from '../types/claim';

interface AuditFlagsPanelProps {
  flags: string[];
  claimEntries: ClaimEntry[];
  onDismissFlag?: (index: number) => void;
}

export const AuditFlagsPanel: React.FC<AuditFlagsPanelProps> = ({
  flags,
  claimEntries,
  onDismissFlag,
}) => {
  // Check compliance against the 5 EMO rules based on active items
  const hasFuel = claimEntries.some(e => e.code === '920-0000');
  const hasAccommodation = claimEntries.some(e => e.code === '923-0000');
  const hasStateInAccommodation = claimEntries
    .filter(e => e.code === '923-0000')
    .every(e => e.details.toUpperCase().includes('STATE:'));
  const hasPackaging = claimEntries.some(e => e.code.startsWith('617-'));
  const hasMultiItem = claimEntries.length > 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-slate-100 text-sm">
            Auditor Compliance &amp; Rule Verification
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
          EMO Audit Standard
        </span>
      </div>

      {/* Flags & Warnings List */}
      {flags && flags.length > 0 ? (
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Detected Audit Flags ({flags.length})
          </span>
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
                    className="text-slate-400 hover:text-white text-[10px] underline ml-2"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-200 flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No discrepancies or missing data detected on this receipt document.</span>
        </div>
      )}

      {/* 5 EMO Core Audit Rules Checklist */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
          5 Core Extraction Policy Rules
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          
          {/* Rule 1: Multi-Item Splitting */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasMultiItem ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Split className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">1. Multi-Item Splitting</p>
              <p className="text-slate-400 text-[10px]">
                {hasMultiItem ? `Active: ${claimEntries.length} items separated` : 'Single vendor item'}
              </p>
            </div>
          </div>

          {/* Rule 2: Fuel Splitting */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasFuel ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">2. Fuel &amp; Mart Splitting</p>
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
                  ? (hasStateInAccommodation ? 'Compliant with STATE: [Name]' : 'Needs STATE: [Name] specified') 
                  : 'No accommodation claimed'}
              </p>
            </div>
          </div>

          {/* Rule 4: Packaging Material Distinction */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
            <div className={`p-1 rounded ${hasPackaging ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">4. Packaging Material</p>
              <p className="text-slate-400 text-[10px]">
                {hasPackaging ? 'Categorized (Boxes 617-1 / Wrap 617-3)' : 'No packaging materials'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
