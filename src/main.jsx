import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initNativeStorage } from "./lib/nativeStorage.js";
import { initDeepLinks } from "./lib/deepLinks.js";
import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/boot.css";
import "./styles/themes.css";
import "./styles/training.css";
import "./styles/game.css";
import "./styles.css";

// On iOS this must finish before anything reads localStorage (it may restore
// an evicted store from the native snapshot). On the web it returns instantly.
initDeepLinks();

initNativeStorage().finally(() => {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
