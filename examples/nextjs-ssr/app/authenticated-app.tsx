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

import { multiFactor, sendEmailVerification, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/firebase/hooks";
import { auth } from "@/lib/firebase/clientApp";
import { type User } from "firebase/auth";

export function AuthenticatedApp({ initialUser }: { initialUser: User | null }) {
  const user = useUser(initialUser);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const mfa = multiFactor(user);

  return (
    <div className="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 space-y-4">
        <h1 className="text-md font-medium">Welcome, {user.displayName || user.email || user.phoneNumber}</h1>
        {user.email ? (
          <>
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
          </>
        ) : null}

        <hr className="opacity-30" />
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
            router.push("/screens/mfa-enrollment-screen");
          }}
        >
          Add MFA Factor &rarr;
        </button>
        <hr className="opacity-30" />
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
