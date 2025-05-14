import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  const router = useRouter();


  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      const userId = user._id;

      if (!userId || !token) return;

      try {
        const res = await fetch(`http://localhost:5000/api/user-orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
<header className="order-history-header">
  <h1>Your Order History</h1>
  <div className="order-actions">
    <button onClick={() => router.push('/products')}>🛍️ Products</button>
  <button onClick={() => router.push('/cart')}>🛒 View Cart</button>
    <button
      onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }}
    >
      Logout
    </button>
  </div>
</header>
    <div className="order-history-container">
      
      {/* <h1>Order History</h1> */}
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => {
          const totalBill = order.items.reduce((total, item) => {
            const price = Number(item.product?.price || 0);
            return total + price * item.quantity;
          }, 0);

          return (
            <div className="order-card" key={order._id}>
              <h2 className='orderid-h2'>Order ID: {order._id}</h2>
              <p className='orderid-p'><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              {/* <p><strong>Shipping:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country} - {order.shippingAddress.postalCode}</p> */}
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
                        <td>{item.product?.name || 'Unnamed Product'}</td>
                        <td>{item.quantity}</td>
                        <td>₹{price.toFixed(2)}</td>
                        <td>₹{subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="total-amount"><strong>Total Bill:</strong> <span className='total-amount-rs'> ₹{totalBill.toFixed(2)}</span></p>
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
