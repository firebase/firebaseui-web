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

import { Link, useNavigate } from "react-router";
import { routes } from "./routes";
import { useUser } from "./firebase/hooks";
import { auth } from "./firebase/firebase";
import { multiFactor, sendEmailVerification, signOut } from "firebase/auth";

function App() {
  const user = useUser();

  if (user) {
    return <AuthenticatedApp />;
  }

  return <UnauthenticatedApp />;
}

function UnauthenticatedApp() {
  return (
    <div className="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div className="text-center space-y-4">
        <img src="/firebase-logo-inverted.png" alt="Firebase UI" className="hidden dark:block h-36 mx-auto" />
        <img src="/firebase-logo.png" alt="Firebase UI" className="block dark:hidden h-36 mx-auto" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Welcome to Firebase UI, choose an example screen below to get started!
        </p>
      </div>
      <div className="border border-neutral-800 rounded divide-y divide-neutral-800 overflow-hidden">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="flex items-center justify-between hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 p-4"
          >
            <div className="space-y-1">
              <h2 className="font-medium text-sm">{route.name}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-300">{route.description}</p>
            </div>
            <div>
              <span className="text-xl">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const user = useUser()!;
  const mfa = multiFactor(user);
  const navigate = useNavigate();

  return (
    <div className="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div className="border border-neutral-800 rounded p-4 space-y-4">
        <h1 className="text-md font-medium">Welcome, {user.displayName || user.email || user.phoneNumber}</h1>
        {user.emailVerified ? (
          <div className="text-green-500">Email verified</div>
        ) : (
          <button
            className="bg-red-500 text-white px-3 py-1.5 rounded text-sm"
            onClick={async () => {
              try {
                await sendEmailVerification(user);
                alert("Email verification sent, please check your email");
              } catch (error) {
                console.error(error);
                alert("Error sending email verification, check console");
              }
            }}
          >
            Verify Email &rarr;
          </button>
        )}
        <hr className="opacity-20" />
        <h2 className="text-sm font-medium">Multi-factor Authentication</h2>
        {mfa.enrolledFactors.map((factor) => {
          return (
            <div key={factor.factorId}>
              {factor.factorId} - {factor.displayName}
            </div>
          );
        })}
        <button
          className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm"
          onClick={() => {
            navigate("/screens/mfa-enrollment-screen");
          }}
        >
          Add MFA Factor &rarr;
        </button>
        <hr className="opacity-20" />
        <button
          className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm"
          onClick={async () => await signOut(auth)}
        >
          Sign Out &rarr;
        </button>
      </div>
    </div>
  );
}

export default App;
