import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./ErrorPage.module.css";

function ErrorPage() {
  const [searchParams] = useSearchParams();
  const returnValue = searchParams.get("ReturnValue");

  return (
    <div className={styles.container}>
      <h1>❌ Payment Failed</h1>
      <p>
        There was an issue processing your payment. Please try again or contact
        support if the problem persists.
      </p>

      {returnValue && (
        <p>
          Order Reference: <strong>{returnValue}</strong>
        </p>
      )}

      <Link to="/checkout" className={styles.link}>
        Try Again
      </Link>
    </div>
  );
}

export default ErrorPage;
