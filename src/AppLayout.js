import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import UploadProduct from "./pages/UploadProduct";
import SuccessPage from "./pages/SuccessPage";
import SuccessPageIframe from "./pages/SuccessPageIframe";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import PurchaseHistory from "./pages/PurchaseHistory";
import { auth } from "./firebaseConfig";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import styles from "./App.module.css";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return unsubscribe;
  }, []);

  // Hide navbar on certain pages
  const hideNavbarRoutes = ["/success-iframe"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Login / logout functions
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {!hideNavbar && (
        <nav className={styles.navbar}>
          <div className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>
              Products
            </Link>
            <Link to="/cart" className={styles.navLink}>
              Cart
            </Link>
            <Link to="/upload" className={styles.navLink}>
              Upload Product
            </Link>
            {user && (
              <Link to="/history" className={styles.navLink}>
                Purchase History
              </Link>
            )}
          </div>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.loggedIn}>
                <span>Hello, {user.displayName}</span>
                <button onClick={logout} className={styles.authBtn}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={loginWithGoogle} className={styles.authBtn}>
                Login with Google
              </button>
            )}
          </div>
        </nav>
      )}

      <div className={styles.container}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/upload" element={<UploadProduct />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/success-iframe" element={<SuccessPageIframe user={user} />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/login" element={<Login user={user} setUser={setUser} />} />
          <Route path="/history" element={<PurchaseHistory user={user} />} />
        </Routes>
      </div>
    </>
  );
}
