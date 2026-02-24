import { FirebaseUIProvider, SignInAuthScreen } from "@firebase-oss/ui-react";
import { ui } from "./firebase";

export default function FirebaseUiExperiment() {
  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: "https://www.google.com",
        privacyPolicyUrl: "https://www.google.com",
      }}
    >
      <SignInAuthScreen
        onSignIn={(result) => {
          console.log("React-in-Vue sign-in success", result);
        }}
      />
    </FirebaseUIProvider>
  );
}
