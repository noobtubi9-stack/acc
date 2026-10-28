/**
 * EMO Book Services Sdn Bhd - Corporate Claims & Receipt Auditor Backend
 * Uses @google/genai with gemini-3.8-flash for multi-modal receipt extraction & COA mapping.
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large image payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const AUDIT_SYSTEM_INSTRUCTION = `# Role & Operational Objective
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
}
`;

const AUDIT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    receipt_info: {
      type: Type.OBJECT,
      properties: {
        merchant_name: { type: Type.STRING },
        merchant_ssm_or_tax_no: { type: Type.STRING },
        receipt_no: { type: Type.STRING },
        date: { type: Type.STRING, description: 'YYYY-MM-DD' },
        total_amount_rm: { type: Type.NUMBER, description: 'Grand total in RM' },
      },
      required: ['merchant_name', 'date', 'total_amount_rm'],
    },
    claim_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: 'Official EMO account code (e.g., 920-0000, 400-00)' },
          details: { type: Type.STRING, description: 'Itemized details and state if accommodation' },
          amount_rm: { type: Type.NUMBER, description: 'Amount in Malaysian Ringgit' },
          remark: { type: Type.STRING, description: 'Audit remark or policy notes' },
        },
        required: ['code', 'details', 'amount_rm', 'remark'],
      },
    },
    claim_total_rm: { type: Type.NUMBER },
    audit_notes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Empty array [] if no anomalies, only populated if true anomaly detected',
    },
  },
  required: ['receipt_info', 'claim_items', 'claim_total_rm', 'audit_notes'],
};

// Audit endpoint
app.post('/api/audit-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', claimantNotes = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Receipt image data is required (imageBase64).' });
    }

    // Clean base64 string if data URL prefix was sent
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9\/+-]+;base64,/, '');

    const userPrompt = claimantNotes
      ? `Audit this Malaysian business receipt document. Claimant notes: "${claimantNotes}". Extract all items, enforce EMO account code mapping and splitting rules, and check for any compliance or calculation issues.`
      : `Audit this Malaysian business receipt document. Extract all items, enforce EMO account code mapping and splitting rules, and check for any compliance or calculation issues.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              text: userPrompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction: AUDIT_SYSTEM_INSTRUCTION,
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: AUDIT_RESPONSE_SCHEMA,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('No response text received from Gemini API.');
    }

    const auditData = JSON.parse(rawText);

    // Ensure audit_notes is initialized
    if (!Array.isArray(auditData.audit_notes)) {
      auditData.audit_notes = [];
    }

    // Sanitize and perform backend accounting cross-verification
    if (auditData.claim_items && Array.isArray(auditData.claim_items)) {
      const calculatedSum = auditData.claim_items.reduce(
        (sum: number, item: { amount_rm: number }) => sum + (Number(item.amount_rm) || 0),
        0
      );
      const roundedClaimTotal = Math.round(calculatedSum * 100) / 100;
      auditData.claim_total_rm = roundedClaimTotal;

      const grandTotal = Number(auditData.receipt_info?.total_amount_rm) || 0;
      const difference = Math.abs(roundedClaimTotal - grandTotal);

      // Rule 5: Only append a string into audit_notes if there is a true anomaly
      if (difference > 0.05) {
        auditData.audit_notes.push(
          `Calculation Discrepancy: Sum of claim items (RM ${roundedClaimTotal.toFixed(
            2
          )}) does not match receipt total (RM ${grandTotal.toFixed(2)}). Variance: RM ${difference.toFixed(2)}.`
        );
      }
    }

    // Populate backwards-compatible alias fields
    auditData.receipt_summary = {
      ...auditData.receipt_info,
      invoice_receipt_no: auditData.receipt_info.receipt_no,
      receipt_grand_total: auditData.receipt_info.total_amount_rm,
    };
    auditData.claim_entries = auditData.claim_items;
    auditData.audit_flags = auditData.audit_notes;

    return res.json({ success: true, data: auditData });
  } catch (error: any) {
    console.error('Error auditing receipt:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'An error occurred while auditing receipt.',
    });
  }
});

// Get Google AI Studio System Prompt and settings configuration
app.get('/api/system-prompt', (req, res) => {
  res.json({
    model: 'gemini-3.8-flash',
    temperature: 0.0,
    responseMimeType: 'application/json',
    systemInstruction: AUDIT_SYSTEM_INSTRUCTION,
    responseSchema: {
      type: 'OBJECT',
      properties: {
        receipt_info: {
          type: 'OBJECT',
          properties: {
            merchant_name: { type: 'STRING' },
            merchant_ssm_or_tax_no: { type: 'STRING' },
            receipt_no: { type: 'STRING' },
            date: { type: 'STRING', description: 'YYYY-MM-DD' },
            total_amount_rm: { type: 'NUMBER', description: 'Grand total in RM' },
          },
          required: ['merchant_name', 'date', 'total_amount_rm'],
        },
        claim_items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              code: { type: 'STRING', description: 'Official EMO account code' },
              details: { type: 'STRING', description: 'Itemized details and state if accommodation' },
              amount_rm: { type: 'NUMBER', description: 'Amount in Malaysian Ringgit' },
              remark: { type: 'STRING', description: 'Audit remark or policy notes' },
            },
            required: ['code', 'details', 'amount_rm', 'remark'],
          },
        },
        claim_total_rm: { type: 'NUMBER' },
        audit_notes: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Empty array [] if no anomalies, only populated if true anomaly detected',
        },
      },
      required: ['receipt_info', 'claim_items', 'claim_total_rm', 'audit_notes'],
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EMO Book Services Claims Auditor running on http://localhost:${PORT}`);
  });
}

startServer();
