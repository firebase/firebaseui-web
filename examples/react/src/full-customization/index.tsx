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

import { useEffect, useState, type ReactElement } from "react";
import { Link, Navigate, Route, Routes } from "react-router";
import type { User } from "firebase/auth";
import { completeEmailLinkSignIn } from "@firebase-oss/ui-core";
import { useMultiFactorAssertionCleanup, useUI } from "@firebase-oss/ui-react";

import { useUser } from "~/firebase/hooks";
import "./full-customization.css";
import { DemoProvider, paths } from "./state";
import { ProAccount } from "./professional/account";
import { ProMfaChallengeStep } from "./professional/mfa-challenge";
import { ProMfaEnrollment } from "./professional/mfa-enrollment";
import { ProPhone } from "./professional/phone";
import { ProEmailLink, ProResetPassword, ProSignIn, ProSignUp } from "./professional/sign-in";
import { ThemeArt, ThemeIdContext, ThemeSwitcher, useTheme } from "./theme";
import { AccountStep } from "./steps/account";
import { EmailEntryStep } from "./steps/email-entry";
import { LoginStep } from "./steps/login";
import { MfaChallengeStep } from "./steps/mfa-challenge";
import { MfaEnrollmentStep } from "./steps/mfa-enrollment";
import { PhoneStep } from "./steps/phone";
import { SignUpStep } from "./steps/sign-up";

/** Owns the sign-in resolver, so switching theme mid-challenge swaps the screen without cancelling the sign in. */
function SignInChallenge({ children }: { children: ReactElement }) {
  useMultiFactorAssertionCleanup();
  return children;
}

/**
 * A complete sign in flow with its own UI, where FirebaseUI supplies only the auth logic through
 * the ui-react action hooks. Sign in state drives the routing: a signed-in user is sent to the
 * account page, and a pending multi-factor challenge takes over whichever screen raised it.
 */
export default function FullCustomizationDemo() {
  const ui = useUI();
  const user = useUser();
  const [theme, setTheme] = useTheme();

  // Completes sign in when the page is opened from a link sent by "Send login link". The ui-react hook for this
  // drops failures, so the demo calls core directly and shows an expired or used link on the login screen.
  const [linkError, setLinkError] = useState<string | null>(null);
  useEffect(() => {
    completeEmailLinkSignIn(ui, window.location.href).catch((error) =>
      setLinkError(error instanceof Error ? error.message : String(error))
    );
    // Runs once on mount, like useEmailLinkAuthFormCompleteSignIn; ui is deliberately not a dependency.
  }, []);

  const signedOut = (step: ReactElement) => (user ? <Navigate to={paths.account} replace /> : step);
  const signedIn = (step: (user: User) => ReactElement) => (user ? step(user) : <Navigate to={paths.email} replace />);

  // Professional brings its own screens; the other themes share one set and differ only in styling.
  const pro = theme === "professional";
  const screens = pro
    ? {
        email: <ProSignIn />,
        login: <ProSignIn />,
        signUp: <ProSignUp />,
        phone: <ProPhone />,
        resetPassword: <ProResetPassword />,
        emailLink: <ProEmailLink />,
        account: (u: User) => <ProAccount user={u} />,
        twoFactor: (u: User) => <ProMfaEnrollment user={u} />,
        challenge: <ProMfaChallengeStep />,
      }
    : {
        email: <EmailEntryStep />,
        login: <LoginStep />,
        signUp: <SignUpStep />,
        phone: <PhoneStep />,
        resetPassword: <LoginStep />,
        emailLink: <LoginStep />,
        account: (u: User) => <AccountStep user={u} />,
        twoFactor: (u: User) => <MfaEnrollmentStep user={u} />,
        challenge: <MfaChallengeStep />,
      };

  return (
    <ThemeIdContext.Provider value={theme}>
      <div className="fc-root" data-theme={theme}>
        <ThemeArt theme={theme} />
        <Link className="fc-exit" to="/" aria-label="All examples">
          <span className="fc-icon" aria-hidden="true">
            arrow_back
          </span>
          <span className="fc-exit__label">All examples</span>
        </Link>
        <ThemeSwitcher theme={theme} onChange={setTheme} />
        <DemoProvider linkError={linkError}>
          {/* A signed-in user with a resolver is reauthenticating; the reauth dialog completes that one. */}
          {ui.multiFactorResolver && !user ? (
            <SignInChallenge>{screens.challenge}</SignInChallenge>
          ) : (
            <Routes>
              <Route index element={signedOut(screens.email)} />
              <Route path="login" element={signedOut(screens.login)} />
              <Route path="sign-up" element={signedOut(screens.signUp)} />
              <Route path="phone" element={signedOut(screens.phone)} />
              <Route path="reset-password" element={signedOut(screens.resetPassword)} />
              <Route path="email-link" element={signedOut(screens.emailLink)} />
              <Route path="account" element={signedIn(screens.account)} />
              <Route path="account/two-factor" element={signedIn(screens.twoFactor)} />
              <Route path="*" element={<Navigate to={paths.email} replace />} />
            </Routes>
          )}
        </DemoProvider>
      </div>
    </ThemeIdContext.Provider>
  );
}
