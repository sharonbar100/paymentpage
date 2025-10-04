import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom"; 

// Receive all authentication functions as props
export default function Login({ user, registerUser, loginUser, loginWithGoogle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If the user is already logged in, redirect them away
  const navigate = useNavigate();
  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (error) {
      // Catch error here to stop loading state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.formContainer}>
        
        {/* Centralized Google Button */}
        <button 
          onClick={loginWithGoogle} 
          className={styles.googleBtn}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "🔑 Continue with Google"}
        </button>

        <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
        </div>

        <h1>{isRegistering ? "Create Account" : "Sign In with Email"}</h1>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isLoading}
          >
            {isLoading 
              ? "Loading..." 
              : isRegistering 
                ? "Sign Up" 
                : "Log In"}
          </button>
        </form>

        <div className={styles.toggleText}>
          <p>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <span 
              onClick={() => setIsRegistering(!isRegistering)} 
              className={styles.toggleLink}
            > 
              {isRegistering ? " Sign In" : " Register"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}