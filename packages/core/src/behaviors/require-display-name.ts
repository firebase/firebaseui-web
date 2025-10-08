import { updateProfile, User } from "firebase/auth";
import { FirebaseUIConfiguration } from "~/config";

export const requireDisplayNameHandler = async (_: FirebaseUIConfiguration, user: User, displayName: string) => {
  await updateProfile(user, { displayName });
};
