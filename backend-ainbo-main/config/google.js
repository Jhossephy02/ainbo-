import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDz4WgB3m6jvqI36a9gJciYmGuoUTkGJw8",
  authDomain: "ainboflora.firebaseapp.com",
  projectId: "ainboflora",
  storageBucket: "ainboflora.firebasestorage.app",
  messagingSenderId: "313770041398",
  appId: "1:313770041398:web:f10dc257a35e14e4683897",
  measurementId: "G-1ZZ1FKSGK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { signInWithPopup, auth, provider, signOut};