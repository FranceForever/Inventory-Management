// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJtUlWnALDeLDmP7xu8bzIvRF3670su-U",
  authDomain: "inventory-managment-fd84f.firebaseapp.com",
  projectId: "inventory-managment-fd84f",
  storageBucket: "inventory-managment-fd84f.appspot.com",
  messagingSenderId: "414708898156",
  appId: "1:414708898156:web:845b5212abf156a999fb49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {firestore, storage};