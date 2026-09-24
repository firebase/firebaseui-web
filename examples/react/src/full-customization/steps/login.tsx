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

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useEmailLinkAuthFormAction,
  useEmailLinkAuthFormSchema,
  useForgotPasswordAuthFormAction,
  useSignInAuthFormAction,
} from "@firebase-oss/ui-react";

import { Actions, Button, ErrorText, Links, Page, TextField, TextLink, useAuthTask } from "../components";
import { paths, useDemo } from "../state";

/**
 * Password sign in, with the password reset and email link modes inline, as in the Android demo.
 * Signing in is picked up by the demo root, which moves to the account page or the MFA challenge.
 */
export function LoginStep() {
  const navigate = useNavigate();
  const { email, setEmail } = useDemo();
  // Arriving here without an address (a refresh, or an email link) makes the field editable.
  const [emailLocked] = useState(email.length > 0);
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const signIn = useSignInAuthFormAction();
  const sendReset = useForgotPasswordAuthFormAction();
  const sendLink = useEmailLinkAuthFormAction();
  const emailSchema = useEmailLinkAuthFormSchema();
  const task = useAuthTask();

  // Both links need an address. Rather than disabling them silently, say what is missing.
  const withEmail = (send: () => Promise<void>) => () => {
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      task.setError(result.error.issues[0]?.message ?? null);
      return;
    }
    void task.run(send);
  };

  return (
    <Page title="Login" prompt="Enter your password to continue.">
      <form
        className="fc-form"
        onSubmit={(event) => {
          event.preventDefault();
          void task.run(() => signIn({ email, password }));
        }}
      >
        <TextField
          icon="alternate_email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          disabled={emailLocked}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          icon="lock"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Links>
          <TextLink disabled={resetSent} onClick={withEmail(() => sendReset({ email }).then(() => setResetSent(true)))}>
            {resetSent ? "Reset link sent!" : "Forgot password?"}
          </TextLink>
          <TextLink onClick={() => navigate(paths.email)}>Use a different email</TextLink>
        </Links>
        <ErrorText>{task.error}</ErrorText>
        <Actions>
          <Button type="submit" disabled={!password || !email} loading={task.pending}>
            Login
          </Button>
          <Button
            variant="secondary"
            disabled={linkSent}
            onClick={withEmail(() => sendLink({ email }).then(() => setLinkSent(true)))}
          >
            {linkSent ? "Login link sent!" : "Send login link"}
          </Button>
        </Actions>
      </form>
    </Page>
  );
}
