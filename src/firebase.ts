import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAfrqks6CgSIWiV9hFNFnovxDK6sfH2JoQ",
  authDomain: "panda-royal.firebaseapp.com",
  projectId: "panda-royal",
  storageBucket: "panda-royal.firebasestorage.app",
  messagingSenderId: "291734954451",
  appId: "1:291734954451:web:104f7b561dcf8df7818f26"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
