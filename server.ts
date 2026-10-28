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

const AUDIT_SYSTEM_INSTRUCTION = `
You are an expert accounts payable and corporate claims auditor at EMO Book Services Sdn Bhd (Malaysia).
Your task is to process uploaded receipt images or documents submitted by employees, extract itemized expenditure data in Malaysian Ringgit (RM), and map each item strictly to EMO's official Staff Monthly Claim Form chart of account codes.

Official EMO Book Services Chart of Account Codes (COA):
- 400-00: CASH PURCHASE (for book / resell only) -> Direct purchase of books, titles, or merchandise intended for retail/resale.
- 923-0000: ACCOMMODATION - STATE: [State Name] -> Hotels, lodging, and stay during outstation business trips (Must capture the state, e.g., Penang, Terengganu, Johor, Sabah).
- 928-0000: COURIER CHARGES -> Commercial parcel couriers (DHL, GDEX, J&T, Ninja Van, Line Clear, Pos Laju courier parcel, etc.).
- 919-0000: ENTERTAINMENT -> Business dining, client meals, catering, coffee/refreshments for guests/clients.
- 966-0002: SPONSORSHIP OTHERS - FOR: [Details] -> Company-sponsored events, donations, external community sponsorship.
- 913-0000: EXHIBITION, ROAD SHOW & PROMOTION -> Booth rentals, banners, flyers, promotional display materials, trade fair expenses.
- 946-0000: RECRUITMENT EXPENSES -> Job ads (JobStreet, LinkedIn), recruitment agency fees, interview refreshments.
- 939-0000: LICENSE & REGISTRATION FEE -> Government renewals, SSM fees, trademark, local council (MBPJ/MBSA) licenses.
- 940-: MEDICAL FEE -> Panel/clinic receipts, prescription medicines, health screenings.
- 920-0000: PETROL - RON95 / DIESEL -> Fuel receipts from Petronas, Shell, Caltex, BHP, Petron, etc.
- 921-0001: PARKING -> Ticketed parking, street parking coupons/apps (Smart Selangor, TnG eWallet parking).
- 921-0002: TOLL -> Touch 'n Go reloads, RFID statements, highway toll receipts.
- 910-0000: PRINTING & STATIONERY -> Paper, pens, files, desk stationery, photocopy/external printing jobs.
- 912-0000: POSTAGE & STAMP -> Pos Malaysia official stamps, standard postal envelopes, registered mail.
- 905-0001: TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT -> Grab rides, airasia ride, LRT, MRT, Monorail, KTM Komuter, airport bus.
- 905-0002: TRAVEANG EXPENSES - LOCAL -> Domestic flight tickets, interstate trains (ETS), long-distance express buses.
- 922-: ATTENDANCE ALLOWANCE -> Approved monthly attendance compensation claims.
- 925-0000: STAFF ALLOWANCE -> Contractual staff allowances (food/meal allowances, mobile allowance top-ups).
- 926-0000: STAFF WELFARE -> Staff pantry supplies (tea, coffee, biscuits, water), first aid kit supplies, internal staff bereavement/celebrations.
- 968-: TRAVELLING ALLOWANCE -> Fixed daily per diem / outstation travel allowances.
- 615-0000: CARRIAGE INWARDS (for forwarder only) -> Port customs clearance, shipping freight, forwarder handling charges.
- 959-0001: UPKEEP OF HARDWARE -> Computer, monitor, printer, server, POS terminal repairs, RAM/SSD upgrades, mouse/keyboard replacements.
- 906-0001: UPKEEP OF MOTOR VEHICLE (for van only) -> Service, engine oil, tires, maintenance strictly for company delivery vans.
- 918-0000: UPKEEP OF OFFICE -> Office aircond maintenance, plumbing, electrical repairs, office cleaning supplies.
- 924-: WAGES / OVERTIME -> Official staff overtime claims or temporary labor pay slips.
- 909-0000: TELEPHONE CHARGES -> Telco bills (Maxis, CelcomDigi, Unifi Mobile, U Mobile), office landlines.
- 952-0001: TRANSPORTATION (Delivery Expenses) -> Lalamove, Borzo, dispatch runners, dedicated third-party logistics dispatch.
- 617-0001: PACKING MATERIAL - BOX -> Corrugated cartons, mailer cartons, standard shipping boxes.
- 617-0002: PACKING MATERIAL - BAG / PLASTIC BAG -> Retail plastic bags, branded carrier bags, poly mailers.
- 617-0003: PACKING MATERIAL - OTHERS EG. BUBBLE WRAP -> Bubble wrap, OPP tape, stretch film, fragile stickers, strapping bands.
- OTHERS: OTHERS (Requires Remark) -> Miscellaneous items strictly outside the standard categories.

Strict Extraction & Parsing Rules:
1. Multi-Item Splitting: If a receipt from a single vendor contains items spanning multiple accounts (e.g. supermarket receipt with pantry coffee 926-0000 and stationery pens 910-0000), split them into separate claim rows.
2. Fuel Splitting: For petrol station receipts, separate fuel purchases (920-0000) from convenience store snacks or car wash items. Fuel goes to 920-0000, food/water goes to 926-0000 (Staff Welfare) or OTHERS.
3. Accommodation Specifics: When mapping to 923-0000, determine the state from the hotel address and populate the field as "ACCOMMODATION - STATE: [State Name]" (e.g., "ACCOMMODATION - STATE: PENANG", "ACCOMMODATION - STATE: TERENGGANU").
4. Packing Materials Nuance: Carefully distinguish cardboard boxes (617-0001), plastic carrier bags (617-0002), and cushioning materials like tape/bubble wrap (617-0003).
5. Currency & Totals: All amounts must be rounded to two decimal places in Malaysian Ringgit (RM). Extract SST/Service Tax and include it proportionally or note it in the remark.
6. Audit Flags: Identify any warnings (e.g. missing date, tax discrepancy, blurry text, weekend personal items, missing hotel state, lack of merchant registration SSM/tax ID).
`;

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
      ? `Audit this Malaysian business receipt document. Claimant provided notes: "${claimantNotes}". Extract all items, enforce EMO account code mapping and splitting rules, and check for any compliance or calculation issues.`
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
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            receipt_summary: {
              type: Type.OBJECT,
              properties: {
                merchant_name: { type: Type.STRING },
                merchant_ssm_or_tax_no: { type: Type.STRING },
                invoice_receipt_no: { type: Type.STRING },
                date: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                currency: { type: Type.STRING, description: 'MYR' },
                receipt_subtotal: { type: Type.NUMBER },
                tax_sst: { type: Type.NUMBER },
                receipt_grand_total: { type: Type.NUMBER },
              },
              required: ['merchant_name', 'date', 'currency', 'receipt_grand_total'],
            },
            claim_entries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING, description: 'Official EMO account code (e.g., 920-0000, 400-00)' },
                  details: { type: Type.STRING, description: 'Details including state for accommodation if applicable' },
                  amount_rm: { type: Type.NUMBER, description: 'Amount in Malaysian Ringgit' },
                  remark: { type: Type.STRING, description: 'Audit remark or tax details' },
                },
                required: ['code', 'details', 'amount_rm', 'remark'],
              },
            },
            claim_total_rm: { type: Type.NUMBER },
            audit_flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['receipt_summary', 'claim_entries', 'claim_total_rm', 'audit_flags'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('No response text received from Gemini API.');
    }

    const auditData = JSON.parse(rawText);

    // Sanitize and perform backend accounting cross-verification
    if (auditData.claim_entries && Array.isArray(auditData.claim_entries)) {
      // Recalculate sum of claim items
      const calculatedSum = auditData.claim_entries.reduce(
        (sum: number, item: { amount_rm: number }) => sum + (Number(item.amount_rm) || 0),
        0
      );
      const roundedClaimTotal = Math.round(calculatedSum * 100) / 100;
      auditData.claim_total_rm = roundedClaimTotal;

      const grandTotal = Number(auditData.receipt_summary?.receipt_grand_total) || 0;
      const difference = Math.abs(roundedClaimTotal - grandTotal);

      if (difference > 0.05) {
        if (!auditData.audit_flags) auditData.audit_flags = [];
        auditData.audit_flags.push(
          `Calculation Discrepancy: Sum of claim items (RM ${roundedClaimTotal.toFixed(
            2
          )}) does not match receipt grand total (RM ${grandTotal.toFixed(2)}). Difference: RM ${difference.toFixed(2)}.`
        );
      }
    }

    return res.json({ success: true, data: auditData });
  } catch (error: any) {
    console.error('Error auditing receipt:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'An error occurred while auditing receipt.',
    });
  }
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
