import React, { useState, useEffect } from "react";
import styles from "./UploadProduct.module.css";
import { toast } from "react-toastify";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";

function UploadProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    image: null,
    imagePreview: "",
  });
  const [products, setProducts] = useState([]);
  const productsCollectionRef = collection(db, "products");

  // State to track which product is being edited
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProductData, setEditedProductData] = useState({});

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const uploadImage = async (image) => {
    if (image == null) return null;
    const imageRef = ref(storage, `images/${image.name + v4()}`);
    await uploadBytes(imageRef, image);
    const url = await getDownloadURL(imageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.quantity || !product.image) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const imageUrl = await uploadImage(product.image);
      await addDoc(productsCollectionRef, {
        name: product.name,
        price: Number(product.price),
        quantity: Number(product.quantity),
        imageUrl: imageUrl,
      });
      toast.success("Product uploaded successfully!");
      fetchProducts();
      setProduct({
        name: "",
        price: "",
        quantity: "",
        image: null,
        imagePreview: "",
      });
    } catch (error) {
      console.error("Error uploading product:", error);
      toast.error("Failed to upload product. Please try again.");
    }
  };

  const fetchProducts = async () => {
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
    toast.success("Product deleted successfully!");
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditedProductData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
  };

  const saveProduct = async (id) => {
    const productDoc = doc(db, "products", id);
    try {
      await updateDoc(productDoc, {
        name: editedProductData.name,
        price: Number(editedProductData.price),
        quantity: Number(editedProductData.quantity),
      });
      toast.success("Product updated successfully!");
      setEditingProductId(null);
      setEditedProductData({});
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product.");
      console.error("Error updating product:", error);
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditedProductData({});
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
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

      <div className={styles.listSection}>
        <h2>Uploaded Products</h2>
        {products.length === 0 ? (
          <p>No products uploaded yet.</p>
        ) : (
          <div className={styles.productsList}>
            {products.map((p) => (
              <div key={p.id} className={styles.productItem}>
                <img src={p.imageUrl} alt={p.name} className={styles.productImage} />
                {editingProductId === p.id ? (
                  // Edit mode
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      name="name"
                      value={editedProductData.name}
                      onChange={handleEditChange}
                    />
                    <input
                      type="number"
                      name="price"
                      value={editedProductData.price}
                      onChange={handleEditChange}
                    />
                    <input
                      type="number"
                      name="quantity"
                      value={editedProductData.quantity}
                      onChange={handleEditChange}
                    />
                    <div className={styles.actions}>
                      <button onClick={() => saveProduct(p.id)} className={styles.saveBtn}>
                        ✅ Save
                      </button>
                      <button onClick={cancelEdit} className={styles.cancelBtn}>
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Read-only mode
                  <>
                    <div className={styles.productDetails}>
                      <p>
                        <strong>Name:</strong> {p.name}
                      </p>
                      <p>
                        <strong>Price:</strong> {p.price} ₪
                      </p>
                      <p>
                        <strong>Quantity:</strong> {p.quantity}
                      </p>
                    </div>
                    <div className={styles.actions}>
                      <button onClick={() => startEdit(p)} className={styles.editBtn}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className={styles.deleteBtn}>
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadProduct;