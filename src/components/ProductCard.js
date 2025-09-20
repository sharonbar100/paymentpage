import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import styles from "./ProductCard.module.css";
import { toast } from "react-toastify";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className={styles.productCard}>
      <h3>{product.name}</h3>
      <p className={styles.price}>{product.price} ₪</p>
      <button
        onClick={handleAddToCart}
        className={styles.addToCartBtn}
      >
        ➕ Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;