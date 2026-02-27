/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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

import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router";

const PROVIDER_MISMATCH_MESSAGE =
  "This account may have been created using a different sign-in method. Try signing in with another method or reset your password.";

export default function SignInAuthScreenProviderGuidancePage() {
  const navigate = useNavigate();
  const ui = useUI();
  const db = getDatabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Attempt login first
      await signInWithEmailAndPassword(ui, email, password);
      navigate("/"); // success
    } catch (err) {
      if (err instanceof FirebaseUIError) {
        // Only show provider guidance if password is wrong
        // This is the error you will need to catch and handle in your app
        if (err.code === "auth/wrong-password") {
          try {
            // Normalize email for DB lookup
            const safeEmail = email.trim().toLowerCase().replace(/\./g, ",");
            const snapshot = await get(ref(db, `usersByEmail/${safeEmail}`));

            if (snapshot.exists()) {
              const provider = snapshot.val().provider;
              if (provider !== "password") {
                setError(PROVIDER_MISMATCH_MESSAGE);
                return; // stop here
              }
            }
          } catch (dbErr) {
            setError("Error getting user by email: " + String(dbErr));
          }
        }

        // If not wrong-password or no provider guidance, show original error
        setError(err.message);
      } else if (err?.code || err?.message) {
        setError(err.message || err.code);
      } else {
        setError("Unexpected error occurred.");
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

              {error && (
                <div role="alert" className="fui-form__error">
                  {error}
                </div>
              )}

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
