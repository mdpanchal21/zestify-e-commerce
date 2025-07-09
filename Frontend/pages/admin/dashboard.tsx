import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";


// Import separate section components
import UsersSection from "../admin/Users";
import ProductsSection from "../admin/Product";
import OrdersSection from "../admin/order";
import SettingsSection from "../admin/settings";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.isAdmin) {
      router.push('/');
      return;
    }

    const fetchStatsData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsData = await statsRes.json();
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('Failed to load admin stats');
      }
    };

    fetchStatsData();
  }, [router]);

  return (
    <div className="admin-dashboard">
  <header className="admin-header">
    <button className="sidebar-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
      ☰
    </button>
    <h1>Admin Dashboard</h1>
  </header>

  <div className="admin-layout">
    <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
      <ul className="sidebar-menu">
        <li onClick={() => setActiveSection("dashboard")}>
          <span className="icon">📊</span>
          <span className="label">Dashboard</span>
        </li>
        <li onClick={() => setActiveSection("users")}>
          <span className="icon">👥</span>
          <span className="label">Users</span>
        </li>
        <li onClick={() => setActiveSection("products")}>
          <span className="icon">📦</span>
          <span className="label">Products</span>
        </li>
        <li onClick={() => setActiveSection("orders")}>
          <span className="icon">🧾</span>
          <span className="label">Orders</span>
        </li>
        <li onClick={() => setActiveSection("settings")}>
          <span className="icon">⚙️</span>
          <span className="label">Settings</span>
        </li>
      </ul>
    </aside>

    <main className="dashboard-content">
      {activeSection === "dashboard" && (
        <>
          <h2 className="dashboard-heading">📊 Admin Overview</h2>
          {loading ? (
            <p>Loading admin overview...</p>
          ) : (
            stats && (
              <div className="modern-stats-grid">
                <div className="modern-stat-card users">
                  <div className="card-icon">
                    <img src="/users.png" alt="Users" />
                  </div>
                  <div className="card-info">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                  </div>
                </div>

                <div className="modern-stat-card products">
                  <div className="card-icon">
                    <img src="/product.png" alt="Products" />
                  </div>
                  <div className="card-info">
                    <h3>Total Products</h3>
                    <p>{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="modern-stat-card orders">
                  <div className="card-icon">
                    <img src="/orders.png" alt="Orders" />
                  </div>
                  <div className="card-info">
                    <h3>Total Orders</h3>
                    <p>{stats.totalOrders}</p>
                  </div>
                </div>

                <div className="modern-stat-card sales">
                  <div className="card-icon">
                    <img src="/sell.png" alt="Sales" />
                  </div>
                  <div className="card-info">
                    <h3>Total Sales</h3>
                    <p>${stats.totalSales.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}

      {activeSection === "users" && <UsersSection />}
      {activeSection === "products" && <ProductsSection />}
      {activeSection === "orders" && <OrdersSection />}
      {activeSection === "settings" && <SettingsSection />}
    </main>
  </div>
</div>

  );
}
