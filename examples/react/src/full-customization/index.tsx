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
import { useUI } from "@firebase-oss/ui-react";

import { useUser } from "~/firebase/hooks";
import "./full-customization.css";
import { DemoProvider, paths } from "./state";
import { ThemeArt, ThemeSwitcher, useTheme } from "./theme";
import { AccountStep } from "./steps/account";
import { EmailEntryStep } from "./steps/email-entry";
import { LoginStep } from "./steps/login";
import { MfaChallengeStep } from "./steps/mfa-challenge";
import { MfaEnrollmentStep } from "./steps/mfa-enrollment";
import { PhoneStep } from "./steps/phone";
import { SignUpStep } from "./steps/sign-up";

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

  return (
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
          <MfaChallengeStep />
        ) : (
          <Routes>
            <Route index element={signedOut(<EmailEntryStep />)} />
            <Route path="login" element={signedOut(<LoginStep />)} />
            <Route path="sign-up" element={signedOut(<SignUpStep />)} />
            <Route path="phone" element={signedOut(<PhoneStep />)} />
            <Route
              path="account"
              element={signedIn((u) => (
                <AccountStep user={u} />
              ))}
            />
            <Route
              path="account/two-factor"
              element={signedIn((u) => (
                <MfaEnrollmentStep user={u} />
              ))}
            />
            <Route path="*" element={<Navigate to={paths.email} replace />} />
          </Routes>
        )}
      </DemoProvider>
    </div>
  );
}
