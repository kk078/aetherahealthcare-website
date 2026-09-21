export interface MacJurisdiction {
  id: string;
  macName: string;
  jurisdictionCode: string;
  primaryState: string;
  allStates: string[];
  workGpci: number;
  peGpci: number;
  mpGpci: number;
  compositeGpci: number;
  promptPayStatute: {
    stateCode: string;
    statuteCitation: string;
    electronicPaymentWindowDays: number;
    statutoryInterestRatePercent: number;
    recoupmentLookbackLimitMonths: number;
    regulatoryEnforcementAgency: string;
    mandatoryAuditRemedy: string;
  };
}

export interface CptParityBenchmark {
  cptCode: string;
  procedureTitle: string;
  specialty: string;
  workRvu: number;
  peRvu: number;
  mpRvu: number;
  totalNationalRvu: number;
  nationalMedicareRate: number; // Based on $33.2875 CY2024 CF
  typicalCommercialMultiplierRange: [number, number]; // e.g., [1.95, 2.40] = 195% - 240% of Medicare
  payerExploits: {
    exploitName: string;
    mechanism: string;
    clawbackVulnerability: string;
    sovereignLegalDefense: string;
  };
}

export interface PayerArbitrageProfile {
  id: string;
  payerName: string;
  payerCategory: string;
  nationalMarketShare: string;
  typicalSettlementRateOfMedicare: number; // e.g. 1.35 = 135%
  underpaymentPattern: string;
  silentPpoLeasingNotice: string;
}

export const MPFS_CONVERSION_FACTOR = 33.2875;

