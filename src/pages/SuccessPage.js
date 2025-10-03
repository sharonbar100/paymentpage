import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./SuccessPage.module.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function SuccessPageIframe({ user }) {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use let here as before, to allow reassignment from sessionStorage
  let lowProfileId = searchParams.get("LowProfileId");
  if (!lowProfileId || lowProfileId.includes("{")) {
    lowProfileId = sessionStorage.getItem("lowProfileId");
  }

  const functionUrl =
    "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

  useEffect(() => {
    const fetchAndSaveOrder = async () => {
      if (!lowProfileId || !user) {
        setLoading(false);
        // Optional: Set a specific error for missing context
        if (!lowProfileId) setError("Missing transaction ID (LowProfileId). Cannot check payment status.");
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
          // Extract the most specific decline message from the response
          const declineMessage = 
              data.TranzactionInfo?.IssuerAuthCodeDescription || 
              data.TranzactionInfo?.Description || 
              data.Description || 
              "Payment failed or is pending. Please try again.";
              
          // Use the specific message for the toast notification
          toast.error(declineMessage);
          
          // Set the specific error message to display in the main page content
          setError(declineMessage); 
        }
      } catch (err) {
        console.error("❌ Error fetching order details:", err);
        setError("Failed to fetch order details. Please check your network connection.");
        setLoading(false);
      }
    };

    fetchAndSaveOrder();
  }, [lowProfileId, user]);

  if (loading)
    return (
      <div className={styles.successContainer}>
        <div className={styles.statusMessage}>
          {/* Your loader component/styles would go here */}
          Checking payment status...
        </div>
      </div>
    );

  // If there's an error from the fetch or a non-0 ResponseCode was detected and set to 'error' state
  if (error || orderDetails?.TranzactionInfo?.ResponseCode !== 0) {
    // If ResponseCode is NOT 0, use the fetched error details, otherwise use the generic fetch error
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
        סכום: **{(info.Amount / 100).toFixed(2)} ₪** {/* Dividing by 100 for Agorot/Cents */}
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

export default SuccessPageIframe;