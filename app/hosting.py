"""Opt-in public hosting isolation and bounded temporary storage.

An unguessable HttpOnly cookie scopes each visitor's temporary workspace.
This is a capability session, not a verified user identity.
"""
import os
import re
import secrets
import time
from contextvars import ContextVar
from pathlib import Path
from starlette.responses import JSONResponse

owner = ContextVar('workspace_owner', default='local')

PUBLIC_FRONTEND_ORIGINS = {
    'https://trishulvani.github.io',
    'https://trishul-vani-frontend.onrender.com',
    'http://127.0.0.1:8765',
    'http://localhost:8765',
}

class WorkspacePath:
    def __init__(self, base): self.base = Path(base)
    def path(self): return self.base / owner.get()
    def __truediv__(self, part): return self.path() / part
    def __getattr__(self, key): return getattr(self.path(), key)

def enable_hosting(app):
    if os.getenv('TRISHUL_PUBLIC_HOSTING') != '1': return
    from . import main, spectral, registry
    base = Path(os.getenv('TRISHUL_HOST_DATA', '/tmp/trishul'))
    main.DATA_DIR = WorkspacePath(base/'experiments')
    spectral.ROOT = WorkspacePath(base/'spectral')
    registry.ROOT = WorkspacePath(base/'registry')
    recent = {}

    @app.middleware('http')
    async def workspace(request, call_next):
        # GitHub Pages serves the frontend from its CDN while Render provides
        # processing. A browser-generated capability keeps each workspace
        # isolated without depending on third-party cookies.
        header_session = request.headers.get('x-trishul-workspace', '')
        query_session = request.query_params.get('workspace', '')
        session = header_session or query_session or request.cookies.get('trishul_workspace', '')
        valid = bool(re.fullmatch(r'[a-f0-9]{64}', session))
        if not valid: session = secrets.token_hex(32)
        api = request.url.path.startswith('/api/')
        if api and request.method != 'OPTIONS' and not valid and request.url.path != '/api/health':
            return JSONResponse({'detail':'Open the app first to establish a private workspace. Enable cookies, or open the backend directly.'},401)
        if request.method in ('POST','PUT','DELETE','PATCH'):
            origin = request.headers.get('origin')
            same_origin = str(request.base_url).rstrip('/')
            if origin and origin not in PUBLIC_FRONTEND_ORIGINS and origin != same_origin:
                return JSONResponse({'detail':'Cross-origin write rejected'},403)
            now=time.monotonic()
            # Bounded in-memory abuse guard; one request per visitor every second.
            if len(recent)>10000: recent.clear()
            if now-recent.get(session,0)<1: return JSONResponse({'detail':'Please wait a second before the next operation'},429)
            recent[session]=now
            size=int(request.headers.get('content-length','0'))
            if size>42*1024*1024: return JSONResponse({'detail':'Upload too large'},413)
            # No public unbounded corpus uploads. Local registry remains available.
            if request.url.path.startswith(('/api/datasets','/api/registry')):
                return JSONResponse({'detail':'Dataset registration is available in the local research lab'},403)
            total=sum(p.stat().st_size for p in base.rglob('*') if p.is_file()) if base.exists() else 0
            if total>250*1024*1024: return JSONResponse({'detail':'Temporary server storage is full. Export your work and retry after the next service restart.'},507)
        token=owner.set(session)
        try:
            response=await call_next(request)
            response.headers['Cache-Control']='private, no-store' if api else 'no-cache'
            response.headers['Referrer-Policy']='no-referrer'
            if not valid and not header_session and not query_session:
                response.set_cookie('trishul_workspace',session,httponly=True,secure=True,samesite='none',max_age=86400*7)
            return response
        finally: owner.reset(token)
