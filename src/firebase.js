// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVFMND9n0LPPgKir7JK_5Sr4ANl-oiLcI",
  authDomain: "cata01-10ba0.firebaseapp.com",
  projectId: "cata01-10ba0",
  storageBucket: "cata01-10ba0.firebasestorage.app",
  messagingSenderId: "1030443047816",
  appId: "1:1030443047816:web:76eb4552f630a50da6f83d",
  measurementId: "G-WFK11V8NT1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };