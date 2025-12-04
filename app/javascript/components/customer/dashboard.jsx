import React, { useEffect, useState } from "react";

const DEFAULT_DASHBOARD = {
  user: {},
  stats: {},
  recent_orders: [],
  saved_addresses: [],
  recommended_restaurants: [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <TopBar signupPath={authPaths.restaurant_signup || "/restaurants/sign_up"} />

        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {user.name || "Your dashboard"}
          </h1>
          <p className="mt-2 text-gray-300">
            Track deliveries, explore new restaurants, and keep your favourites close.
          </p>
          {user.joined_at && (
            <p className="mt-4 text-xs uppercase tracking-wide text-gray-400">
              Member since {formatDate(user.joined_at)}
            </p>
          )}
          {!isLoggedIn && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={authPaths.login || "/users/sign_in"}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-gray-900 shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
              >
                Log in
              </a>
              <a
                href={authPaths.signup || "/users/sign_up"}
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-transparent px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Sign up
              </a>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-gray-300">
            Loading your dashboard…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <RecommendedRestaurants restaurants={dashboard.recommended_restaurants} className="w-full" />

            <StatsGrid stats={dashboard.stats} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <RecentOrders orders={dashboard.recent_orders} className="lg:col-span-2" />
              <SavedAddresses addresses={dashboard.saved_addresses} />
            </div>

            <QuickActions actions={dashboard.quick_actions} className="w-full" />

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
          className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.accent} p-5 shadow-lg shadow-black/30`}
        >
          <p className="text-sm uppercase tracking-wider text-gray-200/80">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats[stat.key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

function RecentOrders({ orders = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Recent orders</h2>
          <p className="text-sm text-gray-300">Your latest activity</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="No orders just yet. Let’s change that!" />
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map(order => (
            <li key={order.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-400">Order #{order.id}</p>
                  <p className="text-lg font-semibold text-white">{order.restaurant || "Restaurant"}</p>
                </div>
                <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-300">
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
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white">Saved addresses</h2>
      <p className="text-sm text-gray-300">Switch delivery locations quickly</p>

      {addresses.length === 0 ? (
        <EmptyState message="Add an address to speed up your next checkout." />
      ) : (
        <ul className="mt-4 space-y-4">
          {addresses.map(address => (
            <li key={address.id || address.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{address.label}</p>
              <p className="text-lg font-semibold text-white">{address.street}</p>
              <p className="text-sm text-gray-300">{address.city}</p>
              {address.instructions && <p className="mt-1 text-xs text-gray-400">{address.instructions}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QuickActions({ actions = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 ${className}`}>
      <h2 className="text-xl font-semibold text-white">Quick actions</h2>
      <p className="text-sm text-gray-300">Jump back into the flow</p>

      {actions.length === 0 ? (
        <EmptyState message="Shortcuts will appear here once available." />
      ) : (
        <div className="mt-4 space-y-3">
          {actions.map(action => (
            <a
              key={action.id}
              href={action.href || "#"}
              className="block rounded-2xl border border-white/5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 p-4 transition hover:border-blue-400/40"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{action.label}</p>
              <p className="text-lg font-semibold text-white">{action.description}</p>
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
    <div className="flex flex-col gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-4 text-white shadow-lg shadow-black/25 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
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
    <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/0 p-6 text-center shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white">Ready to take a break?</h2>
      <p className="mt-2 text-sm text-gray-300">You can always hop back in when hunger strikes.</p>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-900/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loggingOut ? "Signing out…" : "Log out"}
      </button>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </section>
  );
}

function RecommendedRestaurants({ restaurants = [], className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 ${className}`}>
      <h2 className="text-xl font-semibold text-white">Recommended for you</h2>
      <p className="text-sm text-gray-300">Curated picks based on your taste</p>

      {restaurants.length === 0 ? (
        <EmptyState message="Start ordering to get personalised recommendations." />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {restaurants.map(restaurant => (
            <article key={restaurant.id || restaurant.name} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{restaurant.name}</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{restaurant.cuisine}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-amber-300">
                  {restaurant.rating ? `${restaurant.rating}★` : "New"}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-300">ETA {restaurant.eta || "20-30 min"}</p>
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
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-gray-300">
      {message}
    </div>
  );
}

function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "$0.00";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(numericValue);
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
