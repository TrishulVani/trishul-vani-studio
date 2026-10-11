"""Optional structured research metadata. Media remains outside the database."""
from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    pass

class VisitorSession(Base):
    __tablename__ = 'visitor_sessions'
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class Experiment(Base):
    __tablename__ = 'experiments'
    id: Mapped[str] = mapped_column(String(12), primary_key=True)
    owner_hash: Mapped[str] = mapped_column(ForeignKey('visitor_sessions.token_hash'), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    noise_type: Mapped[str] = mapped_column(String(255), nullable=False)
    input_snr_db: Mapped[float | None] = mapped_column(Float)
    seed: Mapped[int | None] = mapped_column(Integer)
    duration_s: Mapped[float] = mapped_column(Float, nullable=False)
    sample_rate_hz: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default='complete')
    algorithm_version: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    record_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    results: Mapped[list['ExperimentResult']] = relationship(cascade='all, delete-orphan')
    __table_args__ = (Index('ix_experiments_owner_created', 'owner_hash', 'created_at'),)

class ExperimentResult(Base):
    __tablename__ = 'experiment_results'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    experiment_id: Mapped[str] = mapped_column(ForeignKey('experiments.id', ondelete='CASCADE'), nullable=False, index=True)
    method: Mapped[str] = mapped_column(String(32), nullable=False)
    snr_db: Mapped[float | None] = mapped_column(Float)
    stoi: Mapped[float | None] = mapped_column(Float)
    pesq: Mapped[float | None] = mapped_column(Float)
    processing_ms: Mapped[float | None] = mapped_column(Float)
    rtf: Mapped[float | None] = mapped_column(Float)
    metric_notes: Mapped[str | None] = mapped_column(Text)
    __table_args__ = (Index('uq_result_experiment_method', 'experiment_id', 'method', unique=True),)

class AudioAsset(Base):
    __tablename__ = 'audio_assets'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    owner_hash: Mapped[str] = mapped_column(ForeignKey('visitor_sessions.token_hash'), nullable=False, index=True)
    experiment_id: Mapped[str | None] = mapped_column(ForeignKey('experiments.id', ondelete='SET NULL'))
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(80), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    storage_state: Mapped[str] = mapped_column(String(24), nullable=False)
    duration_s: Mapped[float | None] = mapped_column(Float)
    sample_rate_hz: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

class SpectralSession(Base):
    __tablename__ = 'spectral_sessions'
    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    owner_hash: Mapped[str] = mapped_column(ForeignKey('visitor_sessions.token_hash'), nullable=False, index=True)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_asset_id: Mapped[str | None] = mapped_column(ForeignKey('audio_assets.id'))
    manifest_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

class SpectralLayer(Base):
    __tablename__ = 'spectral_layers'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey('spectral_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    layer_key: Mapped[str] = mapped_column(String(64), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    recipe_json: Mapped[dict | None] = mapped_column(JSON)
    asset_id: Mapped[str | None] = mapped_column(ForeignKey('audio_assets.id'))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    __table_args__ = (Index('uq_spectral_session_layer', 'session_id', 'layer_key', unique=True),)

class DatasetRecord(Base):
    __tablename__ = 'dataset_records'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    owner_hash: Mapped[str] = mapped_column(ForeignKey('visitor_sessions.token_hash'), nullable=False, index=True)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(1024))
    license_declared: Mapped[str] = mapped_column(String(255), nullable=False)
    attribution: Mapped[str | None] = mapped_column(String(512))
    split: Mapped[str | None] = mapped_column(String(32))
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    is_real_recording: Mapped[bool] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
