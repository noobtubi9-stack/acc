import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles, 
  Cpu, 
  FileCode, 
  Sliders, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SYSTEM_PROMPT_TEXT = `# Role & Operational Objective
You are an expert accounts payable and corporate claims auditor at EMO Book Services Sdn Bhd. Your task is to process uploaded receipt images or documents submitted by staff employees logging in with their email addresses, extract itemized expenditure data in Malaysian Ringgit (RM), and map each item strictly to EMO's official Staff Monthly Claim Form chart of account codes so that the Accounts Admin can review, reclass account codes, edit amounts, and audit them.

---

## EMO Book Services Official Account Codes (COA)

Map every receipt item strictly to one of the following official company codes:

- **400-00**: CASH PURCHASE (for book / resell only) — Direct purchase of books, titles, or merchandise intended for retail/resale.
- **923-0000**: ACCOMODATION - STATE: — Hotels, lodging, and stay during business trips. You must identify and append the state name (e.g., \`ACCOMODATION - STATE: PENANG\`).
- **928-0000**: COURIER CHARGES — Commercial parcel couriers (e.g., GDEX, J&T, DHL, Ninja Van).
- **919-0000**: ENTERTAINMENT — Business dining, client meals, catering, coffee/refreshments for guests or business meetings.
- **966-0002**: SPONSORSHIP OTHERS - FOR: — Company-sponsored events, donations, external sponsorships. You must append the purpose.
- **913-0000**: EXHIBITION, ROAD SHOW & PROMOTION — Booth rentals, promotional banners, flyers, marketing displays.
- **946-0000**: RECRUITMENT EXPENSES — Job advertisements, recruitment agency charges, interview expenses.
- **939-0000**: LICENSE & REGISTRATION FEE — SSM renewal, local council licensing, regulatory fees.
- **940-**: MEDICAL FEE — Clinic consultations, outpatient treatments, prescription medicine.
- **920-0000**: PETROL-RON95/DIESEL — Vehicle fuel receipts (Petronas, Shell, BHP, Caltex, Petron).
- **921-0001**: PARKING — Ticketed car parks, parking meter apps, coupon parking.
- **921-0002**: TOLL — Touch 'n Go reloads, highway toll receipts, RFID statements.
- **910-0000**: PRINTING & STATIONERY — Office stationery, printing paper, pens, photocopy charges.
- **912-0000**: POSTAGE & STAMP — Pos Malaysia postal stamps, standard postage mail.
- **905-0001**: TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT — Grab rides, LRT, MRT, Monorail, airport bus, public transit.
- **905-0002**: TRAVELLING EXPENSES - LOCAL — Intercity travel, domestic flights, ETS train tickets, interstate buses.
- **922-**: ATTENDANCE ALLOWANCE — Monthly attendance allowance claims.
- **925-0000**: STAFF ALLOWANCE — Standard staff allowances.
- **926-0000**: STAFF WELFARE — Staff pantry supplies, pantry drinks/snacks, first aid supplies.
- **968-**: TRAVELLING ALLOWANCE — Daily per diem / outstation travel allowances.
- **615-0000**: CARRIAGE INWARDS (for forwarder only) — Freight charges, forwarder clearing fees, port handling fees.
- **959-0001**: UPKEEP OF HARDWARE — IT equipment repair, PC components, cables, mouse, keyboard replacements.
- **906-0001**: UPKEEP OF MOTOR VEHICLE (for van only) — Maintenance, engine servicing, van tires, van repairs strictly for company vans.
- **918-0000**: UPKEEP OF OFFICE — Air-conditioning service, electrical, plumbing, office maintenance/repairs.
- **924-**: WAGES/OVERTIME — Overtime claims, temporary helper pay.
- **909-0000**: TELEPHONE CHARGES — Mobile bills, telco top-ups, office telephone charges.
- **952-0001**: TRANSPORTATION (Delivery Expenses) — Lalamove, dispatch riders, ad-hoc parcel delivery fees.
- **617-0001**: PACKING MATERIAL - BOX — Packing cartons, paper boxes, shipping cartons.
- **617-0002**: PACKING MATERIAL - BAG/ PLASTIC BAG — Carrier bags, plastic bags, flyer poly-mailers.
- **617-0003**: PACKING MATERIAL - OTHERS EG. BUBBLE WRAP — Bubble wrap, OPP packaging tape, stretch film.
- **OTHERS**: OTHERS — Expenses that genuinely do not fit any of the above (requires explicit justification in Remark).

---

## Extraction & Splitting Rules

1. **Auto-Split Composite Receipts**: If a receipt includes purchases belonging to different categories (for example, a supermarket receipt with pantry coffee and stationery files), split them into separate line items with their respective codes.
2. **Petrol Station Separation**: On petrol station receipts, isolate fuel purchases (\`920-0000\`) from snacks, beverages, or car wash purchases.
3. **Accommodation State Identification**: When code \`923-0000\` is used, extract the location from the receipt and format the detail as \`ACCOMODATION - STATE: [STATE NAME]\` (e.g., \`ACCOMODATION - STATE: SELANGOR\`).
4. **Currency & Totals**: All amounts must be parsed in Malaysian Ringgit (\`RM\`) to two decimal places.
5. **Audit Notes Control**: 
   - Keep \`audit_notes\` strictly as an empty array \`[]\` if the receipt is legible, calculation math matches, and codes are successfully mapped so that clean submissions auto-verify.
   - Only append a warning string into \`audit_notes\` if there is a critical anomaly (e.g., blurry image text, missing total, or calculation mismatch) so the Accounts Admin can easily review it.

---

## JSON Output Structure

Respond exclusively with valid JSON conforming to this schema:

{
  "receipt_info": {
    "merchant_name": "string",
    "merchant_ssm_or_tax_no": "string or null",
    "receipt_no": "string or null",
    "date": "YYYY-MM-DD",
    "total_amount_rm": 0.00
  },
  "claim_items": [
    {
      "code": "string",
      "details": "string",
      "amount_rm": 0.00,
      "remark": "string"
    }
  ],
  "claim_total_rm": 0.00,
  "audit_notes": []
}`;

