// firebaseConfig.js
import { initializeApp } from "firebase/app";
// Auth ve Firestore modüllerini çağırıyoruz
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// BURAYA KENDİ FIREBASE BİLGİLERİNİ YAPIŞTIR
const firebaseConfig = {
  apiKey: "AIzaSyBbdrsRw3vPGCX0aklDC7N4eWXTtEDPBgQ", // Kendi API Key'in
  authDomain: "mobilodev2-dd805.firebaseapp.com",
  projectId: "mobilodev2-dd805",
  storageBucket: "mobilodev2-dd805.firebasestorage.app",
  messagingSenderId: "1060300350732",
  appId: "1:1060300350732:web:a45f81ddec254140a9d529",
  measurementId: "G-FRRLRQPV8C"

};

const app = initializeApp(firebaseConfig);

// Auth durumunu hafızada tutmak için AsyncStorage ile bağlıyoruz
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };