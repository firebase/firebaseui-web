import { initializeUI } from "@firebase-oss/ui-core";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCvMftIUCD9lUQ3BzIrimfSfBbCUQYZf-I",
  authDomain: "fir-ui-rework.firebaseapp.com",
  projectId: "fir-ui-rework",
  storageBucket: "fir-ui-rework.firebasestorage.app",
  messagingSenderId: "200312857118",
  appId: "1:200312857118:web:94e3f69b0e0a4a863f040f",
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
export const auth = getAuth(firebaseApp);
export const ui = initializeUI({ app: firebaseApp });

if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
  } catch {
    // Ignore emulator reconnect errors during HMR.
  }
}
