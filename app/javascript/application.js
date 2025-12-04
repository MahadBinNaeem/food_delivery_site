import React from "react";
import { createRoot } from "react-dom/client";
import AdminDashboard from "./components/admin/dashboard";
import CustomerDashboard from "./components/customer/dashboard";
import RestaurantDashboard from "./components/restaurants/dashboard";

const mount = () => {
  const adminEl = document.getElementById("admin-dashboard");
  if (adminEl) {
    const initialData = adminEl.dataset.dashboard ? JSON.parse(adminEl.dataset.dashboard) : {};
    createRoot(adminEl).render(<AdminDashboard initialData={initialData} />);
  }

  const customerEl = document.getElementById("customer-dashboard");
  if (customerEl) {
    const initialData = customerEl.dataset.dashboard ? JSON.parse(customerEl.dataset.dashboard) : {};
    createRoot(customerEl).render(<CustomerDashboard initialData={initialData} />);
  }

  const restaurantEl = document.getElementById("restaurant-dashboard");
  if (restaurantEl) {
    const initialData = restaurantEl.dataset.dashboard ? JSON.parse(restaurantEl.dataset.dashboard) : {};
    createRoot(restaurantEl).render(<RestaurantDashboard initialData={initialData} />);
  }
};

document.addEventListener("turbo:load", mount);
if (document.readyState !== "loading") mount();
