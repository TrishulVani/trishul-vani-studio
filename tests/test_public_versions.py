"""Guard the Render Static Site publication structure and entry routes."""

from pathlib import Path


WEB = Path(__file__).resolve().parents[1] / "web"


def test_main_address_enters_the_preserved_lab_through_the_cinematic_intro():
    page = (WEB / "index.html").read_text(encoding="utf-8-sig")
    assert 'id="arrival"' in page
    assert 'src="/arrival-v2.js?v=6"' in page
    assert 'id="landing-frame"' in page
    assert 'src="/lab.html?design=2&amp;release=ec436603#overview"' in page
    assert ".landing-frame.is-entering" in page
    assert "new MutationObserver(reveal)" in page


def test_working_lab_and_studio_are_published_as_static_routes():
    lab = (WEB / "lab.html").read_text(encoding="utf-8-sig")
    studio = (WEB / "studio.html").read_text(encoding="utf-8-sig")
    assert 'id="audio-lab"' in lab
    assert 'id="analytics"' in lab
    assert 'src="/app.js?v=20261013a"' in lab
    assert 'src="studio.js"' in studio


def test_original_edition_stays_on_the_static_host():
    page = (WEB / "design-v2" / "index.html").read_text(encoding="utf-8-sig")
    assert 'src="/lab.html?design=2"' in page
    assert "trishul-vani-studio.onrender.com/index.html" not in page
