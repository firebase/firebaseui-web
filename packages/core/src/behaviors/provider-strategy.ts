import { AuthProvider, linkWithPopup, linkWithRedirect, signInWithPopup, signInWithRedirect, User, UserCredential } from "firebase/auth";
import { FirebaseUIConfiguration } from "~/config";

export type ProviderSignInStrategyHandler = (ui: FirebaseUIConfiguration, provider: AuthProvider) => Promise<never | UserCredential>
export type ProviderLinkStrategyHandler = (ui: FirebaseUIConfiguration, user: User, provider: AuthProvider) => Promise<never | UserCredential>;

export const signInWithRediectHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  ui.setState("pending");
  return signInWithRedirect(ui.auth, provider);
};

export const signInWithPopupHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  ui.setState("pending");
  const result = await signInWithPopup(ui.auth, provider);
  ui.setState("idle");
  return result;
};

export const linkWithRedirectHandler: ProviderLinkStrategyHandler = async (ui, user, provider) => {
  ui.setState("pending");
  return linkWithRedirect(user, provider);
};

export const linkWithPopupHandler: ProviderLinkStrategyHandler = async (ui, user, provider) => {
  ui.setState("pending");
  const result = await linkWithPopup(user, provider);
  ui.setState("idle");
  return result;
};
