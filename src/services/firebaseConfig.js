import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 🔹 IMPORTAR STORAGE

// 🔹 Configuración de Firebase (usa la misma que tenías)
const firebaseConfig = {
  apiKey: "AIzaSyDfkayuiS5PKsnI8wsDNO53xxdd5GTbV7c",
  authDomain: "mundoar-146fb.firebaseapp.com",
  projectId: "mundoar-146fb",
  storageBucket: "mundoar-146fb.appspot.com",
  messagingSenderId: "734509520863",
  appId: "1:734509520863:web:fbcd80b5cf64d5866f966a",
  measurementId: "G-SJQ4WB9PXN"
};

// 🔹 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 🔹 EXPORTAR STORAGE

export { app, auth, db, storage };
