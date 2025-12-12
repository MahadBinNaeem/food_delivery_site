import React, { useEffect, useState } from "react";

const DEFAULT_DASHBOARD = {
  restaurant: {},
  sales: { today: 0, this_week: 0, this_month: 0, weekly_trend: [], monthly_trend: [] },
  orders: { pending: 0, preparing: 0, ready: 0, out_for_delivery: 0, completed_today: 0, cancelled_today: 0 },
  metrics: { total_orders: 0, total_revenue: 0, average_order_value: 0, customer_rating: 0, completion_rate: 0, average_prep_time: 0 },
  recent_orders: [],
  top_items: [],
  auth_paths: {}
};

function RestaurantDashboard({ initialData = {} }) {
  const hasInitialData = initialData && Object.keys(initialData).length > 0;
  const [dashboard, setDashboard] = useState(hasInitialData ? initialData : DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  useEffect(() => {
    if (hasInitialData) return;

    const controller = new AbortController();

    fetch("/restaurants/dashboard.json", {
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
  }, [hasInitialData]);

  const restaurant = dashboard.restaurant || {};
  const sales = dashboard.sales || DEFAULT_DASHBOARD.sales;
  const orders = dashboard.orders || DEFAULT_DASHBOARD.orders;
  const metrics = dashboard.metrics || DEFAULT_DASHBOARD.metrics;
  const authPaths = dashboard.auth_paths || DEFAULT_DASHBOARD.auth_paths;
  const logoutPath = authPaths.logout || "/restaurants/sign_out";

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
        window.location.href = "/restaurants/sign_in";
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
        <RestaurantHeader restaurant={restaurant} />

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
            <MenuManagementPanel />
            <SalesCards sales={sales} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SalesChart data={sales.weekly_trend} title="Weekly Sales" />
              <SalesChart data={sales.monthly_trend} title="Monthly Sales Trend" />
            </div>

            <MetricsGrid metrics={metrics} />

            <OrdersStatusGrid orders={orders} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentOrders orders={dashboard.recent_orders} />
              <TopItems items={dashboard.top_items} />
            </div>


            <LogoutPanel
              onLogout={handleLogout}
              loggingOut={loggingOut}
              error={logoutError}
            />
          </>
        )}
      </div>
    </div>
  );
}

function RestaurantHeader({ restaurant }) {
  return (
    <header className="rounded-3xl border border-orange-200 bg-orange-50 p-8 shadow-xl shadow-orange-100">
      <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Restaurant Dashboard</p>
      <h1 className="mt-3 text-3xl font-bold text-orange-600 sm:text-4xl">
        {restaurant.name || "Your Restaurant"}
      </h1>
      <p className="mt-2 text-gray-600">
        Manage orders, track sales, and monitor your restaurant performance.
      </p>
      {restaurant.joined_at && (
        <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">
          Partner since {formatDate(restaurant.joined_at)}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <StatusBadge status={restaurant.status} />
      </div>
    </header>
  );
}

function SalesCards({ sales }) {
  const cards = [
    { label: "Today's Sales", value: sales.today, accent: "from-emerald-400 to-green-400", icon: "📊" },
    { label: "This Week", value: sales.this_week, accent: "from-blue-400 to-cyan-400", icon: "📈" },
    { label: "This Month", value: sales.this_month, accent: "from-purple-400 to-pink-400", icon: "💰" }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${card.accent} p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-wider text-white/90">{card.label}</p>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{formatCurrency(card.value)}</p>
        </div>
      ))}
    </div>
  );
}

function SalesChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <EmptyState message="No sales data available yet" />
      </section>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales || 0), 1);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = ((item.sales || 0) / maxSales) * 100;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.day || item.month}</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(item.sales || 0)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MetricsGrid({ metrics }) {
  const metricCards = [
    { label: "Total Orders", value: metrics.total_orders, suffix: "" },
    { label: "Total Revenue", value: formatCurrency(metrics.total_revenue), suffix: "" },
    { label: "Avg Order Value", value: formatCurrency(metrics.average_order_value), suffix: "" },
    { label: "Customer Rating", value: metrics.customer_rating.toFixed(1), suffix: "⭐" },
    { label: "Completion Rate", value: metrics.completion_rate.toFixed(1), suffix: "%" },
    { label: "Avg Prep Time", value: metrics.average_prep_time, suffix: " min" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {metricCards.map((metric, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md"
        >
          <p className="text-xs uppercase tracking-wider text-gray-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {metric.value}{metric.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

function OrdersStatusGrid({ orders }) {
  const statusCards = [
    { label: "Pending", value: orders.pending, color: "from-yellow-400 to-amber-400" },
    { label: "Preparing", value: orders.preparing, color: "from-orange-400 to-red-400" },
    { label: "Ready", value: orders.ready, color: "from-green-400 to-emerald-400" },
    { label: "Out for Delivery", value: orders.out_for_delivery, color: "from-blue-400 to-cyan-400" },
    { label: "Completed Today", value: orders.completed_today, color: "from-emerald-400 to-teal-400" },
    { label: "Cancelled Today", value: orders.cancelled_today, color: "from-red-400 to-rose-400" }
  ];

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statusCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-xl border border-gray-200 bg-gradient-to-br ${card.color} p-4`}
          >
            <p className="text-xs uppercase tracking-wider text-white/90">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentOrders({ orders = [] }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
      <p className="text-sm text-gray-600 mb-4">Latest customer orders</p>

      {orders.length === 0 ? (
        <EmptyState message="No orders yet" />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-500">#{order.id}</span>
                <OrderStatusPill status={order.status} />
              </div>
              <p className="text-gray-900 font-semibold">{order.customer_name}</p>
              <p className="text-sm text-gray-600 mt-1">{order.items}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</span>
                <span className="text-xs text-gray-500">{formatDateTime(order.placed_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TopItems({ items = [] }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Top Selling Items</h2>
      <p className="text-sm text-gray-600 mb-4">Best performing menu items</p>

      {items.length === 0 ? (
        <EmptyState message="No items data available" />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.orders} orders</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MenuManagementPanel() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Menus</p>
          <h2 className="text-2xl font-semibold text-gray-900">Keep your dishes up to date</h2>
          <p className="mt-2 text-gray-600">
            Add breakfast, lunch, or dinner menus, create dishes, and toggle availability when items sell out.
          </p>
        </div>
        <a
          href="/restaurants/menus"
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-white font-semibold shadow hover:bg-orange-600"
        >
          Manage menus
        </a>
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: "Pending Approval", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    approved: { label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
    suspended: { label: "Suspended", color: "bg-red-100 text-red-700 border-red-300" }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

function OrderStatusPill({ status }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    preparing: "bg-orange-100 text-orange-700",
    ready: "bg-green-100 text-green-700",
    out_for_delivery: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const color = statusColors[status] || statusColors.pending;

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase ${color}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
      {message}
    </div>
  );
}

function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "$0.00";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "PKR" }).format(numericValue);
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

function LogoutPanel({ onLogout, loggingOut, error }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-gradient-to-r from-orange-50 to-white p-6 text-center shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Need a break from managing orders?</h2>
      <p className="mt-2 text-sm text-gray-600">You can sign back in anytime to continue serving your customers.</p>
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

export default RestaurantDashboard;