export const MAC_JURISDICTIONS: MacJurisdiction[] = [
  {
    id: 'novitas-tx',
    macName: 'Novitas Solutions (Jurisdiction H)',
    jurisdictionCode: 'JH - Locality 01/02',
    primaryState: 'Texas',
    allStates: ['TX', 'AR', 'CO', 'LA', 'MS', 'NM', 'OK'],
    workGpci: 1.000,
    peGpci: 0.985,
    mpGpci: 0.812,
    compositeGpci: 0.978,
    promptPayStatute: {
      stateCode: 'TX',
      statuteCitation: 'Texas Insurance Code § 1301.103 & 28 TAC § 21.2804',
      electronicPaymentWindowDays: 30,
      statutoryInterestRatePercent: 15.0,
      recoupmentLookbackLimitMonths: 6, // 180 days under 28 TAC § 21.2814
      regulatoryEnforcementAgency: 'Texas Department of Insurance (TDI)',
      mandatoryAuditRemedy: 'Automatic 15% per annum statutory interest plus reasonable attorneys fees under Tex. Ins. Code § 1301.108 for clean claims unpaid past 30 days.'
    }
  },
  {
    id: 'noridian-ca',
    macName: 'Noridian Healthcare Solutions (Jurisdiction J-E)',
    jurisdictionCode: 'JE - Locality 01/18',
    primaryState: 'California',
    allStates: ['CA', 'NV', 'AZ', 'HI'],
    workGpci: 1.062,
    peGpci: 1.184,
    mpGpci: 0.694,
    compositeGpci: 1.096,
    promptPayStatute: {
      stateCode: 'CA',
      statuteCitation: 'California Insurance Code § 10123.13 & Knox-Keene Act § 1371',
      electronicPaymentWindowDays: 30,
      statutoryInterestRatePercent: 15.0,
      recoupmentLookbackLimitMonths: 12, // 365 days under Cal. Health & Safety Code § 1371.1
      regulatoryEnforcementAgency: 'California Department of Insurance (CDI) / DMHC',
      mandatoryAuditRemedy: 'Mandatory 15% per annum interest beginning on the 31st working day; automatic recoupment barred after 365 days without clear written fraud substantiation.'
    }
  },
  {
    id: 'first-coast-fl',
    macName: 'First Coast Service Options (Jurisdiction N)',
    jurisdictionCode: 'JN - Locality 01/02',
    primaryState: 'Florida',
    allStates: ['FL', 'PR', 'VI'],
    workGpci: 1.000,
    peGpci: 1.012,
    mpGpci: 1.398,
    compositeGpci: 1.034,
    promptPayStatute: {
      stateCode: 'FL',
      statuteCitation: 'Florida Statutes § 641.3155 & § 627.6131',
      electronicPaymentWindowDays: 20,
      statutoryInterestRatePercent: 12.0,
      recoupmentLookbackLimitMonths: 12, // 12 months under Fla. Stat. § 641.3155(5)
      regulatoryEnforcementAgency: 'Florida Office of Insurance Regulation (FLOIR)',
      mandatoryAuditRemedy: 'Strict 20-day electronic prompt pay limit. Claims unpaid after 20 days accrue 12% per annum simple interest; retroactive claim denials barred after 12 months.'
    }
  },
  {
    id: 'ngs-ny',
    macName: 'National Government Services (Jurisdiction J-K)',
    jurisdictionCode: 'JK - Locality 01/02',
    primaryState: 'New York',
    allStates: ['NY', 'CT', 'MA', 'ME', 'NH', 'RI', 'VT'],
    workGpci: 1.075,
    peGpci: 1.218,
    mpGpci: 1.482,
    compositeGpci: 1.162,
    promptPayStatute: {
      stateCode: 'NY',
      statuteCitation: 'New York Insurance Law § 3224-a (Prompt Pay Law)',
      electronicPaymentWindowDays: 30,
      statutoryInterestRatePercent: 12.0,
      recoupmentLookbackLimitMonths: 24, // 24 months under NY Ins. Law § 3224-b
      regulatoryEnforcementAgency: 'New York Department of Financial Services (DFS)',
      mandatoryAuditRemedy: 'Statutory 12% penalty or Department of Tax interest rate. Unilateral offset or recoupment without 30-day explanation letter violates § 3224-b.'
    }
  },
  {
    id: 'palmetto-ga',
    macName: 'Palmetto GBA (Jurisdiction J-J)',
    jurisdictionCode: 'JJ - Locality 01/99',
    primaryState: 'Georgia',
    allStates: ['GA', 'AL', 'TN'],
    workGpci: 1.000,
    peGpci: 0.962,
    mpGpci: 0.884,
    compositeGpci: 0.976,
    promptPayStatute: {
      stateCode: 'GA',
      statuteCitation: 'O.C.G.A. § 33-24-59.5 (Georgia Prompt Pay Act)',
      electronicPaymentWindowDays: 15, // 15 working days
      statutoryInterestRatePercent: 12.0,
      recoupmentLookbackLimitMonths: 12,
      regulatoryEnforcementAgency: 'Office of the Georgia Commissioner of Insurance',
      mandatoryAuditRemedy: 'Mandatory 15-working-day electronic claim resolution. 12% annual interest assessed automatically on unpaid balances.'
    }
  },
  {
    id: 'cgs-oh',
    macName: 'CGS Administrators (Jurisdiction 15)',
    jurisdictionCode: 'J15 - Locality 01/00',
    primaryState: 'Ohio',
    allStates: ['OH', 'KY'],
    workGpci: 1.000,
    peGpci: 0.948,
    mpGpci: 0.922,
    compositeGpci: 0.971,
    promptPayStatute: {
      stateCode: 'OH',
      statuteCitation: 'Ohio Revised Code § 3901.381 & R.C. 3901.388',
      electronicPaymentWindowDays: 30,
      statutoryInterestRatePercent: 18.0, // Aggressive 18% annual penalty in OH
      recoupmentLookbackLimitMonths: 24,
      regulatoryEnforcementAgency: 'Ohio Department of Insurance (ODI)',
      mandatoryAuditRemedy: 'Aggressive 18% per annum statutory interest penalty on claims not adjudicated within 30 days. Payer cannot offset past 2 years without fraud proof.'
    }
  },
  {
    id: 'wps-il',
    macName: 'WPS Government Health Administrators (Jurisdiction 8)',
    jurisdictionCode: 'J8 - Locality 16/99',
    primaryState: 'Illinois',
    allStates: ['IL', 'IN', 'MI'],
    workGpci: 1.028,
    peGpci: 1.054,
    mpGpci: 1.240,
    compositeGpci: 1.058,
    promptPayStatute: {
      stateCode: 'IL',
      statuteCitation: '215 ILCS 5/368a (Illinois Insurance Code Prompt Pay)',
      electronicPaymentWindowDays: 30,
      statutoryInterestRatePercent: 9.0,
      recoupmentLookbackLimitMonths: 18,
      regulatoryEnforcementAgency: 'Illinois Department of Insurance (IDOI)',
      mandatoryAuditRemedy: '9% annual statutory interest assessed on unpaid claims past 30 days. Payer must provide written notice of recoupment with right to appeal within 18 months.'
    }
  }
];

