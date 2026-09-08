export interface ToolDefinition {
  href: string; name: string; desc: string; category: 'scrubbers' | 'calculators' | 'edi' | 'assessments'; tag: string; badge?: string;
  reviewStatus: 'needs-review' | 'reviewed'; effectiveDate: string | null; reviewedAt: string | null; reviewer: string | null; sourceUrls: string[];
}
export const TOOLS: ToolDefinition[] = [
  {
    "href": "/tools/pediatric-hirschsprung-pull-through-scrubber",
    "name": "Pediatric Hirschsprung Pull-Through Scrubber",
    "desc": "Audit aganglionic megacolon pull-through procedures (45120/45112), intraoperative leveling biopsies (+44150-59), laparoscopic mobilization (49320-59), and staged diversion (Mod -58).",
    "category": "scrubbers",
    "tag": "Pediatric Surgery & Colorectal",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/head-and-neck-free-flap-scrubber",
    "name": "Head & Neck Free Flap Reconstruction Scrubber",
    "desc": "Audit microvascular fibula (20955) and ALT free flaps (15756), mandibular plating (+21247-59), operating microscope (+69990), neck dissection (+38724-59), and dual-surgeon co-surgery.",
    "category": "scrubbers",
    "tag": "Head & Neck Oncologic Reconstruction",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-tef-ea-scrubber",
    "name": "Pediatric TEF & Esophageal Atresia Scrubber",
    "desc": "Audit neonatal esophageal atresia and tracheoesophageal fistula repairs (43305/43312), rigid bronchoscopy (+31622-59), gastrostomy (+43653-59), and staged Foker elongation (Modifier -58).",
    "category": "scrubbers",
    "tag": "Pediatric Surgery & Neonatology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/diep-flap-reconstruction-scrubber",
    "name": "DIEP Flap Breast Reconstruction Scrubber",
    "desc": "Audit autologous microvascular DIEP breast reconstructions (19364), bilateral reconstruction (19364-50), operating microscope (+69990), ICG angiography (+15860), and venous rescue (35201-59).",
    "category": "scrubbers",
    "tag": "Plastic & Reconstructive Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-sct-coccygectomy-scrubber",
    "name": "Pediatric SCT & Coccygectomy Scrubber",
    "desc": "Audit sacrococcygeal teratoma excision (49220/45120), en-bloc coccygectomy (27075-59), combined abdominoperineal staging (49000-59), and pelvic floor levatorplasty.",
    "category": "scrubbers",
    "tag": "Pediatric Oncology & Neonatal Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/adult-retroperitoneal-sarcoma-scrubber",
    "name": "Adult Retroperitoneal Sarcoma & Multivisceral Scrubber",
    "desc": "Audit radical retroperitoneal sarcoma excision (49203\u201349205), contiguous radical nephrectomy (50240-59), adrenalectomy (60540-59), and IVC replacement (35281-59).",
    "category": "scrubbers",
    "tag": "Surgical Oncology & Multivisceral Resection",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-single-ventricle-norwood-scrubber",
    "name": "Pediatric Single-Ventricle Norwood & Glenn Scrubber",
    "desc": "Audit Stage 1 Norwood arch reconstruction (33619), Sano/BT shunts (33766/33750), branch pulmonary artery angioplasty (+33688), and staged Modifier -58 defenses.",
    "category": "scrubbers",
    "tag": "Pediatric Congenital Cardiac Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/adult-spine-deformity-llif-scrubber",
    "name": "Adult Spine Deformity & Multi-Level LLIF Scrubber",
    "desc": "Audit multi-level lateral lumbar interbody fusion (22558, +22552), anterior longitudinal ligament release (ALLR +Mod 22), percutaneous instrumentation (+22842\u2013+22843), and S2AI screws (+22848).",
    "category": "scrubbers",
    "tag": "Minimally Invasive Spine Deformity",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-tpiat-islet-transplant-scrubber",
    "name": "Pediatric TPIAT & Islet Isolation Scrubber",
    "desc": "Audit total pancreatectomy (48155), cGMP clean-room islet isolation (48805), intraportal autotransplantation (+48554), and portal vein catheterization.",
    "category": "scrubbers",
    "tag": "Pediatric Pancreas & Islet Transplant",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/endoscopic-pituitary-odontoid-scrubber",
    "name": "Endoscopic Skull Base Pituitary & Odontoid Scrubber",
    "desc": "Audit transnasal odontoidectomy (61575), transsphenoidal hypophysectomy (61548), vascularized Hadad nasoseptal flaps (+15730), and ENT/Neurosurgery Modifier -62.",
    "category": "scrubbers",
    "tag": "Endoscopic Skull Base & Neurosurgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-mibg-radiopharmaceutical-scrubber",
    "name": "Pediatric Targeted MIBG & Radiopharmaceutical Scrubber",
    "desc": "Audit therapeutic I-131 MIBG administration (79445), HCPCS A9508 isotope invoice pass-through, medical physics consultation (+77336), and autologous stem cell rescue (+38240).",
    "category": "scrubbers",
    "tag": "Pediatric Oncology & Radiopharmaceuticals",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/complex-robotic-hernia-tar-scrubber",
    "name": "Complex Robotic Hernia & TAR Component Separation Scrubber",
    "desc": "Audit modern CPT 2023+ anterior abdominal wall hernia repairs (49591\u201349618), transversus abdominis release (TAR add-on +49622), and retrorectus mesh placement (+49623).",
    "category": "scrubbers",
    "tag": "Abdominal Wall Reconstruction & Robotic Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-biochemical-genetics-scrubber",
    "name": "Pediatric Biochemical Genetics & Metabolic Formula Scrubber",
    "desc": "Audit tandem mass spectrometry amino acid panels (82139/82136), urine organic acids (83918), prolonged visits (+99417), and defend medical formula prior-auth (B4162/B4157).",
    "category": "scrubbers",
    "tag": "Biochemical Genetics & Rare Disease",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/skull-base-bypass-aneurysm-scrubber",
    "name": "Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber",
    "desc": "Audit STA-MCA microvascular bypass (61711), unbundle orbitozygomatic approaches (61592), defend autologous graft harvest (+35500/35600), and capture microscope add-ons (+69990).",
    "category": "scrubbers",
    "tag": "Cerebrovascular & Skull Base",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-dbs-neuromodulation-scrubber",
    "name": "Pediatric DBS & Cranial Neuromodulation Scrubber",
    "desc": "Audit stereotactic lead placement with microelectrode recording (61867/+61868 vs 61863), suppress headframe bundling (20660), defend dual-channel IPGs (61886-59/58), and capture intraoperative neuroprogramming (95983).",
    "category": "scrubbers",
    "tag": "Pediatric Neurosurgery & Neuromodulation",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/panfacial-trauma-reconstruction-scrubber",
    "name": "Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber",
    "desc": "Audit complex midface Le Fort I/II/III repairs (21422\u201321435), ZMC fractures (21365), mandibular plating (21462), intermaxillary fixation bundling (21110-59), and orbital blowout reconstructive implants (21390).",
    "category": "scrubbers",
    "tag": "Craniofacial Trauma & OMFS",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-vascular-malformations-scrubber",
    "name": "Pediatric Vascular Malformations & Sclerotherapy Scrubber",
    "desc": "Audit image-guided sclerotherapy (37241/49185), high-flow AVM embolization (37242), off-label Bleomycin (J9040) appeals, dual imaging (+76937/+77002), and Modifier -58 staging.",
    "category": "scrubbers",
    "tag": "Pediatric IR & Vascular Anomalies",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/orthopedic-oncology-limb-salvage-scrubber",
    "name": "Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber",
    "desc": "Audit radical bone tumor resections (27075/27645), defend modular oncologic mega-prostheses (27599/27299-22), unbundle rotational muscle flaps (15734-59), and recover catastrophic implant invoices.",
    "category": "scrubbers",
    "tag": "Orthopedic Oncology & Sarcoma",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-cdh-ecmo-scrubber",
    "name": "Pediatric CDH & Neonatal ECMO Repair Scrubber",
    "desc": "Audit neonatal CDH repair (39503), defend Gore-Tex patch reconstruction (+49568-59), unbundle VA-ECMO cutdown cannulation (+33946-59), and safeguard staged silo closure (49605-58).",
    "category": "scrubbers",
    "tag": "Pediatric General & Critical Care Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/taaa-fevar-scrubber",
    "name": "Complex Fenestrated/Branched EVAR (FEVAR) & TAAA Scrubber",
    "desc": "Audit multi-vessel visceral aortic endografts (34841-34848), defend open Crawford TAAA resections (33877), unbundle lumbar CSF drainage (62272-59), and coordinate Modifier -62.",
    "category": "scrubbers",
    "tag": "Vascular & Endovascular Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-craniosynostosis-scrubber",
    "name": "Pediatric Cranial Vault Remodeling & Synostosis Scrubber",
    "desc": "Audit fronto-orbital advancement (21175), complex multi-suture CVR (21180), co-surgeon Modifier -62 coordination, split-calvarial bone grafts (20900-59), and helmet DME (L0112).",
    "category": "scrubbers",
    "tag": "Pediatric Craniofacial & Neurosurgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/robotic-urologic-oncology-scrubber",
    "name": "Robotic Urologic Oncology & Complex Reconstructive Scrubber",
    "desc": "Audit robot-assisted radical prostatectomy (55866), defend extended pelvic lymphadenectomy (+38572-59), robotic partial nephrectomy (50543), intracorporeal urinary diversions, and Modifier -22.",
    "category": "scrubbers",
    "tag": "Robotic Urologic Oncology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-eos-scrubber",
    "name": "Pediatric Early-Onset Scoliosis (EOS) & Growing Rod Scrubber",
    "desc": "Audit magnetically controlled growing rods (MCGR), staged surgical lengthenings (22849-58), VEPTR rib distraction, pelvic anchors (+22848), and outpatient distraction clinics.",
    "category": "scrubbers",
    "tag": "Pediatric Orthopedic Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/hipec-scrubber",
    "name": "Cytoreductive Surgery & HIPEC Perfusion Scrubber",
    "desc": "Audit extensive peritonectomy (49205), defend 90-min heated chemoperfusion (+96560), coordinate co-surgeon Modifier -62, and safeguard concomitant bowel resections (44140-51).",
    "category": "scrubbers",
    "tag": "Surgical Oncology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/achd-reoperation-scrubber",
    "name": "Adult Congenital Heart Disease (ACHD) & Fontan Conversion Scrubber",
    "desc": "Scrub complex Fontan conversion (33737), defend redo sternotomy adhesiolysis add-ons (+33530), safeguard concomitant arrhythmia cryoablation Maze (+33257/+33258), and audit pulmonary valve replacements.",
    "category": "scrubbers",
    "tag": "Adult Congenital Cardiac Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-facial-reanimation-scrubber",
    "name": "Pediatric Facial Reanimation & Free Gracilis Scrubber",
    "desc": "Audit dynamic smile reanimation for congenital Moebius syndrome and pediatric facial palsy, staged Modifier -58 on Stage 2 free gracilis transfer (15756), masseteric transposition (64864-51), and +69990.",
    "category": "scrubbers",
    "tag": "Pediatric Craniofacial Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/skull-base-scrubber",
    "name": "Lateral Skull Base & Acoustic Neuroma Co-Surgeon Scrubber",
    "desc": "Audit translabyrinthine and retrosigmoid acoustic neuroma approaches (61526, 61530), validate dual-attending Modifier 62 matching, defend operating microscope (+69990), and secure facial nerve monitoring.",
    "category": "scrubbers",
    "tag": "Skull Base Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-airway-scrubber",
    "name": "Pediatric Laryngotracheal Reconstruction (LTR) Scrubber",
    "desc": "Audit single/double-stage LTR (31587, 31590) and cricotracheal resection (31584), defend autologous costal cartilage rib graft (+20902-59), and safeguard staged surveillance bronchoscopy (Modifier -58).",
    "category": "scrubbers",
    "tag": "Pediatric Otolaryngology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/lvad-cardiac-scrubber",
    "name": "Durable LVAD Implantation & Cardiac Reoperation Scrubber",
    "desc": "Audit durable continuous-flow LVAD implants (33979), defend redo sternotomy add-ons (+33530), validate concomitant tricuspid/aortic valve repairs, and prevent RV failure critical care clawbacks.",
    "category": "scrubbers",
    "tag": "Cardiothoracic Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-epilepsy-scrubber",
    "name": "Pediatric Hemispherotomy & Stereo-EEG Scrubber",
    "desc": "Audit stereo-EEG robotic depth electrode placements (61760), defend cranial neuronavigation (+61781), enforce staged hemispherotomy Modifier -58 compliance, and safeguard continuous video-EEG (95724).",
    "category": "scrubbers",
    "tag": "Pediatric Neurosurgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/vcr-spine-scrubber",
    "name": "Vertebral Column Resection (VCR) & Spine Deformity Scrubber",
    "desc": "Audit 3-column osteotomy (22206/22207), additional vertebral segments (+22208), long-construct arthrodesis (22843/22844), pelvic fixation (+22848), and defend Modifier -62 co-surgeon billing.",
    "category": "scrubbers",
    "tag": "Spine Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-transplant-scrubber",
    "name": "Pediatric Solid Organ Transplant & Intestinal Rehabilitation Scrubber",
    "desc": "Audit STEP enteroplasty (44130), intestinal/liver allotransplantation (44135/47135), defend Worksheet D-4 organ acquisition carve-outs, back-table vascular bench surgery (+44720), and Modifier -24 post-op critical care.",
    "category": "scrubbers",
    "tag": "Pediatric Transplant",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/whipple-resection-scrubber",
    "name": "Whipple Procedure & Pancreatic Resection Scrubber",
    "desc": "Audit classic (48150) vs pylorus-preserving (48153) pancreaticoduodenectomy, defend mesenteric vein reconstruction (+35221), feeding jejunostomies (44010), and Modifier -62 co-surgeons.",
    "category": "scrubbers",
    "tag": "Pancreatic Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-craniofacial-scrubber",
    "name": "Pediatric Craniofacial & Cleft Palate Scrubber",
    "desc": "Audit cleft palatoplasty (42200-42210), midface LeFort I osteotomy (21141), defend bone graft inclusivity, enforce Modifier -58 staged sequencing, and overturn cosmetic denials.",
    "category": "scrubbers",
    "tag": "Pediatric Craniofacial",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/colorectal-exenteration-scrubber",
    "name": "Colorectal Surgery & Pelvic Exenteration Scrubber",
    "desc": "Audit total mesorectal excision (45119/45110), pelvic exenteration (45126), defend protective loop ileostomy unbundling (44320-XE), and validate Modifier -62 co-surgeon billing.",
    "category": "scrubbers",
    "tag": "Colorectal Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-brain-tumor-scrubber",
    "name": "Pediatric Brain Tumor & Intraoperative Monitoring Scrubber",
    "desc": "Audit posterior fossa craniotomy (61518/61520), intraoperative neurophysiological monitoring (95940/95941), defend external ventricular drain unbundling (61107-59), and protect stereotactic neuronavigation add-ons (+61781).",
    "category": "scrubbers",
    "tag": "Pediatric Neurosurgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/hepatobiliary-resection-scrubber",
    "name": "Hepatobiliary Resection & Biliary Reconstruction Scrubber",
    "desc": "Audit extended hepatic trisegmentectomy (47125), lobectomy (47130), defend payer downcoding to partial wedge (47120), safeguard vascular reconstruction (+35221), and unbundle Roux-en-Y biliary reconstruction (47760).",
    "category": "scrubbers",
    "tag": "Hepatobiliary Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-cell-therapy-scrubber",
    "name": "Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber",
    "desc": "Audit autologous CAR-T cell infusions (0540T/Q2042), prior authorization dossiers, severe Cytokine Release Syndrome (CRS) critical care (99291), and restaging lumbar puncture unbundling (96450 vs 38222).",
    "category": "scrubbers",
    "tag": "Pediatric Oncology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/trauma-damage-control-scrubber",
    "name": "Trauma & Open Abdomen Damage Control Scrubber",
    "desc": "Audit staged damage control laparotomy (49000, 49002), secondary fascial closure (13160), bedside vascular access unbundling, and enforce Modifier 58 vs 78 compliance.",
    "category": "scrubbers",
    "tag": "Trauma Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pediatric-pulmonary-estimator",
    "name": "Pediatric Pulmonology, Allergy & CFTR Estimator",
    "desc": "Audit pediatric pulmonary spirometry and plethysmography (94010/94060/94726), prevent unbundling clawbacks, sweat chloride testing (82435), and verify CFTR targeted modulator prior authorizations.",
    "category": "scrubbers",
    "tag": "Pediatric Pulmonology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/cardiothoracic-cannulation-scrubber",
    "name": "Cardiothoracic Bypass & Cannulation Scrubber",
    "desc": "Audit CABG arterial-venous graft combinations (33533 + +33517 add-ons), endoscopic vein harvest (+33508), concomitant valve replacements (33405/33430), and ECMO/ECLS cannulation bundling rules.",
    "category": "scrubbers",
    "tag": "Cardiothoracic",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/scoliosis-deformity-scrubber",
    "name": "Pediatric Scoliosis & Multi-Rod Deformity Scrubber",
    "desc": "Audit spinal deformity arthrodesis (22800, 22802, 22804), prevent payer interspace downcoding, safeguard pelvic fixation (+22848 S2AI screws), and validate multi-level Ponte osteotomy claims.",
    "category": "scrubbers",
    "tag": "Pediatric Orthopedics",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/spine-arthrodesis-scrubber",
    "name": "Spine Arthrodesis & Multi-Level Instrumentation Scrubber",
    "desc": "Audit complex spinal fusions (TLIF 22633, ACDF 22551, ALIF 22558), detect NCCI laminectomy bundling (63047), audit Modifier -62 co-surgery rules, and validate instrumentation & bone graft add-ons.",
    "category": "scrubbers",
    "tag": "Spine Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/urogynecology-scrubber",
    "name": "Urogynecology & Pelvic Floor Reconstruction Scrubber",
    "desc": "Audit sacrocolpopexy (57425) and mid-urethral sling (57288) bundling, prevent routine cystoscopy (52000) unbundling clawbacks, validate POP-Q prolapse staging, and stack multi-channel urodynamics (UDS).",
    "category": "scrubbers",
    "tag": "Urogynecology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/retina-injection-scrubber",
    "name": "Anti-VEGF Intravitreal Injection & Bilateral Scrubber",
    "desc": "Audit anti-VEGF dosage and wastage (Modifiers JW/JZ), calculate Medicare Part B bilateral modifier logic (-50 vs -RT/-LT), and enforce 28-day LCD frequency limits.",
    "category": "scrubbers",
    "tag": "Ophthalmology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/pad-revascularization-scrubber",
    "name": "Endovascular & PAD Revascularization Scrubber",
    "desc": "Enforce CPT vascular territory hierarchy (iliac, fem/pop, tibial/peroneal), suppress bundled angioplasties and catheter placements (36245\u201336248), and audit diagnostic angiography exemptions.",
    "category": "scrubbers",
    "tag": "Vascular Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/cardiac-ep-scrubber",
    "name": "Cardiac Electrophysiology & Catheter Ablation Scrubber",
    "desc": "Audit AFib/VT catheter ablation (93656/93653) bundling against diagnostic EP studies (93619/93620), capture 3D mapping and ICE add-ons, and verify remote telemetry 90-day interval cadence.",
    "category": "scrubbers",
    "tag": "Cardiac EP",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/reconstructive-prior-auth-scrubber",
    "name": "Reconstructive vs Cosmetic Prior-Authorization Scrubber",
    "desc": "Calculate Schnur sliding scale BSA thresholds for breast reduction (19318), audit blepharoplasty visual field criteria (15823), verify panniculectomy indications (15830), and validate federal WHCRA mandates.",
    "category": "scrubbers",
    "tag": "Plastic Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/nicu-critical-care-scrubber",
    "name": "NICU & Pediatric Critical Care Scrubber",
    "desc": "Validate inpatient per-day neonatal critical care codes (CPT 99468\u201399476), weight-banded intensive step-down tiers (99477\u201399480), and scrub out CPT bundled catheterizations (36510/36660) and intubations.",
    "category": "scrubbers",
    "tag": "NICU / PICU",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/rad-onc-scrubber",
    "name": "Radiation Oncology IMRT Bundling & Fraction Scrubber",
    "desc": "Audit IMRT planning (CPT 77301) bundling edits against simulation and dosimetry, compute CPT 77427 weekly treatment management fraction math, and generate ANSI X12 837P claim lines.",
    "category": "scrubbers",
    "tag": "Radiation Oncology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/dialysis-mcp-calculator",
    "name": "Dialysis Monthly Capitation Payment (MCP) Tier Calculator",
    "desc": "Compute physician allowable reimbursement under CPT 90951\u201390962 and 90966, calculate inpatient hospital stay pro-rations, and model downcoding revenue recovery.",
    "category": "calculators",
    "tag": "Nephrology",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/fqhc-pps-scrubber",
    "name": "FQHC PPS Encounter Rate & Same-Day Service Scrubber",
    "desc": "Calculate CMS FQHC PPS encounter rates with GAF geographic adjustments, validate same-day mental health statutory exceptions (Modifier 59/XE), and model Medicaid wrap-around reconciliations.",
    "category": "scrubbers",
    "tag": "FQHC / RHC",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/ambulance-fee-calculator",
    "name": "Ambulance & EMS Fee Schedule Calculator",
    "desc": "Compute Medicare Ambulance Fee Schedule reimbursement for BLS, ALS1, ALS2, and SCT, apply statutory rural mileage multipliers, and validate 2-character origin/destination modifier pairs.",
    "category": "calculators",
    "tag": "Ambulance / EMS",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/moldx-zcode-scrubber",
    "name": "Molecular Diagnostics MolDX\u00ae Z-Code & LCD Scrubber",
    "desc": "Verify DEX Z-Codes and LCD coverage criteria for molecular pathology, next-generation sequencing panels, and PGx under CMS MolDX requirements.",
    "category": "scrubbers",
    "tag": "MolDX",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/ctp-skin-substitute-calculator",
    "name": "Skin Substitute & CTP Wastage Modifier JW / JZ Calculator",
    "desc": "Calculate single-use skin substitute administered vs discarded sq cm, determine mandatory Modifiers JW and JZ, and generate dual-line 837P Loop 2400 snippets.",
    "category": "calculators",
    "tag": "Wound Care",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/critical-care-scrubber",
    "name": "Emergency & Critical Care Time Documentation Scrubber",
    "desc": "Evaluate CPT 99291 and 99292 time thresholds, automatically deduct bedside procedure times, and verify split/shared visit substantive portion rules.",
    "category": "scrubbers",
    "tag": "Critical Care",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/anesthesia-concurrency-auditor",
    "name": "Anesthesia Concurrency & Medical Direction Auditor",
    "desc": "Audit operating room concurrency logs under 42 CFR \u00a7 415.110. Model 1:4 TEFRA direction rules, verify Modifiers QK, QY, QX, QZ, and calculate Modifier AD penalties.",
    "category": "calculators",
    "tag": "Concurrency",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/global-period-scrubber",
    "name": "Surgical Global Period & Post-Op Modifier Scrubber",
    "desc": "Scrub surgical follow-ups against 0-day, 10-day, and 90-day global fee packages under CMS Ch. 12 \u00a7 40.1. Validate Modifiers 24, 58, 78, 79, 54, and 55.",
    "category": "scrubbers",
    "tag": "Global Surgery",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/dmepos-validator",
    "name": "DMEPOS Medical Necessity & Prior Auth Validator",
    "desc": "Validate Medicare DMEPOS claims across Oxygen, CPAP, Mobility Assistive Equipment, and Orthotics. Verify SWO, Face-to-Face timing, and DME MAC jurisdiction routing.",
    "category": "scrubbers",
    "tag": "DMEPOS Rules",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/msp-determination-engine",
    "name": "Medicare Secondary Payer (MSP) Determination Engine",
    "desc": "Evaluate statutory primary vs secondary liability under Section 1862(b) of the Social Security Act across Working Aged, Disability, ESRD 30-mo coordination, and No-Fault/WC.",
    "category": "scrubbers",
    "tag": "MSP Rules",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/clinical-trial-billing",
    "name": "Clinical Trial Billing & Coverage Analysis Scrubber",
    "desc": "Separate Medicare routine care (Modifier Q1 + Z00.6) from sponsor-funded investigational items under CMS NCD 310.1 and FDA IDE Category A/B rules.",
    "category": "scrubbers",
    "tag": "Clinical Trials",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/hcc-raf-calculator",
    "name": "CMS HCC Risk Adjustment & RAF Score Benchmarker",
    "desc": "Model risk score erosion transitioning from CMS-HCC v28 to v24. Estimate Medicare Advantage capitation changes, capture disease interactions, and review MEAT criteria.",
    "category": "calculators",
    "tag": "Risk Adjustment",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/mips-score-forecaster",
    "name": "CMS MIPS Performance Score & Penalty Forecaster",
    "desc": "Forecast MIPS composite scores out of 100 points. Model Part B payment penalties (up to -9.0%) or positive incentive bonuses across Quality, Interoperability, Improvement Activities, and Cost.",
    "category": "calculators",
    "tag": "MIPS QPP",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/denial-overturn-predictor",
    "name": "Denial Appeal Readiness & Review Checklist",
    "desc": "Review documentation for common CARC denials and identify policy references to confirm before appeal.",
    "category": "scrubbers",
    "tag": "Appeal Predictor",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/prompt-pay-statutes",
    "name": "50-State Prompt-Payment Statute & Penalty Matrix",
    "desc": "Look up electronic clean-claim deadlines (15\u201330 days), compute accrued annual interest penalties (12%\u201318%), and generate formal demand notices across 50 states.",
    "category": "calculators",
    "tag": "Prompt Pay",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/underpayment-analyzer",
    "name": "Payer Contract Underpayment & Variance Analyzer",
    "desc": "Calculate silent PPO fee schedule downcoding, compare contracted allowable vs actual paid rates, and compute state prompt-pay statutory interest penalties.",
    "category": "calculators",
    "tag": "Contract Audit",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/payer-dispute-directory",
    "name": "Payer Dispute & Electronic Appeals Directory",
    "desc": "Directory of 16+ national commercial, Medicare Advantage, and Medicaid payers with Level 1 & 2 appeal deadlines, electronic dispute portal URLs, and clearinghouse escalation contacts.",
    "category": "scrubbers",
    "tag": "Appeals",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/prior-auth-matrix",
    "name": "Prior-Auth Requirement & Payer Gold-Card Matrix",
    "desc": "Inspect mandatory prior auth triggers, statutory review SLAs under CMS-0057-F, peer-to-peer deadlines, and state Gold Card exemption rules across 20+ procedures.",
    "category": "scrubbers",
    "tag": "Prior Auth",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/modifier-compliance-engine",
    "name": "Modifier 25 & 59 / X{EPSU} Compliance Engine",
    "desc": "Evaluate same-day E/M visits and surgical unbundling against CMS NCCI guidelines. Generate legal audit-defense attestations and eliminate CARC 97 recoupments.",
    "category": "scrubbers",
    "tag": "Compliance",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/anesthesia-calculator",
    "name": "Anesthesia ASA Unit & Reimbursement Calculator",
    "desc": "Calculate total ASA anesthesia units (Base + 15-Min Time + Physical Modifiers + Qualifying Circumstances) and model CMS medical direction concurrency splits (AA, QZ, QK, QX).",
    "category": "calculators",
    "tag": "Anesthesia RVG",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/platform-telemetry",
    "name": "Browser Performance & Telemetry Measurements",
    "desc": "Measure this browser page load with the Navigation Timing API. Clearinghouse infrastructure is not connected.",
    "category": "assessments",
    "tag": "Telemetry",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/good-faith-estimate-generator",
    "name": "No Surprises Act GFE Generator",
    "desc": "Generate CMS-compliant Good Faith Estimates (45 CFR \u00a7 149.610) for self-pay and uninsured patients with statutory dispute disclaimers and PDF export.",
    "category": "scrubbers",
    "tag": "Compliance",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/patient-liability-estimator",
    "name": "Patient Out-of-Pocket Liability Estimator",
    "desc": "Calculate exact point-of-service patient financial responsibility: remaining deductibles, coinsurance splits, copays, and bad-debt risk indicators.",
    "category": "calculators",
    "tag": "Financial",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/edi-270-271-validator",
    "name": "ANSI X12 270/271 Eligibility Validator",
    "desc": "Decode raw ANSI X12 271 real-time eligibility responses. Parse EB benefit segments, remaining deductibles, and prevent CO-27 eligibility denials.",
    "category": "edi",
    "tag": "EDI Parser",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/edi-837-scrubber",
    "name": "ANSI X12 837 Claim File Scrubber",
    "desc": "Diagnostic syntax scrubber for 837P (Professional) and 837I (Institutional) claims. Catch missing NPIs, invalid modifiers, and prevent 277CA rejections.",
    "category": "edi",
    "tag": "EDI Scrubber",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/practice-benchmark-scorecard",
    "name": "MGMA Practice Health Index & Scorecard",
    "desc": "Benchmark your practice against official MGMA / HFMA standards. Calculate overall Practice Health Score (0\u2013100) and quantify annual recoverable cash lift.",
    "category": "assessments",
    "tag": "Benchmark",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/credentialing-timeline-estimator",
    "name": "Provider Credentialing Timeline Estimator",
    "desc": "Map CAQH, Medicare PECOS, state Medicaid, and commercial payer enrollment timelines to prevent billing freezes for newly hired physicians.",
    "category": "assessments",
    "tag": "Onboarding",
    "badge": "New",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/ncci-claim-scrubber",
    "name": "CMS NCCI Claim Scrubber",
    "desc": "Test CPT code pairs against official CMS PTP bundling rules. Check modifier -25 and -59/-XS indicators to prevent CARC 97 denials.",
    "category": "scrubbers",
    "tag": "Scrubber",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/appeal-letter-generator",
    "name": "Appeal Letter Generator",
    "desc": "Generate legal-grade, formal appeal letters with statutory citations (ERISA, ACA \u00a7 2719, CMS NCCI) for CARC 50, 197, 16, 29, 97, and 22.",
    "category": "scrubbers",
    "tag": "Playbook",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/practice-proposal-wizard",
    "name": "Custom Practice Proposal Wizard",
    "desc": "Build a tailored revenue cycle proposal in 3 minutes. Calculate estimated collections lift, target AR days, and transparent performance pricing.",
    "category": "assessments",
    "tag": "Proposal",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/fee-schedule-benchmarker",
    "name": "Fee Schedule Benchmarker",
    "desc": "Compare your commercial payer reimbursement allowances against 2026 Medicare and regional PPO percentiles to quantify underpayments.",
    "category": "calculators",
    "tag": "Calculator",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/era-835-decoder",
    "name": "835 ERA Remittance Decoder",
    "desc": "Parse raw 835 EDI segments (CLP, CAS, SVC). Translate adjustment reason codes (CO, PR, OA) into clear financial allocations and action items.",
    "category": "edi",
    "tag": "Parser",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/timely-filing-matrix",
    "name": "Multi-Payer Timely Filing Matrix",
    "desc": "Compare initial claim deadlines, corrected claim cutoffs, and appeal windows across 50 state Medicaid programs and commercial PPOs.",
    "category": "scrubbers",
    "tag": "Reference",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/denial-code-lookup",
    "name": "Denial Code Lookup (1,283+ Codes)",
    "desc": "Search CARC/RARC denial codes and get plain-English reasons, how to work each one, and how to prevent it.",
    "category": "scrubbers",
    "tag": "Reference",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/tools/clean-claim-scorecard",
    "name": "Clean-Claim Scorecard",
    "desc": "Score your front-end, coding, and submission workflow against 14 controls \u2014 and see which denials each gap invites.",
    "category": "assessments",
    "tag": "Self-assessment",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/ar-cost-calculator",
    "name": "A/R Days Cost Calculator",
    "desc": "See the cash tied up in slow A/R and the yearly carrying cost of staying above your target days-in-A/R.",
    "category": "calculators",
    "tag": "Calculator",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/timely-filing-calculator",
    "name": "Timely Filing Calculator",
    "desc": "Enter a date of service and the payer filing limit to get the exact submission deadline, days remaining, and a risk flag.",
    "category": "calculators",
    "tag": "Calculator",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/eligibility-checklist",
    "name": "Eligibility & Prior-Auth Checklist",
    "desc": "Score your pre-visit verification against the checks that prevent CO-27, CO-197, and eligibility denials before they happen.",
    "category": "assessments",
    "tag": "Self-assessment",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/denial-cost-calculator",
    "name": "Denial Cost Calculator",
    "desc": "See what denials really cost \u2014 lost reimbursement plus rework \u2014 per week, month, and year, and the combined annual impact.",
    "category": "calculators",
    "tag": "Calculator",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/rvu-calculator",
    "name": "RVU Payment Calculator",
    "desc": "Turn work, PE, and malpractice RVUs into an estimated Medicare allowed amount using GPCI and the conversion factor.",
    "category": "calculators",
    "tag": "Calculator",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": []
  },
  {
    "href": "/tools/payer-provider-manuals",
    "name": "Payer Manual & Policy Finder",
    "desc": "Jump straight to provider manuals, medical/payment policies, credentialing, and eligibility pages for 200+ payers, Medicaid programs, and Medicare MACs.",
    "category": "scrubbers",
    "tag": "Reference",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  },
  {
    "href": "/glossary",
    "name": "Healthcare RCM & Billing Glossary",
    "desc": "Authoritative clinical and financial dictionary covering 30+ core terms: EDI 837/835, NCCI PTP edits, CARC/RARC denial codes, and RVU benchmarks.",
    "category": "scrubbers",
    "tag": "Knowledge Base",
    "reviewStatus": "needs-review",
    "effectiveDate": null,
    "reviewedAt": null,
    "reviewer": null,
    "sourceUrls": [
      "https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits"
    ]
  }
];
