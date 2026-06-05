// firebase.js

import {
  initializeApp
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyBEr60ly1rGZThmFI9DamgW8xzgxJ6wwl8",
  authDomain: "q3-tbr-wave---1.firebaseapp.com",
  projectId: "q3-tbr-wave---1",
  storageBucket: "q3-tbr-wave---1.firebasestorage.app",
  messagingSenderId: "436232639814",
  appId: "1:436232639814:web:f7a3cfbb423701c6318147"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
};
