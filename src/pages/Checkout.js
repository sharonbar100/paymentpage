import React, { useState, useContext, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import styles from "./Checkout.module.css";
import { toast } from "react-toastify";

const isLocalhost = window.location.hostname === "localhost";

function Checkout() {
    const { cart } = useContext(CartContext);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(false);
    
    // 🔑 FIX: Ref is the synchronous gatekeeper for one-time effects
    const hasInitiatedPaymentRef = useRef(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const functionUrl = isLocalhost
      ? "http://localhost:5001/paymentpage-2f2d9/us-central1/app"
      : "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

    const handlePayment = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }
        
        // CRITICAL: If ref is true, exit immediately (synchronous check)
        if (hasInitiatedPaymentRef.current) return;
        hasInitiatedPaymentRef.current = true; // Set Ref immediately

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
                sessionStorage.setItem("lowProfileId", data.lowProfileId);
                toast.info("Payment link generated. Ready to proceed.");
            } else {
                toast.error("Failed to generate payment URL.");
                hasInitiatedPaymentRef.current = false; // Allow re-attempt if API call fails
            }
        } catch (err) {
            console.error("❌ Error starting payment:", err);
            toast.error("Failed to start payment. Please try again.");
            hasInitiatedPaymentRef.current = false; // Allow re-attempt on error
        } finally {
            setLoadingPayment(false);
        }
    };

    // The useEffect runs the idempotent function on mount
    useEffect(() => {
        if (cart.length > 0 && !paymentUrl) {
            handlePayment();
        }
    }, [cart, paymentUrl, functionUrl]); 

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Secure Checkout</h1>

            <div className={styles.summarySection}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                <ul className={styles.summaryList}>
                    {cart.map((item, idx) => (
                        <li key={idx}>
                            <span className={styles.summaryItemName}>{item.name}</span>
                            <span className={styles.summaryItemQuantity}>×{item.qty}</span>
                            <span className={styles.summaryItemPrice}>{item.price * item.qty} ₪</span>
                        </li>
                    ))}
                </ul>
                <h3 className={styles.totalAmount}>Total: {total} ₪</h3>
            </div>

            {loadingPayment && (
                <div className={styles.statusMessage}>
                    <div className={styles.loader}></div>
                    Generating secure payment link…
                </div>
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