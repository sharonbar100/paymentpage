import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import styles from "./Checkout.module.css";
import { toast } from "react-toastify";

function Checkout() {
  const { cart } = useContext(CartContext);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const functionUrl =
    "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setLoadingPayment(true);

    try {
      const res = await fetch(`${functionUrl}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, cart }),
      });

      const data = await res.json();
      if (data.url && data.lowProfileId) {
        setPaymentUrl(data.url);
        // Save the LowProfileId for the success page fallback
        sessionStorage.setItem("lowProfileId", data.lowProfileId);
      } else {
        toast.error("Failed to generate payment URL.");
      }
    } catch (err) {
      console.error("❌ Error starting payment:", err);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (cart.length > 0) {
      handlePayment();
    }
  }, []); // run once on mount

  return (
    <div className={styles.checkoutContainer}>
      <h1>Checkout</h1>

      <div className={styles.summarySection}>
        <h2>Cart Summary:</h2>
        <ul className={styles.summaryList}>
          {cart.map((item, idx) => (
            <li key={idx}>
              {item.name} ×{item.qty} = {item.price * item.qty} ₪
            </li>
          ))}
        </ul>
        <h3 className={styles.totalAmount}>Total: {total} ₪</h3>
      </div>

      {loadingPayment && (
        <div className={styles.statusMessage}>Generating payment link…</div>
      )}

      {paymentUrl && (
        <div className={styles.iframeWrapper}>
          <iframe
            id="payment-iframe"
            src={paymentUrl}
            title="CardCom Payment"
            className={styles.paymentIframe}
          />
        </div>
      )}
    </div>
  );
}

export default Checkout;
