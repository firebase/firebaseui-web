import {
  AuthProvider,
  linkWithPopup,
  linkWithRedirect,
  signInWithPopup,
  signInWithRedirect,
  User,
  UserCredential,
} from "firebase/auth";
import { FirebaseUIConfiguration } from "~/config";

export type ProviderSignInStrategyHandler = (
  ui: FirebaseUIConfiguration,
  provider: AuthProvider
) => Promise<never | UserCredential>;
export type ProviderLinkStrategyHandler = (
  ui: FirebaseUIConfiguration,
  user: User,
  provider: AuthProvider
) => Promise<never | UserCredential>;

export const signInWithRediectHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  return signInWithRedirect(ui.auth, provider);
};

export const signInWithPopupHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  return signInWithPopup(ui.auth, provider);
};

export const linkWithRedirectHandler: ProviderLinkStrategyHandler = async (_ui, user, provider) => {
  return linkWithRedirect(user, provider);
};

export const linkWithPopupHandler: ProviderLinkStrategyHandler = async (_ui, user, provider) => {
  return linkWithPopup(user, provider);
};
