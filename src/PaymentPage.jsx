import React, { useState } from "react";
import axios from "axios";

export default function PaymentPage() {
  const [iframeUrl, setIframeUrl] = useState(null);

  const handlePayment = async () => {
    try {
      // call backend
      const res = await axios.post("http://localhost:5000/create-payment");
      console.log("Frontend received:", res.data);

      // CardCom should return { Url, LowProfileCode, ... }
      if (res.data.Url) {
        setIframeUrl(res.data.Url);
      } else {
        alert("No payment URL returned. Check backend logs.");
      }
    } catch (err) {
      console.error("Frontend error:", err.response?.data || err.message);
      alert("Payment request failed. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>CardCom Test Payment</h1>
      <button onClick={handlePayment}>Pay Now</button>

      {iframeUrl && (
        <div style={{ marginTop: "20px" }}>
          <iframe
            src={iframeUrl}
            title="CardCom Payment"
            width="600"
            height="600"
            style={{ border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}
