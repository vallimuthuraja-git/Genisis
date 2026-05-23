from __future__ import annotations

from pathlib import Path
from pydantic import BaseModel, Field


class Locator(BaseModel):
    type: str = "css"
    value: str


class Position(BaseModel):
    x: float = 0
    y: float = 0


class Identifier(BaseModel):
    description: str | None = None
    type: str = "css"
    value: str = ""
    condition: str = "exists"


class Action(BaseModel):
    type: str
    url: str | None = None
    locator: Locator | None = None
    value: str | None = None
    duration: int | None = None
    key: str | None = None
    name: str | None = None


class Scraper(BaseModel):
    name: str
    type: str = "text"
    locator: Locator


class State(BaseModel):
    id: str
    name: str
    identifiers: list[Identifier] = Field(default_factory=list)
    actions: list[Action] = Field(default_factory=list)
    scrapers: list[Scraper] = Field(default_factory=list)
    next: str | None = None
    position: Position = Field(default_factory=Position)
    advanced: dict = Field(default_factory=dict)


class Workflow(BaseModel):
    id: str
    name: str
    states: list[State]


class SaveWorkflowRequest(BaseModel):
    filename: str
    workflow: Workflow


class RunWorkflowRequest(BaseModel):
    filename: str | None = None
    workflow: Workflow | None = None


class TestLocatorRequest(BaseModel):
    locator: Locator


BASE_DIR = Path(__file__).resolve().parents[1]
WORKFLOWS_DIR = BASE_DIR / "workflows"
BROWSER_DATA_DIR = BASE_DIR / "browser_data"
RUN_LOGS_DIR = BASE_DIR / "run_logs"
