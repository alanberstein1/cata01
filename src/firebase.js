// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your real config:
const firebaseConfig = {
  apiKey: "pAsuFSSBSeWMNflIqZbNEBd4n-d7hdmOXnfWMwL4fo4",
  authDomain: "cata01-10ba0.firebaseapp.com",
  projectId: "Cata01",
  storageBucket: "cata01-10ba0.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };