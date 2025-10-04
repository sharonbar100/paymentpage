import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import UploadProduct from "./pages/UploadProduct";
import SuccessPage from "./pages/SuccessPage";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import PurchaseHistory from "./pages/PurchaseHistory";
import { auth, db, provider } from "./firebaseConfig";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "react-toastify"; 
import styles from "./App.module.css";

// Helper function to check for local environment
const isLocalhost = window.location.hostname === "localhost";

// EMULATOR CONNECTION LOGIC (It's generally better practice to put this in firebaseConfig.js)
if (isLocalhost) {
    // Connect Auth emulator on port 9099
    connectAuthEmulator(auth, "http://localhost:9099");
    // Connect Firestore emulator on port 8080
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("🔥 Connected to Firebase Emulators (Auth & Firestore)");
}


export default function AppLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return unsubscribe;
  }, []);

  // Hide navbar on certain pages
  const hideNavbarRoutes = ["/success"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Login / logout functions
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
    }
  };
  
  const registerUser = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Registration successful! Welcome.");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.message.replace("Firebase: ", "").split(" (")[0];
      toast.error(`Registration failed: ${errorMessage}`);
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.message.replace("Firebase: ", "").split(" (")[0];
      toast.error(`Login failed: ${errorMessage}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed.");
    }
  };

  return (
    <>
      {!hideNavbar && (
        <nav className={styles.navbar}>
          <Link to="/" className={styles.logo}>
            Test Shop 🛍️
          </Link>
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
                <span>Hello, {user.displayName?.split(" ")[0] || user.email.split("@")[0] || "User"}</span>
                <button onClick={logout} className={styles.authBtn}>
                  Logout
                </button>
              </div>
            ) : (
              // 👇️ SIMPLIFIED: Only one "Login" button linking to the Login page
              <Link to="/login" className={styles.authBtn}>
                Login
              </Link>
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
          <Route path="/success" element={<SuccessPage user={user} />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route 
            path="/login" 
            element={
              <Login 
                user={user} 
                registerUser={registerUser} 
                loginUser={loginUser} 
                loginWithGoogle={loginWithGoogle} // 👈️ Pass Google function
              />
            } 
          />
          <Route path="/history" element={<PurchaseHistory user={user} />} />
        </Routes>
      </div>
    </>
  );
}