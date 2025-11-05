import SignInAuthScreenPage from "./screens/sign-in-auth-screen";
import SignInAuthScreenWithHandlersPage from "./screens/sign-in-auth-screen-w-handlers";
import SignInAuthScreenWithOAuthPage from "./screens/sign-in-auth-screen-w-oauth";
import SignUpAuthScreenPage from "./screens/sign-up-auth-screen";
import SignUpAuthScreenWithHandlersPage from "./screens/sign-up-auth-screen-w-handlers";
import SignUpAuthScreenWithOAuthPage from "./screens/sign-up-auth-screen-w-oauth";
import EmailLinkAuthScreenPage from "./screens/email-link-auth-screen";
import EmailLinkAuthScreenWithOAuthPage from "./screens/email-link-auth-screen-w-oauth";
import ForgotPasswordAuthScreenPage from "./screens/forgot-password-auth-screen";
import OAuthScreenPage from "./screens/oauth-screen";
import PhoneAuthScreenPage from "./screens/phone-auth-screen";
import PhoneAuthScreenWithOAuthPage from "./screens/phone-auth-screen-w-oauth";
import MultiFactorAuthEnrollmentScreenPage from "./screens/mfa-enrollment-screen";
import ForgotPasswordAuthScreenWithHandlersPage from "./screens/forgot-password-auth-screen-w-handlers";

export const routes = [
  {
    name: "Sign In Screen",
    description: "A simple sign in screen with email and password",
    path: "/screens/sign-in-auth-screen",
    component: SignInAuthScreenPage,
  },
  {
    name: "Sign In Screen (with handlers)",
    description: "A simple sign in screen with email and password, with forgot password and register handlers",
    path: "/screens/sign-in-auth-screen-w-handlers",
    component: SignInAuthScreenWithHandlersPage,
  },
  {
    name: "Sign In Screen (with OAuth)",
    description: "A simple sign in screen with email and password, with oAuth buttons",
    path: "/screens/sign-in-auth-screen-w-oauth",
    component: SignInAuthScreenWithOAuthPage,
  },
  {
    name: "Sign Up Screen",
    description: "A simple sign up screen with email and password",
    path: "/screens/sign-up-auth-screen",
    component: SignUpAuthScreenPage,
  },
  {
    name: "Sign Up Screen (with handlers)",
    description: "A simple sign up screen with email and password, sign in handlers",
    path: "/screens/sign-up-auth-screen-w-handlers",
    component: SignUpAuthScreenWithHandlersPage,
  },
  {
    name: "Sign Up Screen (with OAuth)",
    description: "A simple sign in screen with email and password, with oAuth buttons",
    path: "/screens/sign-up-auth-screen-w-oauth",
    component: SignUpAuthScreenWithOAuthPage,
  },
  {
    name: "Email Link Auth Screen",
    description: "A screen allowing a user to send an email link for sign in",
    path: "/screens/email-link-auth-screen",
    component: EmailLinkAuthScreenPage,
  },
  {
    name: "Email Link Auth Screen (with OAuth)",
    description: "A screen allowing a user to send an email link for sign in, with oAuth buttons",
    path: "/screens/email-link-auth-screen-w-oauth",
    component: EmailLinkAuthScreenWithOAuthPage,
  },
  {
    name: "Forgot Password Screen",
    description: "A screen allowing a user to reset their password",
    path: "/screens/forgot-password-screen",
    component: ForgotPasswordAuthScreenPage,
  },
  {
    name: "Forgot Password Screen (with handlers)",
    description: "A screen allowing a user to reset their password, with handlers",
    path: "/screens/forgot-password-auth-screen-w-handlers",
    component: ForgotPasswordAuthScreenWithHandlersPage,
  },
  {
    name: "OAuth Screen",
    description: "A screen which allows a user to sign in with OAuth only",
    path: "/screens/oauth-screen",
    component: OAuthScreenPage,
  },
  {
    name: "Phone Auth Screen",
    description: "A screen allowing a user to sign in with a phone number",
    path: "/screens/phone-auth-screen",
    component: PhoneAuthScreenPage,
  },
  {
    name: "Phone Auth Screen (with OAuth)",
    description: "A screen allowing a user to sign in with a phone number, with oAuth buttons",
    path: "/screens/phone-auth-screen-w-oauth",
    component: PhoneAuthScreenWithOAuthPage,
  },
] as const;

export const hiddenRoutes = [
  {
    name: "MFA Enrollment Screen",
    description: "A screen allowing a user to enroll in multi-factor authentication",
    path: "/screens/mfa-enrollment-screen",
    component: MultiFactorAuthEnrollmentScreenPage,
  },
] as const;
