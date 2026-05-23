import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography
} from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import { connectLogs, listWorkflows, loadWorkflow, runWorkflow, saveWorkflow } from "./api";
import Sidebar from "./components/Sidebar";
import StateList from "./components/StateList";
import Toolbar from "./components/Toolbar";

const defaultWorkflow = {
  id: "sample_agent",
  name: "Sample Agent",
  states: [
    {
      id: "start",
      name: "Start",
      identifiers: [],
      actions: [{ type: "navigate", url: "https://example.com" }],
      scrapers: [],
      next: null,
      position: { x: 120, y: 120 }
    }
  ]
};

export default function App() {
  const [workflow, setWorkflow] = useState(defaultWorkflow);
  const [selectedId, setSelectedId] = useState("start");
  const [, setStatusMap] = useState({});
  const [variables, setVariables] = useState({});
  const [runInfo, setRunInfo] = useState(null);
  const [view, setView] = useState("home");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [newStateName, setNewStateName] = useState("");

  useEffect(() => {
    document.title = "Genisis";
    const ws = connectLogs((event) => {
      if (event.type === "state") setStatusMap((m) => ({ ...m, [event.stateId]: event.status }));
      if (event.type === "result") setVariables(event.variables || {});
      if (event.type === "run") setRunInfo(event);
      if (event.type === "error") setRunInfo(event);
    });
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (view !== "home") return;
    refreshSavedWorkflows().catch((error) => {
      setRunInfo({ type: "error", message: error.message });
    });
  }, [view]);

  const selected = workflow.states.find((s) => s.id === selectedId) || null;

  const refreshSavedWorkflows = async () => {
    const data = await listWorkflows();
    setSavedWorkflows(data.items || []);
    return data.items || [];
  };

  const updateState = (updated) => setWorkflow((w) => ({ ...w, states: w.states.map((s) => s.id === updated.id ? updated : s) }));
  const addState = (name) => {
    const normalized = name.trim();
    if (!normalized) return;
    const idBase = normalized.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "state";
    const id = `${idBase}_${workflow.states.length + 1}`;
    setWorkflow((w) => ({
      ...w,
      states: [...w.states, {
        id,
        name: normalized,
        identifiers: [],
        actions: [],
        scrapers: [],
        next: null,
        position: { x: 160 + w.states.length * 40, y: 140 + w.states.length * 40 }
      }]
    }));
    setSelectedId(id);
    setCreateDialogOpen(false);
    setNewStateName("");
  };
  const deleteState = (id) => {
    setWorkflow((w) => ({ ...w, states: w.states.filter((state) => state.id !== id) }));
    if (selectedId === id) {
      const next = workflow.states.find((state) => state.id !== id);
      setSelectedId(next?.id || null);
    }
  };
  const duplicateState = (state) => {
    const copyId = `${state.id}_copy_${workflow.states.length + 1}`;
    const copy = {
      ...state,
      id: copyId,
      name: `${state.name} Copy`,
      position: { x: (state.position?.x || 120) + 40, y: (state.position?.y || 120) + 40 }
    };
    setWorkflow((w) => ({ ...w, states: [...w.states, copy] }));
    setSelectedId(copyId);
  };
  const moveState = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= workflow.states.length) return;
    const states = [...workflow.states];
    [states[index], states[nextIndex]] = [states[nextIndex], states[index]];
    setWorkflow((w) => ({ ...w, states }));
  };
  const runCurrentWorkflow = async () => {
    setStatusMap({});
    setVariables({});
    try {
      const info = await runWorkflow(workflow);
      setRunInfo(info);
    } catch (error) {
      setRunInfo({ type: "error", message: error.message });
    }
  };
  const saveCurrentWorkflow = async () => {
    try {
      const filename = `${workflow.id}.json`;
      const info = await saveWorkflow(filename, workflow);
      setRunInfo({ type: "save", status: "saved", message: info.saved });
      await refreshSavedWorkflows();
    } catch (error) {
      setRunInfo({ type: "error", message: error.message });
    }
  };
  const openLoadWorkflow = async () => {
    try {
      const items = await refreshSavedWorkflows();
      setLoadDialogOpen(true);
      if (!items.length) {
        setRunInfo({ type: "load", status: "empty", message: "No saved workflows found." });
      }
    } catch (error) {
      setRunInfo({ type: "error", message: error.message });
    }
  };
  const loadSelectedWorkflow = async (filename) => {
    try {
      const wf = await loadWorkflow(filename);
      setWorkflow(wf);
      setSelectedId(wf.states[0]?.id || null);
      setLoadDialogOpen(false);
      setView("editor");
      setRunInfo({ type: "load", status: "loaded", message: filename });
    } catch (error) {
      setRunInfo({ type: "error", message: error.message });
    }
  };
  const createNewWorkflow = () => {
    setWorkflow(defaultWorkflow);
    setSelectedId(defaultWorkflow.states[0]?.id || null);
    setRunInfo(null);
    setView("editor");
  };

  return (
    <div className="app">
      <Toolbar
        name={workflow.name}
        onName={(name) => setWorkflow((w) => ({ ...w, name }))}
        onRun={runCurrentWorkflow}
        onSave={saveCurrentWorkflow}
        onLoad={openLoadWorkflow}
        onHome={() => setView("home")}
        mode={view}
      />
      {view === "home" ? (
        <main className="home-page">
          <section className="home-header">
            <div className="app-mark app-mark-large">
              <AccountTreeRoundedIcon />
            </div>
            <div>
              <Typography variant="h4">Genisis</Typography>
              <Typography variant="body2" color="text.secondary">Agents</Typography>
            </div>
            <Button variant="contained" startIcon={<AddCircleOutlineRoundedIcon />} onClick={createNewWorkflow}>
              New Agent
            </Button>
          </section>
          <Divider />
          <section className="agent-list">
            {savedWorkflows.length === 0 ? (
              <div className="empty-agents">
                <FolderOpenRoundedIcon />
                <Typography color="text.secondary">No saved agents found.</Typography>
              </div>
            ) : (
              savedWorkflows.map((filename) => (
                <button className="agent-row" key={filename} onClick={() => loadSelectedWorkflow(filename)}>
                  <span className="app-mark">
                    <AccountTreeRoundedIcon fontSize="small" />
                  </span>
                  <span>
                    <Typography variant="subtitle1">{filename.replace(/\.json$/i, "").replace(/_/g, " ")}</Typography>
                    <Typography variant="caption" color="text.secondary">{filename}</Typography>
                  </span>
                  <FolderOpenRoundedIcon fontSize="small" />
                </button>
              ))
            )}
          </section>
        </main>
      ) : (
        <div className="main-grid">
          <StateList
            states={workflow.states}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setCreateDialogOpen(true)}
            onDelete={deleteState}
            onDuplicate={duplicateState}
            onMove={moveState}
          />
          <Sidebar
            selected={selected}
            states={workflow.states}
            onChange={updateState}
            onAddState={() => setCreateDialogOpen(true)}
          />
        </div>
      )}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create State</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="State Name"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addState(newStateName);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addState(newStateName)}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Load Workflow</DialogTitle>
        <DialogContent>
          {savedWorkflows.length === 0 ? (
            <Typography color="text.secondary">No saved workflows found.</Typography>
          ) : (
            <List dense>
              {savedWorkflows.map((filename) => (
                <ListItemButton key={filename} onClick={() => loadSelectedWorkflow(filename)}>
                  <ListItemText primary={filename} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
