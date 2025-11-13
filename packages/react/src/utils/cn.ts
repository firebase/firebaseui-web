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

import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

/**
 * Utility function for merging and deduplicating CSS class names.
 *
 * Combines clsx for conditional class names with tailwind-merge to handle Tailwind CSS class conflicts.
 *
 * @param inputs - Variable number of class name arguments (strings, objects, arrays, etc.).
 * @returns A merged and deduplicated string of class names.
 */
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}
