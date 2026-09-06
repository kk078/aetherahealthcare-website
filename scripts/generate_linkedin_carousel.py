#!/usr/bin/env python3
"""
Generate publication-grade 5-slide 1080x1350 (4:5 vertical) LinkedIn Carousels
for Aethera Healthcare Solutions:

1. clean_claim: "The Anatomy of a Clean Claim in 2026"
2. hcc_v28: "CMS-HCC Model v28: The 2,294 ICD-10 Codes Dropped From Risk Adjustment"
3. biller_transition: "The 30-Day Biller Departure Playbook"
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

W = 1080
H = 1350

FONT_PATH_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_PATH_REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def get_font(size, bold=False):
    path = FONT_PATH_BOLD if bold else FONT_PATH_REGULAR
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_rounded_card(draw, box, radius=20, fill="#FFFFFF", outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def draw_arrow(draw, x, y, length=24, color="#00BFA5", width=3):
    draw.line([(x, y), (x + length, y)], fill=color, width=width)
    draw.line([(x + length - 8, y - 7), (x + length, y)], fill=color, width=width)
    draw.line([(x + length - 8, y + 7), (x + length, y)], fill=color, width=width)

def paste_logo(img, is_dark_bg=True, y=70):
    logo_file = "public/brand/logo-white-1600x480.png" if is_dark_bg else "public/brand/logo-1600x480.png"
    if os.path.exists(logo_file):
        logo = Image.open(logo_file).convert("RGBA")
        target_h = 44
        target_w = int(logo.width * (target_h / logo.height))
        logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.paste(logo_resized, (70, y), logo_resized)
        return target_w
    return 0

def draw_header(img, draw, slide_num, total_slides=5, is_dark_bg=True):
    paste_logo(img, is_dark_bg=is_dark_bg, y=70)
    counter_font = get_font(22, bold=True)
    counter_text = f"0{slide_num} / 0{total_slides}"
    c_color = "#94A3B8" if is_dark_bg else "#64748B"
    bbox = draw.textbbox((0, 0), counter_text, font=counter_font)
    draw.text((W - 70 - (bbox[2] - bbox[0]), 80), counter_text, fill=c_color, font=counter_font)

def draw_footer(draw, text="SWIPE", show_arrow=True, is_dark_bg=True):
    font = get_font(22, bold=True)
    c_color = "#00BFA5" if is_dark_bg else "#003087"
    line_color = "#1E293B" if is_dark_bg else "#E2E8F0"
    draw.line([(70, H - 90), (W - 70, H - 90)], fill=line_color, width=2)
    brand_font = get_font(20, bold=False)
    draw.text((70, H - 65), "Aethera Healthcare Solutions • RCM Intelligence", fill="#64748B" if not is_dark_bg else "#94A3B8", font=brand_font)
    
    if show_arrow:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        x_text = W - 70 - text_w - 36
        draw.text((x_text, H - 65), text, fill=c_color, font=font)
        draw_arrow(draw, W - 70 - 24, H - 53, length=24, color=c_color, width=3)
    else:
        bbox = draw.textbbox((0, 0), text, font=font)
        draw.text((W - 70 - (bbox[2] - bbox[0]), H - 65), text, fill=c_color, font=font)


# =========================================================
# CAROUSEL 1: THE ANATOMY OF A CLEAN CLAIM
# =========================================================
def make_c1_s1():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    draw_rounded_card(draw, (70, 180, 520, 230), radius=25, fill="#002868", outline="#00BFA5", width=2)
    draw.text((95, 193), "REVENUE CYCLE BRIEFING • 2026", fill="#00BFA5", font=get_font(20, bold=True))

    title_lines = ["Why 14% of", "Medical Claims", "Get Denied on", "First Submission"]
    y = 280
    for line in title_lines:
        draw.text((70, y), line, fill="#FFFFFF", font=get_font(66, bold=True))
        y += 82

    draw.rectangle((70, y + 10, 220, y + 16), fill="#00BFA5")
    y += 45

    sub_text = "And the exact 4-step protocol leading specialty practices and surgery centers use to lock in a 99.1% clean pass rate."
    for line in wrap_text(sub_text, get_font(30, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#94A3B8", font=get_font(30, bold=False))
        y += 44

    y_card = 820
    card_w = (W - 140 - 40) // 3
    stats = [("99.1%", "Clean Claim Rate"), ("<32", "Days in A/R"), ("10,600+", "Payer EDI Rules")]
    for i, (val, lbl) in enumerate(stats):
        x0 = 70 + i * (card_w + 20)
        x1 = x0 + card_w
        draw_rounded_card(draw, (x0, y_card, x1, y_card + 200), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.text((x0 + 24, y_card + 35), val, fill="#00BFA5", font=get_font(44, bold=True))
        for l_line in wrap_text(lbl, get_font(22, bold=False), card_w - 48, draw):
            draw.text((x0 + 24, y_card + 100), l_line, fill="#E2E8F0", font=get_font(22, bold=False))

    draw_footer(draw, text="SWIPE TO AUDIT", show_arrow=True, is_dark_bg=True)
    return img

def make_c1_s2():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=False)

    draw.text((70, 180), "THE BOTTLENECK", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Payers Have Weaponized", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Automated Denial Engines", fill="#001A52", font=get_font(52, bold=True))

    b_text = "Commercial payers and Medicare Advantage plans no longer use manual examiners to review initial claims. They deploy algorithmic front-end filters designed to reject claims for micro-discrepancies."
    y = 380
    for line in wrap_text(b_text, get_font(28, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#475569", font=get_font(28, bold=False))
        y += 42

    y_card = y + 40
    draw_rounded_card(draw, (70, y_card, W - 70, y_card + 280), radius=20, fill="#FFF1F2", outline="#FDA4AF", width=2)
    draw.rectangle((70, y_card, 82, y_card + 280), fill="#E11D48")
    draw.text((115, y_card + 35), "$118,000", fill="#BE123C", font=get_font(64, bold=True))
    draw.text((115, y_card + 115), "Average Annual Lost Revenue per Full-Time Physician", fill="#1E293B", font=get_font(28, bold=True))
    stat_desc = "Trapped in unworked denials, write-offs, and expired timely filing windows due to billing team fatigue. (Source: HFMA & MGMA Practice Benchmarks)"
    y_sd = y_card + 165
    for line in wrap_text(stat_desc, get_font(22, bold=False), W - 230, draw):
        draw.text((115, y_sd), line, fill="#475569", font=get_font(22, bold=False))
        y_sd += 32

    y_card2 = y_card + 315
    draw_rounded_card(draw, (70, y_card2, W - 70, y_card2 + 150), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((105, y_card2 + 25), "65% of Denied Claims Are Never Resubmitted", fill="#001A52", font=get_font(26, bold=True))
    c2_desc = "Internal teams spend over 40% of their day on basic charge entry and hold times, leaving complex overturns and appeals completely untouched."
    y_c2 = y_card2 + 65
    for line in wrap_text(c2_desc, get_font(21, bold=False), W - 210, draw):
        draw.text((105, y_c2), line, fill="#64748B", font=get_font(21, bold=False))
        y_c2 += 30

    draw_footer(draw, text="SWIPE FOR TOP ERRORS", show_arrow=True, is_dark_bg=False)
    return img

def make_c1_s3():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=False)

    draw.text((70, 180), "CLAIM AUDIT FINDINGS", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "The 3 Errors Driving 78% of", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Avoidable Claim Rejections", fill="#001A52", font=get_font(52, bold=True))

    errors = [
        ("01", "Inverted Modifiers & Procedural Unbundling", "Improperly using Modifier 59 instead of distinct procedural modifiers (XE, XP, XS, XU) or failing to append Modifier 25 with clear E/M documentation separation.", "#E11D48"),
        ("02", "Stale Eligibility & Benefit Coordination", "Secondary crossover claims submitted with outdated copay/deductible accumulators or mismatched policyholder IDs, triggering instant CO-22 / CO-27 denials.", "#D97706"),
        ("03", "Missing NDC Unit Qualifiers on Specialty Drugs", "Failing to convert 10-digit NDC packaging to mandatory 11-digit format with exact unit measurement qualifiers (UN, ML, GR, F2) on high-cost injectables.", "#2563EB")
    ]
    y_card = 390
    card_h = 220
    for num, title, desc, tag_color in errors:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw_rounded_card(draw, (100, y_card + 30, 160, y_card + 90), radius=12, fill=tag_color, outline=None)
        draw.text((115, y_card + 42), num, fill="#FFFFFF", font=get_font(28, bold=True))
        draw.text((185, y_card + 40), title, fill="#001A52", font=get_font(26, bold=True))
        y_text = y_card + 100
        for line in wrap_text(desc, get_font(22, bold=False), W - 240, draw):
            draw.text((105, y_text), line, fill="#475569", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 30

    draw_footer(draw, text="SWIPE FOR THE FIX", show_arrow=True, is_dark_bg=False)
    return img

def make_c1_s4():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    draw.text((70, 180), "THE AETHERA PROTOCOL", fill="#00BFA5", font=get_font(20, bold=True))
    draw.text((70, 220), "How We Achieve a 99.1%", fill="#FFFFFF", font=get_font(52, bold=True))
    draw.text((70, 285), "Clean-Claim Pass Rate", fill="#00BFA5", font=get_font(52, bold=True))

    steps = [
        ("Step 1: Pre-Submission 277CA Scrubbing", "Every claim is scrubbed against 10,600+ payer EDI specifications, NCCI PTP edits, and MUE thresholds before file transmission."),
        ("Step 2: Sub-Specialty Certified Coders", "Complex operative and diagnostic charts are reviewed by AAPC/AHIMA certified coders who specialize strictly in your medical domain."),
        ("Step 3: Real-Time Timely Filing Watchdog", "Automated countdown monitors prevent claims from quietly expiring past aggressive 45-day commercial filing windows."),
        ("Step 4: Algorithmic Root-Cause Overturn Dossiers", "Pattern-level appeal packages overturn CARC 16, CO-45, and PR-204 rejections within 72 hours of remittance.")
    ]
    y_card = 390
    card_h = 175
    for title, desc in steps:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.ellipse((105, y_card + 32, 135, y_card + 62), fill="#00BFA5")
        draw.line([(113, y_card + 47), (118, y_card + 53), (128, y_card + 40)], fill="#001A52", width=3)
        draw.text((155, y_card + 32), title, fill="#FFFFFF", font=get_font(26, bold=True))
        y_text = y_card + 78
        for line in wrap_text(desc, get_font(22, bold=False), W - 230, draw):
            draw.text((105, y_text), line, fill="#94A3B8", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 24

    draw_footer(draw, text="SWIPE FOR FREE PILOT", show_arrow=True, is_dark_bg=True)
    return img

def make_c1_s5():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=False)

    draw.text((70, 180), "TAKE ACTION", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Stop Leaving 7% to 14% of", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Reimbursement on the Table", fill="#001A52", font=get_font(52, bold=True))

    y_box = 380
    draw_rounded_card(draw, (70, y_box, W - 70, y_box + 390), radius=20, fill="#001A52", outline="#003087", width=2)
    draw_rounded_card(draw, (110, y_box + 35, 470, y_box + 80), radius=20, fill="#00BFA5")
    draw.text((130, y_box + 44), "NO COST • ZERO COMMITMENT", fill="#001A52", font=get_font(18, bold=True))

    draw.text((110, y_box + 110), "Free 50-Claim Denial Recovery Pilot", fill="#FFFFFF", font=get_font(34, bold=True))
    box_desc = "Submit 50 of your recent denied or aging claims. Our senior certified auditors will scrub them, identify root causes, and present an itemized cash-recovery plan."
    y_bd = y_box + 175
    for line in wrap_text(box_desc, get_font(24, bold=False), W - 220, draw):
        draw.text((110, y_bd), line, fill="#94A3B8", font=get_font(24, bold=False))
        y_bd += 36

    draw.text((110, y_box + 290), "• 100% HIPAA Compliant & BAA Protected", fill="#E2E8F0", font=get_font(22, bold=True))
    draw.text((110, y_box + 330), "• Receive your detailed audit findings within 5 business days", fill="#E2E8F0", font=get_font(22, bold=True))

    y_links = y_box + 425
    draw.text((70, y_links), "How to get started:", fill="#001A52", font=get_font(28, bold=True))

    link_cards = [
        ("Run Instant Claim Tools", "aetherahealthcare.com/tools", "#003087"),
        ("Book an Executive Strategy Call", "aetherahealthcare.com/schedule", "#00A86B"),
        ("Request Pilot via Email", "aetherahealthcare.com/contact", "#475569"),
    ]
    y_lc = y_links + 45
    for title, url, color in link_cards:
        draw_rounded_card(draw, (70, y_lc, W - 70, y_lc + 95), radius=14, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw.text((100, y_lc + 18), title, fill="#001A52", font=get_font(22, bold=True))
        draw.text((100, y_lc + 52), url, fill=color, font=get_font(20, bold=True))
        draw_arrow(draw, W - 140, y_lc + 46, length=28, color=color, width=4)
        y_lc += 112

    draw_footer(draw, text="VISIT AETHERAHEALTHCARE.COM", show_arrow=False, is_dark_bg=False)
    return img


# =========================================================
# CAROUSEL 2: CMS-HCC MODEL V28 RISK DELTA
# =========================================================
def make_c2_s1():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    draw_rounded_card(draw, (70, 180, 520, 230), radius=25, fill="#002868", outline="#00BFA5", width=2)
    draw.text((95, 193), "MEDICARE ADVANTAGE BRIEFING", fill="#00BFA5", font=get_font(20, bold=True))

    title_lines = ["CMS-HCC Model v28:", "The 2,294 Codes", "Dropped From Risk", "Adjustment"]
    y = 280
    for line in title_lines:
        draw.text((70, y), line, fill="#FFFFFF", font=get_font(64, bold=True))
        y += 82

    draw.rectangle((70, y + 10, 220, y + 16), fill="#00BFA5")
    y += 45

    sub_text = "How the shift from v24 to v28 is reducing RAF scores and benchmark capitation reimbursements across medical groups."
    for line in wrap_text(sub_text, get_font(30, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#94A3B8", font=get_font(30, bold=False))
        y += 44

    y_card = 820
    card_w = (W - 140 - 40) // 3
    stats = [("2,294", "ICD-10 Codes Cut"), ("115", "v28 HCC Categories"), ("100%", "v28 Phase-In by 2026")]
    for i, (val, lbl) in enumerate(stats):
        x0 = 70 + i * (card_w + 20)
        x1 = x0 + card_w
        draw_rounded_card(draw, (x0, y_card, x1, y_card + 200), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.text((x0 + 24, y_card + 35), val, fill="#00BFA5", font=get_font(40, bold=True))
        for l_line in wrap_text(lbl, get_font(22, bold=False), card_w - 48, draw):
            draw.text((x0 + 24, y_card + 100), l_line, fill="#E2E8F0", font=get_font(22, bold=False))

    draw_footer(draw, text="SWIPE TO ANALYZE", show_arrow=True, is_dark_bg=True)
    return img

def make_c2_s2():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=False)

    draw.text((70, 180), "THE REGULATORY SHIFT", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Why CMS Completely", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Overhauled Risk Adjustment", fill="#001A52", font=get_font(52, bold=True))

    b_text = "CMS reclassified the entire Hierarchical Condition Category (HCC) mapping to curb perceived diagnostic upcoding and align weights with actual Medicare Part A & B fee-for-service cost realities."
    y = 380
    for line in wrap_text(b_text, get_font(28, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#475569", font=get_font(28, bold=False))
        y += 42

    y_card = y + 40
    draw_rounded_card(draw, (70, y_card, W - 70, y_card + 260), radius=20, fill="#FFF1F2", outline="#FDA4AF", width=2)
    draw.rectangle((70, y_card, 82, y_card + 260), fill="#E11D48")
    draw.text((115, y_card + 35), "-6.8% to -14.2%", fill="#BE123C", font=get_font(56, bold=True))
    draw.text((115, y_card + 110), "Projected RAF Score Decline on Unadjusted Practices", fill="#1E293B", font=get_font(26, bold=True))
    stat_desc = "Clinics that continue documenting using v24 coding habits will see direct reductions in Medicare Advantage benchmark funding and shared savings distributions."
    y_sd = y_card + 155
    for line in wrap_text(stat_desc, get_font(22, bold=False), W - 230, draw):
        draw.text((115, y_sd), line, fill="#475569", font=get_font(22, bold=False))
        y_sd += 32

    y_card2 = y_card + 295
    draw_rounded_card(draw, (70, y_card2, W - 70, y_card2 + 170), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((105, y_card2 + 25), "From 86 to 115 Payment Categories", fill="#001A52", font=get_font(26, bold=True))
    c2_desc = "While CMS increased total HCC categories to 115, it removed 2,294 non-predictive codes and restructured hierarchical constraints across cardiac, renal, and endocrine conditions."
    y_c2 = y_card2 + 68
    for line in wrap_text(c2_desc, get_font(21, bold=False), W - 210, draw):
        draw.text((105, y_c2), line, fill="#64748B", font=get_font(21, bold=False))
        y_c2 += 30

    draw_footer(draw, text="SWIPE FOR HIT CODES", show_arrow=True, is_dark_bg=False)
    return img

def make_c2_s3():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=False)

    draw.text((70, 180), "CLINICAL FINANCIAL IMPACT", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "The 3 Biggest Clinical Hits", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Under CMS-HCC Model v28", fill="#001A52", font=get_font(52, bold=True))

    hits = [
        ("01", "Uncomplicated Diabetes (E11.9) Dropped", "Previously mapped to HCC 19 (RAF ~0.105). Under v28, diabetes without documented manifestation or chronic complication maps to zero payment HCCs.", "#E11D48"),
        ("02", "Angina Pectoris & Peripheral Vascular Disease", "Angina pectoris codes (I20.9) stripped from vascular HCCs. Peripheral vascular disease weights reduced by over 40% under the new restructured categories.", "#D97706"),
        ("03", "Protein-Calorie Malnutrition Restrictions", "Severe protein-calorie malnutrition criteria heavily constricted to prevent automated EMR templating from generating unverified risk weight.", "#2563EB")
    ]
    y_card = 390
    card_h = 220
    for num, title, desc, tag_color in hits:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw_rounded_card(draw, (100, y_card + 30, 160, y_card + 90), radius=12, fill=tag_color, outline=None)
        draw.text((115, y_card + 42), num, fill="#FFFFFF", font=get_font(28, bold=True))
        draw.text((185, y_card + 40), title, fill="#001A52", font=get_font(26, bold=True))
        y_text = y_card + 100
        for line in wrap_text(desc, get_font(22, bold=False), W - 240, draw):
            draw.text((105, y_text), line, fill="#475569", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 30

    draw_footer(draw, text="SWIPE FOR THE FIX", show_arrow=True, is_dark_bg=False)
    return img

def make_c2_s4():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    draw.text((70, 180), "THE ADAPTATION PLAYBOOK", fill="#00BFA5", font=get_font(20, bold=True))
    draw.text((70, 220), "How Clinicians & Coders", fill="#FFFFFF", font=get_font(52, bold=True))
    draw.text((70, 285), "Must Adapt Documentation", fill="#00BFA5", font=get_font(52, bold=True))

    steps = [
        ("Rule 1: Specify End-Organ Manifestations", "Never document standalone diabetes or hypertension. Explicitly link diabetic chronic kidney disease (E11.22 + N18.3) or neuropathy (E11.40)."),
        ("Rule 2: Enforce MEAT Documentation Criteria", "Every chronic condition billed must have documented evidence of Monitor, Evaluate, Assess, or Treat during the face-to-face encounter."),
        ("Rule 3: Run Model Delta Comparisons (v24 vs v28)", "Calculate dual-model RAF scores across your entire panel to pinpoint patients experiencing artificial revenue drops."),
        ("Rule 4: Certified Risk Adjustment Coders (CRC)", "Deploy AHIMA/AAPC certified CRC coders to conduct pre-encounter chart reviews and identify gaps before claim submission.")
    ]
    y_card = 390
    card_h = 175
    for title, desc in steps:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.ellipse((105, y_card + 32, 135, y_card + 62), fill="#00BFA5")
        draw.line([(113, y_card + 47), (118, y_card + 53), (128, y_card + 40)], fill="#001A52", width=3)
        draw.text((155, y_card + 32), title, fill="#FFFFFF", font=get_font(26, bold=True))
        y_text = y_card + 78
        for line in wrap_text(desc, get_font(22, bold=False), W - 230, draw):
            draw.text((105, y_text), line, fill="#94A3B8", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 24

    draw_footer(draw, text="SWIPE FOR FREE TOOL", show_arrow=True, is_dark_bg=True)
    return img

def make_c2_s5():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=False)

    draw.text((70, 180), "TAKE ACTION", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Model Your Practice's", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "v24 vs v28 RAF Score Delta", fill="#001A52", font=get_font(52, bold=True))

    y_box = 380
    draw_rounded_card(draw, (70, y_box, W - 70, y_box + 390), radius=20, fill="#001A52", outline="#003087", width=2)
    draw_rounded_card(draw, (110, y_box + 35, 470, y_box + 80), radius=20, fill="#00BFA5")
    draw.text((130, y_box + 44), "INTERACTIVE BENCHMARK TOOL", fill="#001A52", font=get_font(18, bold=True))

    draw.text((110, y_box + 110), "Free HCC RAF Calculator & Audit", fill="#FFFFFF", font=get_font(34, bold=True))
    box_desc = "Test your top ICD-10 diagnosis combinations through our interactive calculator to see exact v24 vs v28 weight changes, demographic adjustments, and revenue projections."
    y_bd = y_box + 175
    for line in wrap_text(box_desc, get_font(24, bold=False), W - 220, draw):
        draw.text((110, y_bd), line, fill="#94A3B8", font=get_font(24, bold=False))
        y_bd += 36

    draw.text((110, y_box + 290), "• Instant v24 vs v28 RAF Score Variance Computation", fill="#E2E8F0", font=get_font(22, bold=True))
    draw.text((110, y_box + 330), "• Specialty risk-adjustment documentation playbooks included", fill="#E2E8F0", font=get_font(22, bold=True))

    y_links = y_box + 425
    draw.text((70, y_links), "Access free resources:", fill="#001A52", font=get_font(28, bold=True))

    link_cards = [
        ("Calculate HCC RAF Score Delta", "aetherahealthcare.com/tools/hcc-raf-calculator", "#003087"),
        ("Schedule Risk Adjustment Audit", "aetherahealthcare.com/schedule", "#00A86B"),
        ("Request Documentation Guide", "aetherahealthcare.com/contact", "#475569"),
    ]
    y_lc = y_links + 45
    for title, url, color in link_cards:
        draw_rounded_card(draw, (70, y_lc, W - 70, y_lc + 95), radius=14, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw.text((100, y_lc + 18), title, fill="#001A52", font=get_font(22, bold=True))
        draw.text((100, y_lc + 52), url, fill=color, font=get_font(20, bold=True))
        draw_arrow(draw, W - 140, y_lc + 46, length=28, color=color, width=4)
        y_lc += 112

    draw_footer(draw, text="VISIT AETHERAHEALTHCARE.COM", show_arrow=False, is_dark_bg=False)
    return img


# =========================================================
# CAROUSEL 3: BILLER DEPARTURE PLAYBOOK
# =========================================================
def make_c3_s1():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    draw_rounded_card(draw, (70, 180, 520, 230), radius=25, fill="#002868", outline="#00BFA5", width=2)
    draw.text((95, 193), "PRACTICE OPERATIONS GUIDE", fill="#00BFA5", font=get_font(20, bold=True))

    title_lines = ["The Solo Biller", "Departure Playbook:", "Surviving Staff", "Turnover in 30 Days"]
    y = 280
    for line in title_lines:
        draw.text((70, y), line, fill="#FFFFFF", font=get_font(64, bold=True))
        y += 82

    draw.rectangle((70, y + 10, 220, y + 16), fill="#00BFA5")
    y += 45

    sub_text = "What medical practice administrators must do within the first 30 days to protect cash flow when their in-house biller resigns."
    for line in wrap_text(sub_text, get_font(30, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#94A3B8", font=get_font(30, bold=False))
        y += 44

    y_card = 820
    card_w = (W - 140 - 40) // 3
    stats = [("60-90 Days", "Average Time to Hire"), ("$6,500+", "Recruitment Overhead"), ("14 Days", "Aethera Transition")]
    for i, (val, lbl) in enumerate(stats):
        x0 = 70 + i * (card_w + 20)
        x1 = x0 + card_w
        draw_rounded_card(draw, (x0, y_card, x1, y_card + 200), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.text((x0 + 20, y_card + 35), val, fill="#00BFA5", font=get_font(36, bold=True))
        for l_line in wrap_text(lbl, get_font(22, bold=False), card_w - 40, draw):
            draw.text((x0 + 20, y_card + 100), l_line, fill="#E2E8F0", font=get_font(22, bold=False))

    draw_footer(draw, text="SWIPE FOR THE GUIDE", show_arrow=True, is_dark_bg=True)
    return img

def make_c3_s2():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=False)

    draw.text((70, 180), "WEEK 1 TRIAGE", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Days 1 to 7: Immediate", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Damage Control & Lockdown", fill="#001A52", font=get_font(52, bold=True))

    b_text = "When an in-house biller hands in their notice, 80% of practice knowledge is at risk. Immediate operational triage is required before their last working day."
    y = 380
    for line in wrap_text(b_text, get_font(28, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#475569", font=get_font(28, bold=False))
        y += 42

    steps = [
        ("01", "Audit Clearinghouse 277CA Queues", "Extract every rejected claim that never reached payer adjudication. These claims are quietly aging out of timely filing limits.", "#E11D48"),
        ("02", "Inventory Payer Portal Logins & EDI Enrollment", "Ensure practice leadership has master administrator credentials for Availity, Optum, Medicare Noridian/Novitas, and Medicaid.", "#D97706"),
        ("03", "Pull a Clean A/R Aging Benchmark", "Run a complete aging report segmented by 30/60/90/120+ days to establish baseline accounts receivable before handoff.", "#2563EB")
    ]
    y_card = y + 40
    card_h = 200
    for num, title, desc, tag_color in steps:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw_rounded_card(draw, (100, y_card + 25, 160, y_card + 80), radius=12, fill=tag_color, outline=None)
        draw.text((115, y_card + 35), num, fill="#FFFFFF", font=get_font(26, bold=True))
        draw.text((185, y_card + 33), title, fill="#001A52", font=get_font(25, bold=True))
        y_text = y_card + 90
        for line in wrap_text(desc, get_font(22, bold=False), W - 240, draw):
            draw.text((105, y_text), line, fill="#475569", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 24

    draw_footer(draw, text="SWIPE FOR WEEKS 2-4", show_arrow=True, is_dark_bg=False)
    return img

def make_c3_s3():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=False)

    draw.text((70, 180), "CRITICAL DECISION", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Hire Another In-House Biller", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "vs Partnering with an RCM Team?", fill="#001A52", font=get_font(52, bold=True))

    draw_rounded_card(draw, (70, 380, W // 2 - 20, 980), radius=18, fill="#FFFFFF", outline="#FDA4AF", width=2)
    draw.text((105, 410), "Hiring Replacement", fill="#BE123C", font=get_font(28, bold=True))
    in_house_points = [
        "• 60 to 90 days to recruit & hire",
        "• $55k-$75k salary + benefits",
        "• $6,500+ in recruiting fees",
        "• Single point of failure returns",
        "• Billers rarely certified in complex specialties",
        "• Vacation & sick days halt billing",
    ]
    y_ih = 470
    for pt in in_house_points:
        for line in wrap_text(pt, get_font(21, bold=False), (W // 2 - 20) - 130, draw):
            draw.text((105, y_ih), line, fill="#475569", font=get_font(21, bold=False))
            y_ih += 30
        y_ih += 12

    draw_rounded_card(draw, (W // 2 + 20, 380, W - 70, 980), radius=18, fill="#001A52", outline="#00BFA5", width=2)
    draw.text((W // 2 + 55, 410), "Aethera RCM Partner", fill="#00BFA5", font=get_font(28, bold=True))
    rcm_points = [
        "• 14-day zero-downtime transition",
        "• Performance-based fee (aligned)",
        "• Zero recruitment or staffing risk",
        "• Redundant team of certified coders",
        "• AAPC/AHIMA specialty specialists",
        "• 99.1% clean claim pass rate",
    ]
    y_rcm = 470
    for pt in rcm_points:
        for line in wrap_text(pt, get_font(21, bold=False), (W // 2 - 20) - 130, draw):
            draw.text((W // 2 + 55, y_rcm), line, fill="#E2E8F0", font=get_font(21, bold=False))
            y_rcm += 30
        y_rcm += 12

    draw_footer(draw, text="SWIPE FOR TRANSITION", show_arrow=True, is_dark_bg=False)
    return img

def make_c3_s4():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    draw.text((70, 180), "THE TRANSITION PROTOCOL", fill="#00BFA5", font=get_font(20, bold=True))
    draw.text((70, 220), "Aethera's 14-Day Seamless", fill="#FFFFFF", font=get_font(52, bold=True))
    draw.text((70, 285), "Practice Onboarding Roadmap", fill="#00BFA5", font=get_font(52, bold=True))

    steps = [
        ("Phase 1: Zero-Friction EHR/PM Integration (Day 1-3)", "Direct secure integration with Epic, AthenaHealth, eClinicalWorks, Kareo, ModMed, or AdvancedMD."),
        ("Phase 2: Legacy A/R Cleanout & Stabilization (Day 4-7)", "Our senior recovery team works existing >90-day aging balances so ongoing cash flow never dips."),
        ("Phase 3: Specialty Coding Engine Calibration (Day 8-10)", "Proprietary NCCI, LCD, and payer modifier rule calibration tailored to your exact physician roster."),
        ("Phase 4: Full Autonomous Go-Live (Day 11-14)", "Full-service claim generation, 277CA validation, payment posting, and denial appeals live with bi-weekly executive reporting.")
    ]
    y_card = 390
    card_h = 175
    for title, desc in steps:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.ellipse((105, y_card + 32, 135, y_card + 62), fill="#00BFA5")
        draw.line([(113, y_card + 47), (118, y_card + 53), (128, y_card + 40)], fill="#001A52", width=3)
        draw.text((155, y_card + 32), title, fill="#FFFFFF", font=get_font(26, bold=True))
        y_text = y_card + 78
        for line in wrap_text(desc, get_font(22, bold=False), W - 230, draw):
            draw.text((105, y_text), line, fill="#94A3B8", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 24

    draw_footer(draw, text="SWIPE FOR CONSULTATION", show_arrow=True, is_dark_bg=True)
    return img

def make_c3_s5():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=False)

    draw.text((70, 180), "TAKE ACTION", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Protect Your Practice's", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Cash Flow from Day One", fill="#001A52", font=get_font(52, bold=True))

    y_box = 380
    draw_rounded_card(draw, (70, y_box, W - 70, y_box + 390), radius=20, fill="#001A52", outline="#003087", width=2)
    draw_rounded_card(draw, (110, y_box + 35, 470, y_box + 80), radius=20, fill="#00BFA5")
    draw.text((130, y_box + 44), "ZERO DOWNTIME TRANSITION", fill="#001A52", font=get_font(18, bold=True))

    draw.text((110, y_box + 110), "Book a Confidential Billing Triage Call", fill="#FFFFFF", font=get_font(34, bold=True))
    box_desc = "Facing unexpected staff departures or looking to replace an underperforming billing service? Our practice operations leads will audit your current aging A/R and present a customized 14-day transition roadmap."
    y_bd = y_box + 175
    for line in wrap_text(box_desc, get_font(24, bold=False), W - 220, draw):
        draw.text((110, y_bd), line, fill="#94A3B8", font=get_font(24, bold=False))
        y_bd += 36

    draw.text((110, y_box + 290), "• Zero setup fees • No long-term lock-in contracts", fill="#E2E8F0", font=get_font(22, bold=True))
    draw.text((110, y_box + 330), "• Full HIPAA Business Associate Agreement (BAA) execution", fill="#E2E8F0", font=get_font(22, bold=True))

    y_links = y_box + 425
    draw.text((70, y_links), "Connect with an RCM Director:", fill="#001A52", font=get_font(28, bold=True))

    link_cards = [
        ("Review Practice Transition Playbook", "aetherahealthcare.com/lp/switch-medical-billing", "#003087"),
        ("Schedule a Confidential Strategy Call", "aetherahealthcare.com/schedule", "#00A86B"),
        ("Direct Inquiries via Email", "aetherahealthcare.com/contact", "#475569"),
    ]
    y_lc = y_links + 45
    for title, url, color in link_cards:
        draw_rounded_card(draw, (70, y_lc, W - 70, y_lc + 95), radius=14, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw.text((100, y_lc + 18), title, fill="#001A52", font=get_font(22, bold=True))
        draw.text((100, y_lc + 52), url, fill=color, font=get_font(20, bold=True))
        draw_arrow(draw, W - 140, y_lc + 46, length=28, color=color, width=4)
        y_lc += 112

    draw_footer(draw, text="VISIT AETHERAHEALTHCARE.COM", show_arrow=False, is_dark_bg=False)
    return img


def build_carousel(name, slide_funcs, pdf_filename):
    out_dir = os.path.join("public/brand/carousel", name)
    os.makedirs(out_dir, exist_ok=True)
    images = []

    print(f"\nBuilding Carousel '{name}'...")
    for idx, fn in enumerate(slide_funcs, start=1):
        print(f"  Rendering Slide {idx}...")
        img = fn()
        img.save(os.path.join(out_dir, f"slide_{idx}.png"), quality=95)
        images.append(img)

    pdf_path = os.path.join("public/brand/carousel", pdf_filename)
    print(f"  Exporting multi-page PDF to {pdf_path}...")
    images[0].save(
        pdf_path,
        "PDF",
        resolution=100.0,
        save_all=True,
        append_images=images[1:]
    )

    # Copy to artifacts directory
    artifact_dir = "/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c"
    for idx, img in enumerate(images, start=1):
        dst = os.path.join(artifact_dir, f"{name}_slide_{idx}.png")
        shutil.copyfile(os.path.join(out_dir, f"slide_{idx}.png"), dst)

    shutil.copyfile(pdf_path, os.path.join(artifact_dir, pdf_filename))
    print(f"  Carousel '{name}' built successfully.")


def main():
    os.makedirs("public/brand/carousel", exist_ok=True)

    # 1. Clean Claim Anatomy
    build_carousel(
        "clean_claim",
        [make_c1_s1, make_c1_s2, make_c1_s3, make_c1_s4, make_c1_s5],
        "anatomy_of_a_clean_claim_2026.pdf"
    )

    # 2. CMS-HCC v28 Delta
    build_carousel(
        "hcc_v28",
        [make_c2_s1, make_c2_s2, make_c2_s3, make_c2_s4, make_c2_s5],
        "cms_hcc_v28_dropped_codes_2026.pdf"
    )

    # 3. Solo Biller Departure Playbook
    build_carousel(
        "biller_departure",
        [make_c3_s1, make_c3_s2, make_c3_s3, make_c3_s4, make_c3_s5],
        "solo_biller_departure_playbook_2026.pdf"
    )

    print("\nAll 3 LinkedIn Carousels generated and ready for publishing!")

if __name__ == "__main__":
    main()
