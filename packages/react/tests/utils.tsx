import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@invertase/firebaseui-translations";
import { Behavior, FirebaseUI, FirebaseUIOptions, FirebaseUIStore, initializeUI } from "@invertase/firebaseui-core";
import { FirebaseUIProvider } from "../src/context";
import { vi } from "vitest";

export function createMockUI(overrides?: Partial<FirebaseUIOptions>): FirebaseUIStore {
  const defaultAuth = {
    onAuthStateChanged: vi.fn(() => vi.fn()),
  } as unknown as Auth;

  const { auth, ...restOverrides } = overrides || {};

  return initializeUI({
    app: {} as FirebaseApp,
    auth: auth ?? defaultAuth,
    locale: enUs,
    behaviors: [] as Behavior[],
    ...restOverrides,
  });
}

export const createFirebaseUIProvider = ({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) => (
  <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>
);

export function CreateFirebaseUIProvider({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) {
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}
