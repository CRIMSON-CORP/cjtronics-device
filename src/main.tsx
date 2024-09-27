import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import KeepAwake from "./KeepAwake.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <KeepAwake />
  </StrictMode>
);
