import React from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root");

createRoot(rootEl).render(<React.StrictMode>{/* App not wired yet */}</React.StrictMode>);
