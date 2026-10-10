"""python -m scripts.ingest_dataset clip.wav provenance.json"""
import argparse
import json
from pathlib import Path
from app.registry import Provenance, ingest

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('audio', type=Path)
    parser.add_argument('metadata', type=Path)
    args = parser.parse_args()
    print(json.dumps(ingest(args.audio.read_bytes(), Provenance.model_validate_json(args.metadata.read_text())), indent=2))
