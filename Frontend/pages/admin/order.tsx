import { useEffect, useState } from "react";

interface OrderItem {
  productId: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: string;
    category: string;
    image: string;
  };
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface User {
  name: string;
  email: string;
}

interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  orderStatus: string;
  user: User | null;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: ShippingAddress;
}

const STATUS_OPTIONS = ["Pending", "On the way", "Delivered", "Cancelled"];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const backendURL = "http://localhost:5000";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const res = await fetch(`${backendURL}/api/admin/admin-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch(
        `${backendURL}/api/admin/admin-orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update status");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );

      setSuccess(`Order ${orderId} status updated to "${newStatus}"`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(`Error updating order ${orderId}: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleOrderClick(orderId: string) {
    setDetailLoading(true);
    setDetailError("");
    setSelectedOrder(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch(
        `${backendURL}/api/admin/admin-orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch order details");

      const data: Order = await res.json();
      setSelectedOrder(data);
    } catch (err: any) {
      setDetailError(err.message || "Unknown error");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setSelectedOrder(null);
  }

  if (loading) return <p className="message">Loading orders...</p>;

  return (
    <div className="orderManagement">
      <h2 className="heading">Order Management</h2>

      {error && (
        <p className="message" style={{ color: "red" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="message" style={{ color: "green" }}>
          {success}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="message">No orders found.</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th className="th">Order ID</th>
              <th className="th">Total</th>
              <th className="th">Date</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="trHover"
                onClick={() => handleOrderClick(order.id)}
              >
                <td className="td">{order.id}</td>
                <td className="td">₹{order.totalAmount.toFixed(2)}</td>
                <td className="td">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="td">
                  <select
                    className="selectStatus"
                    value={order.orderStatus}
                    disabled={updatingOrderId === order.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order.id && (
                    <span className="updatingText">Updating...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {selectedOrder && (
       <div className="modalOverlay" onClick={closeModal}>
  <div className="modalContent" onClick={(e) => e.stopPropagation()}>
    <button className="closeButton" onClick={closeModal}>&times;</button>
    <h3>Order Details</h3>

    {detailLoading && <p>Loading details...</p>}
    {detailError && <p style={{ color: "red" }}>{detailError}</p>}

    {!detailLoading && !detailError && (
      <>
        <section className="orderSummary">
          <div className="orderDate">
            <span className="label">Date:</span>
            <span className="value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
          </div>
          <div className="orderId">
            <span className="label">Order ID:</span>
            <span className="value">{selectedOrder.id}</span>
          </div>
          <div className="orderStatus">
            <span className="label">Status:</span>
            <span className={`statusBadge status-${selectedOrder.orderStatus.toLowerCase()}`}>
              {selectedOrder.orderStatus}
            </span>
          </div>
          <div className="orderTotal">
            <span className="label">Total Amount:</span>
            <span className="value">₹{selectedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </section>

        <h4>Shipping Address</h4>
        <p>
          {/* {selectedOrder.shippingAddress.fullName},{" "} */}
          {selectedOrder.shippingAddress.address},{" "}
          {selectedOrder.shippingAddress.city},{" "}
          {selectedOrder.shippingAddress.postalCode},{" "}
          {selectedOrder.shippingAddress.country}
        </p>

        <h4>User Info</h4>
        <p><strong>Name:</strong> {selectedOrder.user?.name || "N/A"}</p>
        <p><strong>Email:</strong> {selectedOrder.user?.email || "N/A"}</p>

        <h4>Payment Method</h4>
        <p>{selectedOrder.paymentMethod || "N/A"}</p>

        <h4>Items</h4>
        <ul className="itemList">
          {selectedOrder.items.map(({ product, quantity }) => (
            <li key={product._id}>
              <img
                src={backendURL + product.image}
                alt={product.name}
                className="productImage"
              />
              <span>
                <strong>{product.name}</strong> - ₹
                {Number(product.price).toFixed(2)} × {quantity}
              </span>
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
</div>

      )}
    </div>
  );
}
