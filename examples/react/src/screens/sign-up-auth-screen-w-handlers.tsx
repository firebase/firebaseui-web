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

import { SignUpAuthScreen } from "@invertase/firebaseui-react";
import { useNavigate } from "react-router";

export default function SignUpAuthScreenWithHandlersPage() {
  const navigate = useNavigate();

  return (
    <SignUpAuthScreen
      onSignInClick={() => {
        navigate("/screens/sign-in-auth-screen");
      }}
      onSignUp={(credential) => {
        console.log(credential);
        navigate("/");
      }}
    />
  );
}
