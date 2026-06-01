// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABGsh7kvmWcwEsZwdViuV0oBVbtQLM-A0",
  authDomain: "meu-streaming-9d1d5.firebaseapp.com",
  databaseURL: "https://meu-streaming-9d1d5-default-rtdb.firebaseio.com",
  projectId: "meu-streaming-9d1d5",
  storageBucket: "meu-streaming-9d1d5.firebasestorage.app",
  messagingSenderId: "114596993060",
  appId: "1:114596993060:web:023790c80e2d384c6d20b1",
  measurementId: "G-5CVNP3BMH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
