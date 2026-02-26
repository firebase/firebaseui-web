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
import {
  AppleSignInButton,
  Card,
  CardContent,
  CardHeader,
  CardSubtitle,
  CardTitle,
  Divider,
  GoogleSignInButton,
  FacebookSignInButton,
  GitHubSignInButton,
  MicrosoftSignInButton,
  TwitterSignInButton,
  YahooSignInButton,
  useUI,
  RedirectError,
} from "@firebase-oss/ui-react";
import { signInWithEmailAndPassword, getTranslation, FirebaseUIError } from "@firebase-oss/ui-core";
import { EmailAuthProvider, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate } from "react-router";

const PROVIDER_MISMATCH_MESSAGE =
  "This account may have been created using a different sign-in method. Try signing in with another method or reset your password.";

const PROVIDER_GUIDANCE_DOCS_URL = "https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection";

export default function SignInAuthScreenProviderGuidancePage() {
  const navigate = useNavigate();
  const ui = useUI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(ui, email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof FirebaseUIError) {
        // Set to true to display the raw error code instead of handling it (so you can see what to catch)
        const DEBUG_SHOW_ERROR_CODE = false;
        if (DEBUG_SHOW_ERROR_CODE) {
          setError(`Error code: ${err.code}`);
          setSubmitting(false);
          return;
        }

        const isInvalidCredentials = err.code === "auth/wrong-password";

        if (isInvalidCredentials) {
          let signInMethods: string[] | undefined;
          try {
            signInMethods = await fetchSignInMethodsForEmail(ui.auth, email);
          } catch {
            // Fall through to Firebase message if fetch fails
          }

          const accountExistsWithoutEmailPassword =
            Array.isArray(signInMethods) &&
            signInMethods.length > 0 &&
            !signInMethods.includes(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD);

          if (accountExistsWithoutEmailPassword) {
            setError(PROVIDER_MISMATCH_MESSAGE);
            setSubmitting(false);
            return;
          }
        }
        setError(err.message);
      } else {
        setError(getTranslation(ui, "errors", "unknownError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const signInLabel = getTranslation(ui, "labels", "signIn");
  const signInSubtitle = getTranslation(ui, "prompts", "signInToAccount");
  const emailLabel = getTranslation(ui, "labels", "emailAddress");
  const passwordLabel = getTranslation(ui, "labels", "password");
  const dividerLabel = getTranslation(ui, "messages", "dividerOr");

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-100">
        <h2 className="font-semibold mb-2">&quot;Different sign-in method&quot; message</h2>
        <p className="mb-3">
          This screen implements the flow manually: on email/password sign-in error we call{" "}
          <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">fetchSignInMethodsForEmail</code>{" "}
          and, if the account has no password method, show:
        </p>
        <blockquote className="border-l-2 border-amber-400 dark:border-amber-600 pl-3 my-2 italic">
          &quot;This account may have been created using a different sign-in method. Try signing in with another method
          or reset your password.&quot;
        </blockquote>
        <p className="mb-2">
          This only works when <strong>email enumeration protection</strong> is disabled.
        </p>
        <p className="mb-2 font-medium">How to enable:</p>
        <ol className="list-decimal list-inside space-y-1 mb-2">
          <li>
            Open{" "}
            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">
              Google Cloud Console
            </a>{" "}
            and select your project.
          </li>
          <li>
            Go to <strong>Identity Platform</strong> → <strong>Settings</strong>.
          </li>
          <li>
            Find <strong>Email enumeration protection</strong> and turn it <strong>off</strong>.
          </li>
        </ol>
        <a
          href={PROVIDER_GUIDANCE_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 dark:text-amber-300 underline"
        >
          Docs: Enable or disable email enumeration protection
        </a>
        <p className="mt-2 text-xs opacity-90">
          Trade-off: with it disabled, the API can reveal whether an email is registered.
        </p>
      </div>

      <div className="fui-screen">
        <Card>
          <CardHeader>
            <CardTitle>{signInLabel}</CardTitle>
            <CardSubtitle>{signInSubtitle}</CardSubtitle>
          </CardHeader>
          <CardContent>
            <form className="fui-form" onSubmit={handleSubmit}>
              <fieldset>
                <label className="fui-field__label" htmlFor="provider-guidance-email">
                  {emailLabel}
                </label>
                <input
                  id="provider-guidance-email"
                  type="email"
                  className="fui-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </fieldset>
              <fieldset>
                <label className="fui-field__label" htmlFor="provider-guidance-password">
                  {passwordLabel}
                </label>
                <input
                  id="provider-guidance-password"
                  type="password"
                  className="fui-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </fieldset>
              {error ? (
                <div role="alert" className="fui-form__error">
                  {error}
                </div>
              ) : null}
              <fieldset>
                <button type="submit" className="fui-button fui-button--primary" disabled={submitting}>
                  {submitting ? "..." : signInLabel}
                </button>
              </fieldset>
            </form>

            <Divider>{dividerLabel}</Divider>
            <div className="fui-screen__children space-y-2">
              <GoogleSignInButton />
              <FacebookSignInButton />
              <AppleSignInButton />
              <GitHubSignInButton />
              <MicrosoftSignInButton />
              <TwitterSignInButton />
              <YahooSignInButton />
              <RedirectError />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
