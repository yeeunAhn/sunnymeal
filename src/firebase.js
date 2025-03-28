// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore import
import { getAuth } from "firebase/auth"; // 인증을 사용하는 경우

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAAfwZVf7T_PeqSd6F_LgU16FUSw0kiwjU",
  authDomain: "sunnymealpoint.firebaseapp.com",
  projectId: "sunnymealpoint",
  storageBucket: "sunnymealpoint.appspot.com",
  messagingSenderId: "1082060132449",
  appId: "1:1082060132449:web:b64f18e4db6950014c1a20",
  measurementId: "G-YB96N40QV6",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore와 인증 객체를 가져오기
const db = getFirestore(app); // Firestore 객체 초기화
const auth = getAuth(app); // 인증 객체 초기화 (선택 사항)

// db와 auth 객체를 외부에서 사용할 수 있도록 export
export { db, auth };
