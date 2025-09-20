import React, { useState } from "react";
import styles from "./UploadProduct.module.css";
import { toast } from "react-toastify";

function UploadProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    image: null,
    imagePreview: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setProduct({
        ...product,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.quantity || !product.image) {
      toast.error("Please fill in all fields.");
      return;
    }
    console.log("Product to be uploaded:", product);
    toast.success("Product uploaded successfully!");

    setProduct({
      name: "",
      price: "",
      quantity: "",
      image: null,
      imagePreview: "",
    });
  };

  return (
    <div className={styles.uploadContainer}>
      <h1>Upload New Product</h1>
      <form onSubmit={handleSubmit} className={styles.uploadForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Price (₪):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="image">Product Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />
          {product.imagePreview && (
            <img
              src={product.imagePreview}
              alt="Product Preview"
              className={styles.imagePreview}
            />
          )}
        </div>
        <button type="submit" className={styles.uploadButton}>
          Upload Product
        </button>
      </form>
    </div>
  );
}

export default UploadProduct;