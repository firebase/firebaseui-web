import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { Behavior, FirebaseUI, FirebaseUIConfigurationOptions, initializeUI } from "@firebase-ui/core";

export function createMockUI(overrides?: Partial<FirebaseUIConfigurationOptions>): FirebaseUI {
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
