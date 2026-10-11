"""Opt-in SQLAlchemy connection and owner-scoped metadata operations."""
from __future__ import annotations
import hashlib
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import Session
from .models import Experiment, ExperimentResult, VisitorSession

_engine = None

def configured() -> bool:
    return bool(os.environ.get('DATABASE_URL'))

def engine():
    global _engine
    if not configured():
        return None
    if _engine is None:
        _engine = create_engine(os.environ['DATABASE_URL'], pool_pre_ping=True, pool_size=2,
                                max_overflow=1, pool_timeout=5, connect_args={'connect_timeout': 5}
                                if os.environ['DATABASE_URL'].startswith('mysql') else {})
    return _engine

def owner_hash() -> str:
    from app.hosting import owner
    return hashlib.sha256(owner.get().encode('utf-8')).hexdigest()

def ready() -> bool:
    db = engine()
    if db is None:
        return False
    try:
        with db.connect() as connection:
            connection.execute(text('SELECT 1'))
            version = connection.execute(text('SELECT version_num FROM alembic_version LIMIT 1')).scalar_one_or_none()
            if version != '0001':
                return False
        return True
    except Exception:
        return False

def save_experiment(record: dict) -> None:
    db = engine()
    if db is None:
        return
    session_id = owner_hash()
    now = datetime.now(timezone.utc)
    with Session(db) as session, session.begin():
        visitor = session.get(VisitorSession, session_id)
        if visitor is None:
            visitor = VisitorSession(token_hash=session_id, created_at=now, last_seen_at=now,
                                     expires_at=now+timedelta(days=7))
            session.add(visitor)
            # MySQL enforces the experiment FK before SQLAlchemy can infer an
            # ordering between these independent pending ORM objects.
            session.flush()
        else:
            visitor.last_seen_at = now
        row = Experiment(id=record['id'], owner_hash=session_id, source_type=record['source'],
                         noise_type=record['noise'], input_snr_db=record['snr_db'], seed=record['seed'],
                         duration_s=record['duration_s'], sample_rate_hz=record['sample_rate'],
                         status='complete', algorithm_version='alpha-0.2',
                         created_at=datetime.fromisoformat(record['created_at']), record_json=record)
        for method, values in record['metrics'].items():
            row.results.append(ExperimentResult(method=method, snr_db=values.get('snr_db'),
                stoi=values.get('stoi'), pesq=values.get('pesq'),
                processing_ms=values.get('processing_ms'), rtf=values.get('rtf'),
                metric_notes=record.get('method_notes', {}).get(method)))
        session.add(row)

def list_experiments() -> list[dict]:
    db = engine()
    with Session(db) as session:
        rows = session.scalars(select(Experiment).where(Experiment.owner_hash == owner_hash())
            .order_by(Experiment.created_at.desc()).limit(80)).all()
        return [r.record_json for r in rows]

def get_experiment(run_id: str) -> dict | None:
    db = engine()
    with Session(db) as session:
        row = session.scalar(select(Experiment).where(Experiment.id == run_id,
                                                   Experiment.owner_hash == owner_hash()))
        return row.record_json if row else None
