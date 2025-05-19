import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5000/api/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.isAdmin === true);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Pagination logic
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const priceMatch = product.price.toString().includes(query);
    const categoryMatch = (product.category ?? "")
      .toLowerCase()
      .includes(query);
    const nameMatch = (product.name ?? "").toLowerCase().includes(query);
    const categoryFilterMatch =
      selectedCategory === "All" || product.category === selectedCategory;

    return categoryFilterMatch && (nameMatch || categoryMatch || priceMatch);
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  return (
    <main>
      <div className={`product-header ${isAdmin ? "admin-logged-in" : ""}`}>
        <h1>All Products</h1>
        <div className="product-actions">
          <div className="search-drop-prt">
            <select
              className="category-dropdown"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          {isAdmin && (
            <button onClick={() => router.push("/admin/dashboard")}>
              Admin Dashboard
            </button>
          )}
          <button onClick={() => router.push("/order-history")}>
            My Orders
          </button>
          <button onClick={() => router.push("/cart")}>🛒 View Cart</button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="product-grid">
        {currentProducts.map((product) => (
          <div key={product._id} className="product-card">
            <Link href={`/products/${product._id}`}>
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
              />
            </Link>
            <h2>{product.name}</h2>
            <p>
              <strong>${product.price}</strong>
            </p>
            <p>Category: {product.category}</p>
          </div>
        ))}
      </div>

      {/* Pagination buttons */}
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
            className={currentPage === i + 1 ? "active" : ""}
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
  );
}
