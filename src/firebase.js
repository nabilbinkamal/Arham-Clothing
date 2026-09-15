import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARVp5G-Z_OPWQFWsS-SUwOQrRTD_GdY1k",
  authDomain: "aureon-217f3.firebaseapp.com",
  projectId: "aureon-217f3",
  storageBucket: "aureon-217f3.firebasestorage.app",
  messagingSenderId: "554445090859",
  appId: "1:554445090859:web:1c4f5a14ec50949d15fa6e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
