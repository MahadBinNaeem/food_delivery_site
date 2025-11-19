import React, { useEffect, useState } from "react";

function Dashboard({ initialData = {} }) {
  const [stats, setStats] = useState(initialData);
  const [loading, setLoading] = useState(!Object.keys(initialData).length);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/admin/dashboard.json", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to load dashboard stats");
        return response.json();
      })
      .then(data => {
        setStats(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const statOrFallback = value =>
    typeof value === "number" ? value : value || 0;

  return (
    <div className="dashboard space-y-8 text-white">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-300">Key metrics and recent activity</p>
        </div>
      </header>

      {loading && <p className="text-gray-300">Loading dashboard…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Customers" value={statOrFallback(stats.total_customers)} />
            <StatCard title="Total Restaurants" value={statOrFallback(stats.total_restaurants)} />
            <StatCard title="Total Riders" value={statOrFallback(stats.total_riders)} />
            <StatCard title="Total Orders" value={statOrFallback(stats.total_orders)} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Section title="Recent Orders">
              {stats.recent_orders?.length ? (
                <ul className="space-y-2 text-sm">
                  {stats.recent_orders.map(order => (
                    <li key={order.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-md shadow-black/20">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Order #{order.id}</span>
                        <span className="uppercase tracking-wide text-blue-300">{order.status || "—"}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-300">
                        Amount: <span className="font-semibold text-white">{order.total_amount ?? "—"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState message="No recent orders found." />
              )}
            </Section>

            <Section title="Recent Users">
              {stats.recent_users?.length ? (
                <ul className="space-y-2 text-sm">
                  {stats.recent_users.map(user => (
                    <li key={user.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-md shadow-black/20">
                      <div className="font-semibold text-white">{user.name || "Unnamed"}</div>
                      <div className="text-xs text-gray-300">{user.email}</div>
                      <div className="text-xs text-indigo-300 uppercase tracking-wide">{user.role}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState message="No recent users found." />
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:shadow-2xl">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-10 text-center text-sm text-gray-300">
      {message}
    </div>
  );
}

export default Dashboard;