export const CPT_PARITY_BENCHMARKS: CptParityBenchmark[] = [
  {
    cptCode: '22633',
    procedureTitle: 'Combined Posterior Lumbar Interbody & Posterolateral Arthrodesis (Single Level)',
    specialty: 'Orthopedic Spine Surgery / Neurosurgery',
    workRvu: 26.50,
    peRvu: 21.32,
    mpRvu: 3.84,
    totalNationalRvu: 51.66,
    nationalMedicareRate: 1719.63, // 51.66 * 33.2875
    typicalCommercialMultiplierRange: [1.95, 2.45],
    payerExploits: {
      exploitName: 'Interbody Cage Unbundling & Silent PPO Leasing Downcoding',
      mechanism: 'Payer re-prices claim through an uncontracted third-party repricer (MultiPlan / Viant) at 110% of Medicare, or unbundles interbody add-on CPT 22853.',
      clawbackVulnerability: 'Commercial insurer issues a retroactive recoupment demand 14 months post-payment asserting the arthrodesis required prior auth for interbody cage hardware.',
      sovereignLegalDefense: 'Invoke ERISA § 502(a) and state prompt pay recoupment statute of limitations. Challenge silent PPO re-pricing as an unapproved contract breach.'
    }
  },
  {
    cptCode: '33533',
    procedureTitle: 'Coronary Artery Bypass Graft (CABG), Single Arterial Graft',
    specialty: 'Cardiothoracic Surgery',
    workRvu: 30.12,
    peRvu: 22.84,
    mpRvu: 3.88,
    totalNationalRvu: 56.84,
    nationalMedicareRate: 1892.06, // 56.84 * 33.2875
    typicalCommercialMultiplierRange: [2.10, 2.65],
    payerExploits: {
      exploitName: 'Surgical Assistant Downgrade & Global Period Squeeze',
      mechanism: 'Payer denies co-surgeon modifier -62 or assistant surgeon modifier -80, or bundles saphenous vein harvest (35572) into primary sternotomy CABG.',
      clawbackVulnerability: 'Payer algorithm recalculates allowable based on general vascular bypass rather than thoracic cardiovascular open surgery schedule.',
      sovereignLegalDefense: 'Submit CMS NCCI Policy Manual Chapter XI Section B documentation proving separate operative team harvesting and sternal closure.'
    }
  },
  {
    cptCode: '61697',
    procedureTitle: 'Complex Skull Base / Intracranial Aneurysm Clipping (> 15mm, Anterior Circulation)',
    specialty: 'Cerebrovascular Neurosurgery',
    workRvu: 53.40,
    peRvu: 36.10,
    mpRvu: 6.92,
    totalNationalRvu: 96.42,
    nationalMedicareRate: 3209.58, // 96.42 * 33.2875
    typicalCommercialMultiplierRange: [2.25, 2.90],
    payerExploits: {
      exploitName: 'Operating Microscope (69990) & Craniectomy Bundling',
      mechanism: 'Commercial claims scrubber bundles operating microscope CPT 69990 and skull base osteotomy into the primary craniotomy code, slashing professional reimbursement.',
      clawbackVulnerability: 'Post-payment RAC-style audit claiming the aneurysm neck dissection was standard elective micro-dissection without skull base invasion.',
      sovereignLegalDefense: 'Cite AMA CPT Assistant precedent recognizing 69990 standalone reporting for 61697 and operative notes detailing anterior clinoidectomy and optic nerve unroofing.'
    }
  },
  {
    cptCode: '44140',
    procedureTitle: 'Partial Colectomy with End-to-End Anastomosis (Open)',
    specialty: 'Colorectal & General Surgery',
    workRvu: 20.80,
    peRvu: 14.70,
    mpRvu: 2.95,
    totalNationalRvu: 38.45,
    nationalMedicareRate: 1279.90, // 38.45 * 33.2875
    typicalCommercialMultiplierRange: [1.85, 2.30],
    payerExploits: {
      exploitName: 'Laparoscopic Downcoding & Mobilization of Splenic Flexure Disallowance',
      mechanism: 'Payer rejects add-on CPT 44139 (mobilization of splenic flexure) claiming it is inherent to partial colectomy under internal clinical guidelines.',
      clawbackVulnerability: 'Automated payer software re-categorizes emergent diverticular abscess perforation as elective outpatient colectomy.',
      sovereignLegalDefense: 'Substantiate operative report showing anatomical splenic flexure mobilization past the inferior mesenteric vein with separate documentation of operative time.'
    }
  },
  {
    cptCode: '93458',
    procedureTitle: 'Left Heart Catheterization with Coronary Angiography & Left Ventriculography',
    specialty: 'Interventional Cardiology',
    workRvu: 4.85,
    peRvu: 22.40,
    mpRvu: 2.20,
    totalNationalRvu: 29.45,
    nationalMedicareRate: 980.32, // 29.45 * 33.2875
    typicalCommercialMultiplierRange: [1.85, 2.35],
    payerExploits: {
      exploitName: 'Therapeutic Stenting Unbundling Scrub (PXDX Rule)',
      mechanism: 'Payer algorithmic rule bundles diagnostic cardiac cath 93458 into concurrent PCI stent 92928, stripping Modifier -XU.',
      clawbackVulnerability: 'Commercial payer demands full refund of diagnostic catheterization 11 months later, citing NCCI edits.',
      sovereignLegalDefense: 'Enforce CMS NCCI Policy Manual Chapter XI Section E establishing that diagnostic angiography preceding an intervention on a separate lesion is 100% separately payable with Modifier -XU.'
    }
  }
];

