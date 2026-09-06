import os
import math
from PIL import Image, ImageDraw, ImageFont

def draw_check(draw, x, y, size=14, color=(45, 212, 191, 255)):
    # Draw a clean checkmark icon
    p1 = (x, y + int(size * 0.55))
    p2 = (x + int(size * 0.35), y + int(size * 0.9))
    p3 = (x + size, y + int(size * 0.15))
    draw.line([p1, p2], fill=color, width=2)
    draw.line([p2, p3], fill=color, width=2)

def create_og_image():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), (11, 25, 44, 255)) # #0B192C
    
    # Subtle radial glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_glow = ImageDraw.Draw(glow)
    
    # Top-right cyan glow
    cx1, cy1, r1 = 1050, 100, 380
    for r in range(r1, 0, -5):
        alpha = int(35 * (1 - r / r1))
        draw_glow.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(0, 168, 150, alpha))
        
    # Bottom-left mint glow
    cx2, cy2, r2 = 150, 550, 320
    for r in range(r2, 0, -5):
        alpha = int(25 * (1 - r / r2))
        draw_glow.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(5, 182, 212, alpha))
        
    img = Image.alpha_composite(img, glow)
    
    # Grid lines
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_grid = ImageDraw.Draw(grid)
    for x in range(0, W, 60):
        draw_grid.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, 60):
        draw_grid.line([(y, 0), (W, y)], fill=(255, 255, 255, 6), width=1)
    img = Image.alpha_composite(img, grid)

    # Load fonts
    font_bold_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    font_reg_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    
    font_kicker = ImageFont.truetype(font_bold_path, 14)
    font_title = ImageFont.truetype(font_bold_path, 50)
    font_sub = ImageFont.truetype(font_reg_path, 22)
    font_pill = ImageFont.truetype(font_bold_path, 15)
    font_domain = ImageFont.truetype(font_bold_path, 20)

    draw = ImageDraw.Draw(img)

    # Top left: Paste Aethera White Logo
    logo_path = "public/brand/logo-white-1600x480.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        target_w = 320
        target_h = int(logo.height * (target_w / logo.width))
        logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.paste(logo_resized, (70, 50), logo_resized)

    # Top right: Badge / Pill
    pill_text = "ZERO-RISK 50-CLAIM PILOT"
    pill_bbox = font_kicker.getbbox(pill_text)
    pw = pill_bbox[2] - pill_bbox[0] + 32
    ph = 36
    px = W - 70 - pw
    py = 65
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(0, 168, 150, 45), outline=(0, 210, 185, 180), width=1)
    draw.text((px + 16, py + 10), pill_text, fill=(0, 220, 195, 255), font=font_kicker)

    # Center Headline
    title_line1 = "Billing Run by AI. Signed Off by Humans."
    title_line2 = "Proven on Your Real Claims."
    draw.text((70, 185), title_line1, fill=(255, 255, 255, 255), font=font_title)
    draw.text((70, 248), title_line2, fill=(45, 212, 191, 255), font=font_title)

    # Subheading
    sub_line1 = "Full-service RCM back office with deterministic AI boundaries, 98.7% clean claims,"
    sub_line2 = "certified AAPC/AHIMA specialty coders, and a tamper-evident audit trail."
    draw.text((70, 330), sub_line1, fill=(203, 213, 225, 255), font=font_sub)
    draw.text((70, 363), sub_line2, fill=(203, 213, 225, 255), font=font_sub)

    # Divider line
    draw.line([(70, 425), (W - 70, 425)], fill=(255, 255, 255, 30), width=1)

    # Feature badges at bottom with custom drawn checkmark
    badges = [
        "10,600+ Payers Grounded",
        "AAPC Certified Coders",
        "Tamper-Evident Audit Trail",
        "Performance Pricing (3.5%–5%)"
    ]
    
    bx = 70
    by = 452
    for badge in badges:
        bbox = font_pill.getbbox(badge)
        text_w = bbox[2] - bbox[0]
        bw = text_w + 48 # 20 for icon, padding
        bh = 38
        draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=10, fill=(30, 41, 59, 210), outline=(51, 65, 85, 255), width=1)
        # draw custom checkmark
        draw_check(draw, bx + 14, by + 12, size=14, color=(45, 212, 191, 255))
        draw.text((bx + 34, by + 10), badge, fill=(241, 245, 249, 255), font=font_pill)
        bx += bw + 14

    # Bottom footer note: URL and HIPAA compliance
    draw.text((70, 540), "aetherahealthcare.com", fill=(45, 212, 191, 255), font=font_domain)
    hipaa_text = "HIPAA Compliant · US Data Residency · BAA Guaranteed"
    hbbox = font_sub.getbbox(hipaa_text)
    hw = hbbox[2] - hbbox[0]
    draw.text((W - 70 - hw, 542), hipaa_text, fill=(148, 163, 184, 255), font=font_sub)

    out_rgb = img.convert("RGB")
    os.makedirs("public/brand", exist_ok=True)
    out_rgb.save("public/og-image.png", "PNG", quality=95)
    out_rgb.save("public/brand/og-image.png", "PNG", quality=95)
    print("Regenerated public/og-image.png and public/brand/og-image.png with vector checkmarks")

if __name__ == "__main__":
    create_og_image()
