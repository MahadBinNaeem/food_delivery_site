import React from "react";
import { createRoot } from "react-dom/client";
import AdminDashboard from "./components/admin/dashboard";


const mount = () => {
  const adminEl = document.getElementById("admin-dashboard");
  if (adminEl) {
    const initialData = adminEl.dataset.stats ? JSON.parse(adminEl.dataset.stats) : {};
    createRoot(adminEl).render(<AdminDashboard initialData={initialData} />);
  }
};

document.addEventListener("turbo:load", mount);
if (document.readyState !== "loading") mount();
