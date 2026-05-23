import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "@xyflow/react/dist/style.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4f8cff" },
    secondary: { main: "#00bfa5" },
    background: { default: "#101418", paper: "#171c22" }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", sans-serif'
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
