import { updateProfile, type User } from "firebase/auth";
import { type FirebaseUI } from "~/config";

export const requireDisplayNameHandler = async (_: FirebaseUI, user: User, displayName: string) => {
  await updateProfile(user, { displayName });
};
