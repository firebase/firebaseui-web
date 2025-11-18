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

import { useUI } from "@firebase-oss/ui-react";
import { enUs } from "@firebase-oss/ui-translations";
import { pirate } from "../pirate";

export function PirateToggle() {
  const ui = useUI();
  const isPirate = ui.locale.locale === "pirate";

  return (
    <button
      className="fixed z-10 size-10 top-8 right-20 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
      onClick={() => {
        if (isPirate) {
          ui.setLocale(enUs);
        } else {
          ui.setLocale(pirate);
        }
      }}
    >
      {isPirate ? "🇺🇸" : "🏴‍☠️"}
    </button>
  );
}
