'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  Search,
  ArrowRight,
  Printer,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Activity,
  FileCode,
  Check,
  Copy,
  X,
  Zap,
  TrendingUp,
  Eye,
  Send,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
type PracticeKey = 'tampa' | 'pediatric' | 'summit';
type PeriodMode = '30d' | 'q1' | 'ytd' | '12m';
type TabView = 'overview' | 'claims' | 'denials' | 'payers' | 'telemetry';
type ClaimFilter = 'all' | 'paid' | 'pending' | 'appeal';

interface ClaimItem {
  id: string;
  patientId: string;
  patientName: string;
  dos: string;
  payer: string;
  cpt: string;
  modifiers: string;
  icd10: string;
  billed: number;
  expected: number;
  paid: number;
  patientResp: number;
  status: 'paid' | 'pending' | 'appeal';
  statusLabel: string;
  agingBucket: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  auditTrail: string;
  resolutionNote: string;
  edi837p: string;
  casAdjustments: Array<{ group: string; code: string; amount: number; description: string }>;
  clearinghouseTrace: string;
}

interface DenialItem {
  claimId: string;
  patientName: string;
  payer: string;
  code: string;
  rootCause: string;
  clinicalArgument: string;
  legalCitation: string;
  actionTaken: string;
  status: string;
  recovered: string;
  daysToResolve: string;
  daysRemaining: number;
  winProbability: number;
  amountAtRisk: number;
}

interface PayerStat {
  name: string;
  cleanRate: string;
  daysToPay: string;
  collectionRate: string;
  varianceRate: string;
  volume: string;
  status: 'optimal' | 'warning';
}

interface TelemetryEvent {
  id: string;
  time: string;
  type: '837P' | '277CA' | '835' | '270' | '278';
  summary: string;
  status: 'success' | 'processing' | 'warning';
  detail: string;
}

interface PracticeData {
  name: string;
  specialtyTag: string;
  providersCount: number;
  physicianLead: string;
  collections: Record<PeriodMode, number>;
  totalClaims: Record<PeriodMode, number>;
  cleanClaimRate: number;
  daysInAr: number;
  denialRate: number;
  appealsWonRate: number;
  appealsRecoveredTotal: string;
  underpaymentRecouped: string;
  arAging: {
    b30: number;
    b60: number;
    b90: number;
    b120: number;
    bOv: number;
  };
  claims: ClaimItem[];
  denials: DenialItem[];
  payers: PayerStat[];
  telemetry: TelemetryEvent[];
}

