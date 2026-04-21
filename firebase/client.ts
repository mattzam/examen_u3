import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8IY_Wbh33pdqaaY2kKO54CGifi-fEdPs",  // ← O no 0
  authDomain: "web-218500.firebaseapp.com",
  projectId: "web-218500",
  appId: "1:539802319607:web:dc04682efd3ffa857531f2",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);