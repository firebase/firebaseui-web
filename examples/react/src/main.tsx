/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserRouter, Routes, Route } from "react-router";

import ReactDOM from "react-dom/client";
import { FirebaseUIProvider } from "@firebase-ui/react";

import { ui } from "./firebase/firebase";

import App from "./App";
import { Header } from "./components/header";

/** Sign In */
import SignInAuthScreenPage from "./screens/sign-in-auth-screen";
import SignInAuthScreenWithHandlersPage from "./screens/sign-in-auth-screen-w-handlers";
import SignInAuthScreenWithOAuthPage from "./screens/sign-in-auth-screen-w-oauth";

/** Email */
import EmailLinkAuthScreenPage from "./screens/email-link-auth-screen";
import EmailLinkAuthScreenWithOAuthPage from "./screens/email-link-auth-screen-w-oauth";

/** Phone Auth */
import PhoneAuthScreenPage from "./screens/phone-auth-screen";
import PhoneAuthScreenWithOAuthPage from "./screens/phone-auth-screen-w-oauth";

/** Sign up */
import SignUpAuthScreenPage from "./screens/sign-up-auth-screen";
import SignUpAuthScreenWithOAuthPage from "./screens/sign-up-auth-screen";

/** oAuth */
import OAuthScreenPage from "./screens/oauth-screen";

/** Password Reset */
import ForgotPasswordPage from "./screens/forgot-password-screen";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Header />
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: "https://www.google.com",
        privacyPolicyUrl: "https://www.google.com",
      }}
    >
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/screens/sign-in-auth-screen" element={<SignInAuthScreenPage />} />
        <Route path="/screens/sign-in-auth-screen-w-handlers" element={<SignInAuthScreenWithHandlersPage />} />
        <Route path="/screens/sign-in-auth-screen-w-oauth" element={<SignInAuthScreenWithOAuthPage />} />
        <Route path="/screens/email-link-auth-screen" element={<EmailLinkAuthScreenPage />} />
        <Route path="/screens/email-link-auth-screen-w-oauth" element={<EmailLinkAuthScreenWithOAuthPage />} />
        <Route path="/screens/phone-auth-screen" element={<PhoneAuthScreenPage />} />
        <Route path="/screens/phone-auth-screen-w-oauth" element={<PhoneAuthScreenWithOAuthPage />} />
        <Route path="/screens/sign-up-auth-screen" element={<SignUpAuthScreenPage />} />
        <Route path="/screens/sign-up-auth-screen-w-oauth" element={<SignUpAuthScreenWithOAuthPage />} />
        <Route path="/screens/oauth-screen" element={<OAuthScreenPage />} />
        <Route path="/screens/forgot-password-screen" element={<ForgotPasswordPage />} />
      </Routes>
    </FirebaseUIProvider>
  </BrowserRouter>
);
