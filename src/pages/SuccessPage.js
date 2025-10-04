import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./SuccessPage.module.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const isLocalhost = window.location.hostname === "localhost";

function SuccessPage({ user }) {
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderSaved, setOrderSaved] = useState(false); 

    let lowProfileId = searchParams.get("LowProfileId");
    if (!lowProfileId || lowProfileId.includes("{")) {
        lowProfileId = sessionStorage.getItem("lowProfileId");
    }

    const functionUrl = isLocalhost
      ? "http://localhost:5001/paymentpage-2f2d9/us-central1/app"
      : "https://us-central1-paymentpage-2f2d9.cloudfunctions.net/app";

    useEffect(() => {
        const fetchAndSaveOrder = async () => {
            // 1. Check for the LowProfileId only (independent of user status)
            if (!lowProfileId) { 
                setLoading(false);
                setError("Missing transaction ID (LowProfileId). Cannot check payment status.");
                return;
            }

            try {
                // A. ALWAYS CHECK PAYMENT STATUS FIRST
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
                    
                    // B. PREPARE DATA FOR FIRESTORE SAVING
                    if (!orderSaved) {
                        
                        // Extract required info
                        const info = data.TranzactionInfo;
                        const customerEmail = info?.CardOwnerEmail || 'N/A';
                        const customerName = info?.CardOwnerName || 'N/A';
                        
                        const orderData = {
                            amount: info.Amount,
                            approvalNumber: info.ApprovalNumber,
                            last4: info.Last4CardDigitsString,
                            createdAt: serverTimestamp(),
                            
                            // 🔑 CRITICAL: Attribution Logic
                            userId: user ? user.uid : null, // Firebase UID if signed in
                            customerEmail: user ? user.email : customerEmail, // Email from Auth or Cardcom response
                            customerName: user ? user.displayName : customerName,
                            isGuest: !user, // Flag for easy filtering
                        };

                        await addDoc(collection(db, "orders"), orderData);
                        setOrderSaved(true);
                        
                        if (!user) {
                            toast.info(`Order placed successfully. Receipt sent to ${customerEmail}.`);
                        }
                    }

                } else {
                    // ... (Failure handling) ...
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

        fetchAndSaveOrder();
    }, [lowProfileId, user, functionUrl, orderSaved]);

    // ... (rest of the component rendering) ...

    if (loading)
        return (
            <div className={styles.successContainer}>
                <div className={styles.statusMessage}>Checking payment status...</div>
            </div>
        );

    // Failure Case Rendering
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