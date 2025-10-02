import { AuthCredential, AuthProvider, linkWithCredential, linkWithRedirect } from "firebase/auth";
import { FirebaseUIConfiguration } from "~/config";
import { RedirectHandler } from "./utils";
import { getBehavior } from "~/behaviors";

export const autoUpgradeAnonymousCredentialHandler = async (ui: FirebaseUIConfiguration, credential: AuthCredential) => {
  const currentUser = ui.auth.currentUser;

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

  return getBehavior(ui, "providerLinkStrategy")(ui, currentUser, provider);
};

export const autoUpgradeAnonymousUserRedirectHandler: RedirectHandler = async () => {
  // TODO
};