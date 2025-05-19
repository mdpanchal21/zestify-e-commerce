import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';


type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

export default function ProductDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (id) {
      fetch(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token || !product) return;

    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const result = await res.json();
      toast.success(result.message);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!product) return <p className="product-detail-loading">Loading product...</p>;

  return (
    <main className="product-detail-container">
  <div className="product-detail-card">
    <img
      src={`http://localhost:5000${product.image}`}
      alt={product.name}
      className="product-detail-image"
    />
    <div className="product-detail-info">
      <h1 className="product-detail-name">{product.name}</h1>

      <p className="product-detail-brand"><strong>Brand:</strong> {product.category}</p>


      <p className="product-detail-price">₹{product.price}</p>

      <span className="product-detail-offer">🔥 Limited Time Offer: 10% OFF</span>

      <p className="product-detail-availability">✔️ In stock</p>

      <p className="product-detail-delivery">🚚 Delivery in 2–4 business days</p>

      <p className="product-detail-description"><strong>Description:</strong> {product.description}</p>

      <div className="product-detail-actions">
        <button className="product-detail-btn" onClick={addToCart}>
          🛒 Add to Cart
        </button>

        <button
  className="product-detail-buy-btn"
  onClick={async () => {
    await addToCart(); // Add to cart first
    router.push('/checkout'); // Then redirect
  }}
>
  ⚡ Buy Now
</button>


        <button className="product-detail-back-btn" onClick={() => router.back()}>
          ← Go Back
        </button>
      </div>
    </div>
  </div>
</main>

  );
}
