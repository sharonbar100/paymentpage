import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import styles from "./Cart.module.css";

function Cart() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className={styles.cartContainer}>
      <h1>🛍 Your Cart</h1>
      {cart.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <div>
          <div className={styles.cartItems}>
            {cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemDetails}>
                  <div className={styles.itemInfo}>
                    <span>{item.name}</span>
                    <span className={styles.price}>{item.price * item.qty} ₪</span>
                  </div>
                  <div className={styles.quantityControls}>
                    <button onClick={() => decreaseQuantity(item.id)} className={styles.qtyBtn}>-</button>
                    <span className={styles.quantity}>{item.qty}</span>
                    <button onClick={() => increaseQuantity(item.id)} className={styles.qtyBtn}>+</button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeBtn}
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles.cartSummary}>
            <h3>Total: {total} ₪</h3>
            <Link to="/checkout" className={styles.checkoutLink}>
              <button
                className={styles.checkoutBtn}
              >
                ✅ Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;