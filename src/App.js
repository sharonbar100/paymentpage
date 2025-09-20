import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import UploadProduct from "./pages/UploadProduct";
import { CartProvider } from "./context/CartContext";
import styles from "./App.module.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <nav className={styles.navbar}>
          <div className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>Products</Link>
            <Link to="/cart" className={styles.navLink}>Cart</Link>
            <Link to="/upload" className={styles.navLink}>Upload Product</Link>
          </div>
        </nav>
        <div className={styles.container}>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/upload" element={<UploadProduct />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </CartProvider>
  );
}

export default App;