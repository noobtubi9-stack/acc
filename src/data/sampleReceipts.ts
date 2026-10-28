/**
 * Realistic Malaysian Sample Receipts for EMO Book Services Claims Testing
 */
import { AuditResult, normalizeAuditResult } from '../types/claim';

export interface SampleReceipt {
  id: string;
  name: string;
  category: string;
  vendor: string;
  totalRm: number;
  description: string;
  auditScenario: string;
  imageSvg: string;
  expectedAudit: AuditResult;
}

const RAW_SAMPLES = [
  {
    id: 'sample-fuel-snack',
    name: 'Petronas Station (Fuel + Pantry)',
    category: 'Petrol & Welfare Split',
    vendor: 'PETRONAS DAGANGAN BHD (STATION 1142 PJ)',
    totalRm: 74.50,
    description: 'Petrol station receipt containing both RON95 fuel and convenience store snacks.',
    auditScenario: 'Tests Rule #2: Multi-Item Petrol Splitting. Fuel mapped to 920-0000, Snacks mapped to 926-0000 (Staff Welfare).',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="16" font-weight="bold">PETRONAS DAGANGAN BHD</text>
        <text x="200" y="58" font-size="11">STESEN MINYAK SEKSYEN 13 PJ</text>
        <text x="200" y="74" font-size="11">JALAN PROF DIRDIRA, 46200 PJ, SELANGOR</text>
        <text x="200" y="90" font-size="11">SSM: 198201004128 (88222-D) | SST: W10-1808-32000041</text>
        <text x="200" y="112" font-size="13" font-weight="bold">SIMPLIFIED TAX INVOICE / RECEIPT</text>
      </g>
      <line x1="20" y1="125" x2="380" y2="125" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="145">RECEIPT NO : PET-20261014-8841</text>
      <text x="24" y="165">DATE: 14/10/2026 18:32:11</text>
      <text x="24" y="185">PUMP : 04 (POS 02) | CASHIER: AHMAD</text>
      <line x1="20" y1="200" x2="380" y2="200" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="222" font-weight="bold">ITEM DESCRIPTION</text>
      <text x="320" y="222" font-weight="bold">RM</text>
      <line x1="20" y1="232" x2="380" y2="232" stroke="#cbd5e1"/>
      <text x="24" y="255">PRIMAX 95 (RON95)</text>
      <text x="24" y="272" fill="#64748b" font-size="10">31.70 Litres @ RM 2.05 / L</text>
      <text x="330" y="260" font-weight="bold">65.00</text>

      <text x="24" y="302">MESRA MINERAL WATER 1.5L x 2</text>
      <text x="340" y="302">4.50</text>

      <text x="24" y="326">TWIGGIES VANILLA CREAM x 2</text>
      <text x="340" y="326">5.00</text>

      <line x1="20" y1="345" x2="380" y2="345" stroke="#cbd5e1"/>
      <text x="24" y="370">SUBTOTAL (EXCL. TAX)</text>
      <text x="332" y="370">73.96</text>
      <text x="24" y="392">SST @ 6% (CONVENIENCE ITEMS)</text>
      <text x="344" y="392">0.54</text>
      <line x1="20" y1="405" x2="380" y2="405" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="430" font-size="15" font-weight="bold">TOTAL AMOUNT (MYR)</text>
      <text x="320" y="430" font-size="16" font-weight="bold">RM 74.50</text>
      <line x1="20" y1="442" x2="380" y2="442" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="470">PAYMENT MODE: CREDIT CARD (VISA)</text>
      <text x="24" y="488">CARD: ************4892  AUTH: 820192</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="540">*** FUEL REBATE CODE APPLIED ***</text>
        <text x="200" y="560">THANK YOU FOR CHOOSING PETRONAS</text>
        <text x="200" y="578">MESRA LOYALTY CARD: **********1209</text>
        <text x="200" y="605">RETAIN RECEIPT FOR OFFICIAL COMPANY AUDIT</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'PETRONAS DAGANGAN BHD (STESEN SEKSYEN 13 PJ)',
        merchant_ssm_or_tax_no: '198201004128 (88222-D)',
        invoice_receipt_no: 'PET-20261014-8841',
        date: '2026-10-14',
        currency: 'MYR',
        receipt_subtotal: 73.96,
        tax_sst: 0.54,
        receipt_grand_total: 74.50
      },
      claim_entries: [
        {
          code: '920-0000',
          details: 'PETROL - RON95 / DIESEL (31.70L Primax 95)',
          amount_rm: 65.00,
          remark: 'Vehicle fuel RON95 claim'
        },
        {
          code: '926-0000',
          details: 'STAFF WELFARE (Mineral water & bakery snacks)',
          amount_rm: 9.50,
          remark: 'Convenience store pantry supplies split from fuel'
        }
      ],
      claim_total_rm: 74.50,
      audit_flags: []
    }
  },
  {
    id: 'sample-book-purchase',
    name: 'Popular Bookstore (Resell Inventory)',
    category: 'Cash Purchase (Resale)',
    vendor: 'POPULAR BOOK CO. (M) SDN BHD',
    totalRm: 388.00,
    description: 'Purchase of popular novel titles & educational reference books intended for company resale.',
    auditScenario: 'Tests Rule #1 & Code 400-00: Direct purchase of merchandise for retail resale.',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="16" font-weight="bold">POPULAR BOOK CO. (M) SDN BHD</text>
        <text x="200" y="58" font-size="11">SUNWAY PYRAMID SHOPPING MALL</text>
        <text x="200" y="74" font-size="11">LOT LG2.38, BANDAR SUNWAY, SELANGOR</text>
        <text x="200" y="90" font-size="11">SSM: 198401005831 (118352-K) | SST: B16-1808-31012984</text>
        <text x="200" y="112" font-size="13" font-weight="bold">TAX INVOICE / CASH SALES</text>
      </g>
      <line x1="20" y1="125" x2="380" y2="125" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="145">INVOICE NO: POP-SW-992014</text>
      <text x="24" y="165">DATE: 18/10/2026 14:15:00</text>
      <text x="24" y="185">CASHIER: NURUL | COUNTER: 03</text>
      <line x1="20" y1="200" x2="380" y2="200" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="222" font-weight="bold">ITEM DESCRIPTION</text>
      <text x="320" y="222" font-weight="bold">RM</text>
      <line x1="20" y1="232" x2="380" y2="232" stroke="#cbd5e1"/>

      <text x="24" y="255">SPM FOCUS MATEMATIK (5 COPIES)</text>
      <text x="24" y="272" fill="#64748b" font-size="10">ISBN: 9789672810112 @ 28.00 ea</text>
      <text x="326" y="260" font-weight="bold">140.00</text>

      <text x="24" y="302">SEJARAH TINGKATAN 4 & 5 (4 COPIES)</text>
      <text x="24" y="319" fill="#64748b" font-size="10">ISBN: 9789670019284 @ 32.00 ea</text>
      <text x="326" y="307" font-weight="bold">128.00</text>

      <text x="24" y="348">KAMUS DWIBASA OXFORD FAJAR (3 COPIES)</text>
      <text x="24" y="365" fill="#64748b" font-size="10">ISBN: 9789834720918 @ 40.00 ea</text>
      <text x="326" y="353" font-weight="bold">120.00</text>

      <line x1="20" y1="385" x2="380" y2="385" stroke="#cbd5e1"/>
      <text x="24" y="410">TOTAL ITEMS: 12 COPIES</text>
      <text x="24" y="430">SST EXEMPT (ZERO-RATED PRINTED BOOKS)</text>
      <text x="340" y="430">0.00</text>
      <line x1="20" y1="445" x2="380" y2="445" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="470" font-size="15" font-weight="bold">TOTAL PAYABLE (MYR)</text>
      <text x="310" y="470" font-size="16" font-weight="bold">RM 388.00</text>
      <line x1="20" y1="482" x2="380" y2="482" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="510">PAYMENT: TOUCH N GO EWALLET QR</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="565">GOODS SOLD ARE NON-REFUNDABLE</text>
        <text x="200" y="585">EXCHANGE WITHIN 7 DAYS WITH RECEIPT</text>
        <text x="200" y="615">EMO BOOK SERVICES INVENTORY REQUISITION #RQ-881</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'POPULAR BOOK CO. (M) SDN BHD',
        merchant_ssm_or_tax_no: '198401005831 (118352-K)',
        invoice_receipt_no: 'POP-SW-992014',
        date: '2026-10-18',
        currency: 'MYR',
        receipt_subtotal: 388.00,
        tax_sst: 0.00,
        receipt_grand_total: 388.00
      },
      claim_entries: [
        {
          code: '400-00',
          details: 'CASH PURCHASE (for book / resell only) - 12 Copies Academic & Reference Titles',
          amount_rm: 388.00,
          remark: 'Direct purchase of book inventory for company resell stock'
        }
      ],
      claim_total_rm: 388.00,
      audit_flags: []
    }
  },
  {
    id: 'sample-hotel-stay',
    name: 'Hotel Grand Continental (Outstation Stay)',
    category: 'Accommodation (State Format)',
    vendor: 'HOTEL GRAND CONTINENTAL KUALA TERENGGANU',
    totalRm: 298.00,
    description: 'Outstation hotel stay during school book exhibition in Terengganu.',
    auditScenario: 'Tests Rule #3: Accommodation Specifics. Must capture state as "ACCOMMODATION - STATE: TERENGGANU" under 923-0000.',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="15" font-weight="bold">HOTEL GRAND CONTINENTAL</text>
        <text x="200" y="56" font-size="11">KUALA TERENGGANU</text>
        <text x="200" y="72" font-size="11">LOT 00295 JALAN SULTAN ZAINAL ABIDIN</text>
        <text x="200" y="88" font-size="11">20000 KUALA TERENGGANU, TERENGGANU</text>
        <text x="200" y="104" font-size="11">SSM: 198901007823 | SST: T20-1808-32000109</text>
        <text x="200" y="126" font-size="13" font-weight="bold">GUEST FOLIO / OFFICIAL RECEIPT</text>
      </g>
      <line x1="20" y1="138" x2="380" y2="138" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="158">FOLIO NO: HGKT-2026-10492</text>
      <text x="24" y="176">GUEST: MOHD HAZIQ (EMO BOOK SERVICES)</text>
      <text x="24" y="194">ROOM: 612 (SUPERIOR SEAVIEW)</text>
      <text x="24" y="212">CHECK-IN: 2026-10-08 | CHECK-OUT: 2026-10-09</text>
      <line x1="20" y1="226" x2="380" y2="226" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="248" font-weight="bold">DESCRIPTION</text>
      <text x="320" y="248" font-weight="bold">RM</text>
      <line x1="20" y1="258" x2="380" y2="258" stroke="#cbd5e1"/>

      <text x="24" y="280">ROOM CHARGE (1 NIGHT)</text>
      <text x="330" y="280">260.00</text>

      <text x="24" y="306">SERVICE TAX (SST 8%)</text>
      <text x="338" y="306">20.80</text>

      <text x="24" y="332">STATE HERITAGE LEVY (TERENGGANU)</text>
      <text x="344" y="332">5.00</text>

      <text x="24" y="358">TOURISM LEVY CHARGE</text>
      <text x="338" y="358">12.20</text>

      <line x1="20" y1="380" x2="380" y2="380" stroke="#cbd5e1"/>
      <text x="24" y="405">SUBTOTAL EXCLUDING TAX</text>
      <text x="330" y="405">277.20</text>
      <text x="24" y="425">GOVT SST (8%)</text>
      <text x="338" y="425">20.80</text>

      <line x1="20" y1="440" x2="380" y2="440" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="465" font-size="15" font-weight="bold">TOTAL BILLED (MYR)</text>
      <text x="310" y="465" font-size="16" font-weight="bold">RM 298.00</text>
      <line x1="20" y1="478" x2="380" y2="478" stroke="#1e293b" stroke-width="1.5"/>

      <text x="24" y="505">PAYMENT METHOD: CORPORATE CREDIT CARD</text>
      <text x="24" y="525">AUTH CODE: 663910 | STATUS: PAID IN FULL</text>

      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="575">THANK YOU FOR STAYING WITH US IN TERENGGANU</text>
        <text x="200" y="595">VALIDATED TAX INVOICE</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'HOTEL GRAND CONTINENTAL KUALA TERENGGANU',
        merchant_ssm_or_tax_no: '198901007823',
        invoice_receipt_no: 'HGKT-2026-10492',
        date: '2026-10-09',
        currency: 'MYR',
        receipt_subtotal: 277.20,
        tax_sst: 20.80,
        receipt_grand_total: 298.00
      },
      claim_entries: [
        {
          code: '923-0000',
          details: 'ACCOMMODATION - STATE: TERENGGANU',
          amount_rm: 298.00,
          remark: '1 night outstation stay for Terengganu School Book Fair (Inclusive of SST RM20.80 & heritage levy)'
        }
      ],
      claim_total_rm: 298.00,
      audit_flags: []
    }
  },
  {
    id: 'sample-packaging-supplies',
    name: 'MR D.I.Y. (Boxes, Bubble Wrap, Stationery)',
    category: 'Packaging Nuances & Multi-Item',
    vendor: 'MR D.I.Y. (M) SDN BHD',
    totalRm: 104.90,
    description: 'Warehouse supply run with shipping cartons, bubble wrap rolls, and office whiteboard markers.',
    auditScenario: 'Tests Rule #4 & Multi-Item: Corrugated boxes (617-0001), Bubble wrap (617-0003), Stationery markers (910-0000).',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="16" font-weight="bold">MR D.I.Y. (M) SDN BHD</text>
        <text x="200" y="58" font-size="11">GIANT HYPERMARKET KELANA JAYA</text>
        <text x="200" y="74" font-size="11">NO. 33 JALAN SS6/12, PETALING JAYA</text>
        <text x="200" y="90" font-size="11">SSM: 201001034084 (918008-X) | SST: B16-1808-32000011</text>
        <text x="200" y="112" font-size="13" font-weight="bold">TAX INVOICE</text>
      </g>
      <line x1="20" y1="125" x2="380" y2="125" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="145">TAX INVOICE NO: DIY-KJ-20261021-049</text>
      <text x="24" y="165">DATE: 21/10/2026 11:20:45</text>
      <text x="24" y="185">CASHIER: SITI #4 | REG: 04</text>
      <line x1="20" y1="200" x2="380" y2="200" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="222" font-weight="bold">ITEM DESCRIPTION</text>
      <text x="320" y="222" font-weight="bold">RM</text>
      <line x1="20" y1="232" x2="380" y2="232" stroke="#cbd5e1"/>

      <text x="24" y="255">CORRUGATED CARTON BOX 30x20x15CM</text>
      <text x="24" y="272" fill="#64748b" font-size="10">QTY: 10 PCS @ RM 4.50 ea</text>
      <text x="330" y="260" font-weight="bold">45.00</text>

      <text x="24" y="302">BUBBLE WRAP ROLL 50CM X 25M</text>
      <text x="24" y="319" fill="#64748b" font-size="10">QTY: 2 ROLLS @ RM 16.50 ea</text>
      <text x="330" y="307" font-weight="bold">33.00</text>

      <text x="24" y="348">HEAVY DUTY OPP TAPE 48MM (3PK)</text>
      <text x="336" y="348" font-weight="bold">12.50</text>

      <text x="24" y="378">PILOT WHITEBOARD MARKER (BLACK/BLUE)</text>
      <text x="24" y="395" fill="#64748b" font-size="10">QTY: 2 PCS @ RM 7.20 ea</text>
      <text x="336" y="383" font-weight="bold">14.40</text>

      <line x1="20" y1="412" x2="380" y2="412" stroke="#cbd5e1"/>
      <text x="24" y="435">SUBTOTAL</text>
      <text x="328" y="435">104.90</text>
      <text x="24" y="455">INCLUSIVE SST (0.00% / EXEMPT)</text>
      <text x="344" y="455">0.00</text>
      <line x1="20" y1="470" x2="380" y2="470" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="495" font-size="15" font-weight="bold">TOTAL AMOUNT (MYR)</text>
      <text x="310" y="495" font-size="16" font-weight="bold">RM 104.90</text>
      <line x1="20" y1="508" x2="380" y2="508" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="535">PAYMENT: DUITNOW QR SCAN</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="585">ALWAYS LOW PRICES</text>
        <text x="200" y="605">ITEMS FOR EMO BOOK DISPATCH DEPT</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'MR D.I.Y. (M) SDN BHD (GIANT KELANA JAYA)',
        merchant_ssm_or_tax_no: '201001034084 (918008-X)',
        invoice_receipt_no: 'DIY-KJ-20261021-049',
        date: '2026-10-21',
        currency: 'MYR',
        receipt_subtotal: 104.90,
        tax_sst: 0.00,
        receipt_grand_total: 104.90
      },
      claim_entries: [
        {
          code: '617-0001',
          details: 'PACKING MATERIAL - BOX (10 pcs Corrugated Carton)',
          amount_rm: 45.00,
          remark: 'Mailer carton boxes for book dispatch orders'
        },
        {
          code: '617-0003',
          details: 'PACKING MATERIAL - OTHERS EG. BUBBLE WRAP (2 rolls Bubble Wrap + OPP Tape)',
          amount_rm: 45.50,
          remark: 'Protective cushioning bubble wrap (RM33.00) and OPP tape (RM12.50)'
        },
        {
          code: '910-0000',
          details: 'PRINTING & STATIONERY (Pilot Whiteboard Markers)',
          amount_rm: 14.40,
          remark: 'Warehouse stock board marker stationery'
        }
      ],
      claim_total_rm: 104.90,
      audit_flags: []
    }
  },
  {
    id: 'sample-grab-ride',
    name: 'Grab Ride (Meeting / Public Transport)',
    category: 'Local Transport',
    vendor: 'GRABCAR SDN BHD',
    totalRm: 42.50,
    description: 'Grab ride from EMO Headquarters in Damansara to Ministry of Education Putrajaya.',
    auditScenario: 'Tests Code 905-0001: Travelling Expenses - Grab, Public Transport.',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="17" font-weight="bold">GRABCAR SDN BHD</text>
        <text x="200" y="58" font-size="11">FIRST AVENUE, BANDAR UTAMA, PETALING JAYA</text>
        <text x="200" y="74" font-size="11">SSM: 201401018350 (1094437-U) | SST: B16-1808-32000088</text>
        <text x="200" y="104" font-size="13" font-weight="bold">E-HAILING TRIP RECEIPT</text>
      </g>
      <line x1="20" y1="120" x2="380" y2="120" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="142">BOOKING CODE: IOS-GRAB-829104-MY</text>
      <text x="24" y="162">DATE: 23/10/2026 09:12:00</text>
      <text x="24" y="182">DRIVER: RAZAK BIN OTHMAN (PROTON X50)</text>
      <line x1="20" y1="196" x2="380" y2="196" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="218" font-weight="bold">PICK-UP &amp; DROP-OFF</text>
      <text x="24" y="238" font-size="11" fill="#475569">PICK-UP: EMO Book Services, Kota Damansara</text>
      <text x="24" y="258" font-size="11" fill="#475569">DROP-OFF: Kementerian Pendidikan Malaysia, Putrajaya</text>
      <line x1="20" y1="274" x2="380" y2="274" stroke="#cbd5e1"/>

      <text x="24" y="298">JUSTGRAB BASE FARE (32.4 KM)</text>
      <text x="336" y="298">38.50</text>

      <text x="24" y="324">HIGHWAY TOLL CHARGES (MEX)</text>
      <text x="344" y="324">4.00</text>

      <line x1="20" y1="345" x2="380" y2="345" stroke="#cbd5e1"/>
      <text x="24" y="370">SUBTOTAL</text>
      <text x="336" y="370">42.50</text>
      <text x="24" y="390">SERVICE TAX (SST 0% EXEMPT)</text>
      <text x="344" y="390">0.00</text>
      <line x1="20" y1="405" x2="380" y2="405" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="430" font-size="15" font-weight="bold">TOTAL PAID (MYR)</text>
      <text x="320" y="430" font-size="16" font-weight="bold">RM 42.50</text>
      <line x1="20" y1="442" x2="380" y2="442" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="470">PAID VIA: GRAPPAY WALLET / VISA</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="530">PURPOSE: CURRICULUM DEVELOPMENT MEETING</text>
        <text x="200" y="550">OFFICIAL BUSINESS TRANSPORT CLAIM</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'GRABCAR SDN BHD',
        merchant_ssm_or_tax_no: '201401018350 (1094437-U)',
        invoice_receipt_no: 'IOS-GRAB-829104-MY',
        date: '2026-10-23',
        currency: 'MYR',
        receipt_subtotal: 42.50,
        tax_sst: 0.00,
        receipt_grand_total: 42.50
      },
      claim_entries: [
        {
          code: '905-0001',
          details: 'TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT',
          amount_rm: 42.50,
          remark: 'Grab ride to Ministry of Education Putrajaya (Fare RM38.50 + MEX Toll RM4.00)'
        }
      ],
      claim_total_rm: 42.50,
      audit_flags: []
    }
  },
  {
    id: 'sample-dhl-courier',
    name: 'DHL Express (Urgent Book Samples)',
    category: 'Courier Charges',
    vendor: 'DHL EXPRESS (MALAYSIA) SDN BHD',
    totalRm: 68.90,
    description: 'Express parcel shipping of author proof reading manuscripts to Penang branch.',
    auditScenario: 'Tests Code 928-0000: Courier Charges for commercial parcel delivery.',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="16" font-weight="bold">DHL EXPRESS (MALAYSIA) SDN BHD</text>
        <text x="200" y="58" font-size="11">MENARA DHL, GROUND FLOOR, PETALING JAYA</text>
        <text x="200" y="74" font-size="11">SSM: 198201004992 (88712-M) | SST: B16-1808-32000049</text>
        <text x="200" y="104" font-size="13" font-weight="bold">DOMESTIC CONSIGNMENT TAX INVOICE</text>
      </g>
      <line x1="20" y1="120" x2="380" y2="120" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="142">AIR WAYBILL (AWB): 9281 0029 41</text>
      <text x="24" y="162">DATE: 25/10/2026 15:45:20</text>
      <text x="24" y="182">ORIGIN: KUL | DESTINATION: PEN (GEORGETOWN)</text>
      <line x1="20" y1="196" x2="380" y2="196" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="218" font-weight="bold">SERVICE BREAKDOWN</text>
      <text x="320" y="218" font-weight="bold">RM</text>
      <line x1="20" y1="228" x2="380" y2="228" stroke="#cbd5e1"/>

      <text x="24" y="250">DOMESTIC EXPRESS (PARCEL 3.2KG)</text>
      <text x="336" y="250">58.00</text>

      <text x="24" y="276">FUEL SURCHARGE (12%)</text>
      <text x="344" y="276">7.00</text>

      <text x="24" y="302">SERVICE TAX (SST 6%)</text>
      <text x="344" y="302">3.90</text>

      <line x1="20" y1="324" x2="380" y2="324" stroke="#cbd5e1"/>
      <text x="24" y="348">NET CHARGES</text>
      <text x="336" y="348">65.00</text>
      <text x="24" y="368">SST (6%)</text>
      <text x="344" y="368">3.90</text>
      <line x1="20" y1="384" x2="380" y2="384" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="410" font-size="15" font-weight="bold">TOTAL AMOUNT (MYR)</text>
      <text x="320" y="410" font-size="16" font-weight="bold">RM 68.90</text>
      <line x1="20" y1="422" x2="380" y2="422" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="450">PAYMENT: CORPORATE ACCOUNT / CREDIT CARD</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="520">EXCELLENCE. SIMPLY DELIVERED.</text>
        <text x="200" y="540">AUTHOR PROOF MANUSCRIPTS FOR PENANG EXPO</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'DHL EXPRESS (MALAYSIA) SDN BHD',
        merchant_ssm_or_tax_no: '198201004992 (88712-M)',
        invoice_receipt_no: 'AWB-9281002941',
        date: '2026-10-25',
        currency: 'MYR',
        receipt_subtotal: 65.00,
        tax_sst: 3.90,
        receipt_grand_total: 68.90
      },
      claim_entries: [
        {
          code: '928-0000',
          details: 'COURIER CHARGES (DHL Express 3.2kg Parcel)',
          amount_rm: 68.90,
          remark: 'Commercial parcel dispatch of proof reading manuscripts to Penang (inclusive of SST RM3.90)'
        }
      ],
      claim_total_rm: 68.90,
      audit_flags: []
    }
  },
  {
    id: 'sample-discrepancy',
    name: 'Perniagaan Buku Maju (Calculation Mismatch)',
    category: 'Rule 5 Anomaly (Discrepancy)',
    vendor: 'PERNIAGAAN BUKU MAJU (PJ)',
    totalRm: 65.00,
    description: 'Faded local supplier receipt where itemized lines sum to RM 65.50 vs receipt total of RM 65.00.',
    auditScenario: 'Tests Rule #5: True anomaly detection. Calculates variance and populates audit_notes with a calculation discrepancy notice.',
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="100%" height="100%" style="background:#fcfbf8;font-family:monospace;font-size:12px;fill:#1e293b;">
      <rect width="400" height="680" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="200" y="38" font-size="16" font-weight="bold">PERNIAGAAN BUKU MAJU</text>
        <text x="200" y="58" font-size="11">NO. 18 JALAN 14/20, SEKSYEN 14</text>
        <text x="200" y="74" font-size="11">46100 PETALING JAYA, SELANGOR</text>
        <text x="200" y="90" font-size="11">SSM: 200503119821 | CASH BILL</text>
      </g>
      <line x1="20" y1="120" x2="380" y2="120" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="142">BILL NO: PBM-88219</text>
      <text x="24" y="162">DATE: 26/10/2026 16:30:00</text>
      <text x="24" y="182">CUSTOMER: CASH / EMO BOOK SERVICES</text>
      <line x1="20" y1="196" x2="380" y2="196" stroke="#94a3b8" stroke-dasharray="4,4"/>
      <text x="24" y="218" font-weight="bold">ITEMS</text>
      <text x="320" y="218" font-weight="bold">RM</text>
      <line x1="20" y1="228" x2="380" y2="228" stroke="#cbd5e1"/>

      <text x="24" y="250">A4 PAPER IK YELLOW 70GSM (3 REAMS)</text>
      <text x="336" y="250">42.00</text>

      <text x="24" y="278">PACKING CARTON (SMALL) x 5 PCS</text>
      <text x="336" y="278">23.50</text>

      <line x1="20" y1="310" x2="380" y2="310" stroke="#cbd5e1"/>
      <text x="24" y="335">ROUNDING ADJUSTMENT (MANUAL)</text>
      <text x="334" y="335">-0.50</text>
      <line x1="20" y1="355" x2="380" y2="355" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="380" font-size="15" font-weight="bold">TOTAL BILLED (MYR)</text>
      <text x="320" y="380" font-size="16" font-weight="bold">RM 65.00</text>
      <line x1="20" y1="392" x2="380" y2="392" stroke="#1e293b" stroke-width="1.5"/>
      <text x="24" y="420">PAYMENT: CASH RECEIVED RM 100.00</text>
      <text x="24" y="440">CHANGE RETURNED: RM 35.00</text>
      <g text-anchor="middle" fill="#64748b" font-size="11">
        <text x="200" y="520">THANK YOU FOR YOUR PATRONAGE</text>
        <text x="200" y="540">OFFICE &amp; WAREHOUSE DISPATCH EXPENSES</text>
      </g>
    </svg>`,
    expectedAudit: {
      receipt_summary: {
        merchant_name: 'PERNIAGAAN BUKU MAJU (PJ)',
        merchant_ssm_or_tax_no: '200503119821',
        invoice_receipt_no: 'PBM-88219',
        date: '2026-10-26',
        currency: 'MYR',
        receipt_subtotal: 65.00,
        tax_sst: 0.00,
        receipt_grand_total: 65.00
      },
      claim_entries: [
        {
          code: '910-0000',
          details: 'PRINTING & STATIONERY (IK Yellow A4 Paper 3 reams)',
          amount_rm: 42.00,
          remark: 'Office printing paper'
        },
        {
          code: '617-0001',
          details: 'PACKING MATERIAL - BOX (5 pcs Small Cartons)',
          amount_rm: 23.50,
          remark: 'Mailer carton boxes'
        }
      ],
      claim_total_rm: 65.50,
      audit_flags: [
        'Calculation Discrepancy: Sum of claim items (RM 65.50) does not match receipt total (RM 65.00). Variance: RM 0.50.'
      ]
    }
  }
];

export const SAMPLE_RECEIPTS: SampleReceipt[] = RAW_SAMPLES.map((s) => ({
  ...s,
  expectedAudit: normalizeAuditResult(s.expectedAudit),
}));
