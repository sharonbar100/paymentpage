import React from "react";
import styles from "./Login.module.css";

export default function Login({ user, setUser }) {
  return (
    <div className={styles.loginPage}>
      <h1>{user ? `Welcome, ${user.displayName}` : "Please login"}</h1>
      <p>You can also login from the navbar button above.</p>
    </div>
  );
}
