import "@/styles/globals.css";
import '@/styles/home.css';
import '@/styles/login.css';
import '@/styles/register.css';
import '@/styles/products.css';
import '@/styles/cart.css';
import '/styles/ProductDetails.css';
import '@/styles/checkout.css';
import '@/styles/orderHistory.css';
// import '@/styles/adminDashboard.css';
import '@/styles/Layout.css';
import '@/styles/admin/user.css';
import '@/styles/admin/product.css';
import '@/styles/admin/Dashboard.css';
import '@/styles/admin/order.css';


import type { AppProps } from "next/app";

// 🆕 Toastify setup
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {/* 🆕 Toast container */}
      <ToastContainer
  position="top-center"
  autoClose={2000}
  theme="dark" // options: 'light', 'dark', 'colored'
  toastClassName="custom-toast"
  // bodyClassName="custom-toast-body"
/>
    </>
  );
}