// ==========================================
// PRACTICE PRESET DATA
// ==========================================
const PRACTICE_PRESETS: Record<PracticeKey, PracticeData> = {
  tampa: {
    name: 'Tampa Bay Multi-Specialty Clinic',
    specialtyTag: 'Cardiology, Orthopedics & Internal Medicine',
    providersCount: 14,
    physicianLead: 'Dr. Michael Vance, MD (Chief Medical Officer)',
    collections: {
      '30d': 384250,
      q1: 1152750,
      ytd: 2490100,
      '12m': 4611000,
    },
    totalClaims: {
      '30d': 1842,
      q1: 5526,
      ytd: 11950,
      '12m': 22104,
    },
    cleanClaimRate: 98.6,
    daysInAr: 24.8,
    denialRate: 2.4,
    appealsWonRate: 82.4,
    appealsRecoveredTotal: '+$6,395',
    underpaymentRecouped: '$18,450',
    arAging: {
      b30: 136308,
      b60: 33156,
      b90: 11052,
      b120: 2763,
      bOv: 921,
    },
    claims: [
      {
        id: 'CLM-98241',
        patientId: 'PT-4091',
        patientName: 'Eleanor Vance',
        dos: 'May 12, 2026',
        payer: 'Blue Cross Blue Shield FL',
        cpt: '99214, 20610',
        modifiers: '-25, -RT',
        icd10: 'M17.11 (Unilateral primary osteoarthritis, right knee)',
        billed: 420.0,
        expected: 348.5,
        paid: 348.5,
        patientResp: 35.0,
        status: 'paid',
        statusLabel: 'Paid in Full',
        agingBucket: '0-30',
        auditTrail: 'EDI 837P transmitted 05/12 18:20 -> 277CA Accepted 05/12 21:04 -> 835 ERA EFT #49102 posted 05/22.',
        resolutionNote: 'Modifier -25 validated against separate clinical note; clean first-pass adjudication.',
        edi837p: `ISA*00*          *00*          *ZZ*AETHERA        *ZZ*BCBSFL         *260512*1820*^*00501*000098241*0*P*:~
GS*HC*AETHERA*BCBSFL*20260512*1820*98241*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*98241*20260512*1820*CH~
NM1*85*2*TAMPA BAY MULTI-SPECIALTY CLINIC*****XX*1928374650~
NM1*IL*1*VANCE*ELEANOR****MI*FLB8892104~
CLM*CLM-98241*420.00***11:B:1*Y*A*Y*Y~
HI*ABK:M1711~
LX*1~
SV1*HC:99214:25*240.00*UN*1***1~
LX*2~
SV1*HC:20610:RT*180.00*UN*1***1~
SE*15*0001~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 36.5, description: 'Contractual allowable fee schedule adjustment.' },
          { group: 'PR', code: '1', amount: 35.0, description: 'Patient statutory copay/deductible responsibility.' },
        ],
        clearinghouseTrace: '277CA-FLB-20260512-881923',
      },
      {
        id: 'CLM-98242',
        patientId: 'PT-8821',
        patientName: 'Marcus Holloway',
        dos: 'May 14, 2026',
        payer: 'UnitedHealthcare Choice Plus',
        cpt: '93000, 93010',
        modifiers: '-26',
        icd10: 'I48.91 (Unspecified atrial fibrillation)',
        billed: 295.0,
        expected: 242.0,
        paid: 242.0,
        patientResp: 20.0,
        status: 'paid',
        statusLabel: 'Paid',
        agingBucket: '0-30',
        auditTrail: 'Scrubbed for NCCI mutually exclusive edits -> 837P transmitted 05/15 -> Paid via Optum ERA.',
        resolutionNote: 'Diagnostic telemetry interpretation split correctly with professional modifier 26.',
        edi837p: `ST*837*0002*005010X222A1~
BHT*0019*00*98242*20260514*0915*CH~
CLM*CLM-98242*295.00***11:B:1*Y*A*Y*Y~
HI*ABK:I4891~
LX*1~
SV1*HC:93000:26*165.00*UN*1***1~
LX*2~
SV1*HC:93010*130.00*UN*1***1~
SE*12*0002~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 33.0, description: 'UHC commercial fee schedule allowance.' },
          { group: 'PR', code: '2', amount: 20.0, description: 'Coinsurance 20% patient obligation.' },
        ],
        clearinghouseTrace: 'OPTUM-20260515-992144',
      },
      {
        id: 'CLM-98243',
        patientId: 'PT-1094',
        patientName: 'Sophia Sterling',
        dos: 'May 18, 2026',
        payer: 'Aetna Commercial',
        cpt: '17000, 17003',
        modifiers: '-59',
        icd10: 'L57.0 (Actinic keratosis)',
        billed: 580.0,
        expected: 512.4,
        paid: 512.4,
        patientResp: 0.0,
        status: 'appeal',
        statusLabel: 'Under Appeal (Won)',
        agingBucket: '61-90',
        auditTrail: 'Initial denial CO-16 (Missing pathology pointer) -> Overturned via Level 1 appeal in 48h.',
        resolutionNote: 'Submitted path report + dermoscopy photos via Availity gateway. Payer issued $512.40 check.',
        edi837p: `ST*837*0003*005010X222A1~
BHT*0019*00*98243*20260518*1420*CH~
CLM*CLM-98243*580.00***11:B:1*Y*A*Y*Y~
HI*ABK:L570~
LX*1~
SV1*HC:17000*220.00*UN*1***1~
LX*2~
SV1*HC:17003:59*360.00*UN*3***1~
SE*12*0003~`,
        casAdjustments: [
          { group: 'CO', code: '16', amount: 512.4, description: 'Claim lacks info (Overturned on Appeal via Level 1 submission).' },
        ],
        clearinghouseTrace: 'AVAIL-20260518-384912',
      },
      {
        id: 'CLM-98244',
        patientId: 'PT-6612',
        patientName: 'Harold Jenkins',
        dos: 'May 20, 2026',
        payer: 'Medicare Part B (First Coast)',
        cpt: '99204, 99490',
        modifiers: '',
        icd10: 'E11.65 (Type 2 diabetes with hyperglycemia), I10 (Essential hypertension)',
        billed: 340.0,
        expected: 278.4,
        paid: 278.4,
        patientResp: 28.0,
        status: 'paid',
        statusLabel: 'Paid',
        agingBucket: '0-30',
        auditTrail: 'CCM 20+ minute clinical care plan verified -> 837P batch transmitted -> ERA auto-reconciled.',
        resolutionNote: 'Chronic Care Management initial enrollment on file. Passed LCD L33744 checks.',
        edi837p: `ST*837*0004*005010X222A1~
BHT*0019*00*98244*20260520*1640*CH~
CLM*CLM-98244*340.00***11:B:1*Y*A*Y*Y~
HI*ABK:E1165*ABF:I10~
LX*1~
SV1*HC:99204*260.00*UN*1***1~
LX*2~
SV1*HC:99490*80.00*UN*1***1~
SE*12*0004~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 33.6, description: 'Medicare Part B participating physician allowable.' },
          { group: 'PR', code: '2', amount: 28.0, description: '20% Medicare Part B statutory patient coinsurance.' },
        ],
        clearinghouseTrace: 'FCSO-20260520-109284',
      },
      {
        id: 'CLM-98245',
        patientId: 'PT-3389',
        patientName: 'Dorothy Miller',
        dos: 'May 22, 2026',
        payer: 'Humana Medicare Advantage',
        cpt: '99215',
        modifiers: '',
        icd10: 'I50.22 (Chronic systolic heart failure)',
        billed: 265.0,
        expected: 215.0,
        paid: 0.0,
        patientResp: 0.0,
        status: 'pending',
        statusLabel: 'In Payer Review',
        agingBucket: '0-30',
        auditTrail: 'Pre-scrubbed clean -> 277CA Accepted -> In final payer adjudication cycle (Day 6).',
        resolutionNote: 'High medical decision-making complexity documented with medication changes and lab orders.',
        edi837p: `ST*837*0005*005010X222A1~
CLM*CLM-98245*265.00***11:B:1*Y*A*Y*Y~
HI*ABK:I5022~
LX*1~
SV1*HC:99215*265.00*UN*1***1~
SE*10*0005~`,
        casAdjustments: [],
        clearinghouseTrace: 'HUM-20260522-771829',
      },
      {
        id: 'CLM-98246',
        patientId: 'PT-7741',
        patientName: 'Julian Bennett',
        dos: 'May 24, 2026',
        payer: 'Cigna / Evernorth',
        cpt: '90837, 99213',
        modifiers: '-25',
        icd10: 'F33.1 (Major depressive disorder, recurrent, moderate)',
        billed: 310.0,
        expected: 268.0,
        paid: 268.0,
        patientResp: 25.0,
        status: 'paid',
        statusLabel: 'Paid',
        agingBucket: '0-30',
        auditTrail: 'Time-based psychotherapy code linked to qualifying E/M -> 835 posted.',
        resolutionNote: 'Psychiatric diagnostic evaluation requirement verified. Modifier 25 supported by distinct note.',
        edi837p: `ST*837*0006*005010X222A1~
CLM*CLM-98246*310.00***11:B:1*Y*A*Y*Y~
HI*ABK:F331~
LX*1~
SV1*HC:99213:25*140.00*UN*1***1~
LX*2~
SV1*HC:90837*170.00*UN*1***1~
SE*12*0006~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 17.0, description: 'Cigna fee schedule discount.' },
          { group: 'PR', code: '1', amount: 25.0, description: 'Copayment collected at point of care.' },
        ],
        clearinghouseTrace: 'CIGNA-20260524-448102',
      },
    ],
    denials: [
      {
        claimId: 'CLM-97810',
        patientName: 'Eleanor Vance',
        payer: 'Aetna Commercial',
        code: 'CARC 16 / N290',
        rootCause: 'Missing rendering provider taxonomy on box 24J in legacy EHR export',
        clinicalArgument: 'Certified provider NPI 1928374650 is cross-walked to primary taxonomy 207RC0000X (Cardiovascular Disease) on CMS NPPES registry. All credentialing files active with Aetna.',
        legalCitation: 'HIPAA Standard Transactions 45 CFR Part 162 & X12 837P Standards',
        actionTaken: 'Taxonomy corrected in master billing engine profile, 837P resubmitted electronically within 4 hours.',
        status: 'Overturned & Collected',
        recovered: '$1,240.00',
        daysToResolve: '4 days',
        daysRemaining: 0,
        winProbability: 99,
        amountAtRisk: 1240.0,
      },
      {
        claimId: 'CLM-97844',
        patientName: 'Robert Langdon',
        payer: 'UnitedHealthcare',
        code: 'CARC 197',
        rootCause: 'Prior auth number omitted by hospital scheduler during emergency intake',
        clinicalArgument: 'Patient presented through ED with acute unstable angina requiring urgent cardiac catheterization. Urgent exceptions under CMS manual and UHC provider contract allow retroactive authorization within 72 hours of stabilization.',
        legalCitation: 'ERISA 29 CFR § 2560.503-1 & CMS Claims Processing Manual Ch. 29 § 30',
        actionTaken: 'Retrieved retrospective authorization approval from CoverMyMeds & submitted clinical appeal package.',
        status: 'Overturned & Collected',
        recovered: '$3,850.00',
        daysToResolve: '9 days',
        daysRemaining: 0,
        winProbability: 96,
        amountAtRisk: 3850.0,
      },
      {
        claimId: 'CLM-97902',
        patientName: 'Patricia Adams',
        payer: 'BCBS Florida',
        code: 'CARC 97',
        rootCause: 'Bundling claim line: CPT 20610 (Arthrocentesis) bundled into 99214 E/M visit',
        clinicalArgument: 'Contemporaneous electronic medical record demonstrates a significant, separately identifiable evaluation & management service. Knee injection decision was made after examining contralateral hip pain, justifying Modifier -25.',
        legalCitation: 'CMS NCCI Policy Manual Chapter 1, Section E & CPT Assistant guidelines',
        actionTaken: 'Appealed with separate anatomical site chart note & Modifier -25 documentation validation.',
        status: 'Overturned & Collected',
        recovered: '$415.00',
        daysToResolve: '6 days',
        daysRemaining: 0,
        winProbability: 94,
        amountAtRisk: 415.0,
      },
      {
        claimId: 'CLM-98011',
        patientName: 'Gerald Montgomery',
        payer: 'Humana Medicare Advantage',
        code: 'CARC 29',
        rootCause: 'Payer claimed untimely submission alleging 90-day filing limit expired',
        clinicalArgument: 'Clearinghouse 277CA Electronic Acceptance report confirms initial EDI batch transmission on Day 14 post-service. Electronic transaction reference proves timely compliance.',
        legalCitation: 'CMS Claims Processing Manual, Pub. 100-04, Ch. 1, § 70 & Florida Prompt Pay Statute 641.3155',
        actionTaken: 'Extracted clearinghouse 277 EDI timestamp proving first submission at Day 14. Overturned upon re-review.',
        status: 'Overturned & Collected',
        recovered: '$890.00',
        daysToResolve: '7 days',
        daysRemaining: 0,
        winProbability: 98,
        amountAtRisk: 890.0,
      },
    ],
    payers: [
      { name: 'Medicare Part B (First Coast)', cleanRate: '99.4%', daysToPay: '12.4 days', collectionRate: '98.8%', varianceRate: '0.2%', volume: '$148,200', status: 'optimal' },
      { name: 'BCBS Florida (Florida Blue)', cleanRate: '98.8%', daysToPay: '15.8 days', collectionRate: '97.6%', varianceRate: '0.6%', volume: '$124,500', status: 'optimal' },
      { name: 'Aetna Commercial', cleanRate: '98.1%', daysToPay: '14.9 days', collectionRate: '96.9%', varianceRate: '1.2%', volume: '$86,100', status: 'optimal' },
      { name: 'UnitedHealthcare Choice', cleanRate: '97.6%', daysToPay: '17.2 days', collectionRate: '96.2%', varianceRate: '1.8%', volume: '$92,400', status: 'warning' },
      { name: 'Cigna / Evernorth', cleanRate: '98.4%', daysToPay: '16.1 days', collectionRate: '97.1%', varianceRate: '0.4%', volume: '$42,300', status: 'optimal' },
    ],
    telemetry: [
      { id: 'EV-10492', time: '12:28:44', type: '835', summary: 'ERA Batch #99281 posted from BCBS FL', status: 'success', detail: '$14,820.00 auto-reconciled with 0 variances into SunTrust Operating Acct.' },
      { id: 'EV-10491', time: '12:15:10', type: '277CA', summary: 'Clearinghouse 277CA Accepted Batch #1842', status: 'success', detail: '24 claims accepted with zero level-2 WEDI SNIP edits.' },
      { id: 'EV-10490', time: '11:58:02', type: '837P', summary: 'Outbound 837P batch dispatched to Availity', status: 'success', detail: '18 cardiology encounters scrubbed and released.' },
      { id: 'EV-10489', time: '11:32:19', type: '270', summary: 'Real-Time Eligibility 271 verified (Copay $20)', status: 'success', detail: 'Patient PT-4091 verified with active BlueOptions deductible met.' },
    ],
  },
  pediatric: {
    name: 'Pacific Pediatric & Craniofacial Center',
    specialtyTag: 'Pediatric Surgery, Otolaryngology & Complex Dental',
    providersCount: 8,
    physicianLead: 'Dr. Sarah Lin, MD, FACS (Pediatric Surgical Director)',
    collections: {
      '30d': 268400,
      q1: 805200,
      ytd: 1744600,
      '12m': 3220800,
    },
    totalClaims: {
      '30d': 1290,
      q1: 3870,
      ytd: 8385,
      '12m': 15480,
    },
    cleanClaimRate: 98.8,
    daysInAr: 23.2,
    denialRate: 2.1,
    appealsWonRate: 89.2,
    appealsRecoveredTotal: '$44,100',
    underpaymentRecouped: '$14,920',
    arAging: {
      b30: 102400,
      b60: 23100,
      b90: 6800,
      b120: 2100,
      bOv: 700,
    },
    claims: [
      {
        id: 'CLM-84102',
        patientId: 'PT-9912',
        patientName: 'Liam Chen (Age 4)',
        dos: 'May 16, 2026',
        payer: 'Sunshine Health Medicaid',
        cpt: '40700, 42200',
        modifiers: '-22',
        icd10: 'Q37.9 (Unspecified cleft palate with unilateral cleft lip)',
        billed: 3450.0,
        expected: 2820.0,
        paid: 2820.0,
        patientResp: 0.0,
        status: 'paid',
        statusLabel: 'Paid in Full',
        agingBucket: '0-30',
        auditTrail: 'Operative report attached via EDI 275 attachment loop -> 277CA clean -> Paid at 100% Medicaid allowable.',
        resolutionNote: 'Modifier -22 (Increased Procedural Complexity) documented with 90 min operative extension.',
        edi837p: `ST*837*0021*005010X222A1~
BHT*0019*00*84102*20260516*0800*CH~
NM1*IL*1*CHEN*LIAM****MI*SUN992182~
CLM*CLM-84102*3450.00***11:B:1*Y*A*Y*Y~
HI*ABK:Q379~
LX*1~
SV1*HC:40700:22*2150.00*UN*1***1~
LX*2~
SV1*HC:42200*1300.00*UN*1***1~
SE*12*0021~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 630.0, description: 'Medicaid fee schedule adjustment.' },
        ],
        clearinghouseTrace: 'SUNSHINE-20260516-990142',
      },
      {
        id: 'CLM-84103',
        patientId: 'PT-6641',
        patientName: 'Mia Rodriguez (Age 2)',
        dos: 'May 18, 2026',
        payer: 'Florida KidCare (Healthy Kids)',
        cpt: '69436',
        modifiers: '-50',
        icd10: 'H66.93 (Otitis media, bilateral)',
        billed: 980.0,
        expected: 740.0,
        paid: 740.0,
        patientResp: 15.0,
        status: 'paid',
        statusLabel: 'Paid',
        agingBucket: '0-30',
        auditTrail: 'Bilateral tympanostomy under general anesthesia -> Auto-scrubbed for modifier -50 split billing.',
        resolutionNote: 'Bilateral modifier -50 paid at 150% standard allowable per Florida KidCare agreement.',
        edi837p: `ST*837*0022*005010X222A1~
CLM*CLM-84103*980.00***11:B:1*Y*A*Y*Y~
HI*ABK:H6693~
LX*1~
SV1*HC:69436:50*980.00*UN*1***1~
SE*10*0022~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 225.0, description: 'KidCare fee schedule adjustment.' },
          { group: 'PR', code: '1', amount: 15.0, description: 'KidCare copayment.' },
        ],
        clearinghouseTrace: 'KIDCARE-20260518-112034',
      },
      {
        id: 'CLM-84104',
        patientId: 'PT-3120',
        patientName: 'Aiden Brooks (Age 6)',
        dos: 'May 19, 2026',
        payer: 'Simply Healthcare Medicaid',
        cpt: '31525',
        modifiers: '',
        icd10: 'J38.01 (Laryngomalacia, congenital)',
        billed: 620.0,
        expected: 480.0,
        paid: 0.0,
        patientResp: 0.0,
        status: 'pending',
        statusLabel: 'In Payer Review',
        agingBucket: '0-30',
        auditTrail: 'Pre-auth #SIM-9821 on file -> 277CA Accepted -> In final adjudicator medical review.',
        resolutionNote: 'Diagnostic laryngoscopy for recurrent stridor. Documented in pediatric endoscopy suite.',
        edi837p: `ST*837*0023*005010X222A1~
CLM*CLM-84104*620.00***11:B:1*Y*A*Y*Y~
HI*ABK:J3801~
LX*1~
SV1*HC:31525*620.00*UN*1***1~
SE*10*0023~`,
        casAdjustments: [],
        clearinghouseTrace: 'SIMPLY-20260519-781920',
      },
    ],
    denials: [
      {
        claimId: 'CLM-83912',
        patientName: 'Emma Watson (Age 3)',
        payer: 'Sunshine Health Medicaid',
        code: 'CARC 197',
        rootCause: 'Emergency airway foreign body removal performed without prior authorization',
        clinicalArgument: 'Emergency extraction of foreign body in bronchus is life-threatening emergency exempt from prior authorization pursuant to 42 CFR § 438.114 (Emergency and poststabilization services).',
        legalCitation: '42 CFR § 438.114 & Florida Medicaid Provider General Handbook § 1.4',
        actionTaken: 'Submitted emergency room trauma chart and bronchoscopy photos; overturned in 3 days.',
        status: 'Overturned & Collected',
        recovered: '$2,140.00',
        daysToResolve: '3 days',
        daysRemaining: 0,
        winProbability: 99,
        amountAtRisk: 2140.0,
      },
      {
        claimId: 'CLM-83980',
        patientName: 'Lucas Miller (Age 5)',
        payer: 'Aetna Better Health',
        code: 'CARC 16',
        rootCause: 'Medical vs Dental cross-coding dispute on general anesthesia for severe pediatric caries',
        clinicalArgument: 'Pediatric medical necessity established under EPSDT provisions (42 U.S.C. § 1396d(r)). High risk of airway compromise during in-office dental procedure required hospital surgical suite.',
        legalCitation: 'Medicaid Early and Periodic Screening, Diagnostic, and Treatment (EPSDT) Mandate 42 U.S.C. § 1396d(r)',
        actionTaken: 'Attached medical necessity certification and pediatric sedation risk assessment; paid in full.',
        status: 'Overturned & Collected',
        recovered: '$1,680.00',
        daysToResolve: '5 days',
        daysRemaining: 0,
        winProbability: 95,
        amountAtRisk: 1680.0,
      },
    ],
    payers: [
      { name: 'Sunshine Health Medicaid', cleanRate: '99.1%', daysToPay: '11.8 days', collectionRate: '98.5%', varianceRate: '0.4%', volume: '$112,000', status: 'optimal' },
      { name: 'Florida KidCare', cleanRate: '98.9%', daysToPay: '14.2 days', collectionRate: '98.0%', varianceRate: '0.3%', volume: '$68,400', status: 'optimal' },
      { name: 'Simply Healthcare', cleanRate: '97.9%', daysToPay: '16.5 days', collectionRate: '96.8%', varianceRate: '1.4%', volume: '$48,000', status: 'warning' },
      { name: 'Aetna Better Health', cleanRate: '98.5%', daysToPay: '13.9 days', collectionRate: '97.4%', varianceRate: '0.8%', volume: '$40,000', status: 'optimal' },
    ],
    telemetry: [
      { id: 'EV-8821', time: '12:29:10', type: '835', summary: 'Sunshine Health ERA Batch #4102 posted', status: 'success', detail: '$24,190.00 matched to pediatric surgical claims with 0 errors.' },
      { id: 'EV-8820', time: '11:42:00', type: '277CA', summary: 'Florida KidCare Accepted 14 dental encounters', status: 'success', detail: 'All Cross-coded medical claims passed SNIP 5 clinical edits.' },
    ],
  },
  summit: {
    name: 'Summit Orthopedic & Spine Institute',
    specialtyTag: 'Spine Deformity, Total Joint Arthroplasty & ASC',
    providersCount: 6,
    physicianLead: 'Dr. Gregory Sterling, MD (Chief of Spine Surgery)',
    collections: {
      '30d': 612800,
      q1: 1838400,
      ytd: 3983200,
      '12m': 7353600,
    },
    totalClaims: {
      '30d': 840,
      q1: 2520,
      ytd: 5460,
      '12m': 10080,
    },
    cleanClaimRate: 99.4,
    daysInAr: 19.8,
    denialRate: 1.6,
    appealsWonRate: 88.5,
    appealsRecoveredTotal: '$78,600',
    underpaymentRecouped: '$32,400',
    arAging: {
      b30: 264000,
      b60: 51200,
      b90: 13400,
      b120: 3200,
      bOv: 1400,
    },
    claims: [
      {
        id: 'CLM-77190',
        patientId: 'PT-5510',
        patientName: 'Gregory Vance',
        dos: 'May 10, 2026',
        payer: 'Florida Workers’ Compensation',
        cpt: '22558, 22845, 20930',
        modifiers: '',
        icd10: 'M43.16 (Spondylolisthesis, lumbar region), S39.012A (Strain of lumbar muscle)',
        billed: 18450.0,
        expected: 14200.0,
        paid: 14200.0,
        patientResp: 0.0,
        status: 'paid',
        statusLabel: 'Paid in Full',
        agingBucket: '0-30',
        auditTrail: 'DWC-9 format scrubbed -> Electronic 837P batch accepted -> Paid per FL Workers’ Comp Fee Schedule Rule 69L-7.020.',
        resolutionNote: 'Anterior lumbar interbody fusion (ALIF) with anterior instrumentation and allograft fully reimbursed.',
        edi837p: `ST*837*0031*005010X222A1~
BHT*0019*00*77190*20260510*0730*CH~
CLM*CLM-77190*18450.00***11:B:1*Y*A*Y*Y~
HI*ABK:M4316*ABF:S39012A~
LX*1~
SV1*HC:22558*9800.00*UN*1***1~
LX*2~
SV1*HC:22845*6200.00*UN*1***1~
LX*3~
SV1*HC:20930*2450.00*UN*1***1~
SE*14*0031~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 4250.0, description: 'Florida Workers Comp statutory fee schedule ceiling adjustment.' },
        ],
        clearinghouseTrace: 'FLWC-20260510-551920',
      },
      {
        id: 'CLM-77191',
        patientId: 'PT-1248',
        patientName: 'Karen O’Connor',
        dos: 'May 15, 2026',
        payer: 'Medicare Part B (Novitas)',
        cpt: '27447',
        modifiers: '-LT',
        icd10: 'M17.12 (Unilateral primary osteoarthritis, left knee)',
        billed: 8900.0,
        expected: 6450.0,
        paid: 6450.0,
        patientResp: 145.0,
        status: 'paid',
        statusLabel: 'Paid',
        agingBucket: '0-30',
        auditTrail: 'Outpatient Total Knee Arthroplasty (TKA) in ASC setting -> 277CA Accepted -> 835 EFT posted.',
        resolutionNote: 'Compliant with CMS IPO (Inpatient Only) removal for TKA in ambulatory surgery center.',
        edi837p: `ST*837*0032*005010X222A1~
CLM*CLM-77191*8900.00***24:B:1*Y*A*Y*Y~
HI*ABK:M1712~
LX*1~
SV1*HC:27447:LT*8900.00*UN*1***1~
SE*10*0032~`,
        casAdjustments: [
          { group: 'CO', code: '45', amount: 2305.0, description: 'Medicare Part B participating surgical allowable.' },
          { group: 'PR', code: '1', amount: 145.0, description: 'Part B annual deductible satisfied.' },
        ],
        clearinghouseTrace: 'NOVITAS-20260515-882910',
      },
      {
        id: 'CLM-77192',
        patientId: 'PT-9041',
        patientName: 'Steven Wallace',
        dos: 'May 21, 2026',
        payer: 'UnitedHealthcare Choice Plus',
        cpt: '29827, 29824',
        modifiers: '-59',
        icd10: 'M75.122 (Complete tear of left rotator cuff)',
        billed: 6800.0,
        expected: 5120.0,
        paid: 0.0,
        patientResp: 0.0,
        status: 'appeal',
        statusLabel: 'Under Appeal (Won)',
        agingBucket: '61-90',
        auditTrail: 'CARC 97 bundling denial on distal claviculectomy 29824 -> Overturned on Level 1 Appeal with op note.',
        resolutionNote: 'Separate subacromial decompression vs rotator cuff repair validated under NCCI PTP edit Chapter 4.',
        edi837p: `ST*837*0033*005010X222A1~
CLM*CLM-77192*6800.00***24:B:1*Y*A*Y*Y~
HI*ABK:M75122~
LX*1~
SV1*HC:29827*4600.00*UN*1***1~
LX*2~
SV1*HC:29824:59*2200.00*UN*1***1~
SE*12*0033~`,
        casAdjustments: [
          { group: 'CO', code: '97', amount: 1450.0, description: 'Bundled procedure (Overturned via NCCI Chapter 4 clinical exception).' },
        ],
        clearinghouseTrace: 'OPTUM-20260521-192039',
      },
    ],
    denials: [
      {
        claimId: 'CLM-76810',
        patientName: 'Steven Wallace',
        payer: 'UnitedHealthcare',
        code: 'CARC 97',
        rootCause: 'Bundling claim line: CPT 29824 (Distal claviculectomy) bundled into 29827 (Rotator cuff repair)',
        clinicalArgument: 'Operative note indicates distal claviculectomy was performed for independent AC joint arthrosis (M19.012), not merely as surgical exposure. NCCI guidelines explicitly allow Modifier -59 when distinct surgical pathology is documented.',
        legalCitation: 'CMS NCCI Policy Manual Chapter 4, Section E & CPT Assistant August 2022',
        actionTaken: 'Submitted annotated operative narrative with intraoperative photos demonstrating AC joint osteophytes. Overturned in 5 days.',
        status: 'Overturned & Collected',
        recovered: '$1,450.00',
        daysToResolve: '5 days',
        daysRemaining: 0,
        winProbability: 97,
        amountAtRisk: 1450.0,
      },
      {
        claimId: 'CLM-76901',
        patientName: 'Arthur Dent',
        payer: 'BCBS Federal Employee Program',
        code: 'CARC 45',
        rootCause: 'Implant hardware carve-out reimbursed below invoice cost under silent PPO discount',
        clinicalArgument: 'Under the provider participation contract § 8.4, spinal cage implants (L8699) are reimbursed at Acquisition Cost + 15%. Payer applied standard non-carve-out fee schedule in violation of express agreement.',
        legalCitation: 'Contractual Dispute Clause § 8.4 & Florida Prompt Payment of Claims Act',
        actionTaken: 'Submitted verified vendor device invoice and contractual carve-out schedule. Payer issued $4,680 differential payment.',
        status: 'Overturned & Collected',
        recovered: '$4,680.00',
        daysToResolve: '8 days',
        daysRemaining: 0,
        winProbability: 95,
        amountAtRisk: 4680.0,
      },
    ],
    payers: [
      { name: 'FL Workers’ Compensation', cleanRate: '99.6%', daysToPay: '14.1 days', collectionRate: '99.2%', varianceRate: '0.1%', volume: '$210,000', status: 'optimal' },
      { name: 'Medicare Novitas Part B', cleanRate: '99.4%', daysToPay: '11.9 days', collectionRate: '98.9%', varianceRate: '0.2%', volume: '$185,000', status: 'optimal' },
      { name: 'BCBS Federal Employee Program', cleanRate: '99.0%', daysToPay: '15.4 days', collectionRate: '97.8%', varianceRate: '0.5%', volume: '$120,000', status: 'optimal' },
      { name: 'UnitedHealthcare Choice Plus', cleanRate: '98.2%', daysToPay: '17.8 days', collectionRate: '96.5%', varianceRate: '1.6%', volume: '$97,800', status: 'warning' },
    ],
    telemetry: [
      { id: 'EV-3901', time: '12:27:00', type: '835', summary: 'Workers Comp Florida Remit posted', status: 'success', detail: '$48,200.00 electronic deposit reconciled with 0 fee schedule variances.' },
      { id: 'EV-3900', time: '11:50:12', type: '277CA', summary: 'Novitas Accepted ASC Surgical batch #840', status: 'success', detail: '6 complex spine fusion cases cleared first-pass clearinghouse audits.' },
    ],
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function InteractivePortalDemo() {
  const [practiceKey, setPracticeKey] = useState<PracticeKey>('tampa');
  const [period, setPeriod] = useState<PeriodMode>('30d');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>('all');
  const [searchClaim, setSearchClaim] = useState('');
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<string | null>(null);

  // Inspector & Modal States
  const [inspectClaim, setInspectClaim] = useState<ClaimItem | null>(null);
  const [inspectDenial, setInspectDenial] = useState<DenialItem | null>(null);
  const [claimInspectorTab, setClaimInspectorTab] = useState<'clinical' | 'edi837' | 'era835' | 'audit'>('clinical');
  const [scrubberSimulating, setScrubberSimulating] = useState(false);
  const [scrubberResult, setScrubberResult] = useState<boolean | null>(null);
  const [copiedEdi, setCopiedEdi] = useState(false);

  // Live Remit Simulation state
  const [simulatedNotification, setSimulatedNotification] = useState<string | null>(null);
  const [dynamicClaimsList, setDynamicClaimsList] = useState<ClaimItem[]>([]);
  const [extraRevenue, setExtraRevenue] = useState(0);

  // Appeal Submission Simulation
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  // Current active practice data
  const practice = PRACTICE_PRESETS[practiceKey];

  // Combined claims with dynamic live simulations
  const allClaims = useMemo(() => {
    return [...dynamicClaimsList, ...practice.claims];
  }, [dynamicClaimsList, practice.claims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return allClaims.filter((c) => {
      if (claimFilter !== 'all' && c.status !== claimFilter) return false;
      if (selectedAgingBucket && c.agingBucket !== selectedAgingBucket) return false;
      if (searchClaim) {
        const q = searchClaim.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.patientName.toLowerCase().includes(q) ||
          c.patientId.toLowerCase().includes(q) ||
          c.payer.toLowerCase().includes(q) ||
          c.cpt.toLowerCase().includes(q) ||
          c.icd10.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allClaims, claimFilter, selectedAgingBucket, searchClaim]);

  // Dynamic revenue calculations
  const displayRevenue = practice.collections[period] + extraRevenue;
  const displayClaimsCount = practice.totalClaims[period] + dynamicClaimsList.length;

  // Simulate Live 835 Remit
  const handleSimulateLiveRemit = () => {
    const newClaimId = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newClaim: ClaimItem = {
      id: newClaimId,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Live Ingestion Patient',
      dos: 'Today (Live Streaming)',
      payer: 'Blue Cross Blue Shield FL',
      cpt: '99214, 93000',
      modifiers: '-25',
      icd10: 'I10 (Essential hypertension)',
      billed: 395.0,
      expected: 342.0,
      paid: 342.0,
      patientResp: 25.0,
      status: 'paid',
      statusLabel: 'Just Paid (Live 835)',
      agingBucket: '0-30',
      auditTrail: 'Live 835 ERA EFT receipt parsed and reconciled in 420ms.',
      resolutionNote: 'Automatic zero-touch payment posting and direct deposit reconciliation.',
      edi837p: `ST*837*9999*005010X222A1~
CLM*${newClaimId}*395.00***11:B:1*Y*A*Y*Y~
HI*ABK:I10~
LX*1~
SV1*HC:99214:25*265.00*UN*1***1~
LX*2~
SV1*HC:93000*130.00*UN*1***1~
SE*10*9999~`,
      casAdjustments: [
        { group: 'CO', code: '45', amount: 28.0, description: 'Payer fee schedule contract adjustment.' },
        { group: 'PR', code: '1', amount: 25.0, description: 'Patient copay responsibility.' },
      ],
      clearinghouseTrace: `AVAIL-LIVE-${Date.now().toString().slice(-6)}`,
    };

    setDynamicClaimsList((prev) => [newClaim, ...prev]);
    setExtraRevenue((prev) => prev + 342.0);
    setSimulatedNotification(
      `⚡ Live 835 ERA Ingested: Claim ${newClaimId} auto-reconciled with $342.00 EFT deposit!`
    );

    setTimeout(() => {
      setSimulatedNotification(null);
    }, 6000);
  };

  // Run AI Scrubber simulation
  const handleRunScrubberTest = () => {
    setScrubberSimulating(true);
    setScrubberResult(null);
    setTimeout(() => {
      setScrubberSimulating(false);
      setScrubberResult(true);
    }, 850);
  };

  // Copy EDI text
  const handleCopyEdi = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEdi(true);
    setTimeout(() => setCopiedEdi(false), 2000);
  };

  // Submit AI Appeal simulation
  const handleSimulateAppealSubmit = () => {
    setAppealSubmitting(true);
    setTimeout(() => {
      setAppealSubmitting(false);
      setAppealSubmitted(true);
    }, 1200);
  };

  // Calculate A/R Aging Total and Percentages
  const arTotal =
    practice.arAging.b30 +
    practice.arAging.b60 +
    practice.arAging.b90 +
    practice.arAging.b120 +
    practice.arAging.bOv;
  const p30 = ((practice.arAging.b30 / arTotal) * 100).toFixed(1);
  const p60 = ((practice.arAging.b60 / arTotal) * 100).toFixed(1);
  const p90 = ((practice.arAging.b90 / arTotal) * 100).toFixed(1);
  const p120 = ((practice.arAging.b120 / arTotal) * 100).toFixed(1);
  const pOv = ((practice.arAging.bOv / arTotal) * 100).toFixed(1);

  return (
    <div
      id="live-portal-sandbox"
      className="w-full bg-[#090e1a] rounded-3xl border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden text-slate-100 font-inter transition-all duration-300 relative scroll-mt-28"
    >
      {/* Toast Notification for Live Ingestion */}
      {simulatedNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/95 text-slate-950 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-emerald-300 animate-in slide-in-from-top-4 duration-300">
          <Zap className="h-4 w-4 text-slate-950 animate-bounce" />
          <span>{simulatedNotification}</span>
          <button
            type="button"
            onClick={() => setSimulatedNotification(null)}
            className="text-slate-950/70 hover:text-slate-950 ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP SAAS HEADER & TELEMETRY BAR */}
      {/* ============================================================ */}
      <div className="bg-[#050811] border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window Dots & Practice Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Browser Address Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <div className="h-5 w-5 rounded-md bg-[#003087] flex items-center justify-center font-bold text-white text-[10px]">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">portal.aetherahealthcare.com</span>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 font-semibold">
                Live Client Sandbox
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          {/* Practice Switcher Dropdown */}
          <div className="relative group">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mb-0.5">
              Practice Profile Preset
            </label>
            <div className="flex items-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-700/80 transition-colors">
              <Building2 className="h-4 w-4 text-teal-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{practice.name}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[280px]">
                  {practice.specialtyTag}
                </p>
              </div>

              {/* Preset Dropdown Menu */}
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-40 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                  Switch Specialty Scenario:
                </div>
                {(
                  [
                    { key: 'tampa', name: 'Tampa Bay Multi-Specialty', tag: 'Cardiology & Orthopedics' },
                    { key: 'pediatric', name: 'Pacific Pediatric & Dental', tag: 'Medicaid & EPSDT Surgery' },
                    { key: 'summit', name: 'Summit Orthopedic & Spine', tag: 'Spine Surgery & ASC' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPracticeKey(p.key);
                      setSelectedAgingBucket(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                      practiceKey === p.key
                        ? 'bg-[#003087] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[10px] opacity-80">{p.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Ingestion Button & Period Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-time Gateway status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Gateway:</span>
            <span className="font-mono text-emerald-300">Availity EDI 9ms</span>
          </div>

          {/* Simulate Live Remit Button */}
          <button
            type="button"
            onClick={handleSimulateLiveRemit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Inject a real-time incoming 835 Remittance Advice"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simulate Live 835 Remit</span>
          </button>

          {/* Period Mode Selector */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            {(
              [
                { key: '30d', label: 'Last 30D' },
                { key: 'q1', label: 'Q1 2026' },
                { key: 'ytd', label: 'YTD' },
                { key: '12m', label: '12M Rolling' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setPeriod(t.key)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  period === t.key
                    ? 'bg-[#003087] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECONDARY NAVIGATION SUB-BAR */}
      {/* ============================================================ */}
      <div className="bg-[#0b1120] border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setSelectedAgingBucket(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#003087] text-white shadow-sm ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-teal-400" />
            <span>Executive KPIs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-[#003087] text-white shadow-sm ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Claims Stream ({allClaims.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('denials')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'denials'
                ? 'bg-[#003087] text-white shadow-sm ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Denial Recovery Center</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {practice.appealsRecoveredTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'payers'
                ? 'bg-[#003087] text-white shadow-sm ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Payer Scorecards &amp; Yield</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-[#003087] text-white shadow-sm ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>EDI Audit Stream</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="hidden lg:flex items-center gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Executive PDF</span>
          </button>

          <Link
            href="/free-assessment"
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md text-xs active:scale-95"
          >
            <span>Activate for My Practice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN INTERACTIVE BODY */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-6 space-y-6 min-h-[520px]">
        {/* ========================================================== */}
        {/* TAB 1: EXECUTIVE COMMAND (OVERVIEW) */}
        {/* ========================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 6 KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Metric 1: Net Revenue Collected */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Net Collected</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  $<AnimatedCounter to={displayRevenue} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+14.8% vs pre-Aethera</span>
                </div>
              </div>

              {/* Metric 2: Clean Claim Rate */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Clean Claim Rate</span>
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  {practice.cleanClaimRate}%
                </div>
                <span className="text-[11px] font-semibold text-teal-300 mt-1 block">
                  Contractual SLA: 95%+
                </span>
              </div>

              {/* Metric 3: Days in AR */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Days in A/R (DSO)</span>
                  <Clock className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  {practice.daysInAr} days
                </div>
                <span className="text-[11px] font-semibold text-cyan-300 mt-1 block">
                  MGMA Average: 44.5d
                </span>
              </div>

              {/* Metric 4: Initial Denial Rate */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Denial Rate</span>
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  {practice.denialRate}%
                </div>
                <span className="text-[11px] font-semibold text-amber-300 mt-1 block">
                  Down from 11.8%
                </span>
              </div>

              {/* Metric 5: Appeals Overturn Win Rate */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Appeals Overturned</span>
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  {practice.appealsWonRate}%
                </div>
                <span className="text-[11px] font-semibold text-purple-300 mt-1 block">
                  {practice.appealsRecoveredTotal} recovered
                </span>
              </div>

              {/* Metric 6: Total Claims Scanned */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400 mb-1.5 text-xs">
                  <span className="font-medium">Claims Processed</span>
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white tracking-tight">
                  <AnimatedCounter to={displayClaimsCount} />
                </div>
                <span className="text-[11px] font-semibold text-blue-300 mt-1 block">
                  100% triple-scrubbed
                </span>
              </div>
            </div>

            {/* A/R Aging Interactive Visualizer */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Accounts Receivable (A/R) Aging Bucket Breakdown</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Total Active A/R: ${arTotal.toLocaleString()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any bucket to inspect underlying claims and verify zero abandonment past 90 days.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
                    {(Number(p30) + Number(p60)).toFixed(1)}% Resolved Under 60 Days
                  </span>
                </div>
              </div>

              {/* Interactive Horizontal Stacked Bar */}
              <div className="w-full h-7 rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
                <div
                  style={{ width: `${p30}%` }}
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '0-30' ? null : '0-30')}
                  className="bg-emerald-500 hover:brightness-110 cursor-pointer h-full transition-all relative flex items-center justify-center text-[10px] font-bold text-slate-950 select-none"
                  title={`0-30 Days: $${practice.arAging.b30.toLocaleString()} (${p30}%)`}
                >
                  {Number(p30) >= 12 && `${p30}%`}
                </div>
                <div
                  style={{ width: `${p60}%` }}
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '31-60' ? null : '31-60')}
                  className="bg-teal-500 hover:brightness-110 cursor-pointer h-full transition-all relative flex items-center justify-center text-[10px] font-bold text-slate-950 select-none"
                  title={`31-60 Days: $${practice.arAging.b60.toLocaleString()} (${p60}%)`}
                >
                  {Number(p60) >= 12 && `${p60}%`}
                </div>
                <div
                  style={{ width: `${p90}%` }}
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '61-90' ? null : '61-90')}
                  className="bg-blue-500 hover:brightness-110 cursor-pointer h-full transition-all relative flex items-center justify-center text-[10px] font-bold text-white select-none"
                  title={`61-90 Days: $${practice.arAging.b90.toLocaleString()} (${p90}%)`}
                >
                  {Number(p90) >= 6 && `${p90}%`}
                </div>
                <div
                  style={{ width: `${p120}%` }}
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '91-120' ? null : '91-120')}
                  className="bg-amber-500 hover:brightness-110 cursor-pointer h-full transition-all relative flex items-center justify-center text-[10px] font-bold text-slate-950 select-none"
                  title={`91-120 Days: $${practice.arAging.b120.toLocaleString()} (${p120}%)`}
                >
                  {Number(p120) >= 5 && `${p120}%`}
                </div>
                <div
                  style={{ width: `${pOv}%` }}
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '120+' ? null : '120+')}
                  className="bg-rose-500 hover:brightness-110 cursor-pointer h-full transition-all relative flex items-center justify-center text-[10px] font-bold text-white select-none"
                  title={`120+ Days: $${practice.arAging.bOv.toLocaleString()} (${pOv}%)`}
                >
                  {Number(pOv) >= 4 && `${pOv}%`}
                </div>
              </div>

              {/* Bucket Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {/* 0-30 Days */}
                <button
                  type="button"
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '0-30' ? null : '0-30')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgingBucket === '0-30'
                      ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>0–30 Days (Current)</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">
                    ${practice.arAging.b30.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{p30}% of total A/R</p>
                  <span className="text-[9px] text-emerald-300 font-mono mt-1 block">MGMA Benchmark: 65%</span>
                </button>

                {/* 31-60 Days */}
                <button
                  type="button"
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '31-60' ? null : '31-60')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgingBucket === '31-60'
                      ? 'bg-teal-950/40 border-teal-400 ring-1 ring-teal-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span>31–60 Days</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">
                    ${practice.arAging.b60.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{p60}% of total A/R</p>
                  <span className="text-[9px] text-teal-300 font-mono mt-1 block">In-flight adjudications</span>
                </button>

                {/* 61-90 Days */}
                <button
                  type="button"
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '61-90' ? null : '61-90')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgingBucket === '61-90'
                      ? 'bg-blue-950/40 border-blue-400 ring-1 ring-blue-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>61–90 Days</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">
                    ${practice.arAging.b90.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{p90}% of total A/R</p>
                  <span className="text-[9px] text-blue-300 font-mono mt-1 block">Level 1 Appeals Queue</span>
                </button>

                {/* 91-120 Days */}
                <button
                  type="button"
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '91-120' ? null : '91-120')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgingBucket === '91-120'
                      ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>91–120 Days</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">
                    ${practice.arAging.b120.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{p120}% (Urgent SLA)</p>
                  <span className="text-[9px] text-amber-300 font-mono mt-1 block">Timely filing watchdog</span>
                </button>

                {/* 120+ Days */}
                <button
                  type="button"
                  onClick={() => setSelectedAgingBucket(selectedAgingBucket === '120+' ? null : '120+')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgingBucket === '120+'
                      ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>120+ Days</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">
                    ${practice.arAging.bOv.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{pOv}% (Near Zero)</p>
                  <span className="text-[9px] text-emerald-300 font-mono mt-1 block">Industry risk: 14%</span>
                </button>
              </div>

              {/* Bucket filter hint */}
              {selectedAgingBucket && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-teal-500/30 text-xs text-teal-300">
                  <span>
                    Filtering active claims by <strong>{selectedAgingBucket} Days</strong> bucket.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('claims')}
                      className="underline font-bold hover:text-white cursor-pointer"
                    >
                      View in Claims Stream →
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAgingBucket(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom 2 Split Columns: Revenue Safeguards & Cash Flow Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Safeguard Highlights */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Automated Revenue Safeguards (Last 30 Days)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    3/3 Active
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">Modifier -25 Clinical Validation Scrubber</p>
                      <p className="text-slate-400 text-[11px]">
                        Intercepted 42 routine E/M encounters bundled into minor surgical procedures; verified separate chart documentation prior to 837P dispatch.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">+$9,240 saved</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">Silent PPO Underpayment Detector</p>
                      <p className="text-slate-400 text-[11px]">
                        Identified uncontracted 7% fee schedule reductions from commercial payers on high-complexity codes; auto-generated demand letters.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">+$6,180 recouped</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">Electronic Timely Filing Proof Gateway</p>
                      <p className="text-slate-400 text-[11px]">
                        Attached tamper-evident 277CA clearinghouse timestamps to all late-adjudicated payer claims, extinguishing CARC 29 filing limit disputes.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">100% defended</span>
                  </div>
                </div>
              </div>

              {/* Cash Velocity & Forecast */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-teal-400" />
                      <span>Cash Velocity &amp; Remittance Forecast</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">99.2% Accuracy</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Predictive cash disbursement modeling based on payer-specific electronic EFT remits scheduled over the next 14 business days.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-white font-medium">Next EFT Drop (Tuesday)</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        ${Math.round(displayRevenue * 0.22).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-400" />
                        <span className="text-white font-medium">Medicare Part B Bi-Weekly Cycle</span>
                      </div>
                      <span className="font-mono font-bold text-teal-400">
                        ${Math.round(displayRevenue * 0.38).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        <span className="text-white font-medium">Pending Level 1 Appeal Recoveries</span>
                      </div>
                      <span className="font-mono font-bold text-purple-400">
                        {practice.appealsRecoveredTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reconciled Daily with Direct Bank Deposits</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('telemetry')}
                    className="text-teal-400 hover:text-white underline cursor-pointer"
                  >
                    View Real-Time EDI Log →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: CLAIMS STREAM & EDI INSPECTOR */}
        {/* ========================================================== */}
        {activeTab === 'claims' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              {/* Search Bar */}
              <div className="flex items-center gap-2.5 flex-1 min-w-[260px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 focus-within:border-teal-500">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchClaim}
                  onChange={(e) => setSearchClaim(e.target.value)}
                  placeholder="Search by Patient, Claim ID, CPT, ICD-10 or Payer…"
                  className="bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
                />
                {searchClaim && (
                  <button type="button" onClick={() => setSearchClaim('')} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                {(
                  [
                    { key: 'all', label: 'All' },
                    { key: 'paid', label: 'Paid in Full' },
                    { key: 'pending', label: 'In Review' },
                    { key: 'appeal', label: 'Under Appeal' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setClaimFilter(f.key)}
                    className={`px-3 py-1 rounded-xl capitalize transition-all cursor-pointer ${
                      claimFilter === f.key
                        ? 'bg-[#003087] text-white font-bold ring-1 ring-blue-400/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                {selectedAgingBucket && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/40">
                    Bucket: {selectedAgingBucket}d
                    <button
                      type="button"
                      onClick={() => setSelectedAgingBucket(null)}
                      className="hover:text-white ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Claims Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#050811] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Claim ID</th>
                    <th className="p-3.5">Patient / DOS</th>
                    <th className="p-3.5">Payer</th>
                    <th className="p-3.5">CPT &amp; Modifiers</th>
                    <th className="p-3.5 font-mono">Billed</th>
                    <th className="p-3.5 font-mono">Paid</th>
                    <th className="p-3.5 font-mono">Patient Resp</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">EDI Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No claims match the active filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr
                        key={claim.id}
                        onClick={() => setInspectClaim(claim)}
                        className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 font-mono text-white font-bold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                          <span>{claim.id}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{claim.patientName}</div>
                          <div className="text-[10px] text-slate-400">{claim.dos} · {claim.patientId}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">{claim.payer}</td>
                        <td className="p-3.5 font-mono text-teal-400">
                          <div>{claim.cpt}</div>
                          {claim.modifiers && (
                            <span className="text-[10px] text-amber-300 font-mono">{claim.modifiers}</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">${claim.billed.toFixed(2)}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          ${claim.paid.toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          ${claim.patientResp.toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              claim.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : claim.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span>{claim.statusLabel}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-teal-400 group-hover:text-white font-semibold">
                          <span className="underline text-[11px] inline-flex items-center gap-1">
                            Inspect <Eye className="h-3 w-3" />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {filteredClaims.length} of {allClaims.length} active claims</span>
              <span>All 837P files validated against CMS WEDI SNIP Levels 1–7</span>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: DENIAL RECOVERY CENTER */}
        {/* ========================================================== */}
        {activeTab === 'denials' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Active Denial Appeal &amp; Recovery Feed</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every denial is parsed by CARC/RARC code within 4 hours of 835 remittance receipt and matched with CMS statutory arguments.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs text-slate-400 block">Total Recovered This Period</span>
                <span className="text-2xl font-black text-emerald-400 font-jakarta">
                  {practice.appealsRecoveredTotal}
                </span>
              </div>
            </div>

            {/* Denials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practice.denials.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs shadow-sm hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{item.claimId}</span>
                      <span className="text-slate-400 text-xs block">{item.patientName} · {item.payer}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>

                  {/* CARC Code & Root Cause */}
                  <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] shrink-0 font-bold">
                      {item.code}
                    </span>
                    <span className="text-slate-300 text-[11px] leading-snug">{item.rootCause}</span>
                  </div>

                  {/* AI Resolution Action */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                    <strong className="text-teal-400">Aethera Action: </strong>
                    <span>{item.actionTaken}</span>
                  </div>

                  {/* Legal Citation Pill */}
                  <div className="text-[10px] text-slate-400 font-mono">
                    <span className="text-purple-400 font-semibold">Statutory Authority: </span>
                    <span>{item.legalCitation}</span>
                  </div>

                  {/* Bottom Stats & 1-Click Appeal Action */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">Turnaround: {item.daysToResolve}</span>
                      <span className="font-bold text-emerald-400 ml-3">Recovered: {item.recovered}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectDenial(item);
                        setAppealSubmitted(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-purple-300" />
                      <span>Inspect Appeal Package</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: PAYER SCORECARDS & CONTRACT YIELD */}
        {/* ========================================================== */}
        {activeTab === 'payers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>Contracted Commercial &amp; Government Payer Performance Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous audit of contracted fee schedule yield, payment turnaround windows, and silent underpayment deductions.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs text-slate-400 block">Underpayments Recouped</span>
                <span className="text-xl font-bold text-emerald-400 font-jakarta">
                  {practice.underpaymentRecouped}
                </span>
              </div>
            </div>

            {/* Payer Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#050811] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Insurance Payer</th>
                    <th className="p-3.5">Clean-Claim Rate</th>
                    <th className="p-3.5">Avg Remittance Window</th>
                    <th className="p-3.5">Net Collection %</th>
                    <th className="p-3.5">Underpayment Variance</th>
                    <th className="p-3.5 font-mono text-right">Volume Adjudicated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  {practice.payers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">{p.cleanRate}</td>
                      <td className="p-3.5 text-slate-300">{p.daysToPay}</td>
                      <td className="p-3.5 font-semibold text-teal-300">{p.collectionRate}</td>
                      <td className="p-3.5 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'optimal'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {p.varianceRate} variance
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-right text-white">{p.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Underpayment Leakage Callout */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>How Aethera Intercepts Underpayment Leakage</span>
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Most billing software blindly accepts whatever dollar amount the payer posts on the 835 ERA. Aethera cross-checks every line item against your practice&apos;s contracted fee schedule. If a payer reimburses $185 instead of your contractual $215 allowable on code 99215, our system flags the $30 variance immediately and triggers an electronic reconciliation balance request.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: EDI AUDIT STREAM & TELEMETRY */}
        {/* ========================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Real-Time Electronic Data Interchange (EDI) Clearinghouse Stream</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct gateway socket connection to Change Healthcare, Availity, and Optum clearinghouses.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulateLiveRemit}
                className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                Trigger Ingestion Test
              </button>
            </div>

            {/* Telemetry Event Stream Cards */}
            <div className="space-y-2.5">
              {practice.telemetry.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-slate-500 mt-0.5 shrink-0">
                      {event.time}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        event.type === '835'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : event.type === '277CA'
                          ? 'bg-blue-500/20 text-blue-300'
                          : event.type === '837P'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {event.type}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{event.summary}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{event.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{event.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* BOTTOM CONVERSION STRIP */}
        {/* ========================================================== */}
        <div className="bg-gradient-to-r from-[#002875] via-[#004099] to-teal-900/90 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/30 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Bring This 24/7 Command Center to Your Practice</span>
            </h4>
            <p className="text-xs text-blue-100">
              Included free with all Aethera billing partnerships. Performance pricing from 3.5%–5.0%. No onboarding fees.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/schedule"
              className="border border-white/40 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Book 15-Min Demo
            </Link>
            <Link
              href="/free-assessment"
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-md whitespace-nowrap"
            >
              Start Free 50-Claim Pilot
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: INTERACTIVE CLAIM INSPECTOR (SLIDE-OVER / MODAL) */}
      {/* ============================================================ */}
      {inspectClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-blue-300 text-xs">
                  837
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>Claim {inspectClaim.id}</span>
                    <span className="text-slate-400 font-normal">({inspectClaim.patientName})</span>
                  </h3>
                  <p className="text-xs text-teal-400">
                    {inspectClaim.payer} · Date of Service: {inspectClaim.dos}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inspector Tab Bar */}
            <div className="bg-[#0b1120] px-4 sm:px-5 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setClaimInspectorTab('clinical')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                  claimInspectorTab === 'clinical' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Clinical &amp; Financial Summary
              </button>
              <button
                type="button"
                onClick={() => setClaimInspectorTab('edi837')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer ${
                  claimInspectorTab === 'edi837' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-teal-400" />
                <span>Raw EDI 837P Loop</span>
              </button>
              <button
                type="button"
                onClick={() => setClaimInspectorTab('era835')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer ${
                  claimInspectorTab === 'era835' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>835 ERA Adjustments ({inspectClaim.casAdjustments.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setClaimInspectorTab('audit')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                  claimInspectorTab === 'audit' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Clearinghouse 277CA Audit
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tab: Clinical Summary */}
              {claimInspectorTab === 'clinical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Billed Amount</span>
                      <span className="text-base font-bold text-white font-mono">${inspectClaim.billed.toFixed(2)}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Contracted Allowed</span>
                      <span className="text-base font-bold text-teal-400 font-mono">${inspectClaim.expected.toFixed(2)}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Paid by Payer</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">${inspectClaim.paid.toFixed(2)}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Patient Liability</span>
                      <span className="text-base font-bold text-amber-400 font-mono">${inspectClaim.patientResp.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white text-xs">Clinical Code Breakdown:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">CPT Code(s) &amp; Modifiers:</span>
                        <span className="font-mono text-teal-300 font-semibold">{inspectClaim.cpt} {inspectClaim.modifiers}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary ICD-10 Diagnosis:</span>
                        <span className="font-mono text-slate-200">{inspectClaim.icd10}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-white text-xs">Certified Biller &amp; Scrubber Notes:</h5>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{inspectClaim.resolutionNote}</p>
                  </div>

                  {/* Scrubber check action */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Run Automated Pre-Submission Scrubber</span>
                      <span className="text-[11px] text-slate-400">Validates against NCCI, LCD/NCD, and payer specific bundling edits.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunScrubberTest}
                      disabled={scrubberSimulating}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all text-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {scrubberSimulating ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Auditing…</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Run Audit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {scrubberResult && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs animate-in fade-in duration-150">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Scrubber Audit Passed: 0 NCCI conflicts, 0 bundling errors, valid modifier pointer verified.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Raw EDI 837P Loop */}
              {claimInspectorTab === 'edi837' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">ANSI ASC X12N 837P Professional Electronic Payload</span>
                    <button
                      type="button"
                      onClick={() => handleCopyEdi(inspectClaim.edi837p)}
                      className="text-teal-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
                    >
                      {copiedEdi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedEdi ? 'Copied' : 'Copy EDI'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    {inspectClaim.edi837p}
                  </pre>
                  <p className="text-[10px] text-slate-400">
                    Conforms with HIPAA 5010 standard specification. Ready for direct SFTP or API submission.
                  </p>
                </div>
              )}

              {/* Tab: ERA 835 Adjustments */}
              {claimInspectorTab === 'era835' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-white text-xs">Parsed Claim Adjustment Segments (CAS):</h5>
                  {inspectClaim.casAdjustments.length === 0 ? (
                    <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-400">
                      Claim is in adjudication; remittance advice (835) has not yet posted.
                    </div>
                  ) : (
                    inspectClaim.casAdjustments.map((cas, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-teal-400 font-bold">
                            CAS*{cas.group}*{cas.code}
                          </span>
                          <span className="font-mono text-white font-bold">${cas.amount.toFixed(2)}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{cas.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Audit Log */}
              {claimInspectorTab === 'audit' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Clearinghouse 277CA Trace Number:</span>
                      <span className="font-mono font-bold text-emerald-400">{inspectClaim.clearinghouseTrace}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                      <strong>Electronic Audit Trail: </strong>
                      <span>{inspectClaim.auditTrail}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectClaim(null)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
              <Link
                href="/free-assessment"
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>Audit My Practice&apos;s Claims</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: INTERACTIVE AI APPEAL PACKAGE GENERATOR */}
      {/* ============================================================ */}
      {inspectDenial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                  AI
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>Appeal Package: {inspectDenial.claimId}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs">
                      {inspectDenial.code}
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300">
                    Payer: {inspectDenial.payer} · Patient: {inspectDenial.patientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectDenial(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Top Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">Amount at Risk</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    ${inspectDenial.amountAtRisk.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">AI Win Probability</span>
                  <span className="text-base font-bold text-purple-400 font-mono">
                    {inspectDenial.winProbability}% (High)
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block uppercase">Average Turnaround</span>
                  <span className="text-base font-bold text-teal-400 font-mono">{inspectDenial.daysToResolve}</span>
                </div>
              </div>

              {/* Formatted Legal Appeal Letter */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px] text-slate-300 leading-relaxed">
                <div className="pb-2 border-b border-slate-800 text-slate-400">
                  <p>RE: Formal Appeal of Denial / Request for Administrative Reconsideration</p>
                  <p>Payer: {inspectDenial.payer} Appeals Department</p>
                  <p>Patient: {inspectDenial.patientName} · Claim ID: {inspectDenial.claimId}</p>
                  <p>Controverted Reason Code: {inspectDenial.code}</p>
                </div>

                <p>
                  <strong>1. STATUTORY &amp; LEGAL JURISDICTION:</strong>
                  <br />
                  This appeal is submitted in accordance with {inspectDenial.legalCitation} and your published provider manual appeal guidelines.
                </p>

                <p>
                  <strong>2. CLINICAL SUBSTANTIATION &amp; REBUTTAL:</strong>
                  <br />
                  {inspectDenial.clinicalArgument}
                </p>

                <p>
                  <strong>3. RELIEF REQUESTED:</strong>
                  <br />
                  We respectfully request that {inspectDenial.payer} overturn this adverse determination immediately, reprocess Claim #{inspectDenial.claimId}, and release payment of ${inspectDenial.amountAtRisk.toLocaleString()} in accordance with statutory prompt-pay guidelines.
                </p>
              </div>

              {appealSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs animate-in fade-in duration-150">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Appeal package dispatched electronically via clearinghouse gateway. Status updated to <strong>Overturned &amp; Paid</strong>!
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectDenial(null)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSimulateAppealSubmit}
                disabled={appealSubmitting || appealSubmitted}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {appealSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Transmitting to Gateway…</span>
                  </>
                ) : appealSubmitted ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Submitted to Payer Portal</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Simulate 1-Click Electronic Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
