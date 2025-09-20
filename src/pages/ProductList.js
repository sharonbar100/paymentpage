import React from "react";
import ProductCard from "../components/ProductCard";
import styles from "./ProductList.module.css";

const PRODUCTS = [
  { id: "prod_1", name: "טלויזיה", price: 59 },
  { id: "prod_2", name: "מחשב נייד", price: 2500 },
  { id: "prod_3", name: "מקרר", price: 1500 },
];

function ProductList() {
  return (
    <div className={styles.productListContainer}>
      <h1>🛒 Products</h1>
      <div className={styles.productGrid}>
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;