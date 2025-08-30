import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from '../components/HomePage';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react-root');
  if (container) {
    const root = createRoot(container);
    root.render(<HomePage />);
  }
});
