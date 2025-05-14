import { useState } from 'react';
import Layout from '@/components/Layout';
// import '@/styles/login.css'; // Import external login CSS
import Link from 'next/link'; // Make sure this is imported
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      setTimeout(() => {
        window.location.href = '/products';
      }, 2000); // wait 2 seconds before redirecting
    } else {
      toast.error(data.message || 'Login failed.');
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-container">
            <input
               type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="toggle-password-btn-login"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? (
                // 👁️ Eye icon (when visible)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // 🚫 Eye-off icon (when hidden)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M 13.875 18.825 A 10.05 10.05 0 0 1 12 19 c -4.477 0 -8.268 -2.943 -9.542 -7 a 9.958 9.958 0 0 1 2.542 -4 m 0 0 A 9.956 9.956 0 0 1 12 5 c 4.477 0 8.268 2.943 9 7 a 9.958 9.958 0 0 1 -8 7 M 15 12 a 3 3 2 1 1 -6 0 a 3 3 0 0 1 6 0 z m -11 6 L 19 5"
                  />
                </svg>
              )}
            </button>
          </div>
          <button type="submit" className='login-btn-logpage'>Login</button>
        </form>

        <p className="register-link">
          Don't have an account?{' '}
          <Link href="/register">
            Register now
          </Link>
        </p>
      </div>
    </Layout>
  );
}
