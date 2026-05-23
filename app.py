from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
BACKEND_PORT = 8000
FRONTEND_PORT = 5173


def is_windows() -> bool:
    return os.name == "nt"


def command_exists(command: str) -> bool:
    return shutil.which(command) is not None


def run(command: list[str], cwd: Path) -> None:
    print(f"$ {' '.join(command)}")
    subprocess.run(command, cwd=cwd, check=True)


def python_executable() -> Path:
    venv = BACKEND / ".venv"
    return venv / ("Scripts/python.exe" if is_windows() else "bin/python")


def ensure_backend() -> Path:
    py = python_executable()
    if not py.exists():
        run([sys.executable, "-m", "venv", ".venv"], BACKEND)

    try:
        run([str(py), "-m", "pip", "--version"], BACKEND)
    except subprocess.CalledProcessError:
        run([str(py), "-m", "ensurepip", "--upgrade"], BACKEND)

    try:
        run([str(py), "-c", "import fastapi, uvicorn, playwright, pydantic"], BACKEND)
    except subprocess.CalledProcessError:
        run([str(py), "-m", "pip", "install", "--upgrade", "pip"], BACKEND)
        run([str(py), "-m", "pip", "install", "-r", "requirements.txt"], BACKEND)
        run([str(py), "-m", "playwright", "install", "chromium"], BACKEND)

    return py


def ensure_frontend() -> None:
    if not command_exists("npm"):
        raise RuntimeError("npm was not found. Install Node.js LTS and rerun this script.")

    if not (FRONTEND / "node_modules").exists():
        run(["npm", "install"], FRONTEND)


def wait_for(url: str, timeout: int = 45) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status < 500:
                    return True
        except Exception:
            time.sleep(1)
    return False


def start_process(command: list[str], cwd: Path) -> subprocess.Popen:
    flags = subprocess.CREATE_NEW_PROCESS_GROUP if is_windows() else 0
    return subprocess.Popen(command, cwd=cwd, creationflags=flags)


def stop_process(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return
    if is_windows():
        process.send_signal(signal.CTRL_BREAK_EVENT)
    else:
        process.terminate()
    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        process.kill()


def main() -> int:
    backend_process: subprocess.Popen | None = None
    frontend_process: subprocess.Popen | None = None

    try:
        py = ensure_backend()
        ensure_frontend()

        backend_process = start_process(
            [str(py), "-m", "uvicorn", "main:app", "--reload", "--port", str(BACKEND_PORT)],
            BACKEND,
        )
        frontend_process = start_process(["npm", "run", "dev", "--", "--host", "127.0.0.1"], FRONTEND)

        backend_ready = wait_for(f"http://127.0.0.1:{BACKEND_PORT}/health")
        frontend_ready = wait_for(f"http://127.0.0.1:{FRONTEND_PORT}")

        if not backend_ready:
            raise RuntimeError("Backend did not become ready on port 8000.")
        if not frontend_ready:
            raise RuntimeError("Frontend did not become ready on port 5173.")

        url = f"http://127.0.0.1:{FRONTEND_PORT}"
        print(f"Genesis is running: {url}")
        webbrowser.open(url)

        while True:
            if backend_process.poll() is not None:
                raise RuntimeError("Backend process exited.")
            if frontend_process.poll() is not None:
                raise RuntimeError("Frontend process exited.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Genesis...")
        return 0
    finally:
        if frontend_process:
            stop_process(frontend_process)
        if backend_process:
            stop_process(backend_process)


if __name__ == "__main__":
    raise SystemExit(main())
