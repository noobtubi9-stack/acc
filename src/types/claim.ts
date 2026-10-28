/**
 * EMO Book Services Sdn Bhd - Corporate Chart of Accounts (COA) & Claims Types
 */

export interface COACodeDefinition {
  code: string;
  details: string;
  criteria: string;
  category: 'Purchases' | 'Travel & Transport' | 'Logistics & Packaging' | 'Admin & Office' | 'Staff & Welfare' | 'Promotions & Marketing' | 'Others';
  examples: string[];
  rules?: string[];
}

export const EMO_ACCOUNT_CODES: COACodeDefinition[] = [
  {
    code: '400-00',
    details: 'CASH PURCHASE (for book / resell only)',
    criteria: 'Direct purchase of books, titles, or merchandise intended for retail/resale.',
    category: 'Purchases',
    examples: ['Popular Book Co', 'Kinokuniya', 'MPH Bookstores', 'Local book publishers', 'Educational distributors'],
    rules: ['Strictly for inventory intended for resale; office stationery must use 910-0000']
  },
  {
    code: '923-0000',
    details: 'ACCOMMODATION - STATE: [State Name]',
    criteria: 'Hotels, lodging, and stay during outstation business trips. Must capture the state, e.g., Penang, Johor.',
    category: 'Travel & Transport',
    examples: ['Hotel Sentral', 'Tune Hotel', 'Grand Continental', 'Airbnb outstation stay'],
    rules: ['Must format details as "ACCOMMODATION - STATE: [State Name]" (e.g., "ACCOMMODATION - STATE: PENANG")']
  },
  {
    code: '928-0000',
    details: 'COURIER CHARGES',
    criteria: 'Commercial parcel couriers (DHL, GDEX, J&T, Ninja Van, Line Clear, etc.).',
    category: 'Logistics & Packaging',
    examples: ['DHL Express', 'J&T Express', 'GDEX', 'Ninja Van', 'Line Clear Express', 'Pos Laju courier'],
    rules: ['For parcel and freight couriers. Standard stamped envelopes go to 912-0000.']
  },
  {
    code: '919-0000',
    details: 'ENTERTAINMENT',
    criteria: 'Business dining, client meals, catering, coffee/refreshments for guests/clients.',
    category: 'Admin & Office',
    examples: ['Client lunch meeting', 'Author dinner discussion', 'Partner cafe coffee meeting', 'Business catering'],
    rules: ['Internal pantry supplies belong to 926-0000 (Staff Welfare).']
  },
  {
    code: '966-0002',
    details: 'SPONSORSHIP OTHERS - FOR: [Details]',
    criteria: 'Company-sponsored events, donations, external community sponsorship.',
    category: 'Promotions & Marketing',
    examples: ['School library book donation event', 'University reading campaign sponsorship'],
    rules: ['Must specify details of recipient/event in the description.']
  },
  {
    code: '913-0000',
    details: 'EXHIBITION, ROAD SHOW & PROMOTION',
    criteria: 'Booth rentals, banners, flyers, promotional display materials, trade fair expenses.',
    category: 'Promotions & Marketing',
    examples: ['KL International Book Fair booth rental', 'Bunting printing', 'Flyers distribution', 'Display stands'],
    rules: ['Includes trade fairs, school pop-up book fairs, and promotional roadshows.']
  },
  {
    code: '946-0000',
    details: 'RECRUITMENT EXPENSES',
    criteria: 'Job ads (JobStreet, LinkedIn), recruitment agency fees, interview refreshments.',
    category: 'Admin & Office',
    examples: ['JobStreet advertisement credits', 'LinkedIn talent solutions', 'Candidate interview meals']
  },
  {
    code: '939-0000',
    details: 'LICENSE & REGISTRATION FEE',
    criteria: 'Government renewals, SSM fees, trademark, local council (MBPJ/MBSA) licenses.',
    category: 'Admin & Office',
    examples: ['SSM business registration renewal', 'MBPJ billboard license', 'Premise license', 'Trademark renewal']
  },
  {
    code: '940-',
    details: 'MEDICAL FEE',
    criteria: 'Panel/clinic receipts, prescription medicines, health screenings.',
    category: 'Staff & Welfare',
    examples: ['Klinik Mediviron consultation', 'Pharmacy prescription medication', 'Staff health screening'],
    rules: ['Official medical receipts from clinics or pharmacies required.']
  },
  {
    code: '920-0000',
    details: 'PETROL - RON95 / DIESEL',
    criteria: 'Fuel receipts from Petronas, Shell, Caltex, BHP, Petron, etc.',
    category: 'Travel & Transport',
    examples: ['Petronas Primax 95', 'Shell FuelSave 95', 'Caltex Techron Diesel', 'BHPetrol Infiniti'],
    rules: ['Petrol station snacks or convenience items must be split and separated.']
  },
  {
    code: '921-0001',
    details: 'PARKING',
    criteria: 'Ticketed parking, street parking coupons/apps (Smart Selangor, TnG eWallet parking).',
    category: 'Travel & Transport',
    examples: ['Mall ticket parking', 'Smart Selangor parking app', 'TnG street parking', 'Multi-storey parking ticket']
  },
  {
    code: '921-0002',
    details: 'TOLL',
    criteria: 'Touch \'n Go reloads, RFID statements, highway toll receipts.',
    category: 'Travel & Transport',
    examples: ['TnG card reload receipt for highway toll', 'PLUS highway toll receipt', 'RFID statement claim']
  },
  {
    code: '910-0000',
    details: 'PRINTING & STATIONERY',
    criteria: 'Paper, pens, files, desk stationery, photocopy/external printing jobs.',
    category: 'Admin & Office',
    examples: ['A4 paper box', 'Ballpoint pens', 'Document binders & files', 'External plan photocopy / laminating'],
    rules: ['Packing boxes go to 617-0001; stationery files/paper go to 910-0000.']
  },
  {
    code: '912-0000',
    details: 'POSTAGE & STAMP',
    criteria: 'Pos Malaysia official stamps, standard postal envelopes, registered mail.',
    category: 'Admin & Office',
    examples: ['Pos Malaysia postal stamps', 'Registered post AR slip', 'Standard domestic postage stamps']
  },
  {
    code: '905-0001',
    details: 'TRAVELLING EXPENSES - GRAB, PUBLIC TRANSPORT',
    criteria: 'Grab rides, airasia ride, LRT, MRT, Monorail, KTM Komuter, airport bus.',
    category: 'Travel & Transport',
    examples: ['Grab e-hailing receipt', 'AirAsia ride receipt', 'MyRapid LRT token/topup for business travel', 'Airport KLIA Transit bus']
  },
  {
    code: '905-0002',
    details: 'TRAVELLING EXPENSES - LOCAL',
    criteria: 'Domestic flight tickets, interstate trains (ETS), long-distance express buses.',
    category: 'Travel & Transport',
    examples: ['Malaysia Airlines domestic ticket (KL-Penang)', 'AirAsia domestic flight', 'ETS train ticket (KL Sentral to Ipoh)', 'Intercity bus ticket']
  },
  {
    code: '922-',
    details: 'ATTENDANCE ALLOWANCE',
    criteria: 'Approved monthly attendance compensation claims.',
    category: 'Staff & Welfare',
    examples: ['Monthly full attendance incentive claim']
  },
  {
    code: '925-0000',
    details: 'STAFF ALLOWANCE',
    criteria: 'Contractual staff allowances (food/meal allowances, mobile allowance top-ups).',
    category: 'Staff & Welfare',
    examples: ['Shift meal allowance', 'Monthly mobile allowance stipend']
  },
  {
    code: '926-0000',
    details: 'STAFF WELFARE',
    criteria: 'Staff pantry supplies (tea, coffee, biscuits, water), first aid kit supplies, internal staff bereavement/celebrations.',
    category: 'Staff & Welfare',
    examples: ['Pantry 3-in-1 Nescafe & tea bags', 'Office drinking water carton', 'Staff birthday cake', 'Pantry biscuits', 'First aid Panadol/bandages']
  },
  {
    code: '968-',
    details: 'TRAVELLING ALLOWANCE',
    criteria: 'Fixed daily per diem / outstation travel allowances.',
    category: 'Travel & Transport',
    examples: ['RM50/day outstation per diem allowance claim']
  },
  {
    code: '615-0000',
    details: 'CARRIAGE INWARDS (for forwarder only)',
    criteria: 'Port customs clearance, shipping freight, forwarder handling charges.',
    category: 'Logistics & Packaging',
    examples: ['Port Klang sea freight customs clearance', 'Forwarder bill of lading charges']
  },
  {
    code: '959-0001',
    details: 'UPKEEP OF HARDWARE',
    criteria: 'Computer, monitor, printer, server, POS terminal repairs, RAM/SSD upgrades, mouse/keyboard replacements.',
    category: 'Admin & Office',
    examples: ['Wireless mouse replacement', 'Printer cartridge toner', 'Laptop SSD upgrade', 'Barcode scanner replacement']
  },
  {
    code: '906-0001',
    details: 'UPKEEP OF MOTOR VEHICLE (for van only)',
    criteria: 'Service, engine oil, tires, maintenance strictly for company delivery vans.',
    category: 'Logistics & Packaging',
    examples: ['Company Toyota HiAce van engine oil change', 'Van tire replacement', 'Van brake pad servicing'],
    rules: ['Strictly for company delivery vans. Employee personal cars not applicable under this code.']
  },
  {
    code: '918-0000',
    details: 'UPKEEP OF OFFICE',
    criteria: 'Office aircond maintenance, plumbing, electrical repairs, office cleaning supplies.',
    category: 'Admin & Office',
    examples: ['Air conditioner chemical overhaul', 'Office fluorescent lamp replacement', 'Floor disinfectant & mop supplies']
  },
  {
    code: '924-',
    details: 'WAGES / OVERTIME',
    criteria: 'Official staff overtime claims or temporary labor pay slips.',
    category: 'Staff & Welfare',
    examples: ['Weekend warehouse packing overtime claim', 'Exhibition booth weekend OT claim']
  },
  {
    code: '909-0000',
    details: 'TELEPHONE CHARGES',
    criteria: 'Telco bills (Maxis, CelcomDigi, Unifi Mobile, U Mobile), office landlines.',
    category: 'Admin & Office',
    examples: ['Maxis monthly postpaid bill', 'CelcomDigi company line', 'TM Unifi broadband & office phone']
  },
  {
    code: '952-0001',
    details: 'TRANSPORTATION (Delivery Expenses)',
    criteria: 'Lalamove, Borzo, dispatch runners, dedicated third-party logistics dispatch.',
    category: 'Logistics & Packaging',
    examples: ['Lalamove 4x4 dispatch to bookstore', 'Borzo instant book delivery runner']
  },
  {
    code: '617-0001',
    details: 'PACKING MATERIAL - BOX',
    criteria: 'Corrugated cartons, mailer cartons, standard shipping boxes.',
    category: 'Logistics & Packaging',
    examples: ['Carton box size M (pack of 20)', 'Die-cut book shipping boxes', 'Corrugated heavy-duty cartons'],
    rules: ['Strictly for carton boxes. Plastic bags go to 617-0002; bubble wrap & tape go to 617-0003.']
  },
  {
    code: '617-0002',
    details: 'PACKING MATERIAL - BAG / PLASTIC BAG',
    criteria: 'Retail plastic bags, branded carrier bags, poly mailers.',
    category: 'Logistics & Packaging',
    examples: ['Retail plastic shopping bags', 'Waterproof poly mailer courier bags', 'Singlet carrier bags']
  },
  {
    code: '617-0003',
    details: 'PACKING MATERIAL - OTHERS EG. BUBBLE WRAP',
    criteria: 'Bubble wrap, OPP tape, stretch film, fragile stickers, strapping bands.',
    category: 'Logistics & Packaging',
    examples: ['Bubble wrap roll 1m x 100m', 'OPP packaging tape 48mm', 'Pallet stretch film', 'Fragile stickers roll']
  },
  {
    code: 'OTHERS',
    details: 'OTHERS (Requires Remark)',
    criteria: 'Miscellaneous items strictly outside the standard categories.',
    category: 'Others',
    examples: ['Bank charges / service fee', 'Company legal stamps / notary', 'Safety attire / warehouse boots'],
    rules: ['Must clearly provide explanatory remark.']
  }
];

export interface ReceiptSummary {
  merchant_name: string;
  merchant_ssm_or_tax_no: string | null;
  invoice_receipt_no: string | null;
  date: string;
  currency: string;
  receipt_subtotal: number;
  tax_sst: number;
  receipt_grand_total: number;
}

export interface ClaimEntry {
  id?: string;
  code: string;
  details: string;
  amount_rm: number;
  remark: string;
}

export interface AuditResult {
  receipt_summary: ReceiptSummary;
  claim_entries: ClaimEntry[];
  claim_total_rm: number;
  audit_flags: string[];
}

export interface AuditedReceiptRecord {
  id: string;
  createdAt: string;
  claimantName: string;
  claimantStaffId: string;
  department: string;
  claimMonth: string;
  imagePreviewUrl: string;
  fileName: string;
  fileSizeBytes: number;
  status: 'verified' | 'needs_review' | 'flagged';
  auditResult: AuditResult;
  notes?: string;
}