export const PAYER_ARBITRAGE_PROFILES: PayerArbitrageProfile[] = [
  {
    id: 'uhc-optum',
    payerName: 'UnitedHealthcare / Optum Commercial',
    payerCategory: 'Commercial Major Medical / PPO',
    nationalMarketShare: '15.4% National Commercial Share',
    typicalSettlementRateOfMedicare: 1.38, // Unilaterally defaults to ~138% when unmonitored
    underpaymentPattern: 'Automated claim edits downgrade surgical modifier -22 and route out-of-network claims to Shared Savings repricers at 110% of Medicare.',
    silentPpoLeasingNotice: 'Frequently leases secondary discount networks (MultiPlan, Beech Street) without sending statutory 30-day provider election notices.'
  },
  {
    id: 'aetna-cvs',
    payerName: 'Aetna Commercial / CVS Health',
    payerCategory: 'Commercial PPO / Open Choice',
    nationalMarketShare: '11.8% National Commercial Share',
    typicalSettlementRateOfMedicare: 1.42,
    underpaymentPattern: 'Applies proprietary Clinical Policy Bulletins (CPBs) to deny surgical add-on codes and enforce post-payment clawbacks through Optum/HMS audits.',
    silentPpoLeasingNotice: 'Utilizes Cofinity and First Health networks to apply unauthorized secondary fee reductions.'
  },
  {
    id: 'cigna-healthcare',
    payerName: 'Cigna Healthcare Commercial',
    payerCategory: 'Commercial Open Access / PPO',
    nationalMarketShare: '9.6% National Commercial Share',
    typicalSettlementRateOfMedicare: 1.40,
    underpaymentPattern: 'PXDX algorithmic review system batch-denies diagnostic catheterization, surgical assistant modifiers, and non-emergent telemetry.',
    silentPpoLeasingNotice: 'Enforces 180-day arbitrary appeal deadlines that conflict with federal ERISA 180-day post-denial minimums.'
  },
  {
    id: 'anthem-elevance',
    payerName: 'Elevance Health / Anthem BCBS',
    payerCategory: 'Commercial PPO / National BlueCard',
    nationalMarketShare: '13.2% National Commercial Share',
    typicalSettlementRateOfMedicare: 1.45,
    underpaymentPattern: 'Out-of-state BlueCard claims systematically re-priced using home plan local schedules, resulting in severe cross-state underpayments.',
    silentPpoLeasingNotice: 'Applies unilateral fee schedule modifications without giving required 90-day contractual notice to independent surgical practices.'
  },
  {
    id: 'humana-commercial',
    payerName: 'Humana Commercial',
    payerCategory: 'Commercial PPO / ChoiceCare',
    nationalMarketShare: '6.5% National Commercial Share',
    typicalSettlementRateOfMedicare: 1.36,
    underpaymentPattern: 'Carelon third-party utilization algorithms deny concurrent surgical care and downcode inpatient admissions to observation status.',
    silentPpoLeasingNotice: 'Imposes automated recoupments on subsequent clean claims without providing statutory explanation of overpayment.'
  }
];
