  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/router';

  interface CartItem {
    productId: string;
    quantity: number;
    product: {
      name: string;
      price: number;
      image: string;
    };
  }

  export default function OrderSuccess() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
      const fetchCart = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) return;

        try {
          const res = await fetch('http://localhost:5000/api/cart', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];

          setCartItems(items);

          const calculatedTotal = items.reduce(
            (acc: number, item: CartItem) => acc + item.product.price * item.quantity,
            0
          );
          setTotal(calculatedTotal);
        } catch (err) {
          console.error('Error fetching cart:', err);
          setCartItems([]);
          setTotal(0);
        }
      };

      fetchCart();
    }, []);

    const clearCartAndRedirect = async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const userId = user?._id;
    
      if (!userId) {
        console.error('❌ User ID not found in localStorage');
        return;
      }
    
      try {
        const res = await fetch(`http://localhost:5000/api/cart/clear/${userId}`, {
          method: 'DELETE',
        });
    
        const data = await res.json();
        console.log('🛒 Cart cleared:', data.message);
    
        // Redirect after successful clear
        if (res.ok) {
          router.push('/products');
        }
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    };
    
    return (
      <main className="checkout-container">
        <div className="checkout-box">
          <h1 className="checkout-title">🎉 Order Confirmed!</h1>
          <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <section className="checkout-summary">
            <h2 className="section-title">🧾 Order Summary</h2>
            {cartItems.map((item, index) => (
              <div key={index} className="summary-item">
                <span>{item.product.name}</span>
                <span>
                  {item.quantity} × ${item.product.price}
                </span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total:</strong> <span className="total-price">${total.toFixed(2)}</span>
            </div>
          </section>

          <button
  className="proceed-btn"
  onClick={clearCartAndRedirect}
  style={{ width: '100%' }}
>
  🏠 Return to Home
</button>

        </div>
      </main>
    );
  }
