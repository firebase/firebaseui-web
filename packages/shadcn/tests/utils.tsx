import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@invertase/firebaseui-translations";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import { Behavior, FirebaseUIOptions, initializeUI } from "@invertase/firebaseui-core";
import { FirebaseUIStore } from "@invertase/firebaseui-core";
import { vi } from "vitest";

export function createMockUI(overrides?: Partial<FirebaseUIOptions>) {
  return initializeUI({
    app: {} as FirebaseApp,
    auth: {
      currentUser: null,
    } as unknown as Auth,
    locale: enUs,
    behaviors: [] as Behavior[],
    ...overrides,
  });
}

export function createMockUIWithUser(overrides?: Partial<FirebaseUIOptions>) {
  return initializeUI({
    app: {} as FirebaseApp,
    auth: {
      currentUser: {
        uid: "test-user-id",
        email: "test@example.com",
        _onReload: vi.fn(),
        _multiFactor: {
          enrolledFactors: [],
          enroll: vi.fn(),
          unenroll: vi.fn(),
          getSession: vi.fn(),
        },
      },
    } as unknown as Auth,
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
