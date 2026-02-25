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

import { OAuthScreen } from "@firebase-oss/ui-react";
import { useNavigate } from "react-router";
import { LineSignInButton } from "../custom-auth-buttons/line-sign-in-button";
import { SnapchatSignInButton } from "../custom-auth-buttons/snapchat-sign-in-button";

export default function CustomAuthScreenPage() {
  const navigate = useNavigate();

  return (
    <OAuthScreen onSignIn={() => navigate("/")}>
      <LineSignInButton />
      <SnapchatSignInButton />
    </OAuthScreen>
  );
}
