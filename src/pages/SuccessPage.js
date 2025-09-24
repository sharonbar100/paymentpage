import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Checkout.module.css"; // Reuse your existing CSS

function SuccessPage() {
  const [searchParams] = useSearchParams();

  // Cardcom sends these back on redirect
  const lowProfileCode = searchParams.get("LowProfileCode");
  const returnValue = searchParams.get("ReturnValue");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const functionUrl =
    "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!lowProfileCode) {
        setError(
          "Transaction ID not found. Please try again or contact support."
        );
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${functionUrl}/check-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ LowProfileId: lowProfileCode }),
        });

        const data = await res.json();
        setOrderDetails(data);
        setLoading(false);

        if (data.TranzactionInfo?.ResponseCode === 0) {
          toast.success("Payment successful!");
        } else {
          toast.error("Payment failed or is pending.");
        }
      } catch (err) {
        console.error("❌ Error fetching order details:", err);
        setError("Failed to fetch order details.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [lowProfileCode]);

  if (loading) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.statusMessage}>Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={`${styles.statusMessage} ${styles.failure}`}>
          {error}
        </div>
      </div>
    );
  }

  const info = orderDetails?.TranzactionInfo;

  return (
    <div className={styles.checkoutContainer}>
      <h1>Order Summary</h1>
      {info?.ResponseCode === 0 ? (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          ✅ התשלום הצליח!
          <br />
          מספר הזמנה: {returnValue || "N/A"}
          <br />
          סכום: {info.Amount} ₪
          <br />
          מספר אישור: {info.ApprovalNumber}
          <br />
          כרטיס: ****{info.Last4CardDigitsString}
          <br />
          <br />
          <Link to="/">
            <button className={styles.backButton}>Back to Products</button>
          </Link>
        </div>
      ) : (
        <div className={`${styles.statusMessage} ${styles.failure}`}>
          ❌ התשלום נכשל או עדיין ממתין.
          <br />
          {orderDetails?.Description}
        </div>
      )}
    </div>
  );
}

export default SuccessPage;
