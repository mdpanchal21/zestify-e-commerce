import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";

interface Product {
  name: string;
  price: string;
  image?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const userId = user._id;

      if (!userId || !token) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/user-orders/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Filter the orders based on selected time range
  const filteredOrders = orders.filter((order) => {
    if (!selectedTimeRange) return true;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (selectedTimeRange === "last30") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }

    if (selectedTimeRange === "last3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return orderDate >= threeMonthsAgo;
    }

    if (selectedTimeRange === "thisYear") {
      return orderDate.getFullYear() === now.getFullYear();
    }

    if (selectedTimeRange === "lastYear") {
      return orderDate.getFullYear() === now.getFullYear() - 1;
    }

    return true;
  });

  return (
    <>
      <Header
        categories={[]}
        selectedCategory=""
        setSelectedCategory={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
        showFilters={false}
      />

      <div className="order-header-toolbar">
        <h1>Your Order History</h1>
        <div className="order-filter-bar">
          <label htmlFor="timeRangeFilter">Filter By Order Date:</label>
          <select
            id="timeRangeFilter"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="">All Time</option>
            <option value="last30">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
          </select>
          {selectedTimeRange && (
            <button
              onClick={() => setSelectedTimeRange("")}
              className="reset-filter-btn"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="order-history-container">
        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <img
              src="/no_order_found.png"
              alt="No Orders"
              className="empty-orders-image"
            />
            <p>
              {selectedTimeRange
                ? "No orders found for the selected time range."
                : "Looks like you haven't made any purchases yet. Start exploring our latest products now!"}
            </p>
            <button
              onClick={() => router.push("/products")}
              className="start-shopping-btn"
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const totalBill = order.items.reduce((total, item) => {
              const price = Number(item.product?.price || 0);
              return total + price * item.quantity;
            }, 0);

            return (
              <div className="order-card" key={order._id}>
                <h2 className="orderid-h2">Order ID: {order._id}</h2>
                <p className="orderid-p">
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>

                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price (each)</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const price = Number(item.product?.price || 0);
                      const subtotal = price * item.quantity;
                      return (
                        <tr key={index}>
                          <td>{item.product?.name || "Unnamed Product"}</td>
                          <td>{item.quantity}</td>
                          <td>₹{price.toFixed(2)}</td>
                          <td>₹{subtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p className="total-amount">
                  <strong>Total Bill:</strong>{" "}
                  <span className="total-amount-rs">
                    ₹{totalBill.toFixed(2)}
                  </span>
                </p>
              </div>
            );
          })
        )}
      </div>

      <footer className="order-history-footer">
        © {new Date().getFullYear()} My E-Commerce Store. All rights reserved.
      </footer>
    </>
  );
}
