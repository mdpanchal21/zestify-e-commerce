import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Import Next.js Image component

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.reload();
  };

  return (
    <>
      {/* Header */}
      <header className="custom-navbar">
        <div className="custom-logo" onClick={() => router.push('/')}>
          <div className="logo-wrapper">
            <Image
              className="logo-image"
              src="/zestify14.png"
              alt="My E-Commerce Logo"
              width={40}
              height={20}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        <nav className="custom-nav">
          {!isLoggedIn ? (
            <>
              <Link href="/login"><button className="nav-btn">Login</button></Link>
              <Link href="/register"><button className="nav-btn">Register</button></Link>
            </>
          ) : (
            <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="custom-main-we">
          
        {children}
      </main>
<p className='footer-p'>Explore our collection of amazing products. Happy shopping!</p>

      {/* Footer */}
      <footer className="custom-footer">
        © {new Date().getFullYear()} My E-Commerce Store. All rights reserved.
      </footer>
    </>
  );
}
