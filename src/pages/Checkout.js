import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import styles from "./Checkout.module.css";
import { toast } from "react-toastify";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [lowProfileId, setLowProfileId] = useState(null);
  const [status, setStatus] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePayment = async () => {
    try {
      const res = await fetch("http://localhost:5000/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          cart,
        }),
      });

      const data = await res.json();
      setPaymentUrl(data.url);
      setLowProfileId(data.lowProfileId);
    } catch (err) {
      console.error("❌ Error starting payment:", err);
      toast.error("Failed to start payment. Please try again.");
    }
  };

  const checkPayment = async () => {
    if (!lowProfileId) return;
    try {
      const res = await fetch("http://localhost:5000/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LowProfileId: lowProfileId }),
      });

      const data = await res.json();
      setStatus(data);

      if (data.TranzactionInfo?.ResponseCode === 0) {
        setIsPaid(true);
        clearCart();
        toast.success("Payment successful!");
      }
    } catch (err) {
      console.error("❌ Error checking payment:", err);
      toast.error("Failed to check payment status.");
    }
  };

  useEffect(() => {
    if (paymentUrl) {
      const iframe = document.getElementById("payment-iframe");
      iframe.onload = () => {
        console.log("✅ Iframe loaded, checking payment...");
        checkPayment();
      };
    }
  }, [paymentUrl, lowProfileId]);

  return (
    <div className={styles.checkoutContainer}>
      <h1>Checkout</h1>
      {!isPaid && (
        <>
          <div className={styles.summarySection}>
            <h2>Cart Summary:</h2>
            <ul className={styles.summaryList}>
              {cart.map((item, idx) => (
                <li key={idx}>
                  {item.name} x{item.qty} = {item.price * item.qty} ₪
                </li>
              ))}
            </ul>
            <h3 className={styles.totalAmount}>Total: {total} ₪</h3>
          </div>
        </>
      )}

      {!paymentUrl && !isPaid && (
        <button
          onClick={handlePayment}
          disabled={cart.length === 0}
          className={styles.paymentButton}
        >
          Proceed to Payment
        </button>
      )}

      {paymentUrl && !isPaid && (
        <div className={styles.iframeWrapper}>
          <iframe
            id="payment-iframe"
            src={paymentUrl}
            title="CardCom Payment"
            className={styles.paymentIframe}
          />
        </div>
      )}

      {status && (
        <div className={styles.statusSection}>
          {status.TranzactionInfo?.ResponseCode === 0 ? (
            <div className={`${styles.statusMessage} ${styles.success}`}>
              ✅ התשלום הצליח!
              <br />
              סכום: {status.TranzactionInfo.Amount} ₪
              <br />
              מספר אישור: {status.TranzactionInfo.ApprovalNumber}
              <br />
              כרטיס: ****{status.TranzactionInfo.Last4CardDigitsString}
              <br />
              <br />
              <Link to="/">
                <button
                  className={styles.backButton}
                >
                  Back to Products
                </button>
              </Link>
            </div>
          ) : (
            <div className={`${styles.statusMessage} ${styles.failure}`}>
              ❌ התשלום נכשל או עדיין ממתין.
              <br />
              {status.Description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Checkout;