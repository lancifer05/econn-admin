// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCHjDdM-VBB4oWyb5MZLL7rF6CtpSzKTHk',
  authDomain: 'econn-f3757.firebaseapp.com',
  databaseURL: 'https://econn-f3757-default-rtdb.firebaseio.com',
  projectId: 'econn-f3757',
  storageBucket: 'econn-f3757.appspot.com',
  messagingSenderId: '88143220216',
  appId: '1:88143220216:web:4f1e013ce17e62eebfda0d',
  measurementId: 'G-MCD0EFCG5C',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;