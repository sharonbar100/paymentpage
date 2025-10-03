import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import styles from "./Cart.module.css";

function Cart() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);

  // Calculate total, assuming price is in the smallest unit (e.g., Agorot) and dividing by 100 for display
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0) / 100;
  const displayTotal = total.toFixed(2);

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>🛍 Your Cart</h1> 
      
      {cart.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>Your cart is empty.</p>
          <Link to="/" className={styles.continueShoppingLink}>
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cart.map((item) => (
              // The entire cart item row
              <div key={item.id} className={styles.cartItem}>
                
                {/* 1. Name and Controls Group (Left Side) */}
                <div className={styles.itemInfo}> 
                  <div className={styles.nameAndControls}>
                    <span className={styles.itemName}>{item.name}</span>
                    
                    {/* Quantity Controls */}
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => decreaseQuantity(item.id)} 
                        className={styles.qtyBtn} 
                        disabled={item.qty <= 1}>
                          -
                      </button>
                      <span className={styles.quantity}>{item.qty}</span>
                      <button 
                        onClick={() => increaseQuantity(item.id)} 
                        className={styles.qtyBtn}>
                          +
                      </button>
                    </div>
                  </div>

                  {/* 2. Item Total Price (Center) */}
                  <span className={styles.itemTotalPrice}>
                    {(item.price * item.qty / 100).toFixed(2)} ₪
                  </span>
                </div>
                
                {/* 3. Remove Button (Far Right) */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeIconBtn}
                  aria-label={`Remove ${item.name}`}
                >
                  &times; {/* HTML entity for the 'x' character */}
                </button>
              </div>
            ))}
          </div>
          
          {/* Cart Summary and Checkout Button */}
          <div className={styles.cartSummary}>
            <h3 className={styles.summaryTotal}>Total: {displayTotal} ₪</h3>
            <Link to="/checkout" className={styles.checkoutLink}>
              <button className={styles.checkoutBtn}>
                ✅ Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;