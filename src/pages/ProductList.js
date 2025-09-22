import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ProductCard from "../components/ProductCard";
import styles from "./ProductList.module.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const productsCollectionRef = collection(db, "products");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await getDocs(productsCollectionRef);
        setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, []);

  return (
    <div className={styles.productListContainer}>
      <h1>🛒 Products</h1>
      <div className={styles.productGrid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;