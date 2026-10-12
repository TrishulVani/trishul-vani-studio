"""Guard the two public addresses against an accidental edition reversal."""

from html.parser import HTMLParser
from pathlib import Path


PAGES = Path(__file__).resolve().parents[1] / "deploy" / "pages"
BACKEND = "https://trishul-vani-studio.onrender.com"


class FrameParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == "iframe":
            self.sources.append(dict(attrs).get("src"))


def _frame(path):
    page = (PAGES / path).read_text(encoding="utf-8-sig")
    parser = FrameParser()
    parser.feed(page)
    assert len(parser.sources) == 1
    return parser.sources[0]


def test_main_address_opens_cinematic_experience():
    assert _frame("index.html") == f"{BACKEND}/experience.html"


def test_original_edition_opens_previous_default_dashboard():
    assert _frame("design-v2/index.html") == f"{BACKEND}/index.html"
