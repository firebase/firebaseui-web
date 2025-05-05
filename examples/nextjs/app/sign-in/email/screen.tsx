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
import { EmailLinkAuthScreen } from "@firebase-ui/react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Screen() {
  const router = useRouter();
  const user = useUser();

  // If the user signs in, redirect to the home page from the client.
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return <EmailLinkAuthScreen />;
}
