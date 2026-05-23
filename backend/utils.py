from __future__ import annotations

import re
from typing import Any

VAR_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_\-]+)\s*\}\}")


def substitute_vars(value: str, variables: dict[str, Any]) -> str:
    def repl(match: re.Match[str]) -> str:
        return str(variables.get(match.group(1), ""))

    return VAR_PATTERN.sub(repl, value)


def resolve_locator(page, locator: dict[str, str]):
    t = locator.get("type", "css")
    v = locator.get("value", "")
    if t == "css":
        return page.locator(v)
    if t == "xpath":
        return page.locator(f"xpath={v}")
    if t == "text":
        return page.get_by_text(v) if not v.startswith("text=") else page.locator(v)
    if t == "name":
        return page.locator(f"[name={v!r}]")
    if t == "placeholder":
        return page.get_by_placeholder(v)
    if t == "role":
        if "[name=" in v and v.endswith("]"):
            role, name = v.split("[name=", 1)
            return page.get_by_role(role, name=name[:-1].strip("\"'"))
        return page.get_by_role(v)
    if t == "testid":
        return page.get_by_test_id(v)
    raise ValueError(f"Unsupported locator type: {t}")
