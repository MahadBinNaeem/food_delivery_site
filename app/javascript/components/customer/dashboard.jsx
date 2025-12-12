import React, { useEffect, useState } from "react";

const DEFAULT_DASHBOARD = {
  user: {},
  stats: {},
  recent_orders: [],
  saved_addresses: [],
  recommended_restaurants: [],
  featured_dishes: [],
  quick_actions: [],
  auth_paths: {}
};

const STAT_CONFIG = [
  { key: "upcoming_deliveries", label: "Upcoming deliveries", accent: "from-blue-500/40 to-cyan-500/40" },
  { key: "completed_orders", label: "Completed orders", accent: "from-emerald-500/40 to-lime-500/40" },
  { key: "favorite_restaurants", label: "Favourite restaurants", accent: "from-fuchsia-500/40 to-pink-500/40" },
  { key: "loyalty_points", label: "Loyalty points", accent: "from-amber-500/40 to-orange-500/40" }
];

function CustomerDashboard({ initialData = {} }) {
  const hasInitialData = initialData && Object.keys(initialData).length > 0;
  const [dashboard, setDashboard] = useState(hasInitialData ? initialData : DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [activeTab, setActiveTab] = useState('delivery');

  useEffect(() => {
    const controller = new AbortController();

    fetch("/dashboard.json", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) throw new Error("Unable to load dashboard data");
        return response.json();
      })
      .then(data => {
        setDashboard(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== "AbortError") setError(err.message || "Something went wrong");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const user = dashboard.user || {};
  const authPaths = dashboard.auth_paths || {};
  const isLoggedIn = Boolean(user.id);
  const logoutPath = authPaths.logout || "/users/sign_out";

  const handleLogout = async () => {
    if (!logoutPath || loggingOut) return;

    try {
      setLoggingOut(true);
      setLogoutError(null);
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

      const response = await fetch(logoutPath, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken || "",
          Accept: "application/json"
        },
        credentials: "same-origin"
      });

      if (response.ok) {
        window.location.href = "/users/sign_in";
      } else {
        setLogoutError("Unable to log out. Please try again.");
      }
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-2 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1360px] space-y-8">
        <header className="flex items-center justify-between rounded-full border border-orange-200 bg-orange-50 px-6 py-4 shadow-xl shadow-orange-100">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="MealMate Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-orange-500">MealMate</h1>
          </div>

          {/* Action Buttons */}
          {!isLoggedIn && (
            <div className="flex items-center gap-3">
              <a
                href={authPaths.login || "/users/sign_in"}
                className="inline-flex items-center justify-center rounded-full border-2 border-orange-500 bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:bg-orange-50"
              >
                Log in
              </a>
              <a
                href={authPaths.restaurant_signup || "/restaurants/sign_up"}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-300 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Sign up to be a restaurant partner
              </a>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-gray-600">
            Loading your dashboard…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <StatsGrid stats={dashboard.stats} />

            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-6 py-3 text-sm font-semibold transition ${
                  activeTab === 'delivery'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setActiveTab('pickup')}
                className={`px-6 py-3 text-sm font-semibold transition ${
                  activeTab === 'pickup'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pickup
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'delivery' && (
              <>
                <RecommendedRestaurants restaurants={dashboard.recommended_restaurants} className="w-full" />
                <FeaturedDishes dishes={dashboard.featured_dishes} className="w-full" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <RecentOrders orders={dashboard.recent_orders} className="lg:col-span-2" />
                  <SavedAddresses addresses={dashboard.saved_addresses} />
                </div>
                <QuickActions actions={dashboard.quick_actions} className="w-full" />
              </>
            )}

            {activeTab === 'pickup' && (
              <>
                <RecommendedRestaurants restaurants={dashboard.recommended_restaurants} className="w-full" />
                <FeaturedDishes dishes={dashboard.featured_dishes} className="w-full" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <RecentOrders orders={dashboard.recent_orders} className="lg:col-span-2" />
                  <SavedAddresses addresses={dashboard.saved_addresses} />
                </div>
                <QuickActions actions={dashboard.quick_actions} className="w-full" />
              </>
            )}

            {isLoggedIn && (
              <LogoutPanel
                onLogout={handleLogout}
                loggingOut={loggingOut}
                error={logoutError}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatsGrid({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map(stat => (
        <div
          key={stat.key}
          className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${stat.accent} p-5 shadow-lg`}
        >
          <p className="text-sm uppercase tracking-wider text-white/90">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats[stat.key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

function RecentOrders({ orders = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent orders</h2>
          <p className="text-sm text-gray-500">Your latest activity</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="No orders just yet. Let's change that!" />
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map(order => (
            <li key={order.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Order #{order.id}</p>
                  <p className="text-lg font-semibold text-gray-900">{order.restaurant || "Restaurant"}</p>
                </div>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <StatusPill status={order.status} />
                <p>Placed {formatDateTime(order.placed_at)}</p>
                {order.eta && <p>ETA {order.eta}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SavedAddresses({ addresses = [] }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900">Saved addresses</h2>
      <p className="text-sm text-gray-500">Switch delivery locations quickly</p>

      {addresses.length === 0 ? (
        <EmptyState message="Add an address to speed up your next checkout." />
      ) : (
        <ul className="mt-4 space-y-4">
          {addresses.map(address => (
            <li key={address.id || address.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{address.label}</p>
              <p className="text-lg font-semibold text-gray-900">{address.street}</p>
              <p className="text-sm text-gray-600">{address.city}</p>
              {address.instructions && <p className="mt-1 text-xs text-gray-500">{address.instructions}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QuickActions({ actions = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900">Quick actions</h2>
      <p className="text-sm text-gray-500">Jump back into the flow</p>

      {actions.length === 0 ? (
        <EmptyState message="Shortcuts will appear here once available." />
      ) : (
        <div className="mt-4 space-y-3">
          {actions.map(action => (
            <a
              key={action.id}
              href={action.href || "#"}
              className="block rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-300 hover:bg-orange-50"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{action.label}</p>
              <p className="text-lg font-semibold text-gray-900">{action.description}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function TopBar({ signupPath }) {
  if (!signupPath) return null;

  return (
    <div className="flex flex-col gap-3 border border-white/10 bg-white/5 px-5 py-4 text-white shadow-lg shadow-black/25 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gray-300">Partner with us</p>
        <p className="text-sm text-gray-100">List your restaurant and reach new customers today.</p>
      </div>
      <a
        href={signupPath}
        className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-900/30 transition hover:-translate-y-0.5 hover:bg-amber-300"
      >
        Sign up to be a restaurant partner
      </a>
    </div>
  );
}

function LogoutPanel({ onLogout, loggingOut, error }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900">Ready to take a break?</h2>
      <p className="mt-2 text-sm text-gray-600">You can always hop back in when hunger strikes.</p>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loggingOut ? "Signing out…" : "Log out"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}

function RecommendedRestaurants({ restaurants = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900">Restaurants</h2>
      <p className="text-sm text-gray-500">Curated picks based on your taste</p>

      {restaurants.length === 0 ? (
        <EmptyState message="Start ordering to get personalised recommendations." />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {restaurants.map(restaurant => {
            const card = (
              <article className="group rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 transition group-hover:text-orange-600">{restaurant.name}</p>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{restaurant.cuisine}</p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                    {restaurant.rating ? `${restaurant.rating}★` : "New"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">ETA {restaurant.eta || "20-30 min"}</p>
                {restaurant.signature_dishes?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Popular</p>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.signature_dishes.map(dish => (
                        <span
                          key={dish.id || dish.name}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          {dish.name}
                          {dish.price ? (
                            <span className="text-gray-400">
                              · {formatCurrency(dish.price, dish.currency)}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );

            return restaurant.path ? (
              <a
                key={restaurant.id || restaurant.name}
                href={restaurant.path}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                {card}
              </a>
            ) : (
              <React.Fragment key={restaurant.id || restaurant.name}>{card}</React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FeaturedDishes({ dishes = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900">Featured dishes</h2>
      <p className="text-sm text-gray-500">Popular plates from top spots</p>

      {dishes.length === 0 ? (
        <EmptyState message="Your favourite dishes will show up here once restaurants add menus." />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dishes.map(dish => (
            <article key={dish.id || dish.name} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{dish.name}</p>
                    {dish.description && <p className="mt-1 text-sm text-gray-600">{dish.description}</p>}
                  </div>
                  {dish.price && (
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(dish.price, dish.currency)}
                    </span>
                  )}
                </div>
                {dish.restaurant_name && (
                  dish.restaurant_path ? (
                    <a
                      href={dish.restaurant_path}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {dish.restaurant_name}
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">{dish.restaurant_name}</p>
                  )
                )}
              </div>
              {dish.image_url && (
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="mt-4 h-32 w-full rounded-2xl object-cover"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }) {
  if (!status) return null;

  return (
    <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function formatCurrency(value, currency = "PKR") {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "$0.00";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(numericValue);
}

function formatDateTime(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  }).format(new Date(value));
}

function formatDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(value));
}

export default CustomerDashboard;
