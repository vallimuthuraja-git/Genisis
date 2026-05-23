import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { Box, Paper, Typography } from "@mui/material";
import Inspector from "./Inspector";

export default function Sidebar({ selected, states, onChange, onAddState }) {
  return (
    <Paper component="aside" square elevation={0} className="sidebar">
      <Box className="sidebar-heading">
        <AccountTreeRoundedIcon color="primary" />
        <Typography variant="subtitle1">Genisis</Typography>
      </Box>
      <Inspector selected={selected} states={states} onChange={onChange} onAddState={onAddState} />
    </Paper>
  );
}
