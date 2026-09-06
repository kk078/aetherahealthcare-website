#!/usr/bin/env python3
"""
Generate Carousel #5:
"The 2026 RCM Self-Audit & Decision Matrix"
Interactive Diagnostic Framework for US Healthcare RCM Executives & Billing Company Founders
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

W = 1080
H = 1350

FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def get_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REG
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

def draw_vertical_gradient(img, top_color, bottom_color):
    draw = ImageDraw.Draw(img)
    r1, g1, b1 = top_color
    r2, g2, b2 = bottom_color
    for y in range(H):
        ratio = y / float(H)
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

def draw_rounded_card(draw, box, radius=18, fill="#071942", outline="#1E3A8A", width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def paste_logo(img, is_dark_bg=True, y=55):
    logo_file = "public/brand/logo-white-1600x480.png" if is_dark_bg else "public/brand/logo-1600x480.png"
    if os.path.exists(logo_file):
        logo = Image.open(logo_file).convert("RGBA")
        target_h = 42
        target_w = int(logo.width * (target_h / logo.height))
        logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.paste(logo_resized, (70, y), logo_resized)
        return target_w
    return 0

def draw_header(img, draw, step_num, total_steps=5, is_dark_bg=True):
    paste_logo(img, is_dark_bg=is_dark_bg, y=55)
    
    # Progress step pills on top right
    pill_w = 26
    pill_h = 8
    start_x = W - 70 - (total_steps * (pill_w + 6))
    y_pill = 70
    for i in range(total_steps):
        px = start_x + i * (pill_w + 6)
        p_fill = "#00BFA5" if (i + 1) <= step_num else ("#1E293B" if is_dark_bg else "#CBD5E1")
        draw.rounded_rectangle((px, y_pill, px + pill_w, y_pill + pill_h), radius=4, fill=p_fill)

    # Step label
    step_text = f"DIAGNOSTIC 0{step_num} OF 0{total_steps}"
    s_font = get_font(16, bold=True)
    draw.text((start_x, y_pill + 16), step_text, fill="#00BFA5" if is_dark_bg else "#003087", font=s_font)

def draw_footer(draw, text="SWIPE TO AUDIT NEXT LEAK", show_arrow=True, is_dark_bg=True):
    line_color = "#1E293B" if is_dark_bg else "#E2E8F0"
    draw.line([(70, H - 85), (W - 70, H - 85)], fill=line_color, width=2)
    brand_font = get_font(18, bold=False)
    draw.text((70, H - 62), "Aethera Healthcare Solutions • Interactive RCM Suite", fill="#94A3B8" if is_dark_bg else "#64748B", font=brand_font)

    if show_arrow:
        f_font = get_font(20, bold=True)
        bbox = draw.textbbox((0, 0), text, font=f_font)
        text_w = bbox[2] - bbox[0]
        x_text = W - 70 - text_w - 30
        c_color = "#00BFA5" if is_dark_bg else "#003087"
        draw.text((x_text, H - 62), text, fill=c_color, font=f_font)
        # Arrow
        ax = W - 70 - 20
        ay = H - 52
        draw.line([(ax - 10, ay), (ax, ay)], fill=c_color, width=3)
        draw.line([(ax - 6, ay - 6), (ax, ay)], fill=c_color, width=3)
        draw.line([(ax - 6, ay + 6), (ax, ay)], fill=c_color, width=3)
    else:
        f_font = get_font(20, bold=True)
        bbox = draw.textbbox((0, 0), text, font=f_font)
        draw.text((W - 70 - (bbox[2] - bbox[0]), H - 62), text, fill="#00BFA5", font=f_font)

# -------------------------------------------------------------
# SLIDE 1: Cover & Diagnostic Gateway
# -------------------------------------------------------------
def make_s1():
    img = Image.new("RGB", (W, H))
    draw_vertical_gradient(img, (2, 11, 29), (5, 25, 60))
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    # Interactive Badge
    draw_rounded_card(draw, (70, 160, 520, 208), radius=14, fill="#00205B", outline="#00BFA5", width=2)
    draw.text((95, 173), "INTERACTIVE RCM AUDIT • 2026", fill="#00BFA5", font=get_font(19, bold=True))

    # Main Title
    draw.text((70, 245), "The 2026 RCM", fill="#FFFFFF", font=get_font(60, bold=True))
    draw.text((70, 320), "Self-Diagnostic Matrix", fill="#00BFA5", font=get_font(60, bold=True))
    draw.text((70, 395), "For US Billing Leaders", fill="#FFFFFF", font=get_font(60, bold=True))

    sub = "Swipe through this 90-second diagnostic to identify exactly where your billing agency or clinic is bleeding cash—and how the India + AI model recovers 65% operating margin."
    y_sub = 490
    for line in wrap_text(sub, get_font(25, bold=False), W - 140, draw):
        draw.text((70, y_sub), line, fill="#94A3B8", font=get_font(25, bold=False))
        y_sub += 38

    # Diagnostic Preview Cards
    vectors = [
        ("01", "Pre-Submission Scrubbing", "Are clearinghouses catching your errors before you do?"),
        ("02", "Labor Unit Economics", "Is $45/hr US coder payroll capping your EBITDA at 16%?"),
        ("03", "Autonomous Routing", "Are 90% of routine claims clearing with zero manual touches?"),
    ]
    y_card = 680
    for num, title, desc in vectors:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + 115), radius=14, fill="#081E48", outline="#1E3A8A", width=1)
        # Badge
        draw.rounded_rectangle((95, y_card + 28, 145, y_card + 88), radius=10, fill="#002868", outline="#00BFA5", width=1)
        draw.text((105, y_card + 42), num, fill="#00BFA5", font=get_font(24, bold=True))
        # Text
        draw.text((170, y_card + 28), title, fill="#FFFFFF", font=get_font(24, bold=True))
        draw.text((170, y_card + 68), desc, fill="#94A3B8", font=get_font(19, bold=False))
        y_card += 135

    draw_footer(draw, text="SWIPE TO RUN AUDIT", show_arrow=True, is_dark_bg=True)
    return img

# -------------------------------------------------------------
# SLIDE 2: Diagnostic 01 - Pre-Submission Scrub
# -------------------------------------------------------------
def make_s2():
    img = Image.new("RGB", (W, H))
    draw_vertical_gradient(img, (2, 11, 29), (5, 25, 60))
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=True)

    draw.text((70, 150), "DIAGNOSTIC LEVEL 01", fill="#00BFA5", font=get_font(18, bold=True))
    draw.text((70, 185), "Where Does Your Scrubbing Happen?", fill="#FFFFFF", font=get_font(46, bold=True))

    q_text = "Payers use algorithmic denial bots to reject claims in milliseconds. Check your current workflow below to find your vulnerability score:"
    y_q = 255
    for line in wrap_text(q_text, get_font(23, bold=False), W - 140, draw):
        draw.text((70, y_q), line, fill="#94A3B8", font=get_font(23, bold=False))
        y_q += 34

    options = [
        {
            "tag": "LEVEL 1: BASIC CLEARINGHOUSE",
            "tag_color": "#EF4444",
            "badge_text": "HIGH RISK",
            "title": "Post-Submission Clearinghouse Edits Only",
            "desc": "Claims sent directly to Availity/Change. 12% to 15% bounce back as 277CA rejections. Billers spend 48 hours manually researching CARC codes.",
            "impact": "COST: $43.84 rework cost per claim • High write-off risk"
        },
        {
            "tag": "LEVEL 2: MANUAL SPOT CHECKS",
            "tag_color": "#F59E0B",
            "badge_text": "MARGIN SQUEEZE",
            "title": "In-House Certified Coders Reviewing Every Chart",
            "desc": "High accuracy, but bottlenecks turnaround time to 5+ days. US billers spend 80% of their time on routine data checks instead of working denials.",
            "impact": "COST: $85,000/yr per FTE • Stalls agency client expansion"
        },
        {
            "tag": "LEVEL 3: AETHERA AUTONOMOUS NEURAL ENGINE",
            "tag_color": "#10B981",
            "badge_text": "OPTIMAL",
            "title": "Pre-Submission AI Intercept + Global Pods",
            "desc": "Rules graph evaluates NCCI, LCD/NCD, and modifier combinations in <250ms BEFORE clearinghouse transmission. Certified India pod handles complex 10%.",
            "impact": "RESULT: 99.1% First-Pass Clean Claims • 65% Lower Cost"
        }
    ]

    y_card = 390
    card_h = 220
    for opt in options:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#071A40", outline=opt["tag_color"], width=1)
        # Header strip
        draw.text((105, y_card + 20), opt["tag"], fill=opt["tag_color"], font=get_font(16, bold=True))
        
        # Badge Pill
        draw_rounded_card(draw, (W - 240, y_card + 14, W - 100, y_card + 42), radius=6, fill="#030C22", outline=opt["tag_color"], width=1)
        draw.text((W - 225, y_card + 19), opt["badge_text"], fill=opt["tag_color"], font=get_font(14, bold=True))

        # Title
        draw.text((105, y_card + 48), opt["title"], fill="#FFFFFF", font=get_font(24, bold=True))
        # Desc
        y_d = y_card + 88
        for line in wrap_text(opt["desc"], get_font(19, bold=False), W - 210, draw):
            draw.text((105, y_d), line, fill="#94A3B8", font=get_font(19, bold=False))
            y_d += 27
        # Impact bar
        draw.rounded_rectangle((105, y_card + card_h - 40, W - 105, y_card + card_h - 12), radius=6, fill="#040F2B")
        draw.text((120, y_card + card_h - 36), opt["impact"], fill=opt["tag_color"], font=get_font(15, bold=True))

        y_card += card_h + 24

    draw_footer(draw, text="SWIPE TO AUDIT LABOR COSTS", show_arrow=True, is_dark_bg=True)
    return img

# -------------------------------------------------------------
# SLIDE 3: Diagnostic 02 - Unit Economics & Labor Comparison
# -------------------------------------------------------------
def make_s3():
    img = Image.new("RGB", (W, H))
    draw_vertical_gradient(img, (2, 11, 29), (5, 25, 60))
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=True)

    draw.text((70, 150), "DIAGNOSTIC LEVEL 02", fill="#00BFA5", font=get_font(18, bold=True))
    draw.text((70, 185), "The Labor Unit Economics Squeeze", fill="#FFFFFF", font=get_font(46, bold=True))

    sub = "Compare the true fully loaded annual cost of staffing an RCM back office across the three existing delivery models in 2026:"
    y_sub = 255
    for line in wrap_text(sub, get_font(23, bold=False), W - 140, draw):
        draw.text((70, y_sub), line, fill="#94A3B8", font=get_font(23, bold=False))
        y_sub += 34

    # 3-Column Comparison Table
    col_w = (W - 140 - 30) // 3
    cols = [
        {
            "title": "US In-House FTE",
            "cost": "$88,400",
            "cost_lbl": "Fully Loaded / Year",
            "border": "#EF4444",
            "bg": "#130A18",
            "metrics": [
                ("Hourly Wage", "$42 / hr"),
                ("Taxes & Benefits", "+28% overhead"),
                ("Annual Churn", "38% (high)"),
                ("Clean Claim SLA", "None (Internal)"),
                ("Agency EBITDA", "Capped at 16%"),
            ]
        },
        {
            "title": "Legacy Indian BPO",
            "cost": "$32,000",
            "cost_lbl": "Annual Per Seat",
            "border": "#F59E0B",
            "bg": "#18140B",
            "metrics": [
                ("Hourly Basis", "Manual Keying"),
                ("Error Rate", "14% - 18% error"),
                ("Turnover", "High churn"),
                ("Clean Claim SLA", "85% avg"),
                ("Tech Stack", "Zero AI Tools"),
            ]
        },
        {
            "title": "Aethera India + AI",
            "cost": "$29,500",
            "cost_lbl": "Delivered Pod / Year",
            "border": "#00BFA5",
            "bg": "#062238",
            "metrics": [
                ("Hourly Basis", "AI-Augmented"),
                ("Credentials", "AAPC / AHIMA"),
                ("Turnover", "Zero downtime"),
                ("Clean Claim SLA", "99.1% Guaranteed"),
                ("Agency EBITDA", "40%+ Unlocked"),
            ]
        }
    ]

    x_start = 70
    y_table = 380
    table_h = 750

    for col in cols:
        draw_rounded_card(draw, (x_start, y_table, x_start + col_w, y_table + table_h), radius=16, fill=col["bg"], outline=col["border"], width=2)
        # Title
        draw.text((x_start + 20, y_table + 25), col["title"], fill="#FFFFFF", font=get_font(22, bold=True))
        # Cost
        draw.text((x_start + 20, y_table + 65), col["cost"], fill=col["border"], font=get_font(38, bold=True))
        draw.text((x_start + 20, y_table + 115), col["cost_lbl"], fill="#94A3B8", font=get_font(15, bold=False))
        draw.line([(x_start + 20, y_table + 145), (x_start + col_w - 20, y_table + 145)], fill="#334155", width=1)

        # Metric list
        y_m = y_table + 170
        for lbl, val in col["metrics"]:
            draw.text((x_start + 20, y_m), lbl, fill="#94A3B8", font=get_font(16, bold=False))
            draw.text((x_start + 20, y_m + 22), val, fill="#FFFFFF", font=get_font(19, bold=True))
            y_m += 78

        x_start += col_w + 15

    draw_footer(draw, text="SWIPE FOR CLAIM ROUTING MATRIX", show_arrow=True, is_dark_bg=True)
    return img

# -------------------------------------------------------------
# SLIDE 4: Diagnostic 03 - Decision Tree & Claim Routing
# -------------------------------------------------------------
def make_s4():
    img = Image.new("RGB", (W, H))
    draw_vertical_gradient(img, (2, 11, 29), (5, 25, 60))
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    draw.text((70, 150), "DIAGNOSTIC LEVEL 03", fill="#00BFA5", font=get_font(18, bold=True))
    draw.text((70, 185), "The Autonomous Claim Decision Tree", fill="#FFFFFF", font=get_font(46, bold=True))

    sub = "How Aethera routes 100% of your agency's charges to achieve sub-12 hour turnaround with 99.1% clean accuracy:"
    y_sub = 255
    for line in wrap_text(sub, get_font(23, bold=False), W - 140, draw):
        draw.text((70, y_sub), line, fill="#94A3B8", font=get_font(23, bold=False))
        y_sub += 34

    # Visual Flowchart Cards
    flow_steps = [
        ("INCOMING 837P CHARGE", "Direct ingestion from AthenaHealth, Epic, eCW, or AdvancedMD", "#38BDF8", "01"),
        ("AETHERA NEURAL SCRUBBER (<250ms)", "Instant NCCI PTP validation, LCD/NCD coverage check & modifier 25/59 matching", "#00BFA5", "02"),
        ("BRANCH A: 90% ROUTINE CLAIMS", "Cleared autonomously with zero human intervention -> Direct to Clearinghouse", "#10B981", "90%"),
        ("BRANCH B: 10% COMPLEX EXCEPTIONS", "Surgical notes & appeals routed to dedicated AAPC Pod in India -> Resolved overnight", "#F59E0B", "10%"),
        ("REAL-TIME 835 REMITTANCE DEFENSE", "CARC/RARC denial parsed; auto-generates clinical appeal dossiers with evidence", "#8B5CF6", "03"),
    ]

    y_f = 370
    card_h = 135
    for title, desc, color, tag in flow_steps:
        draw_rounded_card(draw, (70, y_f, W - 70, y_f + card_h), radius=14, fill="#071940", outline=color, width=1)
        # Left tag
        draw.rounded_rectangle((70, y_f, 80, y_f + card_h), radius=8, fill=color)
        draw.rounded_rectangle((100, y_f + 20, 170, y_f + 55), radius=8, fill="#030C22", outline=color, width=1)
        draw.text((115, y_f + 25), tag, fill=color, font=get_font(18, bold=True))
        # Title
        draw.text((190, y_f + 24), title, fill="#FFFFFF", font=get_font(22, bold=True))
        # Desc
        y_fd = y_f + 65
        for line in wrap_text(desc, get_font(19, bold=False), W - 230, draw):
            draw.text((100, y_fd), line, fill="#94A3B8", font=get_font(19, bold=False))
            y_fd += 26

        # Down arrow connector if not last
        if y_f < 370 + 4 * (card_h + 20):
            ay = y_f + card_h + 2
            draw.line([(W // 2, ay), (W // 2, ay + 16)], fill="#00BFA5", width=3)

        y_f += card_h + 20

    draw_footer(draw, text="SWIPE FOR YOUR 50-CLAIM PILOT", show_arrow=True, is_dark_bg=True)
    return img

# -------------------------------------------------------------
# SLIDE 5: CTA & Interactive Tool Gateway
# -------------------------------------------------------------
def make_s5():
    img = Image.new("RGB", (W, H))
    draw_vertical_gradient(img, (2, 11, 29), (5, 25, 60))
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=True)

    draw.text((70, 150), "YOUR NEXT ACTION STEP", fill="#00BFA5", font=get_font(18, bold=True))
    draw.text((70, 185), "Put the India + AI Model to Work", fill="#FFFFFF", font=get_font(46, bold=True))

    sub = "Test your agency's numbers right now on our live interactive web tools, or put our team to work on 50 of your denied claims:"
    y_sub = 255
    for line in wrap_text(sub, get_font(23, bold=False), W - 140, draw):
        draw.text((70, y_sub), line, fill="#94A3B8", font=get_font(23, bold=False))
        y_sub += 34

    # Action Cards
    actions = [
        {
            "badge": "INTERACTIVE CALCULATOR",
            "title": "Calculate Your Operating Margin Unlock",
            "desc": "Simulate your agency's exact savings based on your US biller headcount and hourly rate.",
            "url": "aetherahealthcare.com/for-billing-companies#interactive-calculator",
            "color": "#38BDF8"
        },
        {
            "badge": "LIVE SCRUBBING TOOL",
            "title": "Run an Instant Clean-Claim Benchmark",
            "desc": "Test your specialty codes against our 2026 NCCI bundling & LCD coverage matrix.",
            "url": "aetherahealthcare.com/tools/clean-claim-scorecard",
            "color": "#00BFA5"
        },
        {
            "badge": "RISK-FREE PILOT",
            "title": "Complimentary 50-Claim Back-Office Pilot",
            "desc": "Send 50 denied or aging claims. We scrub, draft appeals, and prove cash recovery in 14 days.",
            "url": "aetherahealthcare.com/free-assessment?intent=partner_pilot",
            "color": "#10B981"
        }
    ]

    y_card = 390
    card_h = 220
    for act in actions:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#071940", outline=act["color"], width=2)
        # Badge
        draw_rounded_card(draw, (100, y_card + 20, 360, y_card + 52), radius=8, fill="#030E26", outline=act["color"], width=1)
        draw.text((115, y_card + 26), act["badge"], fill=act["color"], font=get_font(15, bold=True))
        # Title
        draw.text((100, y_card + 65), act["title"], fill="#FFFFFF", font=get_font(24, bold=True))
        # Desc
        y_d = y_card + 105
        for line in wrap_text(act["desc"], get_font(20, bold=False), W - 210, draw):
            draw.text((100, y_d), line, fill="#94A3B8", font=get_font(20, bold=False))
            y_d += 28
        # URL Pill
        draw.rounded_rectangle((100, y_card + card_h - 44, W - 100, y_card + card_h - 14), radius=6, fill="#030E26")
        draw.text((115, y_card + card_h - 38), "TOOL:  " + act["url"], fill=act["color"], font=get_font(15, bold=True))

        y_card += card_h + 24

    draw_footer(draw, text="COMMENT 'AUDIT' FOR 50-CLAIM PILOT", show_arrow=False, is_dark_bg=True)
    return img

def main():
    slides_dir = "public/brand/carousel/interactive_audit"
    os.makedirs(slides_dir, exist_ok=True)

    print("Generating Slide 1: Cover & Diagnostic Gateway...")
    s1 = make_s1()
    s1.save(f"{slides_dir}/slide_1.png", "PNG", quality=95)

    print("Generating Slide 2: Diagnostic 01 - Pre-Submission Scrub...")
    s2 = make_s2()
    s2.save(f"{slides_dir}/slide_2.png", "PNG", quality=95)

    print("Generating Slide 3: Diagnostic 02 - Unit Economics...")
    s3 = make_s3()
    s3.save(f"{slides_dir}/slide_3.png", "PNG", quality=95)

    print("Generating Slide 4: Diagnostic 03 - Decision Tree...")
    s4 = make_s4()
    s4.save(f"{slides_dir}/slide_4.png", "PNG", quality=95)

    print("Generating Slide 5: CTA & Interactive Tool Gateway...")
    s5 = make_s5()
    s5.save(f"{slides_dir}/slide_5.png", "PNG", quality=95)

    # Combine into single PDF
    pdf_path = "public/brand/carousel/rcm_self_audit_interactive_2026.pdf"
    print(f"Compiling combined carousel PDF: {pdf_path}...")
    s1.save(
        pdf_path,
        "PDF",
        resolution=100.0,
        save_all=True,
        append_images=[s2, s3, s4, s5]
    )
    print(f"Generated Carousel #5 PDF ({os.path.getsize(pdf_path)} bytes)")

    # Copy to brain artifacts
    brain_dir = "/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c"
    if os.path.exists(brain_dir):
        shutil.copy(pdf_path, f"{brain_dir}/rcm_self_audit_interactive_2026.pdf")
        for i in range(1, 6):
            shutil.copy(f"{slides_dir}/slide_{i}.png", f"{brain_dir}/interactive_audit_slide_{i}.png")
        print("Copied interactive audit carousel assets to brain artifacts directory.")

if __name__ == "__main__":
    main()
