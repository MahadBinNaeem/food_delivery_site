import React, { useState } from "react";

const STEPS = [
  { id: 1, title: "Restaurant Details", subtitle: "Basic information about your restaurant" },
  { id: 2, title: "Owner Details", subtitle: "Information about the restaurant owner" },
  { id: 3, title: "Business Details", subtitle: "Operating hours and delivery settings" }
];

function MultiStepRegistration({ csrfToken, registrationPath, minimumPasswordLength, errors, linksHtml }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Restaurant Details
    name: "",
    email: "",
    contact_number: "",
    address: "",
    password: "",
    password_confirmation: "",

    owner_name: "",
    owner_email: "",
    owner_contact_number: "",

    description: "",
    cuisine_type: "",
    opening_time: "",
    closing_time: "",
    delivery_time_minutes: "",
    pickup_time_minutes: "",
    min_order_amount: "",
    delivery_fee: "",
    delivery_radius_km: "5",
    is_delivery_enabled: true,
    is_pickup_enabled: true,
    tags: ""
  });

  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateStep = (step) => {
    const errors = [];

    if (step === 1) {
      if (!formData.name.trim()) errors.push("Restaurant name is required");
      if (!formData.email.trim()) errors.push("Email is required");
      if (!formData.contact_number.trim()) errors.push("Contact number is required");
      if (!formData.address.trim()) errors.push("Address is required");
      if (!formData.password) errors.push("Password is required");
      if (formData.password.length < minimumPasswordLength) {
        errors.push(`Password must be at least ${minimumPasswordLength} characters`);
      }
      if (formData.password !== formData.password_confirmation) {
        errors.push("Password confirmation doesn't match");
      }
    }

    if (step === 2) {
      if (!formData.owner_name.trim()) errors.push("Owner name is required");
      if (!formData.owner_email.trim()) errors.push("Owner email is required");
      if (!formData.owner_contact_number.trim()) errors.push("Owner phone is required");
    }

    if (step === 3) {
      if (!formData.description.trim()) errors.push("Description is required");
      if (!formData.cuisine_type.trim()) errors.push("Cuisine type is required");
      if (!formData.opening_time) errors.push("Opening time is required");
      if (!formData.closing_time) errors.push("Closing time is required");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setFormErrors([]);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setFormErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setFormErrors([]);

    try {
      const response = await fetch(registrationPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          restaurant: {
            ...formData,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.redirect_url || "/restaurants/dashboard";
      } else {
        setFormErrors(data.errors || ["Registration failed. Please try again."]);
      }
    } catch (error) {
      setFormErrors(["An error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-8">
      <div className="bg-orange-50 border border-orange-200 p-8 rounded-2xl shadow-xl w-full max-w-2xl">

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= step.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step.id}
                  </div>
                  <p className={`mt-2 text-xs text-center ${
                    currentStep >= step.id ? "text-orange-600 font-semibold" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition ${
                    currentStep > step.id ? "bg-orange-500" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 text-sm">
            {STEPS[currentStep - 1].subtitle}
          </p>
        </div>

        {formErrors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <ul className="text-red-600 text-sm space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Restaurant Details */}
          {currentStep === 1 && (
            <>
              <FormField
                label="Restaurant Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter restaurant name"
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="restaurant@example.com"
                required
              />

              <FormField
                label="Contact Number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
              />

              <FormField
                label="Restaurant Address"
                name="address"
                type="textarea"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State ZIP"
                rows={2}
                required
              />

              <FormField
                label={`Password ${minimumPasswordLength ? `(${minimumPasswordLength} characters minimum)` : ''}`}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                required
              />

              <FormField
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
            </>
          )}

          {/* Step 2: Owner Details */}
          {currentStep === 2 && (
            <>
              <FormField
                label="Owner Full Name"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />

              <FormField
                label="Owner Email"
                name="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={handleChange}
                placeholder="owner@example.com"
                required
              />

              <FormField
                label="Owner Phone"
                name="owner_contact_number"
                type="tel"
                value={formData.owner_contact_number}
                onChange={handleChange}
                placeholder="+1 (555) 987-6543"
                required
              />
            </>
          )}

          {currentStep === 3 && (
            <>
              <FormField
                label="Restaurant Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your restaurant..."
                rows={3}
                required
              />

              <FormField
                label="Cuisine Type"
                name="cuisine_type"
                value={formData.cuisine_type}
                onChange={handleChange}
                placeholder="e.g., Italian, Chinese, Fast Food"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Opening Time"
                  name="opening_time"
                  type="time"
                  value={formData.opening_time}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Closing Time"
                  name="closing_time"
                  type="time"
                  value={formData.closing_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Delivery Time (minutes)"
                  name="delivery_time_minutes"
                  type="number"
                  value={formData.delivery_time_minutes}
                  onChange={handleChange}
                  placeholder="30"
                />

                <FormField
                  label="Pickup Time (minutes)"
                  name="pickup_time_minutes"
                  type="number"
                  value={formData.pickup_time_minutes}
                  onChange={handleChange}
                  placeholder="15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Minimum Order Amount ($)"
                  name="min_order_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  placeholder="10.00"
                />

                <FormField
                  label="Delivery Fee ($)"
                  name="delivery_fee"
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={handleChange}
                  placeholder="5.00"
                />
              </div>

              <FormField
                label="Delivery Radius (km)"
                name="delivery_radius_km"
                type="number"
                value={formData.delivery_radius_km}
                onChange={handleChange}
                placeholder="5"
              />

              <FormField
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="vegetarian, halal, fast-delivery"
              />

              <div className="flex gap-6">
                <label className="flex items-center text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_delivery_enabled"
                    checked={formData.is_delivery_enabled}
                    onChange={handleChange}
                    className="mr-2 w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-sm">Enable Delivery</span>
                </label>

                <label className="flex items-center text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_pickup_enabled"
                    checked={formData.is_pickup_enabled}
                    onChange={handleChange}
                    className="mr-2 w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-sm">Enable Pickup</span>
                </label>
              </div>
            </>
          )}

          <div className="flex gap-4 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
              >
                Previous
              </button>
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transform hover:scale-[1.02] transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>

       <div className="mt-6 text-center text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: linksHtml }} />
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, placeholder, required, rows, step }) {
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={step}
          className={inputClasses}
        />
      )}
    </div>
  );
}

export default MultiStepRegistration;
