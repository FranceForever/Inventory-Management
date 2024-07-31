// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTFZz38HItoDK2kjFbogsm0kZsqbk2Xdo",
  authDomain: "inventory-management-8cdd7.firebaseapp.com",
  projectId: "inventory-management-8cdd7",
  storageBucket: "inventory-management-8cdd7.appspot.com",
  messagingSenderId: "1015005562642",
  appId: "1:1015005562642:web:b0252a3cd7055f8e3615cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);