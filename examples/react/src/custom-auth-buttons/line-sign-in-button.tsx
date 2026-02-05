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

import { OAuthProvider, type UserCredential } from "firebase/auth";
import { OAuthButton } from "@firebase-oss/ui-react";

export type LineSignInButtonProps = {
  provider?: OAuthProvider;
  themed?: boolean | string;
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * Button for signing in with LINE (OIDC).
 */
export function LineSignInButton({ provider, ...props }: LineSignInButtonProps) {
  return (
    <OAuthButton {...props} provider={provider ?? new OAuthProvider("oidc.line")}>
      <span
        className="fui-provider__icon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1em",
          height: "1em",
          borderRadius: 2,
          backgroundColor: "#00c300",
          color: "#fff",
          fontSize: "0.65em",
          fontWeight: 700,
        }}
        aria-hidden
      >
        LINE
      </span>
      <span>Sign in with LINE</span>
    </OAuthButton>
  );
}
