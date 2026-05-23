import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Box, Button, IconButton, List, ListItemButton, Paper, Stack, Tooltip, Typography } from "@mui/material";

export default function StateList({
  states,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onMove
}) {
  return (
    <Paper component="aside" square elevation={0} className="state-list-panel">
      <Box className="sidebar-heading">
        <Typography variant="subtitle1">Workflow States</Typography>
      </Box>
      <Button fullWidth variant="contained" startIcon={<AddCircleOutlineRoundedIcon />} onClick={onAdd}>
        Add State
      </Button>
      <List className="state-list">
        {states.map((state, index) => (
          <ListItemButton
            key={state.id}
            selected={state.id === selectedId}
            onClick={() => onSelect(state.id)}
            className="state-list-item"
          >
            <DragIndicatorRoundedIcon className="drag-icon" />
            <Box className="state-list-copy">
              <Typography variant="body2" className="state-list-name">{state.name}</Typography>
              <Typography variant="caption" color="text.secondary">{state.id}</Typography>
            </Box>
            <Stack direction="row" spacing={0.25} className="state-list-actions">
              <Tooltip title="Move up">
                <span>
                  <IconButton size="small" disabled={index === 0} onClick={(e) => { e.stopPropagation(); onMove(index, -1); }}>
                    <KeyboardArrowUpRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton size="small" disabled={index === states.length - 1} onClick={(e) => { e.stopPropagation(); onMove(index, 1); }}>
                    <KeyboardArrowDownRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDuplicate(state); }}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(state.id); }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
