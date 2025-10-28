import { vi } from "vitest";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@firebase-ui/translations";
import { FirebaseUI } from "../src/config";

export function createMockUI(overrides?: Partial<FirebaseUI>): FirebaseUI {
  return {
    app: {} as FirebaseApp,
    auth: {} as Auth,
    setLocale: vi.fn(),
    state: "idle",
    setState: vi.fn(),
    locale: enUs,
    behaviors: {},
    multiFactorResolver: undefined,
    setMultiFactorResolver: vi.fn(),
    redirectError: undefined,
    setRedirectError: vi.fn(),
    ...overrides,
  };
}
