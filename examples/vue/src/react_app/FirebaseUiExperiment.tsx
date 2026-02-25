import {
  AppleSignInButton,
  EmailLinkAuthScreen,
  FacebookSignInButton,
  FirebaseUIProvider,
  ForgotPasswordAuthScreen,
  GitHubSignInButton,
  GoogleSignInButton,
  MicrosoftSignInButton,
  OAuthScreen,
  PhoneAuthScreen,
  SignInAuthScreen,
  SignUpAuthScreen,
  TwitterSignInButton,
  YahooSignInButton,
} from "@firebase-oss/ui-react";
import type { ReactNode } from "react";
import { ui } from "./firebase";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function FirebaseUiExperiment() {
  const logSuccess = (name: string) => (result: unknown) => {
    console.log(`[${name}] sign-in success`, result);
  };

  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: "https://www.google.com",
        privacyPolicyUrl: "https://www.google.com",
      }}
    >
      <div style={{ display: "grid", gap: "2rem" }}>
        <Section title="Sign In Screen">
          <SignInAuthScreen onSignIn={logSuccess("SignInAuthScreen")} />
        </Section>

        <Section title="Sign Up Screen">
          <SignUpAuthScreen
            onSignUp={(user) => {
              console.log("[SignUpAuthScreen] sign-up success", user.uid);
            }}
          />
        </Section>

        <Section title="Email Link Screen">
          <EmailLinkAuthScreen onSignIn={logSuccess("EmailLinkAuthScreen")} />
        </Section>

        <Section title="Forgot Password Screen">
          <ForgotPasswordAuthScreen />
        </Section>

        <Section title="Phone Screen">
          <PhoneAuthScreen onSignIn={logSuccess("PhoneAuthScreen")} />
        </Section>

        <Section title="OAuth Screen (All Providers)">
          <OAuthScreen onSignIn={logSuccess("OAuthScreen")}>
            <GoogleSignInButton themed />
            <FacebookSignInButton themed />
            <AppleSignInButton themed />
            <GitHubSignInButton themed />
            <MicrosoftSignInButton themed />
            <TwitterSignInButton themed />
            <YahooSignInButton themed />
          </OAuthScreen>
        </Section>
      </div>
    </FirebaseUIProvider>
  );
}
