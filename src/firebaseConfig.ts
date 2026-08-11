import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlghyz2AmEW1gLzVzDIi5eLIOjugEYIhI",
  authDomain: "evidencija-rezija-martina.firebaseapp.com",
  projectId: "evidencija-rezija-martina",
  storageBucket: "evidencija-rezija-martina.firebasestorage.app",
  messagingSenderId: "24351204546",
  appId: "1:24351204546:android:31fbb31aa837557399075b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);
