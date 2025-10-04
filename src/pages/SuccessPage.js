import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./SuccessPage.module.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Helper for checking the environment
const isLocalhost = window.location.hostname === "localhost";

function SuccessPage({ user }) {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use let here as before, to allow reassignment from sessionStorage
  let lowProfileId = searchParams.get("LowProfileId");
  if (!lowProfileId || lowProfileId.includes("{")) {
    lowProfileId = sessionStorage.getItem("lowProfileId");
  }

  // 👇️ CRITICAL CHANGE: Conditional URL for local testing
  const functionUrl = isLocalhost
    ? "http://localhost:5001/paymentpage-2f2d9/us-central1/app"
    : "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";
  // 👆️ CRITICAL CHANGE: Conditional URL for local testing

  useEffect(() => {
    const fetchAndSaveOrder = async () => {
      if (!lowProfileId || !user) {
        setLoading(false);
        if (!lowProfileId) setError("Missing transaction ID (LowProfileId). Cannot check payment status.");
        return;
      }

      try {
        // The fetch request now uses the conditional functionUrl
        const res = await fetch(`${functionUrl}/check-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ LowProfileId: lowProfileId }),
        });

        const data = await res.json();
        setOrderDetails(data);
        setLoading(false);

        const responseCode = data.TranzactionInfo?.ResponseCode;
        
        if (responseCode === 0) {
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
          const declineMessage = 
              data.TranzactionInfo?.IssuerAuthCodeDescription || 
              data.TranzactionInfo?.Description || 
              data.Description || 
              "Payment failed or is pending. Please try again.";
              
          toast.error(declineMessage);
          setError(declineMessage); 
        }
      } catch (err) {
        console.error("❌ Error fetching order details:", err);
        setError("Failed to fetch order details. Please check your network connection.");
        setLoading(false);
      }
    };

    // Include functionUrl in the dependency array
    fetchAndSaveOrder();
  }, [lowProfileId, user, functionUrl]);

  if (loading)
    return (
      <div className={styles.successContainer}>
        <div className={styles.statusMessage}>
          Checking payment status...
        </div>
      </div>
    );

  if (error || orderDetails?.TranzactionInfo?.ResponseCode !== 0) {
    const displayMessage = 
        error || 
        orderDetails?.TranzactionInfo?.IssuerAuthCodeDescription || 
        orderDetails?.Description ||
        "Payment failed. Check logs for details.";
        
    return (
      <div className={styles.successContainer}>
        <h1 className={styles.pageTitle}>Order Summary</h1>
        <div className={`${styles.statusMessage} ${styles.failure}`}>
          ❌ **התשלום נכשל**
          <br />
          {displayMessage}
          <br />
          <br />
          <button
            className={styles.backButton}
            onClick={() => (window.parent.location.href = "/")}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Success Case (ResponseCode === 0)
  const info = orderDetails?.TranzactionInfo;
  
  return (
    <div className={styles.successContainer}>
      <h1 className={styles.pageTitle}>Order Summary</h1>
      <div className={`${styles.statusMessage} ${styles.success}`}>
        ✅ **התשלום הצליח!**
        <br />
        סכום: **{(info.Amount / 100).toFixed(2)} ₪**
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
    </div>
  );
}

export default SuccessPage;