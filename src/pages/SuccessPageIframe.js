import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Checkout.module.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function SuccessPageIframe({ user }) {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let lowProfileId = searchParams.get("LowProfileId");
  if (!lowProfileId || lowProfileId.includes("{")) {
    lowProfileId = sessionStorage.getItem("lowProfileId");
  }

  const functionUrl =
    "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

  useEffect(() => {
    const fetchAndSaveOrder = async () => {
      // Don't proceed if LowProfileId is missing or user is not logged in.
      if (!lowProfileId || !user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${functionUrl}/check-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ LowProfileId: lowProfileId }),
        });

        const data = await res.json();
        setOrderDetails(data);
        setLoading(false);

        if (data.TranzactionInfo?.ResponseCode === 0) {
          toast.success("Payment successful!");
          
          // Only save to Firestore if the payment was a success
          await addDoc(collection(db, "orders"), {
            userId: user.uid,
            amount: data.TranzactionInfo.Amount,
            approvalNumber: data.TranzactionInfo.ApprovalNumber,
            last4: data.TranzactionInfo.Last4CardDigitsString,
            createdAt: serverTimestamp(),
          });
        } else {
          toast.error("Payment failed or is pending.");
        }
      } catch (err) {
        console.error("❌ Error fetching order details:", err);
        setError("Failed to fetch order details.");
        setLoading(false);
      }
    };

    fetchAndSaveOrder();
  }, [lowProfileId, user]); // Add 'user' to the dependency array

  if (loading)
    return <div className={styles.checkoutContainer}><div className={styles.statusMessage}>Checking payment status...</div></div>;

  if (error)
    return <div className={styles.checkoutContainer}><div className={`${styles.statusMessage} ${styles.failure}`}>{error}</div></div>;

  const info = orderDetails?.TranzactionInfo;

  return (
    <div className={styles.checkoutContainer}>
      <h1>Order Summary</h1>
      {info?.ResponseCode === 0 ? (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          ✅ התשלום הצליח!
          <br />
          סכום: {info.Amount} ₪
          <br />
          מספר אישור: {info.ApprovalNumber}
          <br />
          כרטיס: ****{info.Last4CardDigitsString}
          <br />
          <br />
          <button
            className={styles.backButton}
            onClick={() => (window.parent.location.href = "/")}
          >
            Back to Products
          </button>
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

export default SuccessPageIframe;