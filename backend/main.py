from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from browser import init_browser_manager
from models import BROWSER_DATA_DIR, RUN_LOGS_DIR, RunWorkflowRequest, SaveWorkflowRequest, TestLocatorRequest
from runtime import WorkflowRuntime
from utils import resolve_locator
from workflow_store import list_workflows, load_workflow, save_workflow

app = FastAPI(title="Genesis MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

browser_manager = init_browser_manager(BROWSER_DATA_DIR)
runtime = WorkflowRuntime(browser_manager)
connections: set[WebSocket] = set()


async def broadcast(payload: dict[str, Any]) -> None:
    dead = []
    for ws in connections:
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.discard(ws)


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/workflows")
async def workflows_list():
    return {"items": list_workflows()}


@app.get("/workflows/{filename}")
async def workflow_get(filename: str):
    wf = load_workflow(filename)
    return wf.model_dump()


@app.post("/workflows/save")
async def workflow_save(req: SaveWorkflowRequest):
    path = save_workflow(req.filename, req.workflow)
    return {"saved": path.name}


@app.post("/run-workflow")
async def run_workflow(req: RunWorkflowRequest):
    workflow = req.workflow if req.workflow else load_workflow(req.filename or "")
    RUN_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = RUN_LOGS_DIR / f"{workflow.id}_{run_id}.jsonl"

    async def emit(event: dict[str, Any]):
        entry = {
            "time": datetime.now(timezone.utc).isoformat(),
            "runId": run_id,
            "workflowId": workflow.id,
            **event,
        }
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        if event.get("type") != "log":
            await broadcast(entry)

    async def run_and_log():
        await emit({"type": "run", "status": "started", "logFile": str(log_path)})
        try:
            await runtime.run(workflow, emit)
            await emit({"type": "run", "status": "finished", "logFile": str(log_path)})
        except Exception as exc:
            await emit({"type": "error", "message": str(exc), "logFile": str(log_path)})

    asyncio.create_task(run_and_log())
    return {"status": "started", "workflow": workflow.id, "runId": run_id, "logFile": str(log_path)}


@app.post("/locators/test")
async def test_locator(req: TestLocatorRequest):
    page = await browser_manager.get_page()
    locator = resolve_locator(page, req.locator.model_dump())
    count = await locator.count()
    visible = False
    if count > 0:
        visible = await locator.first.is_visible()
    return {"found": count > 0, "count": count, "visible": visible}


@app.websocket("/ws/logs")
async def ws_logs(ws: WebSocket):
    await ws.accept()
    connections.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        connections.discard(ws)
