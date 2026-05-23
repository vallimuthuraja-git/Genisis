from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from actions import ACTION_HANDLERS
from browser import BrowserManager
from models import Workflow
from utils import resolve_locator


class WorkflowRuntime:
    def __init__(self, browser_manager: BrowserManager):
        self.browser_manager = browser_manager

    async def run(self, workflow: Workflow, emit: Callable[[dict[str, Any]], Awaitable[None]]) -> dict[str, Any]:
        page = await self.browser_manager.get_page()
        state_map = {s.id: s for s in workflow.states}
        variables: dict[str, Any] = {}
        current = workflow.states[0].id if workflow.states else None

        async def log(msg: str, state_id: str | None = None):
            await emit({"type": "log", "message": msg, "stateId": state_id})

        while current:
            state = state_map.get(current)
            if not state:
                await log(f"missing state: {current}")
                break
            await emit({"type": "state", "stateId": state.id, "status": "running"})
            await log(f"state start: {state.name}", state.id)

            for action in [a for a in state.actions if a.type == "navigate"]:
                handler = ACTION_HANDLERS.get(action.type)
                if not handler:
                    raise ValueError(f"Unsupported action type: {action.type}")
                await handler(page, action, variables, lambda m: log(m, state.id))

            for identifier in state.identifiers:
                data = identifier.model_dump()
                condition = data.get("condition", "exists")
                if condition == "url_contains":
                    found = data.get("value", "") in page.url
                    count = 1 if found else 0
                else:
                    locator = resolve_locator(page, data)
                    count = await locator.count()
                    found = count > 0
                    if condition == "not_exists":
                        found = count == 0
                    elif condition == "text_exists":
                        found = count > 0
                if not found:
                    raise ValueError(f"Identifier failed in state {state.id}: {condition} {identifier.type}={identifier.value}")
                await log(f"identifier passed: {condition} {identifier.type}={identifier.value} count={count}", state.id)

            for action in [a for a in state.actions if a.type != "navigate"]:
                handler = ACTION_HANDLERS.get(action.type)
                if not handler:
                    raise ValueError(f"Unsupported action type: {action.type}")
                await handler(page, action, variables, lambda m: log(m, state.id))

            for scraper in state.scrapers:
                text = (await resolve_locator(page, scraper.locator.model_dump()).first.inner_text()).strip()
                variables[scraper.name] = text
                await log(f"scrape {scraper.name}={text}", state.id)

            await log(f"state done: {state.name}", state.id)
            await emit({"type": "state", "stateId": state.id, "status": "done"})
            current = state.next

        await emit({"type": "result", "variables": variables})
        return variables
