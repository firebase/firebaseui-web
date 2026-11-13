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

import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { GoogleAuthProvider, updateProfile } from "firebase/auth";
import { Ellipsis, Lock, Mail, MailOpen, Phone, User } from "lucide-react";
import { signInAnonymously } from "@firebase-oss/ui-core";
import {
  GoogleLogo,
  useEmailLinkAuthFormAction,
  useEmailLinkAuthFormSchema,
  useForgotPasswordAuthFormAction,
  useSignInAuthFormAction,
  useSignInWithProvider,
  useSignUpAuthFormAction,
  useUI,
} from "@firebase-oss/ui-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { useAuthTask } from "../components";
import { paths, useDemo } from "../state";
import { ProButton, ProDivider, ProError, ProField, ProHeader, ProLegal, ProPage, ProPrompt } from "./kit";

function useValidEmail(email: string) {
  return useEmailLinkAuthFormSchema().safeParse({ email }).success;
}

/** Providers first, then email and password on the same screen; there is no email-first step. */
export function ProSignIn() {
  const ui = useUI();
  const navigate = useNavigate();
  const { email, setEmail, linkError } = useDemo();
  const [password, setPassword] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const validEmail = useValidEmail(email);

  const google = useMemo(() => new GoogleAuthProvider(), []);
  const { callback: signInWithGoogle, error: googleError } = useSignInWithProvider(google);
  const signIn = useSignInAuthFormAction();
  const task = useAuthTask();
  const busy = ui.state !== "idle";

  return (
    <ProPage
      brand
      title="Sign in to your account"
      subtitle="Welcome back. Choose how you'd like to continue."
      footer={<ProLegal lead="By continuing, you agree to the" />}
    >
      <div className="pro-stack pro-stack--tight">
        <ProButton variant="outline" icon={<GoogleLogo />} onClick={signInWithGoogle} disabled={busy}>
          Continue with Google
        </ProButton>
        <ProButton variant="outline" icon={<Phone />} onClick={() => navigate(paths.phone)} disabled={busy}>
          Continue with phone
        </ProButton>
        <ProButton variant="outline" icon={<Ellipsis />} onClick={() => setMoreOpen(true)} disabled={busy}>
          More sign-in options
        </ProButton>
      </div>
      <ProDivider>or continue with email</ProDivider>
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void task.run(() => signIn({ email, password }));
        }}
      >
        <ProField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <ProField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          action={{ label: "Forgot password?", onClick: () => navigate(paths.resetPassword) }}
        />
        <ProError>{task.error ?? googleError ?? linkError}</ProError>
        <ProButton type="submit" disabled={!validEmail || !password} loading={task.pending}>
          Sign in
        </ProButton>
      </form>
      <ProButton variant="text" onClick={() => navigate(paths.emailLink)}>
        Email me a sign-in link
      </ProButton>
      <ProPrompt prompt="Don't have an account?" action="Create account" onClick={() => navigate(paths.signUp)} />

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="pro-dialog" showCloseButton={false}>
          <DialogTitle className="pro-title">Other sign in methods</DialogTitle>
          <DialogDescription className="pro-subtitle">Try the demo without creating an account.</DialogDescription>
          <div className="pro-content pro-stack pro-stack--tight">
            <ProButton
              variant="outline"
              icon={<User />}
              onClick={() => {
                setMoreOpen(false);
                void task.run(() => signInAnonymously(ui));
              }}
            >
              Continue as guest
            </ProButton>
            <ProButton variant="text" onClick={() => setMoreOpen(false)}>
              Cancel
            </ProButton>
          </div>
        </DialogContent>
      </Dialog>
    </ProPage>
  );
}

export function ProSignUp() {
  const navigate = useNavigate();
  const { email, setEmail } = useDemo();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const validEmail = useValidEmail(email);
  const signUp = useSignUpAuthFormAction();
  const task = useAuthTask();

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const complete = name.trim() && validEmail && password && password === confirmPassword;

  return (
    <ProPage
      onBack={() => navigate(paths.email)}
      title="Create your account"
      subtitle="Sign up with your email. It takes less than a minute."
      footer={<ProLegal lead="By creating an account, you agree to the" />}
    >
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          const displayName = name.trim();
          void task.run(async () => {
            const credential = await signUp({ email, password, displayName });
            if (!credential) return;
            // Core only saves the name when the requireDisplayName behavior is configured, which this example doesn't use.
            await updateProfile(credential.user, { displayName });
            // Refreshing the token fires onIdTokenChanged, so the account page re-renders with the name.
            await credential.user.getIdToken(true);
          });
        }}
      >
        <ProField
          label="Name"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <ProField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <ProField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <ProField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          invalid={mismatch}
          hint={mismatch ? "Passwords don't match" : undefined}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <ProError>{task.error}</ProError>
        <ProButton type="submit" disabled={!complete} loading={task.pending}>
          Create account
        </ProButton>
      </form>
      <ProPrompt prompt="Already have an account?" action="Sign in" onClick={() => navigate(paths.email)} />
    </ProPage>
  );
}

type SentProps = { title: string; subtitle: string; children: ReactNode };

function SentPage({ title, subtitle, children }: SentProps) {
  return (
    <main className="pro-page">
      <ProHeader icon={MailOpen} title={title} subtitle={subtitle} />
      <div className="pro-content">{children}</div>
    </main>
  );
}

export function ProResetPassword() {
  const navigate = useNavigate();
  const { email, setEmail } = useDemo();
  const [sent, setSent] = useState(false);
  const validEmail = useValidEmail(email);
  const sendReset = useForgotPasswordAuthFormAction();
  const task = useAuthTask();

  if (sent) {
    return (
      <SentPage title="Check your inbox" subtitle={`We sent a link to reset your password to ${email}.`}>
        <ProButton onClick={() => navigate(paths.email)}>Back to sign in</ProButton>
      </SentPage>
    );
  }

  return (
    <ProPage
      onBack={() => navigate(paths.email)}
      icon={Lock}
      title="Reset your password"
      subtitle="Enter the email you sign in with and we'll send you a link to choose a new password."
    >
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void task.run(() => sendReset({ email }).then(() => setSent(true)));
        }}
      >
        <ProField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <ProError>{task.error}</ProError>
        <ProButton type="submit" disabled={!validEmail} loading={task.pending}>
          Send reset link
        </ProButton>
      </form>
    </ProPage>
  );
}

export function ProEmailLink() {
  const navigate = useNavigate();
  const { email, setEmail, linkError } = useDemo();
  const [sent, setSent] = useState(false);
  const validEmail = useValidEmail(email);
  const sendLink = useEmailLinkAuthFormAction();
  const task = useAuthTask();

  if (sent) {
    return (
      <SentPage
        title="Check your inbox"
        subtitle={`We sent a sign-in link to ${email}. Open it on this device to finish signing in.`}
      >
        <ProButton variant="text" onClick={() => setSent(false)}>
          Use a different email
        </ProButton>
      </SentPage>
    );
  }

  return (
    <ProPage
      onBack={() => navigate(paths.email)}
      icon={Mail}
      title="Sign in with a link"
      subtitle="We'll email you a link that signs you in, no password needed."
    >
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void task.run(() => sendLink({ email }).then(() => setSent(true)));
        }}
      >
        <ProField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <ProError>{task.error ?? linkError}</ProError>
        <ProButton type="submit" disabled={!validEmail} loading={task.pending}>
          Send link
        </ProButton>
      </form>
    </ProPage>
  );
}
