#!/usr/bin/env python3
"""
Generate 1080x1350 High-Resolution Architecture Infographic for LinkedIn:
"The 4-Layer AI Integration Stack for US Medical Billing Companies"
"""

import os
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

def draw_rounded_card(draw, box, radius=18, fill="#002868", outline="#1E3A8A", width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def paste_logo(img, x=70, y=55):
    logo_file = "public/brand/logo-white-1600x480.png"
    if os.path.exists(logo_file):
        logo = Image.open(logo_file).convert("RGBA")
        target_h = 42
        target_w = int(logo.width * (target_h / logo.height))
        logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.paste(logo_resized, (x, y), logo_resized)
        return target_w
    return 0

def draw_down_arrow(draw, x, y, length=24, color="#00BFA5", width=3):
    draw.line([(x, y), (x, y + length)], fill=color, width=width)
    draw.line([(x - 6, y + length - 7), (x, y + length)], fill=color, width=width)
    draw.line([(x + 6, y + length - 7), (x, y + length)], fill=color, width=width)

def generate_infographic():
    os.makedirs("public/brand/infographics", exist_ok=True)
    img = Image.new("RGB", (W, H), "#030C22")
    draw = ImageDraw.Draw(img)

    # Header & Logo
    paste_logo(img, x=70, y=50)
    tag_box = (W - 390, 50, W - 70, 92)
    draw_rounded_card(draw, tag_box, radius=12, fill="#00205B", outline="#00BFA5", width=1)
    draw.text((W - 370, 62), "SYSTEM ARCHITECTURE • 2026", fill="#00BFA5", font=get_font(18, bold=True))

    # Title & Subtitle
    draw.text((70, 115), "How US Medical Billing Companies", fill="#FFFFFF", font=get_font(42, bold=True))
    draw.text((70, 168), "Integrate AI & Global Delivery", fill="#00BFA5", font=get_font(42, bold=True))
    
    sub = "Deploy an autonomous pre-submission intelligence engine on top of your existing EHR—backed by AAPC-certified specialists in India—without migrating software."
    y_sub = 228
    for line in wrap_text(sub, get_font(21, bold=False), W - 140, draw):
        draw.text((70, y_sub), line, fill="#94A3B8", font=get_font(21, bold=False))
        y_sub += 29

    layers = [
        {
            "num": "LAYER 01",
            "title": "Practice Management & EHR Ingestion (Zero-Migration)",
            "badge": "COMPATIBILITY",
            "badge_color": "#3B82F6",
            "desc": "Operates inside your existing systems: AthenaHealth, Epic, eCW, ModMed, AdvancedMD, or Kareo. Automated FHIR/837P charge capture extraction with zero client disruption.",
            "tech": "AthenaHealth • Epic Systems • eCW • AdvancedMD • ModMed • Kareo"
        },
        {
            "num": "LAYER 02",
            "title": "Aethera AI Pre-Submission Neural Engine",
            "badge": "AUTONOMOUS",
            "badge_color": "#10B981",
            "desc": "Autonomous claim scrubber matches CMS LCD/NCD coverage policies, resolves NCCI edits, validates Modifiers 25/59, and predicts payer denial propensity in milliseconds.",
            "tech": "LCD/NCD Rules Graph • NCCI Bundling Matrix • Pre-Submission 277CA Intercept"
        },
        {
            "num": "LAYER 03",
            "title": "AAPC & AHIMA Certified Global Pods (India Hub)",
            "badge": "HUMAN EXPERTISE",
            "badge_color": "#F59E0B",
            "desc": "The 10% high-complexity exceptions (operative notes, modifier disputes, complex appeals) routed to dedicated AAPC coders (CPC, COC, CRC) for 24/7 overnight resolution.",
            "tech": "Dedicated Specialty Pods • 24/7 Overnight Turnaround • 65% Labor Cost Reduction"
        },
        {
            "num": "LAYER 04",
            "title": "Automated 835 Remittance & Denial Defense",
            "badge": "CASH RECOVERY",
            "badge_color": "#8B5CF6",
            "desc": "Real-time ERA 835 parsing maps CARC/RARC codes. Instant auto-generation of payer-specific appeal packages citing medical necessity, overturning 74%+ of initial denials.",
            "tech": "99.1% First-Pass Clean Claims • 14-Day AR Days • Autonomous Payer Appeal Dossiers"
        }
    ]

    y_card = 310
    card_h = 190
    spacing = 28

    for i, lyr in enumerate(layers):
        # Card background
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#071942", outline="#1E3A8A", width=1)
        
        # Left accent stripe
        draw.rounded_rectangle((70, y_card, 80, y_card + card_h), radius=8, fill=lyr["badge_color"])

        # Layer number & badge
        draw.text((105, y_card + 18), lyr["num"], fill="#64748B", font=get_font(16, bold=True))
        
        b_box = (200, y_card + 15, 365, y_card + 40)
        draw_rounded_card(draw, b_box, radius=8, fill="#0F2B66", outline=lyr["badge_color"], width=1)
        draw.text((215, y_card + 19), lyr["badge"], fill=lyr["badge_color"], font=get_font(14, bold=True))

        # Title
        draw.text((105, y_card + 48), lyr["title"], fill="#FFFFFF", font=get_font(24, bold=True))

        # Description
        y_d = y_card + 84
        for d_line in wrap_text(lyr["desc"], get_font(19, bold=False), W - 220, draw):
            draw.text((105, y_d), d_line, fill="#94A3B8", font=get_font(19, bold=False))
            y_d += 26

        # Tech footer pill
        draw.rounded_rectangle((105, y_card + card_h - 38, W - 105, y_card + card_h - 12), radius=6, fill="#040F2D")
        draw.text((120, y_card + card_h - 34), "ENGINE:  " + lyr["tech"], fill="#38BDF8", font=get_font(15, bold=True))

        # Down arrow connector between layers
        if i < len(layers) - 1:
            arrow_y = y_card + card_h + 4
            draw_down_arrow(draw, W // 2, arrow_y, length=20, color="#00BFA5", width=3)

        y_card += card_h + spacing

    # Bottom Offer / CTA Banner
    y_cta = 1190
    draw_rounded_card(draw, (70, y_cta, W - 70, y_cta + 115), radius=16, fill="#002868", outline="#00BFA5", width=2)
    
    draw.text((105, y_cta + 20), "WHITE-LABEL PILOT FOR US BILLING AGENCIES", fill="#00BFA5", font=get_font(18, bold=True))
    draw.text((105, y_cta + 48), "Complimentary 50-Claim Audit • See AI + India in Action", fill="#FFFFFF", font=get_font(25, bold=True))
    draw.text((105, y_cta + 82), "Visit aetherahealthcare.com/for-billing-companies • Book at aetherahealthcare.com/schedule", fill="#CBD5E1", font=get_font(17, bold=False))

    out_path = "public/brand/infographics/ai_rcm_integration_architecture_2026.png"
    img.save(out_path, "PNG", quality=95)
    print(f"Successfully generated architecture infographic: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    generate_infographic()
