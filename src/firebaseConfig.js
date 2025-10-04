import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"; // 👈️ Added connectFirestoreEmulator
import { getStorage, connectStorageEmulator } from "firebase/storage"; // 👈️ Added connectStorageEmulator
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth"; // 👈️ Added connectAuthEmulator

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXIj3knbPdCXHRpA7Y--5wou9vBUjvfoI",
  authDomain: "paymentpage-2f2d9.firebaseapp.com",
  projectId: "paymentpage-2f2d9",
  storageBucket: "paymentpage-2f2d9.firebasestorage.app",
  messagingSenderId: "1053802324174",
  appId: "1:1053802324174:web:da8e2cdc8ec87b752cf09f",
  measurementId: "G-ENKY8VZTVM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// -----------------------------------------------------------------
// 👇️ CRITICAL EMULATOR CONNECTION LOGIC
const isLocalhost = window.location.hostname === "localhost";

if (isLocalhost) {
  // Connect Firestore Emulator
  connectFirestoreEmulator(db, "localhost", 8080);
  
  // 🎯 FIX for Storage Upload 🎯
  connectStorageEmulator(storage, "localhost", 9199);
  
  // Connect Auth Emulator (for Login)
  connectAuthEmulator(auth, "http://localhost:9099");
  
  console.log("🔥 Connected to Firebase Emulators (Auth, Firestore, Storage)");
}
// -----------------------------------------------------------------


export { app, analytics, db, storage, auth, provider };