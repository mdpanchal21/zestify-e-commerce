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
          <p className="product-detail-price"><strong>Price:</strong> ${product.price}</p>
          <p className="product-detail-category"><strong>Category:</strong> {product.category}</p>
          <p className="product-detail-description"><strong>Description:</strong> {product.description}</p>

          <button className="product-detail-btn" onClick={addToCart}>
            🛒 Add to Cart
          </button>

          <button className="product-detail-back-btn" onClick={() => router.back()}>
            ← Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
