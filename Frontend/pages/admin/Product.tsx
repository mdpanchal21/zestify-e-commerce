import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Selected product state
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For modal visibility
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
  }); // For the product form
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null as File | null, // Updated field for image
  });

  const allowedCategories = [
    "Electronics",
    "Clothing",
    "Accessories",
    "Home & Kitchen",
    "Books",
    "Toys",
    "Beauty",
  ];

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when currentPage changes
  }, [currentPage]);

  // Fetch products on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user.isAdmin) {
      router.push("/");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productsData = await res.json();
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  // Handle search functionality for products
  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic for products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };

  // Handle product deletion
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/admin/products/${productToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((prev) =>
        prev.filter((product) => product._id !== productToDelete)
      );
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Handle editing a product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product); // Store the selected product
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
    });
    setIsEditModalOpen(true); // Open the modal
  };
  // Step 4: Handle updating the product
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    const { name, price, category } = editForm;

    if (!name || !price || !category) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, price: parseFloat(price), category }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update product");
      }

      // Update the products list in the state
      setProducts((prev) =>
        prev.map((product) =>
          product._id === selectedProduct._id
            ? { ...product, name, price: parseFloat(price), category }
            : product
        )
      );

      toast.success("Product updated successfully");
      setIsEditModalOpen(false); // Close the modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  // const updateProduct = async (productId: string, name: string, price: number, category: string) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const res = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ name, price, category }),
  //     });

  //     if (!res.ok) {
  //       const data = await res.json();
  //       throw new Error(data.message || 'Failed to update product');
  //     }

  //     setProducts((prev) =>
  //       prev.map((product) =>
  //         product._id === productId ? { ...product, name, price, category } : product
  //       )
  //     );
  //     a('Product updated successfully');
  //   } catch (err) {
  //     console.error(err);
  //     alert('Failed to update product');
  //   }
  // };

  // Handle product creation
  const handleCreateProduct = () => {
    setCreateForm({ name: "", price: "", category: "", image: null }); // Clear form
    setIsCreateModalOpen(true); // Open modal
  };

  const submitCreateProduct = async () => {
    const { name, price, category, image } = createForm;

    if (!name || !price || !category || !image) {
      toast.error("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", parseFloat(price).toString());
    formData.append("category", category);
    formData.append("image", image); // Append the image file

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Send the form data with the image
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create product");
      }

      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product created successfully");
      setIsCreateModalOpen(false); // Close modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    }
  };

  // Loading state
  if (loading) return <p className="loading">Loading products...</p>;

  // Handle opening the product details modal
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="product-management">
      <div className="header-prt">
        <h1 className="main-h1">Product Section</h1>
        <button onClick={handleCreateProduct} className="create-product-btn">
          Create New Product
        </button>
      </div>
      <input
        type="text"
        placeholder="Search products by name or category..."
        className="product-search-input"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="product-list">
        {filteredProducts.length > 0 ? (
          currentProducts.map((product: Product) => (
            <div
              key={product._id}
              className="product-list-item"
              onClick={() => handleProductClick(product)} // Open modal on product click
            >
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
              />
              <div>
                <strong>{product.name}</strong>
                <p>
                  💲{product.price} | 📁 {product.category}
                </p>
              </div>

              <div className="product-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(product);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(product._id);
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Product Details Modal */}
      {isProductModalOpen && selectedProduct && (
        <div
          className="product-modal-overlay open"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="product-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="product-modal-close"
              onClick={() => setIsProductModalOpen(false)}
            >
              <span>&times;</span>
            </button>

            <div className="product-modal-header">
              <div className="product-avatar">
                <img
                  src={`http://localhost:5000${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  className="avatar-img"
                />
              </div>
              <h2>{selectedProduct.name}</h2>
              <p>Category: {selectedProduct.category}</p>
            </div>

            <div className="product-modal-body">
              <div className="product-detail-row fade-in-delay">
                <span>Price:</span>
                <span>💲{selectedProduct.price}</span>
              </div>
              <div className="product-detail-row fade-in-delay">
                <span>Category:</span>
                <span>{selectedProduct.category}</span>
              </div>
            </div>

            <div className="product-modal-footer">
              <button className="view-product-btn">View Full Product</button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && selectedProduct && (
        <div
          className="modal-overlay open"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="product-modal-close"
              onClick={() => setIsEditModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="edit-model-h2">Edit Product</h2>
            <input
              type="text"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="edit-input-product"
            />
            <input
              type="number"
              placeholder="Price"
              value={editForm.price}
              onChange={(e) =>
                setEditForm({ ...editForm, price: e.target.value })
              }
              className="edit-input-product"
            />
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              className="edit-input-product"
            >
              <option value="">Select Category</option>
              {allowedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button className="save-btn" onClick={handleUpdateProduct}>
              Save Changes
            </button>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div
          className="delete-overlay"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="delete-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="delete-title">Confirm Deletion</h2>
            <p className="delete-message">
              Are you sure you want to delete this product?
            </p>
            <div className="delete-buttons">
              <button
                className="delete-confirm-btn"
                onClick={confirmDeleteProduct}
              >
                Yes, Delete
              </button>
              <button
                className="delete-cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="product-modal-close"
              onClick={() => setIsCreateModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="edit-model-h2">Create New Product</h2>

            <input
              type="text"
              placeholder="Product Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              className="edit-input-product"
            />
            <input
              type="number"
              placeholder="Price"
              value={createForm.price}
              onChange={(e) =>
                setCreateForm({ ...createForm, price: e.target.value })
              }
              className="edit-input-product"
            />
            <select
              value={createForm.category}
              onChange={(e) =>
                setCreateForm({ ...createForm, category: e.target.value })
              }
              className="edit-input-product"
            >
              <option value="">Select Category</option>
              {allowedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCreateForm({ ...createForm, image: e.target.files[0] }); // Use 'image' here
                }
              }}
              className="create-product-image"
            />
            <button className="save-btn" onClick={submitCreateProduct}>
              Create Product
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
