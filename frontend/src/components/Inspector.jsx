import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useState } from "react";
import { testLocator } from "../api";

const locatorTypes = ["css", "xpath", "text", "name", "placeholder", "role", "testid"];
const actionTypes = ["navigate", "click", "fill", "press", "wait"];
const identifierConditions = ["exists", "not_exists", "text_exists", "url_contains"];

function updateList(list, index, value) {
  return list.map((item, i) => (i === index ? value : item));
}

function removeFromList(list, index) {
  return list.filter((_, i) => i !== index);
}

function moveItem(list, index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  return copy;
}

function LocatorFields({ locator, onChange, statusKey, testStatuses, onTest }) {
  const status = testStatuses[statusKey];
  return (
    <Stack direction="row" spacing={1} className="locator-row">
      <FormControl size="small" className="locator-type">
        <InputLabel>Locator</InputLabel>
        <Select
          label="Locator"
          value={locator.type || "css"}
          onChange={(e) => onChange({ ...locator, type: e.target.value })}
        >
          {locatorTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Value"
        value={locator.value || ""}
        onChange={(e) => onChange({ ...locator, value: e.target.value })}
        className="locator-value"
      />
      <Tooltip title="Test locator">
        <IconButton onClick={() => onTest(statusKey, locator)} aria-label="Test locator">
          <ScienceRoundedIcon />
        </IconButton>
      </Tooltip>
      {status && (
        <Chip
          size="small"
          color={status.found ? "success" : "error"}
          label={status.found ? `Found ${status.count}${status.visible ? " visible" : ""}` : "Not found"}
        />
      )}
    </Stack>
  );
}

function Section({ icon, title, onAdd, children }) {
  return (
    <Stack spacing={1.25} className="builder-section">
      <Box className="section-title">
        {icon}
        <Typography variant="overline">{title}</Typography>
        {onAdd && (
          <Tooltip title={`Add ${title.toLowerCase()}`}>
            <IconButton size="small" onClick={onAdd} aria-label={`Add ${title}`}>
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {children}
    </Stack>
  );
}

export default function Inspector({ selected, states = [], onChange }) {
  const [testStatuses, setTestStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("identifier");

  if (!selected) {
    return (
      <Box className="inspector-empty">
        <EditRoundedIcon color="disabled" />
        <Typography variant="body2" color="text.secondary">Select a state</Typography>
      </Box>
    );
  }

  const identifiers = selected.identifiers || [];
  const actions = selected.actions || [];
  const scrapers = selected.scrapers || [];

  const patch = (changes) => onChange({ ...selected, ...changes });
  const handleTest = async (key, locator) => {
    setTestStatuses((s) => ({ ...s, [key]: { found: false, count: 0, pending: true } }));
    try {
      const result = await testLocator(locator);
      setTestStatuses((s) => ({ ...s, [key]: result }));
    } catch {
      setTestStatuses((s) => ({ ...s, [key]: { found: false, count: 0 } }));
    }
  };

  return (
    <Stack spacing={1.75} className="inspector">
      <Box className="state-config-header">
        <Typography variant="h6">{selected.name}</Typography>
        <Typography variant="caption" color="text.secondary">{selected.id}</Typography>
      </Box>

      <Stack direction="row" spacing={1} className="section-tabs">
        <Button variant={activeTab === "identifier" ? "contained" : "outlined"} onClick={() => setActiveTab("identifier")} startIcon={<FactCheckRoundedIcon />}>Identifier</Button>
        <Button variant={activeTab === "actions" ? "contained" : "outlined"} onClick={() => setActiveTab("actions")} startIcon={<BoltRoundedIcon />}>Actions</Button>
        <Button variant={activeTab === "scrape" ? "contained" : "outlined"} onClick={() => setActiveTab("scrape")} startIcon={<DownloadRoundedIcon />}>Scrape</Button>
        <Button variant={activeTab === "navigation" ? "contained" : "outlined"} onClick={() => setActiveTab("navigation")} startIcon={<RouteRoundedIcon />}>Navigation</Button>
        <Button variant={activeTab === "advanced" ? "contained" : "outlined"} onClick={() => setActiveTab("advanced")} startIcon={<EditRoundedIcon />}>Advanced</Button>
      </Stack>

      <Divider />

      {activeTab === "identifier" && (
        <Section
          icon={<FactCheckRoundedIcon fontSize="small" />}
          title="Identifier"
          onAdd={() => patch({ identifiers: [...identifiers, { description: "", condition: "exists", type: "css", value: "" }] })}
        >
          {identifiers.map((identifier, index) => (
            <Box className="builder-row stacked" key={`identifier-${index}`}>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="Description" value={identifier.description || ""} onChange={(e) => patch({ identifiers: updateList(identifiers, index, { ...identifier, description: e.target.value }) })} />
                <FormControl size="small" className="action-type">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    label="Condition"
                    value={identifier.condition || "exists"}
                    onChange={(e) => patch({ identifiers: updateList(identifiers, index, { ...identifier, condition: e.target.value }) })}
                  >
                    {identifierConditions.map((condition) => <MenuItem key={condition} value={condition}>{condition}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton onClick={() => patch({ identifiers: removeFromList(identifiers, index) })} aria-label="Delete identifier">
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
              {identifier.condition === "url_contains" ? (
                <TextField size="small" label="URL Contains" value={identifier.value || ""} onChange={(e) => patch({ identifiers: updateList(identifiers, index, { ...identifier, value: e.target.value }) })} />
              ) : (
                <LocatorFields
                  locator={identifier}
                  statusKey={`identifier-${index}`}
                  testStatuses={testStatuses}
                  onTest={handleTest}
                  onChange={(value) => patch({ identifiers: updateList(identifiers, index, { ...identifier, ...value }) })}
                />
              )}
            </Box>
          ))}
        </Section>
      )}

      {activeTab === "actions" && (
        <Section
          icon={<BoltRoundedIcon fontSize="small" />}
          title="Actions"
          onAdd={() => patch({ actions: [...actions, { type: "click", locator: { type: "css", value: "" }, value: "" }] })}
        >
          {actions.map((action, index) => (
            <Box className="builder-row stacked" key={`action-${index}`}>
              <Stack direction="row" spacing={1}>
                <FormControl size="small" className="action-type">
                  <InputLabel>Action</InputLabel>
                  <Select
                    label="Action"
                    value={action.type}
                    onChange={(e) => patch({ actions: updateList(actions, index, { ...action, type: e.target.value }) })}
                  >
                    {actionTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton onClick={() => patch({ actions: moveItem(actions, index, -1) })} aria-label="Move action up">
                  <KeyboardArrowUpRoundedIcon />
                </IconButton>
                <IconButton onClick={() => patch({ actions: moveItem(actions, index, 1) })} aria-label="Move action down">
                  <KeyboardArrowDownRoundedIcon />
                </IconButton>
                <IconButton onClick={() => patch({ actions: removeFromList(actions, index) })} aria-label="Delete action">
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
              {action.type === "navigate" && (
                <TextField size="small" label="URL" value={action.url || ""} onChange={(e) => patch({ actions: updateList(actions, index, { ...action, url: e.target.value }) })} />
              )}
              {["click", "fill", "press"].includes(action.type) && (
                <LocatorFields
                  locator={action.locator || { type: "css", value: "" }}
                  statusKey={`action-${index}`}
                  testStatuses={testStatuses}
                  onTest={handleTest}
                  onChange={(locator) => patch({ actions: updateList(actions, index, { ...action, locator }) })}
                />
              )}
              {action.type === "fill" && (
                <TextField size="small" label="Value" value={action.value || ""} onChange={(e) => patch({ actions: updateList(actions, index, { ...action, value: e.target.value }) })} />
              )}
              {action.type === "press" && (
                <TextField size="small" label="Key" value={action.key || ""} onChange={(e) => patch({ actions: updateList(actions, index, { ...action, key: e.target.value }) })} />
              )}
              {action.type === "wait" && (
                <TextField size="small" type="number" label="Duration (ms)" value={action.duration || 1000} onChange={(e) => patch({ actions: updateList(actions, index, { ...action, duration: Number(e.target.value) }) })} />
              )}
            </Box>
          ))}
        </Section>
      )}

      {activeTab === "scrape" && (
        <Section
          icon={<DownloadRoundedIcon fontSize="small" />}
          title="Scrape"
          onAdd={() => patch({ scrapers: [...scrapers, { name: "value", type: "text", locator: { type: "css", value: "" } }] })}
        >
          {scrapers.map((scraper, index) => (
            <Box className="builder-row stacked" key={`scraper-${index}`}>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="Variable Name" value={scraper.name} onChange={(e) => patch({ scrapers: updateList(scrapers, index, { ...scraper, name: e.target.value }) })} />
                <IconButton onClick={() => patch({ scrapers: removeFromList(scrapers, index) })} aria-label="Delete scraper">
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
              <LocatorFields
                locator={scraper.locator}
                statusKey={`scraper-${index}`}
                testStatuses={testStatuses}
                onTest={handleTest}
                onChange={(locator) => patch({ scrapers: updateList(scrapers, index, { ...scraper, locator }) })}
              />
            </Box>
          ))}
        </Section>
      )}

      {activeTab === "navigation" && (
        <Section icon={<RouteRoundedIcon fontSize="small" />} title="Navigation">
          <FormControl size="small">
            <InputLabel>Next State</InputLabel>
            <Select label="Next State" value={selected.next || ""} onChange={(e) => patch({ next: e.target.value || null })}>
              <MenuItem value="">End workflow</MenuItem>
              {states.filter((state) => state.id !== selected.id).map((state) => (
                <MenuItem key={state.id} value={state.id}>{state.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Section>
      )}

      {activeTab === "advanced" && (
        <Section icon={<EditRoundedIcon fontSize="small" />} title="Advanced">
          <TextField size="small" type="number" label="Timeout (ms)" value={selected.advanced?.timeout || 30000} onChange={(e) => patch({ advanced: { ...(selected.advanced || {}), timeout: Number(e.target.value) } })} />
          <TextField size="small" type="number" label="Retry Count" value={selected.advanced?.retryCount || 0} onChange={(e) => patch({ advanced: { ...(selected.advanced || {}), retryCount: Number(e.target.value) } })} />
        </Section>
      )}
    </Stack>
  );
}
