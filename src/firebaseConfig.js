import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXIj3knbPdCXHRpA7Y--5wou9vBUjvfoI",
  authDomain: "paymentpage-2f2d9.firebaseapp.com",
  projectId: "paymentpage-2f2d9",
  storageBucket: "paymentpage-2f2d9.firebasestorage.app",
  messagingSenderId: "1053802324174",
  appId: "1:1053802324174:web:da8e2cdc8ec87b752cf09f",
  measurementId: "G-ENKY8VZTVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage and export it

export { app, analytics, db, storage };