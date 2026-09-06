#!/usr/bin/env python3
"""
Generate a 5-slide 1080x1350 (4:5 vertical) LinkedIn Carousel for Aethera Healthcare Solutions:
"The Anatomy of a Clean Claim in 2026: Why 14% of Medical Claims Get Denied (And How to Fix It)"

Outputs:
  - public/brand/carousel/slide_1.png ... slide_5.png
  - public/brand/carousel/anatomy_of_a_clean_claim_2026.pdf
  - Copied to agent brain artifacts for immediate visual preview.
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

# ---------------------------------------------------------
# SLIDE 1: Cover Slide (Dark Navy)
# ---------------------------------------------------------
def make_slide_1():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    # Eyebrow Pill
    draw_rounded_card(draw, (70, 180, 520, 230), radius=25, fill="#002868", outline="#00BFA5", width=2)
    eyebrow_font = get_font(20, bold=True)
    draw.text((95, 193), "REVENUE CYCLE BRIEFING • 2026", fill="#00BFA5", font=eyebrow_font)

    # Title
    title_font = get_font(66, bold=True)
    title_lines = [
        "Why 14% of",
        "Medical Claims",
        "Get Denied on",
        "First Submission"
    ]
    y = 280
    for line in title_lines:
        draw.text((70, y), line, fill="#FFFFFF", font=title_font)
        y += 82

    # Highlight accent bar
    draw.rectangle((70, y + 10, 220, y + 16), fill="#00BFA5")
    y += 45

    # Subtitle
    sub_font = get_font(30, bold=False)
    sub_text = "And the exact 4-step protocol leading specialty practices and surgery centers use to lock in a 99.1% clean pass rate."
    for line in wrap_text(sub_text, sub_font, W - 140, draw):
        draw.text((70, y), line, fill="#94A3B8", font=sub_font)
        y += 44

    # 3 Stat Cards Container
    y_card = 820
    card_w = (W - 140 - 40) // 3
    stats = [
        ("99.1%", "Clean Claim Rate"),
        ("<32", "Days in A/R"),
        ("10,600+", "Payer EDI Rules")
    ]
    for i, (val, lbl) in enumerate(stats):
        x0 = 70 + i * (card_w + 20)
        x1 = x0 + card_w
        draw_rounded_card(draw, (x0, y_card, x1, y_card + 200), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        v_font = get_font(44, bold=True)
        draw.text((x0 + 24, y_card + 35), val, fill="#00BFA5", font=v_font)
        l_font = get_font(22, bold=False)
        for l_line in wrap_text(lbl, l_font, card_w - 48, draw):
            draw.text((x0 + 24, y_card + 100), l_line, fill="#E2E8F0", font=l_font)

    draw_footer(draw, text="SWIPE TO AUDIT", show_arrow=True, is_dark_bg=True)
    return img

# ---------------------------------------------------------
# SLIDE 2: The Bottleneck (Light Theme)
# ---------------------------------------------------------
def make_slide_2():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=False)

    # Eyebrow
    draw.text((70, 180), "THE BOTTLENECK", fill="#003087", font=get_font(20, bold=True))

    # Headline
    h_font = get_font(52, bold=True)
    draw.text((70, 220), "Payers Have Weaponized", fill="#001A52", font=h_font)
    draw.text((70, 285), "Automated Denial Engines", fill="#001A52", font=h_font)

    # Body
    b_font = get_font(28, bold=False)
    b_text = "Commercial payers and Medicare Advantage plans no longer use manual examiners to review initial claims. They deploy algorithmic front-end filters designed to reject claims for micro-discrepancies."
    y = 380
    for line in wrap_text(b_text, b_font, W - 140, draw):
        draw.text((70, y), line, fill="#475569", font=b_font)
        y += 42

    # Stat Card (Red Accent)
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

    # Secondary Insight Card
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

# ---------------------------------------------------------
# SLIDE 3: Top 3 Submission Errors (Light Theme)
# ---------------------------------------------------------
def make_slide_3():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=False)

    # Eyebrow
    draw.text((70, 180), "CLAIM AUDIT FINDINGS", fill="#003087", font=get_font(20, bold=True))

    # Headline
    h_font = get_font(52, bold=True)
    draw.text((70, 220), "The 3 Errors Driving 78% of", fill="#001A52", font=h_font)
    draw.text((70, 285), "Avoidable Claim Rejections", fill="#001A52", font=h_font)

    errors = [
        (
            "01",
            "Inverted Modifiers & Procedural Unbundling",
            "Improperly using Modifier 59 instead of distinct procedural modifiers (XE, XP, XS, XU) or failing to append Modifier 25 with clear E/M documentation separation.",
            "#E11D48"
        ),
        (
            "02",
            "Stale Eligibility & Benefit Coordination",
            "Secondary crossover claims submitted with outdated copay/deductible accumulators or mismatched policyholder IDs, triggering instant CO-22 / CO-27 denials.",
            "#D97706"
        ),
        (
            "03",
            "Missing NDC Unit Qualifiers on Specialty Drugs",
            "Failing to convert 10-digit NDC packaging to mandatory 11-digit format with exact unit measurement qualifiers (UN, ML, GR, F2) on high-cost injectables.",
            "#2563EB"
        )
    ]

    y_card = 390
    card_h = 220
    for num, title, desc, tag_color in errors:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
        # Number badge
        draw_rounded_card(draw, (100, y_card + 30, 160, y_card + 90), radius=12, fill=tag_color, outline=None)
        draw.text((115, y_card + 42), num, fill="#FFFFFF", font=get_font(28, bold=True))
        # Title
        draw.text((185, y_card + 40), title, fill="#001A52", font=get_font(26, bold=True))
        # Desc
        y_text = y_card + 100
        for line in wrap_text(desc, get_font(22, bold=False), W - 240, draw):
            draw.text((105, y_text), line, fill="#475569", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 30

    draw_footer(draw, text="SWIPE FOR THE FIX", show_arrow=True, is_dark_bg=False)
    return img

# ---------------------------------------------------------
# SLIDE 4: The 4-Step Protocol (Dark Midnight Theme)
# ---------------------------------------------------------
def make_slide_4():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    # Eyebrow
    draw.text((70, 180), "THE AETHERA PROTOCOL", fill="#00BFA5", font=get_font(20, bold=True))

    # Headline
    h_font = get_font(52, bold=True)
    draw.text((70, 220), "How We Achieve a 99.1%", fill="#FFFFFF", font=h_font)
    draw.text((70, 285), "Clean-Claim Pass Rate", fill="#00BFA5", font=h_font)

    steps = [
        (
            "Step 1: Pre-Submission 277CA Scrubbing",
            "Every claim is scrubbed against 10,600+ payer EDI specifications, NCCI PTP edits, and MUE thresholds before file transmission."
        ),
        (
            "Step 2: Sub-Specialty Certified Coders",
            "Complex operative and diagnostic charts are reviewed by AAPC/AHIMA certified coders who specialize strictly in your medical domain."
        ),
        (
            "Step 3: Real-Time Timely Filing Watchdog",
            "Automated countdown monitors prevent claims from quietly expiring past aggressive 45-day commercial filing windows."
        ),
        (
            "Step 4: Algorithmic Root-Cause Overturn Dossiers",
            "Pattern-level appeal packages overturn CARC 16, CO-45, and PR-204 rejections within 72 hours of remittance."
        )
    ]

    y_card = 390
    card_h = 175
    for title, desc in steps:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        # Checkmark icon dot
        draw.ellipse((105, y_card + 32, 135, y_card + 62), fill="#00BFA5")
        draw.line([(113, y_card + 47), (118, y_card + 53), (128, y_card + 40)], fill="#001A52", width=3)
        # Title
        draw.text((155, y_card + 32), title, fill="#FFFFFF", font=get_font(26, bold=True))
        # Desc
        y_text = y_card + 78
        for line in wrap_text(desc, get_font(22, bold=False), W - 230, draw):
            draw.text((105, y_text), line, fill="#94A3B8", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 24

    draw_footer(draw, text="SWIPE FOR FREE PILOT", show_arrow=True, is_dark_bg=True)
    return img

# ---------------------------------------------------------
# SLIDE 5: Call to Action (Clean High-Impact Card)
# ---------------------------------------------------------
def make_slide_5():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=False)

    # Eyebrow
    draw.text((70, 180), "TAKE ACTION", fill="#003087", font=get_font(20, bold=True))

    # Headline
    h_font = get_font(52, bold=True)
    draw.text((70, 220), "Stop Leaving 7% to 14% of", fill="#001A52", font=h_font)
    draw.text((70, 285), "Reimbursement on the Table", fill="#001A52", font=h_font)

    # Pilot Offer Box
    y_box = 380
    draw_rounded_card(draw, (70, y_box, W - 70, y_box + 390), radius=20, fill="#001A52", outline="#003087", width=2)
    # Badge inside box
    draw_rounded_card(draw, (110, y_box + 35, 470, y_box + 80), radius=20, fill="#00BFA5")
    draw.text((130, y_box + 44), "NO COST • ZERO COMMITMENT", fill="#001A52", font=get_font(18, bold=True))

    draw.text((110, y_box + 110), "Free 50-Claim Denial Recovery Pilot", fill="#FFFFFF", font=get_font(34, bold=True))
    box_desc = "Submit 50 of your recent denied or aging claims. Our senior certified auditors will scrub them, identify root causes, and present an itemized cash-recovery plan."
    y_bd = y_box + 175
    for line in wrap_text(box_desc, get_font(24, bold=False), W - 220, draw):
        draw.text((110, y_bd), line, fill="#94A3B8", font=get_font(24, bold=False))
        y_bd += 36

    # Bullet points
    draw.text((110, y_box + 290), "• 100% HIPAA Compliant & BAA Protected", fill="#E2E8F0", font=get_font(22, bold=True))
    draw.text((110, y_box + 330), "• Receive your detailed audit findings within 5 business days", fill="#E2E8F0", font=get_font(22, bold=True))

    # Links Section
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
        # Draw clean vector arrow
        draw_arrow(draw, W - 140, y_lc + 46, length=28, color=color, width=4)
        y_lc += 112

    draw_footer(draw, text="VISIT AETHERAHEALTHCARE.COM", show_arrow=False, is_dark_bg=False)
    return img

def main():
    out_dir = "public/brand/carousel"
    os.makedirs(out_dir, exist_ok=True)

    print("Generating Slide 1...")
    s1 = make_slide_1()
    s1.save(os.path.join(out_dir, "slide_1.png"), quality=95)

    print("Generating Slide 2...")
    s2 = make_slide_2()
    s2.save(os.path.join(out_dir, "slide_2.png"), quality=95)

    print("Generating Slide 3...")
    s3 = make_slide_3()
    s3.save(os.path.join(out_dir, "slide_3.png"), quality=95)

    print("Generating Slide 4...")
    s4 = make_slide_4()
    s4.save(os.path.join(out_dir, "slide_4.png"), quality=95)

    print("Generating Slide 5...")
    s5 = make_slide_5()
    s5.save(os.path.join(out_dir, "slide_5.png"), quality=95)

    # Save as multi-page PDF document
    pdf_path = os.path.join(out_dir, "anatomy_of_a_clean_claim_2026.pdf")
    print(f"Generating PDF Carousel at {pdf_path}...")
    s1.save(
        pdf_path,
        "PDF",
        resolution=100.0,
        save_all=True,
        append_images=[s2, s3, s4, s5]
    )

    # Copy to artifacts directory
    artifact_dir = "/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c"
    for i in range(1, 6):
        src = os.path.join(out_dir, f"slide_{i}.png")
        dst = os.path.join(artifact_dir, f"linkedin_carousel_slide_{i}.png")
        shutil.copyfile(src, dst)

    shutil.copyfile(pdf_path, os.path.join(artifact_dir, "linkedin_carousel_clean_claim.pdf"))
    print("All slides and PDF generated and copied successfully!")

if __name__ == "__main__":
    main()
