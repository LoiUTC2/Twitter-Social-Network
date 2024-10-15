// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3LUcaWcrcgS3qPmjMRayl8E6eABN61MY",
  authDomain: "twitter-clone-020.firebaseapp.com",
  projectId: "twitter-clone-020",
  storageBucket: "twitter-clone-020.appspot.com",
  messagingSenderId: "247796747374",
  appId: "1:247796747374:web:2df0fbfef1dc1bae212a7f",
  measurementId: "G-6P7NR2XZEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);