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

"use client";

import {
  AppleSignInButton,
  EmailLinkAuthScreen,
  FacebookSignInButton,
  GitHubSignInButton,
  GoogleSignInButton,
  MicrosoftSignInButton,
  TwitterSignInButton,
  OAuthButton,
} from "@firebase-oss/ui-react";
import { OAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function EmailLinkAuthScreenWithOAuthPage() {
  const router = useRouter();

  return (
    <EmailLinkAuthScreen
      onEmailSent={() => {
        alert("Email has been sent - please check your email");
      }}
      onSignIn={(credential) => {
        console.log(credential);
        router.push("/");
      }}
    >
      <GoogleSignInButton />
      <FacebookSignInButton />
      <AppleSignInButton />
      <GitHubSignInButton />
      <MicrosoftSignInButton />
      <TwitterSignInButton />
      <LineSignInButton />
    </EmailLinkAuthScreen>
  );
}

function LineSignInButton() {
  const provider = new OAuthProvider("oidc.line");

  return (
    <OAuthButton provider={provider}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
        <path
          fill="#00c300"
          d="M12.5 42h23a6.5 6.5 0 0 0 6.5-6.5v-23A6.5 6.5 0 0 0 35.5 6h-23A6.5 6.5 0 0 0 6 12.5v23a6.5 6.5 0 0 0 6.5 6.5"
        />
        <path
          fill="#fff"
          d="M37.113 22.417c0-5.865-5.88-10.637-13.107-10.637s-13.108 4.772-13.108 10.637c0 5.258 4.663 9.662 10.962 10.495.427.092 1.008.282 1.155.646.132.331.086.85.042 1.185 0 0-.153.925-.187 1.122-.057.331-.263 1.296 1.135.707s7.548-4.445 10.298-7.611h-.001c1.901-2.082 2.811-4.197 2.811-6.544m-18.238 3.49h-2.604a.69.69 0 0 1-.687-.688V20.01a.688.688 0 0 1 1.374 0v4.521h1.917a.688.688 0 0 1 0 1.376m2.693-.688a.688.688 0 1 1-1.374 0V20.01a.688.688 0 0 1 1.374 0zm6.27 0a.684.684 0 0 1-.688.688.69.69 0 0 1-.549-.275l-2.669-3.635v3.222a.689.689 0 0 1-1.376 0V20.01a.687.687 0 0 1 1.237-.412l2.67 3.635V20.01a.688.688 0 0 1 1.375 0zm4.214-3.292a.689.689 0 0 1 0 1.375h-1.917v1.23h1.917a.688.688 0 0 1 0 1.375h-2.604a.69.69 0 0 1-.687-.688v-5.208c0-.379.308-.687.687-.687h2.604a.688.688 0 1 1 0 1.374h-1.917v1.23h1.917z"
        />
      </svg>
      <span>Sign in with Line</span>
    </OAuthButton>
  );
}
