from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/bayesian-bandit-strategy-framework.pdf"
PUBLIC = ROOT / "apps/web/public/downloads/bayesian-bandit-strategy-framework.pdf"

PAGE_W, PAGE_H = landscape(A4)
NAVY = HexColor("#0D3551")
BLUE = HexColor("#0B6FB7")
SKY = HexColor("#EAF5FB")
PALE = HexColor("#F5F9FB")
LINE = HexColor("#C9DDE8")
TEXT = HexColor("#19384D")
MUTED = HexColor("#587383")

pdfmetrics.registerFont(
    TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
)
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
    lines = []
    current = ""
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
    text(c, 54, PAGE_H - 160, "ベイズ × バンディット戦略", 29, white)
    text(c, 54, PAGE_H - 205, "意思決定フレームワーク", 25, white)
    text(c, 54, PAGE_H - 255, "広告を、配信作業から学習システムへ。", 13, HexColor("#C8DCE8"))
    text(c, 54, 70, "Framework Brief  /  2026", 9, HexColor("#8DC8EA"))
    text(c, 54, 48, "株式会社ルーキースマートジャパン", 8, HexColor("#C8DCE8"))


def page_problem(c):
    header(c, 2, "WHY")
    title(c, "01 / WHY", "固定配分だけでは、学習が止まる。", "施策の勝ち負けではなく、次の配分判断に使えるデータを残します。")
    items = [
        ("01", "仮説が混ざる", "訴求・制作・LPを分ける", "何が効いたのか判定できない。"),
        ("02", "早すぎる最適化", "初期データで決めない", "探索すべき可能性を失う。"),
        ("03", "事業成果と切れる", "CVだけで判断しない", "商談・受注・粗利へ接続しない。"),
    ]
    w = (PAGE_W - 108) / 3
    for i, (n, label, heading, line) in enumerate(items):
        box(c, 42 + i * (w + 12), 82, w, 230, label, heading, [line], n, PALE)
    footer(c, 2)


def page_framework(c):
    header(c, 3, "FRAMEWORK")
    title(c, "02 / FRAMEWORK", "5段階で、探索を学習へ変える。")
    steps = [
        ("01", "仮説分解", "訴求・クリエイティブ・LPを分ける"),
        ("02", "探索", "固定配分で比較可能な初期データを集める"),
        ("03", "更新", "ベイズ統計で成功確率を逐次更新する"),
        ("04", "配分", "有望施策へ段階的に配分を寄せる"),
        ("05", "事業接続", "商談・受注・粗利を次の判断へ戻す"),
    ]
    x, y, w, h = 42, 105, 138, 235
    for i, (n, heading, body) in enumerate(steps):
        box(c, x + i * (w + 11), y, w, h, "STEP", heading, [body], n, white if i % 2 == 0 else SKY)
    footer(c, 3)


def page_bayes(c):
    header(c, 4, "BAYES")
    title(c, "03 / BAYES", "確率を、データのたびに更新する。", "一点の予測値ではなく、成功する可能性と不確実性を同時に見ます。")
    box(c, 42, 92, 330, 250, "INPUT", "事前の見立て", ["過去実績・類似施策・市場理解を、", "最初の仮説として設定します。"], "01", PALE)
    box(c, 390, 92, 160, 250, "UPDATE", "新しい観測", ["クリック、CV、商談、", "受注のデータを追加。"], "02", SKY)
    box(c, 568, 92, 228, 250, "OUTPUT", "次の判断", ["成功確率と不確実性を更新し、", "継続・拡大・停止を判断。"], "03", PALE)
    footer(c, 4)


def page_bandit(c):
    header(c, 5, "BANDIT")
    title(c, "04 / BANDIT", "探索しながら、機会損失を抑える。")
    box(c, 42, 110, 350, 230, "EXPLORE", "探索枠を残す", ["新しい訴求や未検証の施策へ、", "一定量の配分を残します。"], "01", SKY)
    box(c, 410, 110, 386, 230, "EXPLOIT", "有望施策へ寄せる", ["確率が高まった施策へ段階的に配分し、", "固定A/Bテストより早く学習を反映します。"], "02", PALE)
    text(c, 42, 76, "適用条件：計測品質・最低母数・損失上限・探索枠・停止条件を先に定義します。", 9, MUTED)
    footer(c, 5)


def page_measurement(c):
    header(c, 6, "MEASUREMENT")
    title(c, "05 / MEASUREMENT", "広告から受注まで、一本につなぐ。")
    labels = ["広告・キーワード", "LP・コンテンツ", "Lead ID", "商談", "受注・粗利"]
    x = 42
    for i, label in enumerate(labels):
        c.setFillColor(SKY if i % 2 == 0 else PALE)
        c.setStrokeColor(LINE)
        c.rect(x, 190, 128, 76, fill=1, stroke=1)
        text(c, x + 14, 222, label, 10, NAVY)
        if i < len(labels) - 1:
            text(c, x + 136, 220, "→", 16, BLUE)
        x += 153
    text(c, 42, 145, "Google Tag Manager / GA4 / Search Console / UTM / CRMステージ", 10, MUTED)
    text(c, 42, 116, "判断指標はクリック率だけでなく、商談化率・受注率・粗利まで接続します。", 10, TEXT)
    footer(c, 6)


def page_roadmap(c):
    header(c, 7, "ROADMAP")
    title(c, "06 / ROADMAP", "90日で、判断基盤を立ち上げる。")
    box(c, 42, 150, 230, 190, "DAY 1-30", "定義", ["KPI・データ辞書", "イベント・UTM・CRM接続"], "01", PALE)
    box(c, 292, 150, 230, 190, "DAY 31-60", "探索", ["仮説バックログ", "固定配分による初期検証"], "02", SKY)
    box(c, 542, 150, 254, 190, "DAY 61-90", "配分", ["ベイズ判断ルール", "バンディット配分ルール"], "03", PALE)
    text(c, 42, 108, "本資料は意思決定フレームワークの概要です。成果を保証するものではなく、自動配分エンジンの提供を標準としません。", 8, MUTED)
    c.setFillColor(BLUE)
    c.rect(542, 65, 254, 34, fill=1, stroke=0)
    text(c, 560, 77, "相談日程を確認する  →", 9, white)
    c.linkURL("https://calendar.app.google/gPiaQRbjMoBtnnKu8", (542, 65, 796, 99), relative=0)
    footer(c, 7)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    for page in [page_cover, page_problem, page_framework, page_bayes, page_bandit, page_measurement, page_roadmap]:
        page(c)
        c.showPage()
    c.setTitle("ベイズ × バンディット戦略 意思決定フレームワーク")
    c.setAuthor("株式会社ルーキースマートジャパン")
    c.save()
    PUBLIC.write_bytes(OUTPUT.read_bytes())
    print(OUTPUT)
    print(PUBLIC)


if __name__ == "__main__":
    build()
