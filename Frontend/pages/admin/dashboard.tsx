// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useRef } from 'react';

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   isAdmin: boolean;
// }

// interface Product {
//   _id: string;
//   name: string;
//   price: number;
//   category: string;
//   image: string;
// }

// interface AdminStats {
//   totalUsers: number;
//   totalProducts: number;
//   totalOrders: number;
//   totalSales: number;
// }

// type DashboardUser = {
//   _id: string;
//   name: string;
//   email: string;
//   isAdmin: boolean;
// };

// export default function AdminDashboard() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sidebarExpanded, setSidebarExpanded] = useState(false);
//   const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'settings'>('dashboard');
//   const router = useRouter();
//   const [stats, setStats] = useState<AdminStats | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const usersPerPage = 10;
//   const usersSectionRef = useRef<HTMLDivElement | null>(null);
//   const [searchProduct, setSearchProduct] = useState('');
//   const [currentProductPage, setCurrentProductPage] = useState(1);
//   const productsPerPage = 10;
//   const productSectionRef = useRef<HTMLDivElement | null>(null);
//   const userSectionRef = useRef<HTMLDivElement>(null);
//   const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleUserClick = (user: DashboardUser) => {
//     setSelectedUser(user);
//     setIsModalOpen(true);
//   };


//   const filteredUsers = users.filter(user =>
//     user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.email?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Apply search and pagination correctly
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   // Updated search handling with page reset when search term changes
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1); // Reset to first page on search change
//   };

//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
//     product.category?.toLowerCase().includes(searchProduct.toLowerCase()) ||
//     product.price?.toString().includes(searchProduct)
//   );

//   const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
//   const indexOfLastProduct = currentProductPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   useEffect(() => {
//     if (usersSectionRef.current) {
//       usersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [currentPage]);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const user = JSON.parse(localStorage.getItem('user') || '{}');

