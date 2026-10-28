import React from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { SAMPLE_RECEIPTS, SampleReceipt } from '../data/sampleReceipts';
import { formatRM } from '../utils/formatters';

interface SampleReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleReceipt) => void;
}

export const SampleReceiptsModal: React.FC<SampleReceiptsModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Pre-Audited Malaysian Test Receipts
              </h3>
              <p className="text-xs text-slate-400">
                Select a real-world scenario to test EMO&apos;s chart of accounts parsing and auditing rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of sample scenarios */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {SAMPLE_RECEIPTS.map((sample) => (
            <div
              key={sample.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-950 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition">
                    {sample.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {sample.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 ml-auto sm:ml-0">
                    {formatRM(sample.totalRm)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Vendor: <span className="text-slate-300 font-medium">{sample.vendor}</span>
                </p>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {sample.description}
                </p>

                {/* Scenario highlights */}
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{sample.auditScenario}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <button
                  className="px-3.5 py-2 rounded-lg bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>Load &amp; Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>All samples include authentic Malaysian SST numbers, SSM registrations &amp; itemizations.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
