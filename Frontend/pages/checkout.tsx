import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string;
  };
}

interface ShippingForm {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [formData, setFormData] = useState<ShippingForm>({
    line1: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartItems(data.items || []);
        const calculatedTotal = data.items.reduce(
          (acc: number, item: CartItem) => acc + item.product.price * item.quantity,
          0
        );
        setTotal(calculatedTotal);
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    if (token) fetchCart();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    try {
      if (!token) {
        toast.error("You must be logged in to place an order.");
        return;
      }

      // Validate that all shipping fields are filled
      const { line1, city, state, zip, country } = formData;
      if (!line1 || !city || !state || !zip || !country) {
        toast.error("Please fill in all shipping address fields.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 Order placed successfully!");
        router.push("/order-success"); // Optional redirect
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <main className="checkout-container">
      <div className="checkout-box">
        <h1 className="checkout-title">🧾 Checkout</h1>

        <section className="checkout-summary">
          <h2 className="section-title">🛍️ Order Summary</h2>
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
              <span>{item.product.name}</span>
              <span>{item.quantity} × ${item.product.price}</span>
            </div>
          ))}
          <div className="summary-total">
            <strong>Total:</strong> <span className="total-price text-green-600">${total.toFixed(2)}</span>
          </div>
        </section>

        <section className="checkout-address">
          <h2 className="section-title">🏠 Shipping Address</h2>
          <form className="address-form">
            <input type="text" name="line1" placeholder="Address Line 1" value={formData.line1} onChange={handleInputChange} required />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} required />
            <input type="text" name="zip" placeholder="Zip" value={formData.zip} onChange={handleInputChange} required />
            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required />
          </form>
        </section>
        <div className="button-group">
        <button className="proceed-btn" onClick={placeOrder} type="button">
  Place Order
</button>


<button className="back-btn-checkout" onClick={() => router.push('/cart')} type="button">
  Return to Cart
</button>
</div>
      </div>
    </main>
  );
}
