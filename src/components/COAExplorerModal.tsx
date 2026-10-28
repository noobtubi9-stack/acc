import React, { useState } from 'react';
import { 
  X, 
  Search, 
  FileSpreadsheet, 
  Tag, 
  Info, 
  Copy, 
  Check, 
  Filter, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { EMO_ACCOUNT_CODES, COACodeDefinition } from '../types/claim';

interface COAExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode?: (code: string) => void;
}

export const COAExplorerModal: React.FC<COAExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    'all',
    'Purchases',
    'Travel & Transport',
    'Logistics & Packaging',
    'Admin & Office',
    'Staff & Welfare',
    'Promotions & Marketing',
    'Others'
  ];

  const filteredCodes = EMO_ACCOUNT_CODES.filter((coa) => {
    const matchesCategory = selectedCategory === 'all' || coa.category === selectedCategory;
    const matchesSearch =
      coa.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coa.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coa.criteria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coa.examples.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                EMO Official Chart of Account Codes (COA)
              </h3>
              <p className="text-xs text-slate-400">
                Staff Monthly Claim Form Reference &bull; 31 Official Company Codes
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

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code (e.g. 920-0000), description, keyword (e.g. fuel, hotel, box, bubble)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories (31)' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Code list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCodes.map((item) => (
            <div
              key={item.code}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono font-bold text-xs border border-amber-500/20">
                    {item.code}
                  </span>
                  <span className="font-bold text-slate-100 text-xs sm:text-sm">
                    {item.details}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.code)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
                    title="Copy code"
                  >
                    {copiedCode === item.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="text-[11px]">{copiedCode === item.code ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onSelectCode && (
                    <button
                      onClick={() => {
                        onSelectCode(item.code);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <span>Use Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Criteria description */}
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.criteria}
              </p>

              {/* Examples */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Common Vendors / Items:</span>
                {item.examples.map((ex, exIdx) => (
                  <span
                    key={exIdx}
                    className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800/80"
                  >
                    {ex}
                  </span>
                ))}
              </div>

              {/* Special rules */}
              {item.rules && item.rules.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-900 flex items-start gap-1.5 text-[11px] text-amber-300/90 font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Rule: {item.rules.join(' ')}</span>
                </div>
              )}
            </div>
          ))}

          {filteredCodes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No account codes matching &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Showing {filteredCodes.length} of {EMO_ACCOUNT_CODES.length} account codes</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
