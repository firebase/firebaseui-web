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
import { useSignUpAuthFormAction } from "@firebase-oss/ui-react";

import { Actions, Button, ErrorText, Links, Page, TextField, TextLink, useAuthTask } from "../components";
import { paths, useDemo } from "../state";

export function SignUpStep() {
  const navigate = useNavigate();
  const { email, setEmail } = useDemo();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUp = useSignUpAuthFormAction();
  const task = useAuthTask();

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const complete = firstName.trim() && lastName.trim() && email && password && password === confirmPassword;

  return (
    <Page title="Sign up" prompt="Create an account to continue.">
      <form
        className="fc-form"
        onSubmit={(event) => {
          event.preventDefault();
          const displayName = `${firstName.trim()} ${lastName.trim()}`;
          void task.run(() => signUp({ email, password, displayName }));
        }}
      >
        <div className="fc-row">
          <TextField
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <TextField
            autoComplete="family-name"
            placeholder="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <TextField
          icon="alternate_email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          icon="lock"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextField
          icon="lock"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirmPassword}
          invalid={mismatch}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <ErrorText>{mismatch ? "Passwords don't match" : task.error}</ErrorText>
        <Links>
          <TextLink onClick={() => navigate(paths.login)}>Already have an account?</TextLink>
          <TextLink onClick={() => navigate(paths.email)}>Use a different email</TextLink>
        </Links>
        <Actions>
          <Button type="submit" disabled={!complete} loading={task.pending}>
            Sign up
          </Button>
        </Actions>
      </form>
    </Page>
  );
}
