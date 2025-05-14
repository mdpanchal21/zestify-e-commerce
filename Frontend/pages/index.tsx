// pages/index.tsx
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const handleProductClick = (productId: string) => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push(`/products/${productId}`);
    } else {
      router.push('/login');
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  return (
    <Layout>
      <main className="custom-main">
        <div className="product-grid">
          {currentProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={`http://localhost:5000${product.image}`} alt={product.name} />
              <h2>{product.name}</h2>
              <p><strong>${product.price}</strong></p>
              <p>Category: {product.category}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </Layout>
  );
}
