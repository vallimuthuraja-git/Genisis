from __future__ import annotations

from typing import Any, Awaitable, Callable

from models import Action
from utils import resolve_locator, substitute_vars

ActionHandler = Callable[[Any, Action, dict[str, Any], Callable[[str], Awaitable[None]]], Awaitable[None]]


async def handle_navigate(page, action: Action, variables: dict[str, Any], log):
    url = substitute_vars(action.url or "", variables)
    await log(f"navigate {url}")
    await page.goto(url)


async def handle_click(page, action: Action, variables: dict[str, Any], log):
    if not action.locator:
        raise ValueError("click requires locator")
    await log(f"click {action.locator.value}")
    await resolve_locator(page, action.locator.model_dump()).first.click()


async def handle_fill(page, action: Action, variables: dict[str, Any], log):
    if not action.locator:
        raise ValueError("fill requires locator")
    value = substitute_vars(action.value or "", variables)
    await log(f"fill {action.locator.value}")
    await resolve_locator(page, action.locator.model_dump()).first.fill(value)


async def handle_wait(page, action: Action, variables: dict[str, Any], log):
    duration = action.duration or 1000
    await log(f"wait {duration}ms")
    await page.wait_for_timeout(duration)


async def handle_press(page, action: Action, variables: dict[str, Any], log):
    if not action.locator or not action.key:
        raise ValueError("press requires locator and key")
    await log(f"press {action.key} on {action.locator.value}")
    await resolve_locator(page, action.locator.model_dump()).first.press(action.key)


async def handle_extract_text(page, action: Action, variables: dict[str, Any], log):
    if not action.locator or not action.name:
        raise ValueError("extract_text requires locator and name")
    text = (await resolve_locator(page, action.locator.model_dump()).first.inner_text()).strip()
    variables[action.name] = text
    await log(f"extract {action.name}={text}")


ACTION_HANDLERS: dict[str, ActionHandler] = {
    "navigate": handle_navigate,
    "click": handle_click,
    "fill": handle_fill,
    "wait": handle_wait,
    "press": handle_press,
    "extract_text": handle_extract_text,
}
