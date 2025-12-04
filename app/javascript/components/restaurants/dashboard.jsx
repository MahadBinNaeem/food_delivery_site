import React, { useEffect, useState } from "react";

const DEFAULT_DASHBOARD = {
  restaurant: {},
  sales: { today: 0, this_week: 0, this_month: 0, weekly_trend: [], monthly_trend: [] },
  orders: { pending: 0, preparing: 0, ready: 0, out_for_delivery: 0, completed_today: 0, cancelled_today: 0 },
  metrics: { total_orders: 0, total_revenue: 0, average_order_value: 0, customer_rating: 0, completion_rate: 0, average_prep_time: 0 },
  recent_orders: [],
  top_items: []
};

function RestaurantDashboard({ initialData = {} }) {
  const hasInitialData = initialData && Object.keys(initialData).length > 0;
  const [dashboard, setDashboard] = useState(hasInitialData ? initialData : DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <RestaurantHeader restaurant={restaurant} />

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
          </>
        )}
      </div>
    </div>
  );
}

function RestaurantHeader({ restaurant }) {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">Restaurant Dashboard</p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        {restaurant.name || "Your Restaurant"}
      </h1>
      <p className="mt-2 text-gray-300">
        Manage orders, track sales, and monitor your restaurant performance.
      </p>
      {restaurant.joined_at && (
        <p className="mt-4 text-xs uppercase tracking-wide text-gray-400">
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
    { label: "Today's Sales", value: sales.today, accent: "from-emerald-500/40 to-green-500/40", icon: "📊" },
    { label: "This Week", value: sales.this_week, accent: "from-blue-500/40 to-cyan-500/40", icon: "📈" },
    { label: "This Month", value: sales.this_month, accent: "from-purple-500/40 to-pink-500/40", icon: "💰" }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 shadow-lg shadow-black/30`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-wider text-gray-200/80">{card.label}</p>
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
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <EmptyState message="No sales data available yet" />
      </section>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales || 0), 1);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>
      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = ((item.sales || 0) / maxSales) * 100;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{item.day || item.month}</span>
                <span className="text-white font-semibold">{formatCurrency(item.sales || 0)}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
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
          className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
        >
          <p className="text-xs uppercase tracking-wider text-gray-400">{metric.label}</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metric.value}{metric.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

function OrdersStatusGrid({ orders }) {
  const statusCards = [
    { label: "Pending", value: orders.pending, color: "from-yellow-500/40 to-amber-500/40" },
    { label: "Preparing", value: orders.preparing, color: "from-orange-500/40 to-red-500/40" },
    { label: "Ready", value: orders.ready, color: "from-green-500/40 to-emerald-500/40" },
    { label: "Out for Delivery", value: orders.out_for_delivery, color: "from-blue-500/40 to-cyan-500/40" },
    { label: "Completed Today", value: orders.completed_today, color: "from-emerald-500/40 to-teal-500/40" },
    { label: "Cancelled Today", value: orders.cancelled_today, color: "from-red-500/40 to-rose-500/40" }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white mb-4">Order Status</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statusCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-xl border border-white/10 bg-gradient-to-br ${card.color} p-4`}
          >
            <p className="text-xs uppercase tracking-wider text-gray-200">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentOrders({ orders = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
      <p className="text-sm text-gray-300 mb-4">Latest customer orders</p>

      {orders.length === 0 ? (
        <EmptyState message="No orders yet" />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-400">#{order.id}</span>
                <OrderStatusPill status={order.status} />
              </div>
              <p className="text-white font-semibold">{order.customer_name}</p>
              <p className="text-sm text-gray-300 mt-1">{order.items}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
                <span className="text-xs text-gray-400">{formatDateTime(order.placed_at)}</span>
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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <h2 className="text-xl font-semibold text-white">Top Selling Items</h2>
      <p className="text-sm text-gray-300 mb-4">Best performing menu items</p>

      {items.length === 0 ? (
        <EmptyState message="No items data available" />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.orders} orders</p>
                </div>
                <p className="text-lg font-bold text-white">{formatCurrency(item.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: "Pending Approval", color: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40" },
    approved: { label: "Active", color: "bg-green-500/20 text-green-200 border-green-500/40" },
    suspended: { label: "Suspended", color: "bg-red-500/20 text-red-200 border-red-500/40" }
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
    pending: "bg-yellow-500/20 text-yellow-200",
    preparing: "bg-orange-500/20 text-orange-200",
    ready: "bg-green-500/20 text-green-200",
    out_for_delivery: "bg-blue-500/20 text-blue-200",
    completed: "bg-emerald-500/20 text-emerald-200",
    cancelled: "bg-red-500/20 text-red-200"
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

export default RestaurantDashboard;
