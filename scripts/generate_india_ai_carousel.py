#!/usr/bin/env python3
"""
Generate Carousel #4:
"India + AI: The Next-Gen Global Delivery Model for US Healthcare RCM"
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
    draw.text((70, H - 65), "Aethera Healthcare Solutions • Global RCM Delivery", fill="#64748B" if not is_dark_bg else "#94A3B8", font=brand_font)
    
    if show_arrow:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        x_text = W - 70 - text_w - 36
        draw.text((x_text, H - 65), text, fill=c_color, font=font)
        draw_arrow(draw, W - 70 - 24, H - 53, length=24, color=c_color, width=3)
    else:
        bbox = draw.textbbox((0, 0), text, font=font)
        draw.text((W - 70 - (bbox[2] - bbox[0]), H - 65), text, fill=c_color, font=font)

# Slide 1: Cover
def make_s1():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 1, 5, is_dark_bg=True)

    draw_rounded_card(draw, (70, 180, 560, 230), radius=25, fill="#002868", outline="#00BFA5", width=2)
    draw.text((95, 193), "GLOBAL RCM INTELLIGENCE • 2026", fill="#00BFA5", font=get_font(20, bold=True))

    title_lines = ["How US Billing", "Companies Scale", "With India + AI", "Economics"]
    y = 280
    for line in title_lines:
        draw.text((70, y), line, fill="#FFFFFF", font=get_font(64, bold=True))
        y += 82

    draw.rectangle((70, y + 10, 220, y + 16), fill="#00BFA5")
    y += 45

    sub_text = "Why legacy manual offshore BPOs are falling short, and how AI-augmented certified delivery hubs unlock 40%+ operating margins for US revenue cycle executives."
    for line in wrap_text(sub_text, get_font(28, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#94A3B8", font=get_font(28, bold=False))
        y += 42

    y_card = 820
    card_w = (W - 140 - 40) // 3
    stats = [("65%", "Cost Reduction vs US FTEs"), ("99.1%", "First-Pass Clean Claim Rate"), ("14 Days", "White-Label Onboarding")]
    for i, (val, lbl) in enumerate(stats):
        x0 = 70 + i * (card_w + 20)
        x1 = x0 + card_w
        draw_rounded_card(draw, (x0, y_card, x1, y_card + 200), radius=16, fill="#002868", outline="#1E3A8A", width=1)
        draw.text((x0 + 20, y_card + 35), val, fill="#00BFA5", font=get_font(40, bold=True))
        for l_line in wrap_text(lbl, get_font(21, bold=False), card_w - 40, draw):
            draw.text((x0 + 20, y_card + 100), l_line, fill="#E2E8F0", font=get_font(21, bold=False))

    draw_footer(draw, text="SWIPE TO UNPACK", show_arrow=True, is_dark_bg=True)
    return img

# Slide 2: The Bottleneck
def make_s2():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 2, 5, is_dark_bg=False)

    draw.text((70, 180), "THE US OPERATING SQUEEZE", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "US Billing Companies Cannot", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Hire Fast Enough to Grow", fill="#001A52", font=get_font(52, bold=True))

    b_text = "Experienced AAPC-certified coders and billing managers in the US now demand $38 to $52/hour. With a 38% annual churn rate, agency owners spend more time recruiting than closing new physician practices."
    y = 380
    for line in wrap_text(b_text, get_font(28, bold=False), W - 140, draw):
        draw.text((70, y), line, fill="#475569", font=get_font(28, bold=False))
        y += 42

    y_card = y + 40
    draw_rounded_card(draw, (70, y_card, W - 70, y_card + 260), radius=20, fill="#FFF1F2", outline="#FDA4AF", width=2)
    draw.rectangle((70, y_card, 82, y_card + 260), fill="#E11D48")
    draw.text((115, y_card + 35), "$75,000 - $95,000", fill="#BE123C", font=get_font(54, bold=True))
    draw.text((115, y_card + 110), "Fully Loaded Annual Cost per US Billing Specialist", fill="#1E293B", font=get_font(26, bold=True))
    stat_desc = "Salary, health insurance, 401k, software seats, and recruiting overhead consume up to 75% of agency top-line billing collections."
    y_sd = y_card + 155
    for line in wrap_text(stat_desc, get_font(22, bold=False), W - 230, draw):
        draw.text((115, y_sd), line, fill="#475569", font=get_font(22, bold=False))
        y_sd += 32

    y_card2 = y_card + 295
    draw_rounded_card(draw, (70, y_card2, W - 70, y_card2 + 170), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((105, y_card2 + 25), "The Problem With Legacy Offshore BPOs", fill="#001A52", font=get_font(26, bold=True))
    c2_desc = "Traditional offshore firms in India sold 'cheap manual labor'—leading to high error rates, rework, missed timely filing deadlines, and zero software intelligence. US clients refuse to accept that."
    y_c2 = y_card2 + 68
    for line in wrap_text(c2_desc, get_font(21, bold=False), W - 210, draw):
        draw.text((105, y_c2), line, fill="#64748B", font=get_font(21, bold=False))
        y_c2 += 30

    draw_footer(draw, text="SWIPE FOR THE HYBRID FIX", show_arrow=True, is_dark_bg=False)
    return img

# Slide 3: The Hybrid Model
def make_s3():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 3, 5, is_dark_bg=False)

    draw.text((70, 180), "THE PARADIGM SHIFT", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Pure Software Fails. Pure Labor", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Fails. The Winner: India + AI.", fill="#001A52", font=get_font(52, bold=True))

    models = [
        ("01", "Pure 'AI Only' Software", "Black-box AI hallucinates on complex operative notes, misses payer-specific local coverage determinations (LCDs), and cannot call a commercial payer rep to dispute a clawback.", "#E11D48"),
        ("02", "Legacy Indian BPO Labor", "Manual keyboards, entry-level staff, high turnover, zero proprietary scrubbing software, and rigid 1-year FTE contracts that lock you in regardless of collection performance.", "#D97706"),
        ("03", "The Aethera Model: India + AI", "Proprietary autonomous AI engines pre-scrub 90% of routine claims in milliseconds; AAPC/AHIMA certified specialists in India handle the high-value 10% complex appeals.", "#00A86B")
    ]
    y_card = 390
    card_h = 220
    for num, title, desc, tag_color in models:
        draw_rounded_card(draw, (70, y_card, W - 70, y_card + card_h), radius=16, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw_rounded_card(draw, (100, y_card + 30, 160, y_card + 90), radius=12, fill=tag_color, outline=None)
        draw.text((115, y_card + 42), num, fill="#FFFFFF", font=get_font(28, bold=True))
        draw.text((185, y_card + 40), title, fill="#001A52", font=get_font(26, bold=True))
        y_text = y_card + 100
        for line in wrap_text(desc, get_font(22, bold=False), W - 240, draw):
            draw.text((105, y_text), line, fill="#475569", font=get_font(22, bold=False))
            y_text += 32
        y_card += card_h + 30

    draw_footer(draw, text="SWIPE FOR ARCHITECTURE", show_arrow=True, is_dark_bg=False)
    return img

# Slide 4: White-Label Architecture
def make_s4():
    img = Image.new("RGB", (W, H), "#001A52")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 4, 5, is_dark_bg=True)

    draw.text((70, 180), "THE WHITE-LABEL ENGINE", fill="#00BFA5", font=get_font(20, bold=True))
    draw.text((70, 220), "How Aethera Powers US", fill="#FFFFFF", font=get_font(52, bold=True))
    draw.text((70, 285), "Billing Agencies Behind the Scenes", fill="#00BFA5", font=get_font(52, bold=True))

    steps = [
        ("We Operate Inside Your Practice Management System", "AthenaHealth, Epic, eClinicalWorks, Kareo, ModMed, or AdvancedMD. Zero migration, zero software changes for your provider clients."),
        ("Autonomous 277CA & EDI Rules Engine", "Our pre-submission AI intercepts NCCI bundling, missing modifiers, and NDC units before claims are sent to clearinghouses."),
        ("Dedicated Certified Coder Pods in India", "AAPC & AHIMA certified coders (CPC, COC, CRC) dedicated strictly to your specialty books—ortho, cardio, surgery, primary care."),
        ("Transparent Weekly SLA & AR Scorecards", "Real-time visibility into clean claim pass rates, denial overturn percentages, and cash collected. Month-to-month flexibility.")
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

    draw_footer(draw, text="SWIPE FOR 50-CLAIM PILOT", show_arrow=True, is_dark_bg=True)
    return img

# Slide 5: Call to Action
def make_s5():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(img, draw, 5, 5, is_dark_bg=False)

    draw.text((70, 180), "TAKE ACTION", fill="#003087", font=get_font(20, bold=True))
    draw.text((70, 220), "Scale Your Billing Company's", fill="#001A52", font=get_font(52, bold=True))
    draw.text((70, 285), "Margins With Zero Risk", fill="#001A52", font=get_font(52, bold=True))

    y_box = 380
    draw_rounded_card(draw, (70, y_box, W - 70, y_box + 390), radius=20, fill="#001A52", outline="#003087", width=2)
    draw_rounded_card(draw, (110, y_box + 35, 510, y_box + 80), radius=20, fill="#00BFA5")
    draw.text((130, y_box + 44), "WHITE-LABEL PARTNER PILOT", fill="#001A52", font=get_font(18, bold=True))

    draw.text((110, y_box + 110), "Complimentary 50-Claim Back-Office Pilot", fill="#FFFFFF", font=get_font(34, bold=True))
    box_desc = "Send us 50 of your agency's denied or aging claims. Our AI + AAPC certified recovery team will scrub them, identify uncollected cash flow, and deliver a full audit in 14 days."
    y_bd = y_box + 175
    for line in wrap_text(box_desc, get_font(24, bold=False), W - 220, draw):
        draw.text((110, y_bd), line, fill="#94A3B8", font=get_font(24, bold=False))
        y_bd += 36

    draw.text((110, y_box + 290), "• White-label or disclosed (you own 100% of client brand)", fill="#E2E8F0", font=get_font(22, bold=True))
    draw.text((110, y_box + 330), "• Month-to-month flexibility • Zero minimums for the pilot", fill="#E2E8F0", font=get_font(22, bold=True))

    y_links = y_box + 425
    draw.text((70, y_links), "Partner with Aethera Healthcare:", fill="#001A52", font=get_font(28, bold=True))

    link_cards = [
        ("Explore Billing Partner Program", "aetherahealthcare.com/for-billing-companies", "#003087"),
        ("Schedule an Executive Partnership Call", "aetherahealthcare.com/schedule", "#00A86B"),
        ("Request Pilot Terms via Email", "aetherahealthcare.com/contact", "#475569"),
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

def main():
    out_dir = "public/brand/carousel/india_ai"
    os.makedirs(out_dir, exist_ok=True)
    images = []

    print("Building Carousel 'India + AI Delivery Model'...")
    slides = [make_s1, make_s2, make_s3, make_s4, make_s5]
    for idx, fn in enumerate(slides, start=1):
        print(f"  Rendering Slide {idx}...")
        img = fn()
        img.save(os.path.join(out_dir, f"slide_{idx}.png"), quality=95)
        images.append(img)

    pdf_path = "public/brand/carousel/india_ai_global_rcm_2026.pdf"
    print(f"  Exporting multi-page PDF to {pdf_path}...")
    images[0].save(pdf_path, "PDF", resolution=100.0, save_all=True, append_images=images[1:])

    artifact_dir = "/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c"
    for idx, img in enumerate(images, start=1):
        dst = os.path.join(artifact_dir, f"india_ai_slide_{idx}.png")
        shutil.copyfile(os.path.join(out_dir, f"slide_{idx}.png"), dst)

    shutil.copyfile(pdf_path, os.path.join(artifact_dir, "india_ai_global_rcm_2026.pdf"))
    print("Carousel generated successfully!")

if __name__ == "__main__":
    main()
