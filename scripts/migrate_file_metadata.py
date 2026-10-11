"""Idempotently import existing file reports into optional SQL metadata storage.

This reads metadata only. It does not copy or preserve WAV files. Dry-run is the default.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path
from app import db
from app.hosting import owner


def migrate(source: Path, apply: bool = False) -> dict[str, int]:
    if not db.configured() or not db.ready():
        raise RuntimeError('Migrated DATABASE_URL is required')
    result = {'examined': 0, 'imported': 0, 'existing': 0, 'invalid': 0}
    for file in sorted(source.glob('*/report.json')) + sorted(source.glob('*/*/report.json')):
        result['examined'] += 1
        rel = file.relative_to(source)
        session = rel.parts[0] if len(rel.parts) == 3 else 'local'
        if session != 'local' and not re.fullmatch(r'[a-f0-9]{64}', session):
            result['invalid'] += 1
            continue
        try:
            record = json.loads(file.read_text(encoding='utf-8'))
            if not re.fullmatch(r'[a-f0-9]{12}', record['id']) or file.parent.name != record['id']:
                raise ValueError('Identifier mismatch')
            if not isinstance(record['metrics'], dict):
                raise ValueError('Metrics missing')
            token = owner.set(session)
            try:
                if db.get_experiment(record['id']) is not None:
                    result['existing'] += 1
                elif apply:
                    db.save_experiment(record)
                    result['imported'] += 1
            finally:
                owner.reset(token)
        except (ValueError, KeyError, OSError):
            result['invalid'] += 1
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path, help='Existing experiment folder')
    parser.add_argument('--apply', action='store_true', help='Write new metadata rows (default: dry run)')
    args = parser.parse_args()
    print(json.dumps(migrate(args.source.resolve(), args.apply), sort_keys=True))
