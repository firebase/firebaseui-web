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

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { GoogleAuthProvider } from "firebase/auth";
import { signInAnonymously } from "@firebase-oss/ui-core";
import { useEmailLinkAuthFormSchema, useSignInWithProvider, useUI } from "@firebase-oss/ui-react";

import { Actions, Button, ErrorText, Page, ProviderButton, TextField, useAuthTask } from "../components";
import { paths, useDemo } from "../state";

/** The landing screen from the web Figma frames: one email field, then the chosen next step. */
export function EmailEntryStep() {
  const ui = useUI();
  const navigate = useNavigate();
  const { email, setEmail } = useDemo();
  const emailSchema = useEmailLinkAuthFormSchema();
  const isValidEmail = emailSchema.safeParse({ email }).success;

  const google = useMemo(() => new GoogleAuthProvider(), []);
  const { callback: signInWithGoogle, error: googleError } = useSignInWithProvider(google);
  const guest = useAuthTask();
  const busy = ui.state !== "idle";

  return (
    <Page
      title="Hey there, Welcome"
      prompt="Enter your email address to continue."
      footer={
        <footer className="fc-footer">
          <p className="fc-footer__label">Other sign in methods</p>
          <div className="fc-providers">
            <ProviderButton provider="google" onClick={signInWithGoogle} disabled={busy}>
              Sign in with Google
            </ProviderButton>
            <ProviderButton provider="phone" onClick={() => navigate(paths.phone)} disabled={busy}>
              Sign in with phone
            </ProviderButton>
            <ProviderButton provider="guest" onClick={() => guest.run(() => signInAnonymously(ui))} disabled={busy}>
              Sign in as a guest
            </ProviderButton>
          </div>
          <ErrorText>{googleError ?? guest.error}</ErrorText>
        </footer>
      }
    >
      <form
        className="fc-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (isValidEmail) navigate(paths.login);
        }}
      >
        <TextField
          icon="alternate_email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Actions>
          <Button type="submit" disabled={!isValidEmail}>
            Continue
          </Button>
          <Button variant="secondary" onClick={() => navigate(paths.signUp)}>
            Create account
          </Button>
        </Actions>
      </form>
    </Page>
  );
}
