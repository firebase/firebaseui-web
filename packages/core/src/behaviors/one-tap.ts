import { GoogleAuthProvider } from "firebase/auth";
import type { IdConfiguration } from "google-one-tap";
import type { FirebaseUIConfiguration } from "~/config";
import { signInWithCredential } from "~/auth";

export type OneTapSignInOptions = {
  clientId: IdConfiguration['client_id'];
  autoSelect?: IdConfiguration['auto_select'];
  cancelOnTapOutside?: IdConfiguration['cancel_on_tap_outside'];
  context?: IdConfiguration['context'];
  uxMode?: IdConfiguration['ux_mode'];
  logLevel?: IdConfiguration['log_level'];
};

export const oneTapSignInHandler = async (ui: FirebaseUIConfiguration, options: OneTapSignInOptions) => {
  // Only show one-tap if user is not signed in OR if they are anonymous.
  // Don't show if user is already signed in with a real account.
  if (ui.auth.currentUser && !ui.auth.currentUser.isAnonymous) {
    return;
  }

  // Prevent multiple instances of the script from being loaded, e.g. hot reload.
  if (document.querySelector('script[data-one-tap-sign-in]')) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('data-one-tap-sign-in', 'true');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: options.clientId,
      auto_select: options.autoSelect,
      cancel_on_tap_outside: options.cancelOnTapOutside,
      context: options.context,
      ux_mode: options.uxMode,
      log_level: options.logLevel,
      callback: async (response) => {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(ui, credential);
      },
    });

    window.google.accounts.id.prompt();
  };

  document.body.appendChild(script);
};