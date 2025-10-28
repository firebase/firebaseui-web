import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@invertase/firebaseui-translations";
import { Behavior, FirebaseUI, FirebaseUIOptions, initializeUI } from "@invertase/firebaseui-core";
import { FirebaseUIProvider } from "../src/context";

export function createMockUI(overrides?: Partial<FirebaseUIOptions>): FirebaseUI {
  return initializeUI({
    app: {} as FirebaseApp,
    auth: {} as Auth,
    locale: enUs,
    behaviors: [] as Behavior[],
    ...overrides,
  });
}

export const createFirebaseUIProvider = ({ children, ui }: { children: React.ReactNode; ui: FirebaseUI }) => (
  <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>
);

export function CreateFirebaseUIProvider({ children, ui }: { children: React.ReactNode; ui: FirebaseUI }) {
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}