//     if (!token || !user.isAdmin) {
//       router.push('/');
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const [usersRes, productsRes, statsRes] = await Promise.all([
//           fetch('http://localhost:5000/api/admin/users', {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           fetch('http://localhost:5000/api/admin/products', {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           fetch('http://localhost:5000/api/admin/stats', {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         const usersData = await usersRes.json();
//         const productsData = await productsRes.json();
//         const statsData = await statsRes.json();

//         setUsers(usersData);
//         setProducts(productsData);
//         setStats(statsData);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         alert('Failed to load admin data');
//       }
//     };

//     fetchData();
//   }, []);

//   const handleDelete = async (productId: string) => {
//     const confirmDelete = confirm('Are you sure you want to delete this product?');
//     if (!confirmDelete) return;

//     const token = localStorage.getItem('token');
//     try {
//       const res = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert('Product deleted successfully');
//         setProducts(products.filter((p) => p._id !== productId));
//       } else {
//         alert(data.message || 'Failed to delete product');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Error deleting product');
//     }
//   };

//   const handleEdit = (product: Product) => {
//     const newName = prompt('Enter new name', product.name);
//     const newPrice = prompt('Enter new price', product.price.toString());
//     const newCategory = prompt('Enter new category', product.category);

//     if (!newName || !newPrice || !newCategory) return;

//     const token = localStorage.getItem('token');

//     fetch(`http://localhost:5000/api/admin/products/${product._id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         name: newName,
//         price: parseFloat(newPrice),
//         category: newCategory,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.message === 'Product updated successfully') {
//           alert('Product updated!');
//           setProducts((prev) =>
//             prev.map((p) =>
//               p._id === product._id
//                 ? { ...p, name: newName, price: parseFloat(newPrice), category: newCategory }
//                 : p
//             )
//           );
//         } else {
//           alert(data.message || 'Update failed');
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         alert('Error updating product');
//       });
//   };

//   const handleDeleteUser = async (userId: string) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || 'Failed to delete user');
//       }

//       // Refresh users after delete
//       setUsers((prev) => prev.filter((user) => user._id !== userId));
//       alert('User deleted successfully');
//     } catch (err: any) {
//       console.error(err.message);
//       alert('Failed to delete user');
//     }
//   };

//   const handleEditUser = (user: any) => {
//     const newName = window.prompt('Enter new name:', user.name);
//     const newEmail = window.prompt('Enter new email:', user.email);
//     const newIsAdmin = window.confirm('Should this user be admin? OK = Yes, Cancel = No');

//     if (!newName || !newEmail) {
//       alert('Name and Email are required');
//       return;
//     }

//     updateUser(user._id, newName, newEmail, newIsAdmin);
//   };

//   const updateUser = async (userId: string, name: string, email: string, isAdmin: boolean) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ name, email, isAdmin }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || 'Failed to update user');
//       }

//       // Refresh users after update
//       setUsers((prev) =>
//         prev.map((user) =>
//           user._id === userId ? { ...user, name, email, isAdmin } : user
//         )
//       );
//       alert('User updated successfully');
//     } catch (err: any) {
//       console.error(err.message);
//       alert('Failed to update user');
//     }
//   };

//   if (loading) return <p className="loading">Loading admin dashboard...</p>;

//   return (
//     <div className="admin-dashboard">
//       <header className="admin-header">
//         <button className="sidebar-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
//           ☰
//         </button>
//         <h1>Admin Dashboard</h1>
//       </header>

//       <div className="admin-layout">
//         <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
//           <ul className="sidebar-menu">
//             <li onClick={() => setActiveSection('dashboard')}>
//               <span className="icon">📊</span>
//               <span className="label">Dashboard</span>
//             </li>
//             <li onClick={() => setActiveSection('users')}>
//               <span className="icon">👥</span>
//               <span className="label">Users</span>
//             </li>
//             <li onClick={() => setActiveSection('products')}>
//               <span className="icon">📦</span>
//               <span className="label">Products</span>
//             </li>
//             <li onClick={() => setActiveSection('orders')}>
//               <span className="icon">🧾</span>
//               <span className="label">Orders</span>
//             </li>
//             <li onClick={() => setActiveSection('settings')}>
//               <span className="icon">⚙️</span>
//               <span className="label">Settings</span>
//             </li>
//           </ul>
//         </aside>


//         <main className="dashboard-content">
//           {activeSection === 'dashboard' && (
//             <div className="dashboard-section">
//               <h2 className="dashboard-heading">📊 Admin Overview</h2>

//               {stats && (
//                 <div className="modern-stats-grid">
//                   <div className="modern-stat-card users">
//                     <div className="card-icon">
//                       <img src="/users.png" alt="Users" />
//                     </div>
//                     <div className="card-info">
//                       <h3>Total Users</h3>
//                       <p>{stats.totalUsers}</p>
//                     </div>
//                   </div>

//                   <div className="modern-stat-card products">
//                     <div className="card-icon">
//                       <img src="/product.png" alt="Products" />
//                     </div>
//                     <div className="card-info">
//                       <h3>Total Products</h3>
//                       <p>{stats.totalProducts}</p>
//                     </div>
//                   </div>

//                   <div className="modern-stat-card orders">
//                     <div className="card-icon">
//                       <img src="/orders.png" alt="Orders" />
//                     </div>
//                     <div className="card-info">
//                       <h3>Total Orders</h3>
//                       <p>{stats.totalOrders}</p>
//                     </div>
//                   </div>

//                   <div className="modern-stat-card sales">
//                     <div className="card-icon">
//                       <img src="/sell.png" alt="Sales" />
//                     </div>
//                     <div className="card-info">
//                       <h3>Total Sales</h3>
//                       <p>${stats.totalSales.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeSection === 'users' && (
//             <div className="dashboard-section" ref={usersSectionRef}>
//               <h2>👥 Users</h2>

//               <input
//                 type="text"
//                 placeholder="Search users by name or email..."
//                 className="user-search-input"
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//               />

//               <div className="user-list">
//                 {filteredUsers.length > 0 ? (
//                   currentUsers.map((user: DashboardUser) => (  // <-- no extra {}
//                     <div
//                       key={user._id}
//                       className="user-list-item"
//                       onClick={() => handleUserClick(user)}
//                       style={{ cursor: 'pointer' }}
//                     >
//                       <div>
//                         <div className="user-name-role">
//                           <strong>{user.name || 'No Name'}</strong>
//                           <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
//                             {user.isAdmin ? 'Admin' : 'User'}
//                           </span>
//                         </div>
//                         <p className="user-email">{user.email}</p>
//                       </div>

//                       <div className="user-actions">
//                         <button onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}>Edit</button>
//                         <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }}>Delete</button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No users found.</p>
//                 )}
//               </div>


//               <div className="pagination">
//                 <button
//                   onClick={() => {
//                     if (currentPage > 1) {
//                       setCurrentPage(currentPage - 1);
//                       userSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }
//                   }}
//                   disabled={currentPage === 1}
//                 >
//                   Prev
//                 </button>

//                 {Array.from({ length: totalPages }, (_, i) => (
//                   <button
//                     key={i + 1}
//                     onClick={() => {
//                       setCurrentPage(i + 1);
//                       userSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }}
//                     className={currentPage === i + 1 ? 'active' : ''}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}

//                 <button
//                   onClick={() => {
//                     if (currentPage < totalPages) {
//                       setCurrentPage(currentPage + 1);
//                       userSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }
//                   }}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}


//           {isModalOpen && selectedUser && (
//             <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
//               <div className="modal-content">
//                 <h2>User Info</h2>
//                 <p><strong>Name:</strong> {selectedUser.name}</p>
//                 <p><strong>Email:</strong> {selectedUser.email}</p>
//                 <p><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'User'}</p>

//                 <button onClick={() => setIsModalOpen(false)}>Close</button>
//               </div>
//             </div>
//           )}


//           {activeSection === 'products' && (
//             <div className="dashboard-section" ref={productSectionRef}>
//               <h2>📦 Products</h2>

//               <input
//                 type="text"
//                 placeholder="Search products by name, category or price..."
//                 className="product-search-input"
//                 value={searchProduct}
//                 onChange={(e) => {
//                   setSearchProduct(e.target.value);
//                   setCurrentProductPage(1);
//                 }}
//               />

//               <div className="product-list">
//                 {currentProducts.length > 0 ? (
//                   currentProducts.map((product) => (
//                     <div key={product._id} className="product-list-item">
//                       <img src={`http://localhost:5000${product.image}`} alt={product.name} />
//                       <div>
//                         <strong>{product.name}</strong>
//                         <p>💲{product.price} | 📁 {product.category}</p>
//                       </div>
//                       <div className="product-actions">
//                         <button onClick={() => handleEdit(product)}>✏️ Edit</button>
//                         <button onClick={() => handleDelete(product._id)}>🗑️ Delete</button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No products found.</p>
//                 )}
//               </div>

//               <div className="pagination">
//                 {/* Previous Button */}
//                 <button
//                   onClick={() => {
//                     if (currentProductPage > 1) {
//                       setCurrentProductPage(currentProductPage - 1);
//                       productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }
//                   }}
//                   disabled={currentProductPage === 1}
//                 >
//                   Prev
//                 </button>

//                 {/* Page Numbers */}
//                 {Array.from({ length: totalProductPages }, (_, i) => (
//                   <button
//                     key={i + 1}
//                     onClick={() => {
//                       setCurrentProductPage(i + 1);
//                       productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }}
//                     className={currentProductPage === i + 1 ? 'active' : ''}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}

//                 {/* Next Button */}
//                 <button
//                   onClick={() => {
//                     if (currentProductPage < totalProductPages) {
//                       setCurrentProductPage(currentProductPage + 1);
//                       productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//                     }
//                   }}
//                   disabled={currentProductPage === totalProductPages}
//                 >
//                   Next
//                 </button>
//               </div>

//             </div>

//           )}

//           {activeSection === 'orders' && (
//             <div className="dashboard-section">
//               <h2>🧾 Orders</h2>
//               <p>Order management section coming soon.</p>
//             </div>
//           )}

//           {activeSection === 'settings' && (
//             <div className="dashboard-section">
//               <h2>⚙️ Settings</h2>
//               <p>Admin settings area.</p>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";


// Import separate section components
import UsersSection from "../admin/Users";
import ProductsSection from "../admin/Product";
import OrdersSection from "../admin/order";
import SettingsSection from "../admin/settings";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.isAdmin) {
      router.push('/');
      return;
    }

    const fetchStatsData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsData = await statsRes.json();
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('Failed to load admin stats');
      }
    };

    fetchStatsData();
  }, [router]);

  return (
    <div className="admin-dashboard">
  <header className="admin-header">
    <button className="sidebar-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
      ☰
    </button>
    <h1>Admin Dashboard</h1>
  </header>

  <div className="admin-layout">
    <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
      <ul className="sidebar-menu">
        <li onClick={() => setActiveSection("dashboard")}>
          <span className="icon">📊</span>
          <span className="label">Dashboard</span>
        </li>
        <li onClick={() => setActiveSection("users")}>
          <span className="icon">👥</span>
          <span className="label">Users</span>
        </li>
        <li onClick={() => setActiveSection("products")}>
          <span className="icon">📦</span>
          <span className="label">Products</span>
        </li>
        <li onClick={() => setActiveSection("orders")}>
          <span className="icon">🧾</span>
          <span className="label">Orders</span>
        </li>
        <li onClick={() => setActiveSection("settings")}>
          <span className="icon">⚙️</span>
          <span className="label">Settings</span>
        </li>
      </ul>
    </aside>

    <main className="dashboard-content">
      {activeSection === "dashboard" && (
        <>
          <h2 className="dashboard-heading">📊 Admin Overview</h2>
          {loading ? (
            <p>Loading admin overview...</p>
          ) : (
            stats && (
              <div className="modern-stats-grid">
                <div className="modern-stat-card users">
                  <div className="card-icon">
                    <img src="/users.png" alt="Users" />
                  </div>
                  <div className="card-info">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                  </div>
                </div>

                <div className="modern-stat-card products">
                  <div className="card-icon">
                    <img src="/product.png" alt="Products" />
                  </div>
                  <div className="card-info">
                    <h3>Total Products</h3>
                    <p>{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="modern-stat-card orders">
                  <div className="card-icon">
                    <img src="/orders.png" alt="Orders" />
                  </div>
                  <div className="card-info">
                    <h3>Total Orders</h3>
                    <p>{stats.totalOrders}</p>
                  </div>
                </div>

                <div className="modern-stat-card sales">
                  <div className="card-icon">
                    <img src="/sell.png" alt="Sales" />
                  </div>
                  <div className="card-info">
                    <h3>Total Sales</h3>
                    <p>${stats.totalSales.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}

      {activeSection === "users" && <UsersSection />}
      {activeSection === "products" && <ProductsSection />}
      {activeSection === "orders" && <OrdersSection />}
      {activeSection === "settings" && <SettingsSection />}
    </main>
  </div>
</div>

  );
}
