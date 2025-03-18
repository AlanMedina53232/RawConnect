import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Check if Firebase app is already initialized
let app;
let db;

// Only initialize Firebase if it hasn't been initialized yet
if (getApps().length === 0) {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDJWPeRAqgHqFWKSDxymvQClzMdQ5kGhhU",
        authDomain: "rawconnect-53d6d.firebaseapp.com",
        projectId: "rawconnect-53d6d",
        storageBucket: "rawconnect-53d6d.firebasestorage.app",
        messagingSenderId: "318383808919",
        appId: "1:456269115125:web:7c34aebcf76dad6f4c1fbc"
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
} else {
    // Use the existing Firebase app
    app = getApps()[0];
}

// Initialize Firestore
db = getFirestore(app);

export { db };
