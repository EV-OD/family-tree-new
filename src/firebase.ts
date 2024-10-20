import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: "family-tree-85e98.firebaseapp.com",
  projectId: "family-tree-85e98",
  storageBucket: "family-tree-85e98.appspot.com",
  messagingSenderId: "146217766002",
  appId: "1:146217766002:web:1573541b7c2d3198b106eb",
  measurementId: "G-XX0MM7H08Q"
};

console.log(firebaseConfig)

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);


export default firebaseConfig;