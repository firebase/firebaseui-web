/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserRouter, Route, Routes } from "react-router";

import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import ReactDOM from "react-dom/client";

import { ui } from "./firebase/firebase";

import App from "./App";
import { Header } from "./components/header";

/** Sign In */
import { EmailLinkAuthScreen } from "@/components/email-link-auth-screen";
import { ForgotPasswordAuthScreen } from "@/components/forgot-password-auth-screen";
import { SignInAuthScreen } from "@/components/sign-in-auth-screen";
import { SignUpAuthScreen } from "@/components/sign-up-auth-screen";

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
        <Route path="/screens/sign-in-auth-screen" element={<SignInAuthScreen />} />
        {/* <Route path="/screens/sign-in-auth-screen-w-handlers" element={<SignInAuthScreenWithHandlers />} /> */}
        {/* <Route path="/screens/sign-in-auth-screen-w-oauth" element={<SignInAuthScreenWithOAuth />} /> */}
        <Route path="/screens/email-link-auth-screen" element={<EmailLinkAuthScreen />} />
        {/* <Route path="/screens/email-link-auth-screen-w-oauth" element={<EmailLinkAuthScreenWithOAuth />} /> */}
        {/* <Route path="/screens/phone-auth-screen" element={<PhoneAuthScreen />} /> */}
        {/* <Route path="/screens/phone-auth-screen-w-oauth" element={<PhoneAuthScreenWithOAuth />} /> */}
        <Route path="/screens/sign-up-auth-screen" element={<SignUpAuthScreen />} />
        {/* <Route path="/screens/sign-up-auth-screen-w-oauth" element={<SignUpAuthScreenWithOAuth />} /> */}
        {/* <Route path="/screens/oauth-screen" element={<OAuthScreen />} /> */}
        <Route path="/screens/forgot-password-screen" element={<ForgotPasswordAuthScreen />} />
      </Routes>
    </FirebaseUIProvider>
  </BrowserRouter>
);
