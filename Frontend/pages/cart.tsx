import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface Product {
  name: string;
  price: number;
  image: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface Cart {
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isAdmin, setIsAdmin] = useState(false);


  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch Cart
  const fetchCart = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCart(data && Array.isArray(data.items) ? data : { items: [] });


      const qtyState: { [key: string]: number } = {};
      data.items.forEach((item: CartItem) => {
        qtyState[item.productId] = item.quantity;
      });
      setQuantities(qtyState);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchCart();
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.isAdmin === true);
    }
  }, []);
  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  // Handle quantity change
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (newQuantity <= 0) {
      // DELETE when quantity goes to 0
      try {
        const res = await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        toast.success(data.message); // ✅ Only show alert on deletion
      } catch (error) {
        console.error('Error deleting cart item:', error);
      }
    } else {
      // PUT to update quantity
      try {
        await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        // ❌ No alert here — silent update
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    }

    fetchCart(); // Refresh the cart
  };



  // Update Quantity API
  const handleQuantityUpdate = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      setQuantities({ ...quantities, [productId]: newQty });

      const res = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.success(result.message);
      } else {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };


  // Delete Item API
  const deleteItem = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      toast.success(result.message);
      fetchCart();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (!cart) return <p>Loading...</p>;

  return (
    <>
      <header className="cart-header">
        <h2>🛒 My Cart</h2>
        <div>
        {isAdmin && (
  <button className="cart-header-btn" onClick={() => router.push('/admin/dashboard')}>Admin Dashboard</button>
)}

          <button  className="cart-header-btn" onClick={() => router.push('/order-history')}>
            My Orders
          </button>
          <button className="cart-header-btn" onClick={() => router.push('/products')}>
            🛍️ Products
          </button>
          <button
            className="cart-header-btn2"
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

      <main className="cart-main">
        <h1 className="cart-title">Your Cart</h1>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <img src="/download.png" alt="Empty Cart" />
            <p>Oops! Your cart is feeling empty.</p>
            <button onClick={() => router.push('/products')}>🛍️ Start Shopping</button>
          </div>
        ) : (
          <div>
            <div className="cart-grid">
              {cart.items.map((item, index) =>
                item?.product ? (
                  <div className="cart-item" key={index}>
                    <img
                      src={`http://localhost:5000${item.product.image}`}
                      alt={item.product.name}
                      className="cart-image"
                    />
                    <h3>{item.product.name}</h3>
                    <p>Price: ${item.product.price}</p>

                    <div className="cart-controls">
                      <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                        ➖
                      </button>

                      <span>{quantities[item.productId] || item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityUpdate(item.productId, (quantities[item.productId] || 1) + 1)
                        }
                      >
                        ➕
                      </button>
                      <button onClick={() => deleteItem(item.productId)} className="delete-btn">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <p key={index}>Invalid product</p>
                )
              )}
            </div>
            <div className="cart-summary">
              <h2 className="summary-title">Cart Summary</h2>
              <div className="summary-content">
                <p className="summary-total">
                  Total:{' '}
                  <span className="summary-amount">
                    $
                    {cart.items
                      .reduce(
                        (acc, item) =>
                          acc + item.quantity * item.product.price,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
                <button className="checkout-btn" onClick={() => router.push('/checkout')}>
                  🛒 Checkout
                </button>
              </div>
            </div>

          </div>

        )}
      </main>


    </>
  );
}
