from __future__ import annotations

import json
from pathlib import Path

from models import WORKFLOWS_DIR, Workflow


def list_workflows() -> list[str]:
    WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    return sorted([p.name for p in WORKFLOWS_DIR.glob("*.json")])


def save_workflow(filename: str, workflow: Workflow) -> Path:
    WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    target = WORKFLOWS_DIR / (filename if filename.endswith(".json") else f"{filename}.json")
    target.write_text(json.dumps(workflow.model_dump(), indent=2), encoding="utf-8")
    return target


def load_workflow(filename: str) -> Workflow:
    target = WORKFLOWS_DIR / filename
    data = json.loads(target.read_text(encoding="utf-8"))
    return Workflow.model_validate(data)
