from __future__ import annotations

from pathlib import Path
from playwright.async_api import BrowserContext, Page, Playwright, async_playwright


class BrowserManager:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.playwright: Playwright | None = None
        self.context: BrowserContext | None = None
        self.page: Page | None = None

    async def start(self) -> None:
        if self.context:
            return
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.playwright = await async_playwright().start()
        self.context = await self.playwright.chromium.launch_persistent_context(
            user_data_dir=str(self.data_dir),
            headless=False,
            viewport={"width": 1366, "height": 900},
        )
        self.page = self.context.pages[0] if self.context.pages else await self.context.new_page()

    async def get_page(self) -> Page:
        if not self.context or not self.page:
            await self.start()
        return self.page

    async def stop(self) -> None:
        if self.context:
            await self.context.close()
            self.context = None
            self.page = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None


browser_manager: BrowserManager | None = None


def init_browser_manager(data_dir: Path) -> BrowserManager:
    global browser_manager
    if browser_manager is None:
        browser_manager = BrowserManager(data_dir=data_dir)
    return browser_manager
