// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnr3CCVIFBwMlnYFVKj7pZF2PXtCgBU-M",
  authDomain: "chat-4252a.firebaseapp.com",
  projectId: "chat-4252a",
  storageBucket: "chat-4252a.appspot.com",
  messagingSenderId: "206938549631",
  appId: "1:206938549631:web:9ab430ef91e1c181ec7e4a",
  measurementId: "G-1SE1MF1WH1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
