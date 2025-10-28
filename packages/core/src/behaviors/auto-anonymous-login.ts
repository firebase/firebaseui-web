import { signInAnonymously } from "firebase/auth";
import { type InitHandler } from "./utils";

export const autoAnonymousLoginHandler: InitHandler = async (ui) => {
  const auth = ui.auth;

  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
};
