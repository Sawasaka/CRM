from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/sales-led-gtm-wedge-model.pdf"
PUBLIC = ROOT / "apps/web/public/downloads/sales-led-gtm-wedge-model.pdf"

PAGE_W, PAGE_H = landscape(A4)
NAVY = HexColor("#0D3551")
BLUE = HexColor("#0B6FB7")
SKY = HexColor("#EAF5FB")
PALE = HexColor("#F5F9FB")
LINE = HexColor("#C9DDE8")
TEXT = HexColor("#19384D")
MUTED = HexColor("#587383")

pdfmetrics.registerFont(TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))
FONT = "ArialUnicode"


def text(c, x, y, value, size=12, color=TEXT):
    c.setFont(FONT, size)
    c.setFillColor(color)
    c.drawString(x, y, value)


def right_text(c, x, y, value, size=12, color=TEXT):
    c.setFont(FONT, size)
    c.setFillColor(color)
    c.drawRightString(x, y, value)


def wrapped_text(c, x, y, value, size, max_width, leading, color=TEXT):
    lines, current = [], ""
    for character in value:
        candidate = current + character
        if current and pdfmetrics.stringWidth(candidate, FONT, size) > max_width:
            lines.append(current)
            current = character
        else:
            current = candidate
    if current:
        lines.append(current)
    for line in lines:
        text(c, x, y, line, size, color)
        y -= leading
    return y


def header(c, page_no, section):
    text(c, 42, PAGE_H - 34, "ROOKIE SMART JAPAN", 8, BLUE)
    right_text(c, PAGE_W - 42, PAGE_H - 34, f"{section}  /  {page_no:02d}", 8, MUTED)
    c.setStrokeColor(LINE)
    c.line(42, PAGE_H - 44, PAGE_W - 42, PAGE_H - 44)


def footer(c, page_no):
    c.setStrokeColor(LINE)
    c.line(42, 32, PAGE_W - 42, 32)
    text(c, 42, 18, "株式会社ルーキースマートジャパン", 7, MUTED)
    right_text(c, PAGE_W - 42, 18, str(page_no), 7, MUTED)


def title(c, eyebrow, heading, sub=None):
    text(c, 42, PAGE_H - 76, eyebrow, 8, BLUE)
    text(c, 42, PAGE_H - 116, heading, 25, NAVY)
    if sub:
        text(c, 42, PAGE_H - 142, sub, 10, MUTED)


def box(c, x, y, w, h, label, heading, body_lines, number=None, fill=white):
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.rect(x, y, w, h, fill=1, stroke=1)
    if number:
        c.setFillColor(BLUE)
        c.rect(x + 16, y + h - 42, 28, 28, fill=1, stroke=0)
        text(c, x + 23, y + h - 33, number, 8, white)
        tx = x + 56
    else:
        tx = x + 18
    text(c, tx, y + h - 25, label, 7, BLUE)
    max_width = w - (tx - x) - 14
    yy = wrapped_text(c, tx, y + h - 49, heading, 13, max_width, 18, NAVY) - 5
    for line in body_lines:
        yy = wrapped_text(c, tx, yy, line, 8.5, max_width, 15, MUTED)


