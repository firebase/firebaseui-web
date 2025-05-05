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

'use client';

import { NavLink } from "react-router";
import { useUser } from "../firebase/hooks";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase/clientApp";

export function Header() {
  const user = useUser();

  async function onSignOut() {
    await signOut(auth);
    router.push("/sign-in");
  }

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto h-12 flex items-center">
        <div className="font-bold">
          <NavLink to="/">FirebaseUI</NavLink>
        </div>
        <div className="flex-grow flex items-center justify-end">
          <ul className="text-sm flex items-center gap-6 *:hover:opacity-75">
            {user ? <li><button onClick={onSignOut}>Sign Out</button></li> : <li><NavLink to="/sign-in">Sign In</NavLink></li>}
          </ul>
        </div>
      </div>
    </header>
  );
}