from __future__ import annotations

import html
import re
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "TRISHUL_VANI_OPERATOR_GUIDE.md"
OUTPUT = ROOT / "output" / "pdf" / "TRISHUL_VANI_Operator_Guide.pdf"
PUBLIC_COPY = ROOT / "web" / "guides" / OUTPUT.name
INK = colors.HexColor("#14231d")
FOREST = colors.HexColor("#0b1712")
GREEN = colors.HexColor("#287a55")
GOLD = colors.HexColor("#b98243")
PALE = colors.HexColor("#edf3ef")
MUTED = colors.HexColor("#596962")


def inline_markup(text: str) -> str:
    tokens = re.split(r"(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`)", text)
    rendered: list[str] = []
    for token in tokens:
        link = re.fullmatch(r"\[([^\]]+)\]\(([^)]+)\)", token)
        bold = re.fullmatch(r"\*\*(.+?)\*\*", token)
        code = re.fullmatch(r"`([^`]+)`", token)
        if link:
            rendered.append(f'<link href="{html.escape(link.group(2), quote=True)}" color="#287a55">{html.escape(link.group(1))}</link>')
        elif bold:
            rendered.append(f"<b>{html.escape(bold.group(1))}</b>")
        elif code:
            rendered.append(f'<font name="Courier">{html.escape(code.group(1))}</font>')
        else:
            rendered.append(html.escape(token))
    return "".join(rendered)


class GuideDoc(BaseDocTemplate):
    def __init__(self, filename: Path, styles: dict[str, ParagraphStyle]):
        super().__init__(str(filename), pagesize=letter, title="TRISHUL VANI Operator Guide", author="TRISHUL VANI Engineering")
        self.styles_map = styles
        frame = Frame(0.68 * inch, 0.66 * inch, 7.14 * inch, 9.35 * inch, id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="main", frames=frame, onPage=self.decorate))

    def decorate(self, canvas, doc):
        canvas.saveState()
        width, height = letter
        if doc.page == 1:
            canvas.setFillColor(FOREST)
            canvas.rect(0, 0, width, height, fill=1, stroke=0)
            canvas.setStrokeColor(GOLD)
            canvas.setLineWidth(1.1)
            for inset in (34, 46, 58):
                canvas.circle(width * 0.5, height * 0.58, 125 + inset, stroke=1, fill=0)
            canvas.setFillColor(GOLD)
            canvas.rect(0.48 * inch, 0.76 * inch, 0.07 * inch, 9.9 * inch, fill=1, stroke=0)
        else:
            canvas.setStrokeColor(colors.HexColor("#d5dfd8"))
            canvas.setLineWidth(0.5)
            canvas.line(0.68 * inch, 0.52 * inch, 7.82 * inch, 0.52 * inch)
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(MUTED)
            canvas.drawString(0.68 * inch, 0.34 * inch, "TRISHUL VANI  /  OPERATOR GUIDE  /  RESEARCH PROTOTYPE")
            canvas.drawRightString(7.82 * inch, 0.34 * inch, f"{doc.page}")
            canvas.setFillColor(GREEN)
            canvas.setFont("Helvetica-Bold", 8)
            canvas.drawString(0.68 * inch, height - 0.45 * inch, "TRISHUL VANI  /  FIELD SOFTWARE WORKBENCH")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "GuideH1":
            title = flowable.getPlainText()
            if title == "Contents":
                return
            key = f"section-{self.seq.nextf('guide')}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, 0, False)
            self.notify("TOCEntry", (0, title, self.page, key))


