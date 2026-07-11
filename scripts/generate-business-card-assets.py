from __future__ import annotations

from pathlib import Path
import os

SITE_URL = "https://www.rookiesmart-jp.com/"
COMPANY_NAME = "株式会社ルーキースマートジャパン"
TAGLINE = "Enterprise AI CRM"
EMAIL = "h.sawasaka@rookiesmart.jp"
WEB = "www.rookiesmart-jp.com"

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "business-card"
LOGO_PATH = ROOT / "apps" / "web" / "public" / "brand" / "rookie-smart-japan" / "rsj-04-apex-signal-logo-transparent.svg"


def reed_solomon_compute_remainder(data: list[int], degree: int) -> list[int]:
    generator = [1]
    root = 1
    for _ in range(degree):
        generator = poly_multiply(generator, [1, root])
        root = gf_multiply(root, 2)

    result = [0] * degree
    for byte in data:
        factor = byte ^ result.pop(0)
        result.append(0)
        for i, coef in enumerate(generator[1:]):
            result[i] ^= gf_multiply(coef, factor)
    return result


def poly_multiply(left: list[int], right: list[int]) -> list[int]:
    result = [0] * (len(left) + len(right) - 1)
    for i, x in enumerate(left):
        for j, y in enumerate(right):
            result[i + j] ^= gf_multiply(x, y)
    return result


def gf_multiply(x: int, y: int) -> int:
    z = 0
    for i in reversed(range(8)):
        z = (z << 1) ^ ((z >> 7) * 0x11D)
        z ^= ((y >> i) & 1) * x
    return z


def get_bit(value: int, index: int) -> int:
    return (value >> index) & 1


def make_qr_svg(data: str, x: int, y: int, size: int) -> str:
    # Version 3-L: 29x29 modules, 55 data codewords, 15 ECC codewords.
    version = 3
    module_count = version * 4 + 17
    data_codewords = 55
    ecc_codewords = 15
    mask = 2

    bits: list[int] = []
    bits += [0, 1, 0, 0]  # byte mode
    payload = data.encode("utf-8")
    bits += [(len(payload) >> i) & 1 for i in reversed(range(8))]
    for byte in payload:
        bits += [(byte >> i) & 1 for i in reversed(range(8))]
    bits += [0] * min(4, data_codewords * 8 - len(bits))
    while len(bits) % 8:
        bits.append(0)

    codewords = [int("".join(str(bit) for bit in bits[i : i + 8]), 2) for i in range(0, len(bits), 8)]
    for pad in [0xEC, 0x11] * data_codewords:
        if len(codewords) >= data_codewords:
            break
        codewords.append(pad)
    codewords += reed_solomon_compute_remainder(codewords, ecc_codewords)

    modules: list[list[bool | None]] = [[None] * module_count for _ in range(module_count)]
    function: list[list[bool]] = [[False] * module_count for _ in range(module_count)]

    def set_function(xx: int, yy: int, value: bool) -> None:
        modules[yy][xx] = value
        function[yy][xx] = True

    def draw_finder(xx: int, yy: int) -> None:
        for dy in range(-1, 8):
            for dx in range(-1, 8):
                rx, ry = xx + dx, yy + dy
                if 0 <= rx < module_count and 0 <= ry < module_count:
                    dark = 0 <= dx <= 6 and 0 <= dy <= 6 and (dx in (0, 6) or dy in (0, 6) or (2 <= dx <= 4 and 2 <= dy <= 4))
                    set_function(rx, ry, dark)

    draw_finder(0, 0)
    draw_finder(module_count - 7, 0)
    draw_finder(0, module_count - 7)

    for i in range(module_count):
        if not function[6][i]:
            set_function(i, 6, i % 2 == 0)
        if not function[i][6]:
            set_function(6, i, i % 2 == 0)

    for center in (6, 22):
        if center == 6:
            continue
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                set_function(center + dx, center + dy, max(abs(dx), abs(dy)) != 1)

    set_function(8, module_count - 8, True)

    bit_index = 0
    direction = -1
    xx = module_count - 1
    data_bits = [(byte >> i) & 1 for byte in codewords for i in reversed(range(8))]
    while xx > 0:
        if xx == 6:
            xx -= 1
        for yy in range(module_count - 1, -1, -1) if direction == -1 else range(module_count):
            for col in (xx, xx - 1):
                if not function[yy][col]:
                    bit = data_bits[bit_index] if bit_index < len(data_bits) else 0
                    modules[yy][col] = bool(bit ^ qr_mask(mask, col, yy))
                    bit_index += 1
        xx -= 2
        direction *= -1

    draw_format_bits(modules, function, mask, module_count)

    unit = size / (module_count + 8)
    rects = [f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="#ffffff"/>']
    for yy in range(module_count):
        for xx in range(module_count):
            if modules[yy][xx]:
                rects.append(
                    f'<rect x="{x + (xx + 4) * unit:.3f}" y="{y + (yy + 4) * unit:.3f}" width="{unit:.3f}" height="{unit:.3f}" fill="#101827"/>'
                )
    return "\n".join(rects)


def qr_mask(mask: int, x: int, y: int) -> int:
    if mask == 0:
        return int((x + y) % 2 == 0)
    if mask == 1:
        return int(y % 2 == 0)
    if mask == 2:
        return int(x % 3 == 0)
    if mask == 3:
        return int((x + y) % 3 == 0)
    raise ValueError(mask)


def draw_format_bits(modules: list[list[bool | None]], function: list[list[bool]], mask: int, size: int) -> None:
    # Error correction level L is format value 1.
    data = (1 << 3) | mask
    rem = data
    for _ in range(10):
        rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537)
    bits = ((data << 10) | rem) ^ 0x5412

    coords1 = [(8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8), (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)]
    coords2 = [(size - 1, 8), (size - 2, 8), (size - 3, 8), (size - 4, 8), (size - 5, 8), (size - 6, 8), (size - 7, 8), (8, size - 8), (8, size - 7), (8, size - 6), (8, size - 5), (8, size - 4), (8, size - 3), (8, size - 2), (8, size - 1)]
    for i in range(15):
        value = bool((bits >> i) & 1)
        for xx, yy in (coords1[i], coords2[i]):
            modules[yy][xx] = value
            function[yy][xx] = True


