// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerServiceWorker } from "./services/offlineSync";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
registerServiceWorker().then((registration) => {
  if (registration) {
    console.log("Service Worker registered successfully");
  }
});
