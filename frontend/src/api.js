const API_BASE = "http://127.0.0.1:8000";

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed with ${res.status}`);
  }
  return data;
}

export async function saveWorkflow(filename, workflow) {
  const res = await fetch(`${API_BASE}/workflows/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, workflow })
  });
  return readJson(res);
}

export async function listWorkflows() {
  const res = await fetch(`${API_BASE}/workflows`);
  return readJson(res);
}

export async function loadWorkflow(filename) {
  const res = await fetch(`${API_BASE}/workflows/${encodeURIComponent(filename)}`);
  return readJson(res);
}

export async function runWorkflow(workflow) {
  const res = await fetch(`${API_BASE}/run-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow })
  });
  return readJson(res);
}

export async function testLocator(locator) {
  const res = await fetch(`${API_BASE}/locators/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locator })
  });
  return readJson(res);
}

export function connectLogs(onEvent) {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws/logs");
  ws.onopen = () => ws.send("hello");
  ws.onmessage = (e) => onEvent(JSON.parse(e.data));
  return ws;
}
