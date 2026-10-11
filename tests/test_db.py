from datetime import datetime, timezone
from pathlib import Path
import pytest
from alembic import command
from alembic.config import Config
from app import db
from app.hosting import owner


def sample_record(run_id='abcdef123456'):
    return dict(id=run_id, created_at=datetime.now(timezone.utc).isoformat(), source='synthetic',
                noise='factory', snr_db=0.0, duration_s=1.5, sample_rate=16000, seed=42,
                model='spectral_fallback', metrics={'raw': {'snr_db': 0.0, 'stoi': None,
                'pesq': None, 'processing_ms': 1.0, 'rtf': 0.01}},
                method_notes={'raw': 'Unprocessed input'})


def migrate(url):
    config = Config(str(Path(__file__).resolve().parents[1] / 'alembic.ini'))
    command.upgrade(config, 'head')


def test_owner_scoped_metadata_and_migration(tmp_path, monkeypatch):
    url = f'sqlite:///{(tmp_path / "metadata.sqlite").as_posix()}'
    monkeypatch.setenv('DATABASE_URL', url)
    db._engine = None
    try:
        migrate(url)
        assert db.ready()
        token = owner.set('visitor-one')
        try:
            db.save_experiment(sample_record())
            assert db.get_experiment('abcdef123456')['seed'] == 42
            assert db.list_experiments()[0]['id'] == 'abcdef123456'
        finally:
            owner.reset(token)
        token = owner.set('visitor-two')
        try:
            assert db.get_experiment('abcdef123456') is None
            assert db.list_experiments() == []
        finally:
            owner.reset(token)
    finally:
        if db._engine is not None: db._engine.dispose()
        db._engine = None


@pytest.mark.skipif(not __import__('os').environ.get('MYSQL_TEST_URL'), reason='No CI MySQL service')
def test_mysql_migration_and_owner_scope(monkeypatch):
    url = __import__('os').environ['MYSQL_TEST_URL']
    monkeypatch.setenv('DATABASE_URL', url)
    db._engine = None
    try:
        migrate(url)
        assert db.ready()
        token = owner.set('ci-visitor')
        try:
            db.save_experiment(sample_record('abcdef654321'))
            assert db.get_experiment('abcdef654321')['model'] == 'spectral_fallback'
        finally:
            owner.reset(token)
        token = owner.set('different-visitor')
        try:
            assert db.get_experiment('abcdef654321') is None
        finally:
            owner.reset(token)
    finally:
        if db._engine is not None: db._engine.dispose()
        db._engine = None


def test_api_owner_boundary_and_expired_media(tmp_path, monkeypatch):
    import json
    from fastapi import HTTPException
    import app.main as core
    url = f'sqlite:///{(tmp_path / "api.sqlite").as_posix()}'
    monkeypatch.setenv('DATABASE_URL', url)
    monkeypatch.setattr(core, 'DATA_DIR', tmp_path / 'runs')
    db._engine = None
    try:
        migrate(url)
        record = sample_record('123456abcdef')
        token = owner.set('owner-a')
        try:
            db.save_experiment(record)
            folder = core.DATA_DIR / record['id']
            folder.mkdir(parents=True)
            (folder / 'report.json').write_text(json.dumps(record), encoding='utf-8')
            assert core.readiness()['database'] == 'connected'
            assert core.experiments()[0]['id'] == record['id']
            assert core.experiment(record['id'])['id'] == record['id']
        finally:
            owner.reset(token)
        token = owner.set('owner-b')
        try:
            assert core.experiments() == []
            with pytest.raises(HTTPException) as denied:
                core.experiment(record['id'])
            assert denied.value.status_code == 404
        finally:
            owner.reset(token)
        (folder / 'report.json').unlink()
        token = owner.set('owner-a')
        try:
            with pytest.raises(HTTPException) as expired:
                core.experiment(record['id'])
            assert expired.value.status_code == 410
        finally:
            owner.reset(token)
    finally:
        if db._engine is not None: db._engine.dispose()
        db._engine = None
