import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { AppBar, Box, IconButton, TextField, Toolbar as MuiToolbar, Tooltip, Typography } from "@mui/material";

export default function Toolbar({ name, onName, onRun, onSave, onLoad, onHome, mode = "editor" }) {
  return (
    <AppBar position="static" elevation={1} color="default" className="topbar">
      <MuiToolbar variant="dense" className="topbar-inner">
        <Typography variant="subtitle1" className="brand">
          <AccountTreeRoundedIcon fontSize="small" />
          Genisis
        </Typography>
        {mode === "editor" && (
          <TextField
            size="small"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Workflow name"
            className="workflow-name"
          />
        )}
        <Box className="top-actions">
          {mode === "editor" && (
            <Tooltip title="Home">
              <IconButton onClick={onHome} aria-label="Home">
                <HomeRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          {mode === "editor" && (
            <Tooltip title="Run workflow">
              <IconButton color="primary" onClick={onRun} aria-label="Run workflow">
                <PlayArrowRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          {mode === "editor" && (
            <Tooltip title="Save workflow">
              <IconButton onClick={onSave} aria-label="Save workflow">
                <SaveRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Load workflow">
            <IconButton onClick={onLoad} aria-label="Load workflow">
              <FolderOpenRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
}
