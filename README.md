# Genesis MVP

Local-first visual browser workflow runtime.

## Run Backend

## Run Everything

```bash
python app.py
```

This starts the FastAPI backend and Vite frontend, then opens `http://127.0.0.1:5173`.

## Run Backend Manually

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
uvicorn main:app --reload --port 8000
```

## Run Frontend Manually

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Notes

- Workflows are saved in `workflows/` as JSON.
- Workflow run logs are dumped per run in `run_logs/`.
- Persistent browser session data is stored in `browser_data/`.
- Runtime supports: `navigate`, `click`, `fill`, `wait`, `extract_text`.
