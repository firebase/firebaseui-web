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

import { useUser } from "@/lib/firebase/hooks";
import Link from "next/link";

export default function Home() {
  const user = useUser();

  return (
    <div className="p-8 ">
      <h1 className="text-3xl font-bold mb-6">Firebase UI Demo</h1>
      <div className="mb-6">
        {user && <div>Welcome: {user.email || user.phoneNumber}</div>}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Auth Screens</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <li>
            <Link
              href="/screens/sign-in-auth-screen"
              className="text-blue-500 hover:underline"
            >
              Sign In Auth Screen
            </Link>
          </li>
          <li>
            <Link
              href="/screens/sign-in-auth-screen-w-handlers"
              className="text-blue-500 hover:underline"
            >
              Sign In Auth Screen with Handlers
            </Link>
          </li>
          <li>
            <Link
              href="/screens/sign-in-auth-screen-w-oauth"
              className="text-blue-500 hover:underline"
            >
              Sign In Auth Screen with OAuth
            </Link>
          </li>
          <li>
            <Link
              href="/screens/email-link-auth-screen"
              className="text-blue-500 hover:underline"
            >
              Email Link Auth Screen
            </Link>
          </li>
          <li>
            <Link
              href="/screens/email-link-auth-screen-w-oauth"
              className="text-blue-500 hover:underline"
            >
              Email Link Auth Screen with OAuth
            </Link>
          </li>
          <li>
            <Link
              href="/screens/phone-auth-screen"
              className="text-blue-500 hover:underline"
            >
              Phone Auth Screen
            </Link>
          </li>
          <li>
            <Link
              href="/screens/phone-auth-screen-w-oauth"
              className="text-blue-500 hover:underline"
            >
              Phone Auth Screen with OAuth
            </Link>
          </li>
          <li>
            <Link
              href="/screens/sign-up-auth-screen"
              className="text-blue-500 hover:underline"
            >
              Sign Up Auth Screen
            </Link>
          </li>
          <li>
            <Link
              href="/screens/sign-up-auth-screen-w-oauth"
              className="text-blue-500 hover:underline"
            >
              Sign Up Auth Screen with OAuth
            </Link>
          </li>
          <li>
            <Link
              href="/screens/oauth-screen"
              className="text-blue-500 hover:underline"
            >
              OAuth Screen
            </Link>
          </li>
          <li>
            <Link
              href="/screens/password-reset-screen"
              className="text-blue-500 hover:underline"
            >
              Password Reset Screen
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