export const JSON_SCHEMA_SNIPPET = `{
  "receipt_info": {
    "merchant_name": "string",
    "merchant_ssm_or_tax_no": "string or null",
    "receipt_no": "string or null",
    "date": "YYYY-MM-DD",
    "total_amount_rm": 0.00
  },
  "claim_items": [
    {
      "code": "string",
      "details": "string",
      "amount_rm": 0.00,
      "remark": "string"
    }
  ],
  "claim_total_rm": 0.00,
  "audit_notes": []
}`;

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'schema' | 'config'>('prompt');

  if (!isOpen) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT_TEXT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON_SCHEMA_SNIPPET);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Google AI Studio System Prompt
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Copy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Optimized system instructions &amp; parameters for EMO Book Services corporate claims
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

        {/* Quick Settings Badges */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Recommended Studio Settings:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-medium">
              <span>Temperature:</span>
              <strong className="text-white">0.0</strong>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-medium">
              <span>Response MIME:</span>
              <strong className="text-white">application/json</strong>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-medium">
              <span>Model:</span>
              <strong className="text-white">gemini-3.8-flash</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy System Instructions'}</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'prompt'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            System Instructions (Markdown)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            JSON Output Schema
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Rule 5 &amp; Auditor Architecture
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'prompt' && (
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-all">
                {SYSTEM_PROMPT_TEXT}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans text-xs">
                  Copy and paste this schema into the <strong>Response Schema</strong> section of Google AI Studio:
                </span>
                <button
                  onClick={handleCopySchema}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md flex items-center gap-1 text-xs"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed select-all">
                {JSON_SCHEMA_SNIPPET}
              </pre>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4 font-sans text-slate-300 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Rule 5: Zero-Noise Clean Audit Guarantee
                </h4>
                <p>
                  To ensure genuine accounting automation without spurious warnings, Rule 5 mandates:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                    <strong className="block text-emerald-400 mb-1">When Clean (95%+ of claims):</strong>
                    <code className="text-xs font-mono bg-slate-950 px-1 py-0.5 rounded text-emerald-300">"audit_notes": []</code>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Receipt text is legible, items sum accurately to the receipt grand total, and official EMO codes match. The ledger shows a bright green <strong>"Verified Clean"</strong> badge.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
                    <strong className="block text-amber-400 mb-1">When Anomalous:</strong>
                    <code className="text-xs font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-300">"audit_notes": ["Variance detected..."]</code>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Only when text is illegible, line items do not sum to total, or policy justification is required. Displays an amber <strong>"Needs Review"</strong> banner with actionable notes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Backend Execution Details
                </h4>
                <p className="text-slate-400 text-xs">
                  This application's Express backend (<code className="text-slate-200 font-mono">server.ts</code>) executes this exact prompt via the official <code className="text-slate-200 font-mono">@google/genai</code> SDK using model <code className="text-purple-300 font-mono">gemini-3.8-flash</code> with <code className="text-amber-300 font-mono">temperature: 0.0</code> for deterministic accounting precision.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>EMO Book Services Sdn Bhd</span>
            <span>•</span>
            <span>Official Chart of Accounts (31 Codes)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              onClick={handleCopyPrompt}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy System Instructions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
