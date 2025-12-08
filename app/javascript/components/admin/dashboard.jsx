import React, { useEffect, useState } from "react";

const DEFAULT_DASHBOARD = {
  overview: { total_users: 0, total_restaurants: 0, total_orders: 0, total_revenue: 0 },
  users: { total: 0, customers: 0, vendors: 0, riders: 0, new_today: 0, new_this_week: 0, new_this_month: 0 },
  restaurants: { total: 0, pending: 0, approved: 0, suspended: 0, new_today: 0, new_this_week: 0 },
  orders: { total: 0, pending: 0, preparing: 0, out_for_delivery: 0, completed: 0, cancelled: 0, today: 0, this_week: 0, this_month: 0 },
  revenue: { total: 0, today: 0, this_week: 0, this_month: 0, average_order_value: 0, trend: [] },
  recent_activity: { recent_orders: [], recent_users: [], recent_restaurants: [] },
  platform_metrics: { user_growth_rate: 0, restaurant_growth_rate: 0, order_completion_rate: 0, average_delivery_time: 0 },
  auth_paths: {}
};

function AdminDashboard({ initialData = {} }) {
  const hasInitialData = initialData && Object.keys(initialData).length > 0;
  const [dashboard, setDashboard] = useState(hasInitialData ? initialData : DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  useEffect(() => {
    if (hasInitialData) return;

    const controller = new AbortController();

    fetch("/admin/dashboard.json", {
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

  const overview = dashboard.overview || DEFAULT_DASHBOARD.overview;
  const users = dashboard.users || DEFAULT_DASHBOARD.users;
  const restaurants = dashboard.restaurants || DEFAULT_DASHBOARD.restaurants;
  const orders = dashboard.orders || DEFAULT_DASHBOARD.orders;
  const revenue = dashboard.revenue || DEFAULT_DASHBOARD.revenue;
  const platformMetrics = dashboard.platform_metrics || DEFAULT_DASHBOARD.platform_metrics;
  const recentActivity = dashboard.recent_activity || DEFAULT_DASHBOARD.recent_activity;
  const authPaths = dashboard.auth_paths || DEFAULT_DASHBOARD.auth_paths;
  const logoutPath = authPaths.logout || "/admin/sign_out";

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
        window.location.href = "/admin/sign_in";
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
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminHeader />

        {loading && (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-gray-300">
            Loading dashboard data…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <OverviewCards overview={overview} />

            <RevenueSection revenue={revenue} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <UserStatsCard users={users} />
              <RestaurantStatsCard restaurants={restaurants} />
            </div>

            <OrderStatsCard orders={orders} />

            <PlatformMetricsCard metrics={platformMetrics} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <RecentOrders orders={recentActivity.recent_orders} />
              <RecentUsers users={recentActivity.recent_users} />
              <RecentRestaurants restaurants={recentActivity.recent_restaurants} />
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

function AdminHeader() {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.3em] text-purple-200/80">Admin Panel</p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        Platform Dashboard
      </h1>
      <p className="mt-2 text-gray-300">
        Monitor and manage the entire platform from one central location.
      </p>
    </header>
  );
}

function OverviewCards({ overview }) {
  const cards = [
    { label: "Total Users", value: overview.total_users, accent: "from-blue-500/40 to-cyan-500/40", icon: "👥", link: "/admin/users" },
    { label: "Total Restaurants", value: overview.total_restaurants, accent: "from-orange-500/40 to-amber-500/40", icon: "🍽️", link: "/admin/restaurants" },
    { label: "Total Orders", value: overview.total_orders, accent: "from-purple-500/40 to-pink-500/40", icon: "📦", link: "/admin/orders" },
    { label: "Total Revenue", value: formatCurrency(overview.total_revenue), accent: "from-emerald-500/40 to-green-500/40", icon: "💰", link: "/admin/revenue" }
  ];

  const handleCardClick = (link) => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => handleCardClick(card.link)}
          className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 shadow-lg shadow-black/30 ${card.link ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-wider text-gray-200/80">{card.label}</p>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{typeof card.value === 'string' ? card.value : card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

function RevenueSection({ revenue }) {
  const revenueCards = [
    { label: "Today", value: revenue.today },
    { label: "This Week", value: revenue.this_week },
    { label: "This Month", value: revenue.this_month },
    { label: "Avg Order Value", value: revenue.average_order_value }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Revenue Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {revenueCards.map((card, idx) => (
          <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      {revenue.trend && revenue.trend.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">7-Day Revenue Trend</h3>
          <RevenueTrendChart data={revenue.trend} />
        </div>
      )}
    </section>
  );
}

function RevenueTrendChart({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const percentage = ((item.revenue || 0) / maxRevenue) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{item.date}</span>
              <span className="text-white font-semibold">{formatCurrency(item.revenue || 0)}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UserStatsCard({ users }) {
  const stats = [
    { label: "Customers", value: users.customers, color: "text-blue-300" },
    { label: "Vendors", value: users.vendors, color: "text-orange-300" },
    { label: "Riders", value: users.riders, color: "text-green-300" },
    { label: "New Today", value: users.new_today, color: "text-purple-300" },
    { label: "New This Week", value: users.new_this_week, color: "text-pink-300" },
    { label: "New This Month", value: users.new_this_month, color: "text-cyan-300" }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center rounded-xl border border-white/5 bg-white/5 p-3">
            <span className="text-sm text-gray-300">{stat.label}</span>
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RestaurantStatsCard({ restaurants }) {
  const stats = [
    { label: "Total", value: restaurants.total, color: "text-white" },
    { label: "Pending Approval", value: restaurants.pending, color: "text-yellow-300" },
    { label: "Approved", value: restaurants.approved, color: "text-green-300" },
    { label: "Suspended", value: restaurants.suspended, color: "text-red-300" },
    { label: "New Today", value: restaurants.new_today, color: "text-purple-300" },
    { label: "New This Week", value: restaurants.new_this_week, color: "text-cyan-300" }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Restaurant Statistics</h2>
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center rounded-xl border border-white/5 bg-white/5 p-3">
            <span className="text-sm text-gray-300">{stat.label}</span>
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderStatsCard({ orders }) {
  const statusCards = [
    { label: "Pending", value: orders.pending, color: "from-yellow-500/40 to-amber-500/40" },
    { label: "Preparing", value: orders.preparing, color: "from-orange-500/40 to-red-500/40" },
    { label: "Out for Delivery", value: orders.out_for_delivery, color: "from-blue-500/40 to-cyan-500/40" },
    { label: "Completed", value: orders.completed, color: "from-emerald-500/40 to-green-500/40" },
    { label: "Cancelled", value: orders.cancelled, color: "from-red-500/40 to-rose-500/40" }
  ];

  const periodCards = [
    { label: "Today", value: orders.today },
    { label: "This Week", value: orders.this_week },
    { label: "This Month", value: orders.this_month }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Order Statistics</h2>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">By Status</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statusCards.map((card, idx) => (
            <div key={idx} className={`rounded-xl border border-white/10 bg-gradient-to-br ${card.color} p-4`}>
              <p className="text-xs uppercase tracking-wider text-gray-200">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">By Period</h3>
        <div className="grid grid-cols-3 gap-4">
          {periodCards.map((card, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformMetricsCard({ metrics }) {
  const metricCards = [
    { label: "User Growth Rate", value: `${metrics.user_growth_rate.toFixed(1)}%`, icon: "📈" },
    { label: "Restaurant Growth", value: `${metrics.restaurant_growth_rate.toFixed(1)}%`, icon: "🚀" },
    { label: "Order Completion", value: `${metrics.order_completion_rate.toFixed(1)}%`, icon: "✅" },
    { label: "Avg Delivery Time", value: `${metrics.average_delivery_time} min`, icon: "⏱️" }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Platform Metrics</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((metric, idx) => (
          <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-gray-400">{metric.label}</p>
              <span className="text-xl">{metric.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentOrders({ orders = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>

      {orders.length === 0 ? (
        <EmptyState message="No recent orders" />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map(order => (
            <div key={order.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono text-gray-400">#{order.id}</span>
                <OrderStatusPill status={order.status} />
              </div>
              <p className="text-sm text-white font-medium">{order.customer}</p>
              <p className="text-xs text-gray-400">{order.restaurant}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white font-bold">{formatCurrency(order.total_amount)}</span>
                <span className="text-xs text-gray-400">{formatDateTime(order.placed_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentUsers({ users = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Users</h2>

      {users.length === 0 ? (
        <EmptyState message="No recent users" />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map(user => (
            <div key={user.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <p className="text-sm text-white font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <div className="flex justify-between items-center mt-2">
                <RoleBadge role={user.role} />
                <span className="text-xs text-gray-400">{formatDateTime(user.joined_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentRestaurants({ restaurants = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Restaurants</h2>

      {restaurants.length === 0 ? (
        <EmptyState message="No recent restaurants" />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <p className="text-sm text-white font-medium">{restaurant.name}</p>
              <p className="text-xs text-gray-400">{restaurant.email}</p>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={restaurant.status} />
                <span className="text-xs text-gray-400">{formatDateTime(restaurant.joined_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OrderStatusPill({ status }) {
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-200",
    preparing: "bg-orange-500/20 text-orange-200",
    out_for_delivery: "bg-blue-500/20 text-blue-200",
    completed: "bg-emerald-500/20 text-emerald-200",
    cancelled: "bg-red-500/20 text-red-200"
  };

  const color = statusColors[status] || statusColors.pending;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${color}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function RoleBadge({ role }) {
  const roleColors = {
    customer: "bg-blue-500/20 text-blue-200",
    vendor: "bg-orange-500/20 text-orange-200",
    rider: "bg-green-500/20 text-green-200"
  };

  const color = roleColors[role] || roleColors.customer;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${color}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { color: "bg-yellow-500/20 text-yellow-200" },
    approved: { color: "bg-green-500/20 text-green-200" },
    suspended: { color: "bg-red-500/20 text-red-200" }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${config.color}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-gray-300">
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

function LogoutPanel({ onLogout, loggingOut, error }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/0 p-6 text-center shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white">Finished managing the platform?</h2>
      <p className="mt-2 text-sm text-gray-300">You can return to the admin panel anytime to monitor operations.</p>
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

export default AdminDashboard;
