from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "social" / "2026-08-20-builder-pricing"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1350
INK = "#111111"
CREAM = "#f7f4ef"
ACCENT = "#d7c3a1"
WHITE = "#ffffff"
MUTED = "#5f5f5f"


def font(size, bold=False):
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def wrap(draw, text, face, max_width):
    lines, current = [], ""
    for word in text.split():
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=face)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text_block(draw, text, xy, face, fill, max_width, spacing=18):
    x, y = xy
    for line in wrap(draw, text, face, max_width):
        draw.text((x, y), line, font=face, fill=fill)
        y += face.size + spacing
    return y


def add_brand(draw, number, dark=False):
    colour = WHITE if dark else INK
    draw.text((72, 62), "DELVIK BUILD", font=font(32, True), fill=colour)
    draw.text((910, 62), f"{number}/6", font=font(26), fill=colour)
    draw.rectangle((72, 1255, 1008, 1259), fill=ACCENT)
    draw.text((72, 1280), "BUILDING INSIGHTS  •  TAURANGA", font=font(23, True), fill=colour)


def save_slide(number, title, body=None, eyebrow=None, dark=False):
    bg = INK if dark else CREAM
    fg = WHITE if dark else INK
    im = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(im)
    add_brand(draw, number, dark)
    if eyebrow:
        draw.text((72, 250), eyebrow.upper(), font=font(28, True), fill=ACCENT if dark else "#6d5a3d")
    y = text_block(draw, title, (72, 330), font(76, True), fg, 900, 16)
    if body:
        text_block(draw, body, (72, y + 55), font(39), WHITE if dark else MUTED, 900, 15)
    im.save(OUT / f"slide-{number}.png", quality=95)


# Cover uses a verified image already published with the related DELVIK Insight.
photo = Image.open(ROOT / "assets" / "project-a-720x400.webp").convert("RGB")
scale = max(W / photo.width, H / photo.height)
photo = photo.resize((int(photo.width * scale), int(photo.height * scale)), Image.Resampling.LANCZOS)
left = (photo.width - W) // 2
top = (photo.height - H) // 2
photo = photo.crop((left, top, left + W, top + H))
photo = ImageEnhance.Contrast(photo).enhance(1.08)
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.rectangle((0, 0, W, H), fill=(0, 0, 0, 115))
od.rectangle((0, 640, W, H), fill=(0, 0, 0, 125))
cover = Image.alpha_composite(photo.convert("RGBA"), overlay).convert("RGB")
draw = ImageDraw.Draw(cover)
add_brand(draw, 1, True)
draw.text((72, 605), "PROJECT READINESS", font=font(29, True), fill=ACCENT)
text_block(draw, "What does a builder need before pricing?", (72, 670), font(75, True), WHITE, 900, 12)
cover.save(OUT / "slide-1.png", quality=95)

save_slide(2, "A useful price starts with useful information.", "A feasibility allowance, preliminary estimate and formal quote are not the same thing. The information supplied should match the type of price requested.", "Start with the right expectation", True)
save_slide(3, "1. Site and current drawings", "Share the project address, access constraints, photos and the latest drawing set. Label the drawings clearly: concept, developed design, consent or construction issue.", "Define the project")
save_slide(4, "2. Specifications and specialist reports", "Include known selections plus relevant structural, civil, geotechnical, drainage or fire information. If something is undecided, identify it rather than hiding an assumption.", "Make scope visible")
save_slide(5, "3. Consent, programme and responsibilities", "Confirm approval status, target dates, budget range, consultant roles, client-supplied items and exclusions. These details affect procurement, sequencing and commercial risk.", "Give the commercial context", True)
save_slide(6, "Not everything needs to be complete before the first conversation.", "Ask for the response that fits the current stage. Read the full checklist at delvik.co/insights — or use DELVIK’s free Project Readiness Checker.", "Next step")

print(OUT)
