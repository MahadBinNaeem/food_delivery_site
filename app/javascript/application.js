import React from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./components/HomePage";

const mount = () => {
  const el = document.getElementById("home");
  if (el) {
    createRoot(el).render(<HomePage />);
  }
};

// Mount on full load and Turbo transitions
document.addEventListener("turbo:load", mount);
if (document.readyState !== "loading") mount();
