import { updateProfile, type User } from "firebase/auth";
import { type FirebaseUIConfiguration } from "~/config";

export const requireDisplayNameHandler = async (_: FirebaseUIConfiguration, user: User, displayName: string) => {
  await updateProfile(user, { displayName });
};
