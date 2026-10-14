"""Guard the Render Static Site publication structure and entry routes."""

from pathlib import Path


WEB = Path(__file__).resolve().parents[1] / "web"


def test_main_address_is_a_direct_cinematic_entry_without_backend_iframe():
    page = (WEB / "index.html").read_text(encoding="utf-8-sig")
    assert 'id="arrival"' in page
    assert 'src="/arrival-v2.js?v=6"' in page
    assert "<iframe" not in page


def test_working_lab_and_studio_are_published_as_static_routes():
    lab = (WEB / "lab.html").read_text(encoding="utf-8-sig")
    studio = (WEB / "studio.html").read_text(encoding="utf-8-sig")
    assert 'id="audio-lab"' in lab
    assert 'id="analytics"' in lab
    assert 'src="/app.js?v=20261013a"' in lab
    assert 'src="studio.js"' in studio


def test_overview_dashboard_links_to_existing_workspaces_and_keeps_the_story():
    lab = (WEB / "lab.html").read_text(encoding="utf-8-sig")
    dashboard = lab.index('id="workspace-dashboard"')
    story = lab.index('class="v2-cinema"')
    assert dashboard < story
    for target in ('href="#audio-lab"', 'href="/studio.html"', 'href="#hardware-lab"', 'href="#datasets"'):
        assert target in lab[dashboard:story]
    assert 'class="workspace-dashboard-metrics"' in lab[dashboard:story]
    assert 'class="workspace-signal-plot"' in lab[dashboard:story]
    assert 'workspace-activity-panel' in lab[dashboard:story]
    assert lab[dashboard:story].count('class="workspace-dashboard-links"') == 1
    assert 'id="environments"' in lab
    assert ".workspace-dashboard-metrics" in (WEB / "design-v2.css").read_text(encoding="utf-8-sig")


def test_original_edition_stays_on_the_static_host():
    page = (WEB / "design-v2" / "index.html").read_text(encoding="utf-8-sig")
    assert 'src="/lab.html?design=2"' in page
    assert "trishul-vani-studio.onrender.com/index.html" not in page


def test_github_pages_entry_redirects_to_render_without_iframe():
    pages = Path(__file__).resolve().parents[1] / "deploy" / "pages"
    main = (pages / "index.html").read_text(encoding="utf-8-sig")
    original = (pages / "design-v2" / "index.html").read_text(encoding="utf-8-sig")
    assert "location.replace('https://trishul-vani-frontend.onrender.com/" in main
    assert "location.replace('https://trishul-vani-frontend.onrender.com/design-v2/" in original
    assert "<iframe" not in main.lower()
    assert "github.io" not in (pages / "README.md").read_text(encoding="utf-8-sig")
