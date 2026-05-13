import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBuGdsXUNv7RyDYe3gnlcUtQ2Ler1xnbPk",
  authDomain: "laboratorio-93dc6.firebaseapp.com",
  projectId: "laboratorio-93dc6",
  storageBucket: "laboratorio-93dc6.firebasestorage.app",
  messagingSenderId: "386756894566",
  appId: "1:386756894566:web:24ca23f17e9ce5913972a7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
