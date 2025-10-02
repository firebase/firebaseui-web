import { AuthCredential, AuthProvider, linkWithCredential, linkWithRedirect } from "firebase/auth";
import { FirebaseUIConfiguration } from "~/config";
import { RedirectHandler } from "./utils";

export const autoUpgradeAnonymousCredentialHandler = async (ui: FirebaseUIConfiguration, credential: AuthCredential) => {
  const currentUser = ui.auth.currentUser;

  // Check if the user is anonymous. If not, we can't upgrade them.
  if (!currentUser?.isAnonymous) {
    return;
  }

  ui.setState("pending");
  const result = await linkWithCredential(currentUser, credential);

  ui.setState("idle");
  return result;
};

export const autoUpgradeAnonymousProviderHandler = async (ui: FirebaseUIConfiguration, provider: AuthProvider) => {
  const currentUser = ui.auth.currentUser;

  if (!currentUser?.isAnonymous) {
    return;
  }

  ui.setState("pending");
  // TODO... this should use redirect OR popup
  await linkWithRedirect(currentUser, provider);
  // We don't modify state here since the user is redirected.
  // If we support popups, we'd need to modify state here.
};

export const autoUpgradeAnonymousUserRedirectHandler: RedirectHandler = async () => {
  // TODO
};