import { RecaptchaVerifier } from "firebase/auth";
import { type FirebaseUIConfiguration } from "~/config";

export type RecaptchaVerificationOptions = {
  size?: "normal" | "invisible" | "compact";
  theme?: "light" | "dark";
  tabindex?: number;
};

export const recaptchaVerificationHandler = (
  ui: FirebaseUIConfiguration,
  element: HTMLElement,
  options?: RecaptchaVerificationOptions
) => {
  return new RecaptchaVerifier(ui.auth, element, {
    size: options?.size ?? "invisible",
    theme: options?.theme ?? "light",
    tabindex: options?.tabindex ?? 0,
  });
};
