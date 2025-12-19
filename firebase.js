
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO-WdMKGTjaZh96oN2huL1jYOXtyPifbw",
  authDomain: "location-app-2f9a9.firebaseapp.com",
  projectId: "location-app-2f9a9",
  storageBucket: "location-app-2f9a9.firebasestorage.app",
  messagingSenderId: "625780020846",
  appId: "1:625780020846:web:d3f6b8f50c0ef4673d387f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const database = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export the services we'll use
export { database, auth, signInAnonymously };