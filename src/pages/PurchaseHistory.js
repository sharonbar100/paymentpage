import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import styles from "./PurchaseHistory.module.css";

function PurchaseHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) return <div className={styles.container}>Loading orders…</div>;
  if (!user)
    return <div className={styles.container}>Please log in to see your purchase history.</div>;

  return (
    <div className={styles.container}>
      <h1>Purchase History</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order.id} className={styles.orderItem}>
              <p>
                <strong>Amount:</strong> {order.amount} ₪
              </p>
              <p>
                <strong>Approval Number:</strong> {order.approvalNumber}
              </p>
              <p>
                <strong>Card:</strong> ****{order.last4}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {order.createdAt.toDate
                  ? order.createdAt.toDate().toLocaleString()
                  : new Date(order.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PurchaseHistory;
