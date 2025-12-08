import React from "react";
import { createRoot } from "react-dom/client";
import MultiStepRegistration from "../components/restaurants/MultiStepRegistration";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("restaurant-registration-root");
  if (container && window.restaurantRegistrationData) {
    const root = createRoot(container);
    root.render(<MultiStepRegistration {...window.restaurantRegistrationData} />);
  }
});