def parse_source(styles):
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    story = []
    toc = TableOfContents()
    toc.levelStyles = [styles["TOC"]]
    story.extend([
        Spacer(1, 2.22 * inch),
        Paragraph("TRISHUL VANI", styles["CoverTitle"]),
        Paragraph("OPERATOR GUIDE", styles["CoverSub"]),
        Spacer(1, 0.28 * inch),
        Paragraph("Audio research · virtual hardware · reproducible software tests", styles["CoverLine"]),
        Spacer(1, 0.2 * inch),
        Paragraph("College research and engineering review edition  /  14 October 2026", styles["CoverMeta"]),
        Spacer(1, 1.3 * inch),
        Paragraph("PUBLIC WORKSPACE", styles["CoverMeta"]),
        Paragraph('<link href="https://trishul-vani-studio.onrender.com/" color="#e4bd8a">trishul-vani-studio.onrender.com</link>', styles["CoverUrl"]),
        Paragraph("Indexed PDF with clickable contents and section bookmarks", styles["CoverMeta"]),
        PageBreak(),
        Paragraph("Contents", styles["GuideH1"]),
        Paragraph("Select any section below, or use the document outline in your PDF reader.", styles["Body"]),
        Spacer(1, 0.12 * inch),
        toc,
        PageBreak(),
    ])
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line == "---":
            i += 1
            continue
        if line.startswith("# "):
            i += 1
            continue
        if line.startswith("## "):
            story.append(Paragraph(inline_markup(line[3:]), styles["GuideH1"]))
            story.append(Spacer(1, 0.06 * inch))
            i += 1
            continue
        if line.startswith("```"):
            i += 1
            block = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i])
                i += 1
            story.append(Preformatted(html.escape("\n".join(block)), styles["CodeBlock"]))
            story.append(Spacer(1, 0.1 * inch))
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                row = [cell.strip() for cell in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell or "") for cell in row):
                    rows.append([Paragraph(inline_markup(cell), styles["TableHead"] if not rows else styles["TableCell"]) for cell in row])
                i += 1
            table = Table(rows, colWidths=[1.46 * inch, 2.08 * inch, 3.58 * inch], repeatRows=1, hAlign="LEFT")
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), PALE),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#c9d5cd")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.extend([table, Spacer(1, 0.12 * inch)])
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(ListItem(Paragraph(inline_markup(lines[i].strip()[2:]), styles["Body"]), leftIndent=12))
                i += 1
            story.append(ListFlowable(items, bulletType="bullet", start="circle", leftIndent=15, bulletFontName="Helvetica", bulletFontSize=7, bulletColor=GOLD))
            story.append(Spacer(1, 0.08 * inch))
            continue
        paragraph = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", "- ", "|", "```")) and lines[i].strip() != "---":
            paragraph.append(lines[i].strip())
            i += 1
        story.append(Paragraph(inline_markup(" ".join(paragraph)), styles["Body"]))
    return story


def main():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=33, leading=38, alignment=TA_LEFT, textColor=colors.HexColor("#f2f3ee"), spaceAfter=4))
    styles.add(ParagraphStyle(name="CoverSub", fontName="Helvetica-Bold", fontSize=16, leading=21, alignment=TA_LEFT, textColor=colors.HexColor("#d5aa72")))
    styles.add(ParagraphStyle(name="CoverLine", fontName="Helvetica", fontSize=12, leading=18, textColor=colors.HexColor("#d8e1da")))
    styles.add(ParagraphStyle(name="CoverMeta", fontName="Helvetica", fontSize=9, leading=14, textColor=colors.HexColor("#afc2b5"), spaceAfter=5))
    styles.add(ParagraphStyle(name="CoverUrl", fontName="Helvetica-Bold", fontSize=12, leading=18, textColor=colors.HexColor("#e4bd8a"), spaceAfter=7))
    styles.add(ParagraphStyle(name="GuideH1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=21, leading=26, textColor=FOREST, spaceBefore=10, spaceAfter=9, keepWithNext=True))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=14, textColor=INK, spaceAfter=8, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="CodeBlock", fontName="Courier", fontSize=8, leading=12, textColor=INK, backColor=PALE, borderColor=colors.HexColor("#c9d5cd"), borderWidth=0.5, borderPadding=8, leftIndent=10, rightIndent=10, spaceBefore=5, spaceAfter=9))
    styles.add(ParagraphStyle(name="TableHead", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=colors.white))
    styles.add(ParagraphStyle(name="TableCell", fontName="Helvetica", fontSize=7.5, leading=10, textColor=INK))
    styles.add(ParagraphStyle(name="TOC", fontName="Helvetica", fontSize=10, leading=17, leftIndent=12, firstLineIndent=-12, textColor=INK, spaceAfter=5))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)
    doc = GuideDoc(OUTPUT, styles)
    doc.multiBuild(parse_source(styles))
    shutil.copy2(OUTPUT, PUBLIC_COPY)
    print(f"Created {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
    print(f"Published copy source: {PUBLIC_COPY}")


if __name__ == "__main__":
    main()