def page_cover(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#174D6D"))
    c.circle(PAGE_W - 70, PAGE_H - 40, 185, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(0, 0, 18, PAGE_H, fill=1, stroke=0)
    text(c, 54, PAGE_H - 70, "ROOKIE SMART JAPAN", 9, HexColor("#8DC8EA"))
    text(c, 54, PAGE_H - 160, "Sales-led GTM × Wedgeモデル", 29, white)
    text(c, 54, PAGE_H - 210, "顧客獲得の設計ガイド", 25, white)
    text(c, 54, PAGE_H - 260, "小さな突破口から、再現性のある営業網へ。", 13, HexColor("#C8DCE8"))
    text(c, 54, 70, "GTM Guide  /  2026", 9, HexColor("#8DC8EA"))
    text(c, 54, 48, "株式会社ルーキースマートジャパン", 8, HexColor("#C8DCE8"))


def page_goal(c):
    header(c, 2, "GOAL")
    title(c, "01 / GOAL", "最初の受注から、成長の兆候をつかむ。", "売る相手と勝ち筋を絞り、顧客の反応から再現可能な市場開拓へつなげます。")
    items = [
        ("01", "FOCUS", "対象を絞る", "広い市場ではなく、課題が強い顧客から始める。"),
        ("02", "SELL", "対話で確かめる", "提案と商談を通じて、選ばれる理由を検証する。"),
        ("03", "LEARN", "勝ち筋を残す", "受注・失注の学びを、営業網と提供価値へ戻す。"),
    ]
    w = (PAGE_W - 108) / 3
    for i, (n, label, heading, body) in enumerate(items):
        box(c, 42 + i * (w + 12), 82, w, 230, label, heading, [body], n, PALE if i != 1 else SKY)
    footer(c, 2)


def page_wedge(c):
    header(c, 3, "WEDGE")
    title(c, "02 / WEDGE", "狭い入口から、市場を切り開く。")
    box(c, 42, 104, 230, 238, "CUSTOMER", "切実な課題", ["今すぐ解決したい課題を持ち、", "意思決定が進みやすい顧客を選ぶ。"], "01", PALE)
    box(c, 292, 104, 230, 238, "VALUE", "明確な価値", ["導入前後の変化を、", "顧客の言葉と数字で示せる形にする。"], "02", SKY)
    box(c, 542, 104, 254, 238, "EXPANSION", "隣接市場への展開", ["最初の成功条件を再利用し、", "類似顧客・用途・地域へ営業網を広げる。"], "03", PALE)
    footer(c, 3)


def page_motion(c):
    header(c, 4, "SALES MOTION")
    title(c, "03 / SALES MOTION", "顧客対話を、成長の学習ループへ。")
    steps = [
        ("01", "対象", "ICPと優先アカウント"),
        ("02", "接点", "紹介・アウトバウンド"),
        ("03", "商談", "課題・価値・条件の検証"),
        ("04", "受注", "成功条件と導入設計"),
        ("05", "学習", "失注理由と顧客の声"),
    ]
    x, y, w, h = 42, 105, 138, 235
    for i, (n, heading, body) in enumerate(steps):
        box(c, x + i * (w + 11), y, w, h, "STEP", heading, [body], n, white if i % 2 == 0 else SKY)
    footer(c, 4)


def page_signals(c):
    header(c, 5, "SIGNALS")
    title(c, "04 / SIGNALS", "成長の兆候を、数字と言葉で捉える。")
    box(c, 42, 110, 230, 230, "DEMAND", "反応", ["返信率・商談化率", "紹介と再問い合わせ"], "01", SKY)
    box(c, 292, 110, 230, 230, "VALUE", "納得", ["課題の一致度", "提案への反応・失注理由"], "02", PALE)
    box(c, 542, 110, 254, 230, "REVENUE", "収益", ["受注率・ARR", "継続・アップセル可能性"], "03", SKY)
    footer(c, 5)


def page_system(c):
    header(c, 6, "OPERATING SYSTEM")
    title(c, "05 / OPERATING SYSTEM", "営業網を、個人技から仕組みへ。")
    labels = ["ICP", "訴求", "商談ステージ", "営業プレイブック", "CS・改善"]
    x = 42
    for i, label in enumerate(labels):
        c.setFillColor(SKY if i % 2 == 0 else PALE)
        c.setStrokeColor(LINE)
        c.rect(x, 190, 128, 76, fill=1, stroke=1)
        text(c, x + 14, 222, label, 10, NAVY)
        if i < len(labels) - 1:
            text(c, x + 136, 220, "→", 16, BLUE)
        x += 153
    text(c, 42, 145, "判断基準をCRMへ実装し、案件の進捗・失注理由・顧客の声を同じ言葉で記録します。", 10, MUTED)
    text(c, 42, 116, "営業・マーケティング・カスタマーサクセスを、一つの顧客獲得プロセスへ接続します。", 10, TEXT)
    footer(c, 6)


def page_roadmap(c):
    header(c, 7, "ROADMAP")
    title(c, "06 / ROADMAP", "90日で、最初の勝ち筋を形にする。")
    box(c, 42, 150, 230, 190, "DAY 1-30", "仮説", ["市場・ICP・課題", "提供価値と優先アカウント"], "01", PALE)
    box(c, 292, 150, 230, 190, "DAY 31-60", "検証", ["接点創出・商談", "提案と失注理由の収集"], "02", SKY)
    box(c, 542, 150, 254, 190, "DAY 61-90", "展開", ["勝ち筋の標準化", "営業網・CRM・CSへの接続"], "03", PALE)
    text(c, 42, 108, "本資料は顧客獲得設計の概要です。対象市場や提供価値に応じて、実行範囲と判断指標を定義します。", 8, MUTED)
    c.setFillColor(BLUE)
    c.rect(542, 65, 254, 34, fill=1, stroke=0)
    text(c, 560, 77, "相談日程を確認する  →", 9, white)
    c.linkURL("https://calendar.app.google/gPiaQRbjMoBtnnKu8", (542, 65, 796, 99), relative=0)
    footer(c, 7)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    for page in [page_cover, page_goal, page_wedge, page_motion, page_signals, page_system, page_roadmap]:
        page(c)
        c.showPage()
    c.setTitle("Sales-led GTM × Wedgeモデル 顧客獲得の設計ガイド")
    c.setAuthor("株式会社ルーキースマートジャパン")
    c.save()
    PUBLIC.write_bytes(OUTPUT.read_bytes())
    print(OUTPUT)
    print(PUBLIC)


if __name__ == "__main__":
    build()
