// import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from "./components/Login";

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('home');
  if (container) {
    const root = createRoot(container);
    root.render(<Login />);
  }
});
