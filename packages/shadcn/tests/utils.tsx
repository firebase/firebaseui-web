import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { Behavior, FirebaseUIOptions, initializeUI } from "@firebase-ui/core";
import { FirebaseUIStore } from "@firebase-ui/core";

export function createMockUI(overrides?: Partial<FirebaseUIOptions>) {
  return initializeUI({
    app: {} as FirebaseApp,
    auth: {} as Auth,
    locale: enUs,
    behaviors: [] as Behavior[],
    ...overrides,
  });
}

export const createFirebaseUIProvider = ({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) => (
  <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>
);

export function CreateFirebaseUIProvider({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) {
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}
