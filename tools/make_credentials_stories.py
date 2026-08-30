from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "social" / "credentials-highlight"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
INK = "#111111"
CREAM = "#f7f4ef"
ACCENT = "#d7c3a1"
MUTED = "#5f5f5f"
WHITE = "#ffffff"


def face(size, bold=False):
    path = Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf")
    return ImageFont.truetype(str(path), size)


def wrap(draw, text, font, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def block(draw, text, x, y, font, fill, width, gap=18):
    for line in wrap(draw, text, font, width):
        draw.text((x, y), line, font=font, fill=fill)
        y += font.size + gap
    return y


def brand(draw, dark=False):
    colour = WHITE if dark else INK
    draw.text((72, 70), "DELVIK BUILD", font=face(34, True), fill=colour)
    draw.rectangle((72, 1790, 1008, 1795), fill=ACCENT)
    draw.text((72, 1825), "CREDENTIALS  •  TAURANGA", font=face(25, True), fill=colour)


def contain(image, box):
    x, y, w, h = box
    image = image.convert("RGBA")
    scale = min(w / image.width, h / image.height)
    resized = image.resize((int(image.width * scale), int(image.height * scale)), Image.Resampling.LANCZOS)
    return resized, (x + (w - resized.width) // 2, y + (h - resized.height) // 2)


# 1 — highlight cover / opening story
im = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(im)
brand(d, True)
d.text((72, 390), "CREDENTIALS", font=face(28, True), fill=ACCENT)
y = block(d, "Capability you can verify.", 72, 490, face(92, True), WHITE, 900, 18)
block(d, "Licensed leadership and independently assessed health & safety systems.", 72, y + 70, face(43), "#e7e7e7", 880, 18)
im.save(OUT / "story-1-cover.png")


# 2 — LBP
im = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(im)
brand(d)
lbp = Image.open(ROOT / "logos" / "lbp-roundel-black-png.png")
lbp, pos = contain(lbp, (72, 260, 300, 300))
im.paste(lbp, pos, lbp)
d.text((72, 650), "LICENSED LEADERSHIP", font=face(28, True), fill="#6d5a3d")
y = block(d, "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner.", 72, 745, face(66, True), INK, 900, 15)
block(d, "We regularly engage LBPs. Always check the LBP Register to ensure your building practitioner is licensed.", 72, y + 75, face(34), MUTED, 900, 15)
im.save(OUT / "story-2-lbp.png")


# 3 — SiteWise Green
im = Image.new("RGB", (W, H), WHITE)
d = ImageDraw.Draw(im)
brand(d)
sitewise = Image.open(ROOT / "logos" / "SiteWise_Green.png")
sitewise, pos = contain(sitewise, (72, 265, 570, 270))
im.paste(sitewise, pos, sitewise)
d.text((72, 650), "HEALTH & SAFETY", font=face(28, True), fill="#6d5a3d")
y = block(d, "SiteWise Green contractor", 72, 745, face(72, True), INK, 900, 15)
block(d, "A Green grading reflects a SiteWise assessment score above 75% and demonstrates sound health & safety systems and processes.", 72, y + 75, face(39), MUTED, 900, 16)
im.save(OUT / "story-3-sitewise.png")


# 4 — CTA
im = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(im)
brand(d, True)
d.text((72, 400), "BUILD WITH CLARITY", font=face(28, True), fill=ACCENT)
y = block(d, "Planning a project in Tauranga or Bay of Plenty?", 72, 500, face(78, True), WHITE, 900, 15)
block(d, "Start with project readiness, buildability and a clear conversation about scope.", 72, y + 75, face(42), "#e7e7e7", 900, 18)
d.rounded_rectangle((72, 1375, 750, 1505), radius=20, fill=ACCENT)
d.text((115, 1415), "START YOUR PROJECT  →", font=face(32, True), fill=INK)
im.save(OUT / "story-4-cta.png")

print(OUT)
