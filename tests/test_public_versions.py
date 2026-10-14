"""Guard the unified studio site routes and intro-to-overview entry."""

from pathlib import Path


WEB = Path(__file__).resolve().parents[1] / "web"


def test_main_address_enters_the_preserved_lab_through_the_cinematic_intro():
    page = (WEB / "index.html").read_text(encoding="utf-8-sig")
    assert 'id="arrival"' in page
    assert 'src="/arrival-v2.js?v=9"' in page
    assert 'src="/trident-3d.js?v=3"' in page
    assert 'id="landing-frame"' in page
    assert 'src="/experience.html?story=1"' in page
    assert ".landing-frame.is-entering" in page
    assert "new MutationObserver(reveal)" in page
    arrival = (WEB / "arrival-v2.js").read_text(encoding="utf-8-sig")
    assert "location.replace('/lab.html?design=2')" not in arrival
    assert "Math.exp(-elapsed / 82)" in arrival
    assert "window.tvArrivalPose" in arrival
    story = (WEB / "experience.html").read_text(encoding="utf-8-sig")
    assert 'id="hero-title"' in story
    assert 'href="/lab.html?design=2"' in story
    assert 'class="arrival-weapon-3d"' in page
    model = (WEB / "trident-3d.js").read_text(encoding="utf-8-sig")
    assert "getContext('webgl'" in model
    assert "genuine volumetric trident" in model
    assert "turned-shaft" in model
    assert "tube(path" in model
    assert "gl.drawArrays(gl.TRIANGLES,0,vertexCount)" in model
    assert "vNormal" in model and "specular" in model
    assert ".arrival-weapon-body.has-3d" in (WEB / "intro-v2.css").read_text(encoding="utf-8-sig")


def test_studio_host_is_the_single_site_and_api_origin():
    client = (WEB / "api-client.js").read_text(encoding="utf-8-sig")
    readme = (WEB.parent / "README.md").read_text(encoding="utf-8-sig")
    render = (WEB.parent / "render.yaml").read_text(encoding="utf-8-sig")
    assert "trishul-vani-studio.onrender.com" in client
    assert "https://trishul-vani-studio.onrender.com/" in readme
    assert "name: trishul-vani-frontend" not in render


def test_working_lab_and_studio_are_published_as_static_routes():
    lab = (WEB / "lab.html").read_text(encoding="utf-8-sig")
    studio = (WEB / "studio.html").read_text(encoding="utf-8-sig")
    assert 'id="audio-lab"' in lab
    assert 'id="analytics"' in lab
    assert 'src="/app.js?v=20261014a"' in lab
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


def test_original_edition_stays_on_the_studio_host():
    page = (WEB / "design-v2" / "index.html").read_text(encoding="utf-8-sig")
    assert 'src="/lab.html?design=2"' in page
    assert "trishul-vani-studio.onrender.com/index.html" not in page


def test_github_pages_entry_redirects_to_studio_without_iframe():
    pages = Path(__file__).resolve().parents[1] / "deploy" / "pages"
    main = (pages / "index.html").read_text(encoding="utf-8-sig")
    original = (pages / "design-v2" / "index.html").read_text(encoding="utf-8-sig")
    assert "location.replace('https://trishul-vani-studio.onrender.com/" in main
    assert "location.replace('https://trishul-vani-studio.onrender.com/design-v2/" in original
    assert "<iframe" not in main.lower()
    assert "github.io" not in (pages / "README.md").read_text(encoding="utf-8-sig")