def svg_template(front: bool) -> str:
    width, height = 1050, 600
    logo_href = os.path.relpath(LOGO_PATH, OUT_DIR).replace(os.sep, "/")
    if front:
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" rx="0" fill="#08111f"/>
  <path d="M0 450 C220 390 310 300 500 360 C700 424 785 256 1050 198 L1050 600 L0 600 Z" fill="#0e2239"/>
  <path d="M716 -80 C840 70 948 134 1100 136" fill="none" stroke="#2de0a5" stroke-width="2.5" opacity=".55"/>
  <path d="M676 -88 C812 112 918 180 1100 188" fill="none" stroke="#58a6ff" stroke-width="2" opacity=".45"/>
  <rect x="70" y="70" width="910" height="460" rx="18" fill="none" stroke="#24344c" stroke-width="1.5"/>
  <image href="{logo_href}" x="66" y="58" width="470" height="118" preserveAspectRatio="xMinYMid meet"/>
  <text x="86" y="302" fill="#ffffff" font-family="'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" font-size="40" font-weight="800">{COMPANY_NAME}</text>
  <text x="88" y="348" fill="#9fb2ca" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3">{TAGLINE.upper()}</text>
  <line x1="86" y1="398" x2="442" y2="398" stroke="#2de0a5" stroke-width="3"/>
  <text x="88" y="448" fill="#d9e5f5" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="600">{EMAIL}</text>
  <text x="88" y="488" fill="#93a4bb" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="600">{WEB}</text>
  <text x="865" y="472" fill="#d9e5f5" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900">RSJ</text>
  <text x="870" y="502" fill="#63748c" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2">AI CRM</text>
</svg>
"""

    qr_svg = make_qr_svg(SITE_URL, 369, 96, 312)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#f7f9fc"/>
  <rect x="64" y="64" width="922" height="472" rx="18" fill="#ffffff" stroke="#dde5ef" stroke-width="1.5"/>
  <path d="M64 536 L986 536 L986 392 C820 436 690 456 540 416 C368 370 258 412 64 472 Z" fill="#edf4fb"/>
  <path d="M64 64 L986 64 L986 158 C834 136 716 104 552 148 C365 198 232 160 64 132 Z" fill="#f0fbf7"/>
  {qr_svg}
</svg>
"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "rookie-smart-japan-business-card-front.svg").write_text(svg_template(front=True), encoding="utf-8")
    (OUT_DIR / "rookie-smart-japan-business-card-back.svg").write_text(svg_template(front=False), encoding="utf-8")


if __name__ == "__main__":
    main()
