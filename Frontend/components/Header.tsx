
import { useRouter } from "next/router";
import { RxAvatar } from "react-icons/rx";
import { FiShoppingCart, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { useEffect } from "react";
interface HeaderProps {
  categories?: string[];
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  showFilters?: boolean;
}

export default function Header({
  categories = [],
  selectedCategory = "All",
  setSelectedCategory = () => {},
  searchQuery = "",
  setSearchQuery = () => {},
  showFilters = false,
}: HeaderProps) {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser?.isAdmin || false);
    }
  }, []);

  return (
    <div className="product-header">
      <div className="logo-wrapper-header">
        <img
          src="/zestifynew.png"
          alt="Zestify Logo"
          className="site-logo"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div
        className={`search-drop-prt-header ${
          showFilters ? "" : "hidden-filter-space"
        }`}
      >
        <div
          className={`search-bar-wrapper ${
            isSearchFocused ? "search-bar-wrapper--focused" : ""
          }`}
        >
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
            onFocus={() => setIsSearchFocused(true)} // <- 👈 important
            onBlur={() => setIsSearchFocused(false)}
          />
          <button className="search-button" onClick={() => {}}>
            <FiSearch />
          </button>
        </div>
      </div>

      <div className="icon-button" onClick={() => router.push("/cart")}>
        <FiShoppingCart
          className={`cart-icon ${
            router.pathname === "/cart" ? "active-cart" : ""
          }`}
        />
      </div>

      <div className="profile-container">
        <RxAvatar className="profile-icon" />
        <div className="profile-dropdown">
          {isAdmin && (
            <div onClick={() => router.push("/admin/dashboard")}>
              Admin Dashboard
            </div>
          )}
          <div onClick={() => router.push("/profile")}>View Profile</div>
          <div onClick={() => router.push("/order-history")}>Order History</div>

          <div
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
          >
            Logout
          </div>
        </div>
      </div>
      {router.pathname === "/cart" && (
        <div className="continue-shopping-float">
          <button onClick={() => router.push("/")}>Continue Shopping</button>
        </div>
      )}
    </div>
  );
}
