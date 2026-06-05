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

  apiKey: "AIzaSyCjWhhMzy0SMI3ZeD_Xsfdo0UPyFPxG57Q",
  authDomain: "q3-tbr-wave-steer.firebaseapp.com",
  projectId: "q3-tbr-wave-steer",
  storageBucket: "q3-tbr-wave-steer.firebasestorage.app",
  messagingSenderId: "16883148372",
  appId: "1:16883148372:web:0b482607f3016dfa0eefc1"

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
