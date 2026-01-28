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

import type { SVGProps } from "react";
const SvgLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="-271 324 256 153"
    {...props}
  >
    <path d="M-37.5 356.3h.2l7.1-10.3h-.4l.7-1.1h-99.9l3.9 15.7h27.3l-46 41.5c-9.4-13-31.4-39.9-46.7-62.3h34.4v-12l.4-2.6c-.1 0-.3-.1-.4-.1V324H-271v15.8h33.8c13.1 10.3 63.4 73 65.4 79.2.8 5.9 1.6 40.4-.9 43-4.9 5.2-27.5 3.8-32.9 4.2l-1.9 10.7c9.9.3 42.2-.8 52.2-.8 19.8 0 54.4-.1 59.3.3l.6-11.2c-5-.8-32.3-.1-36-1-.8-5.4-1.7-41.8-.9-45.6 3.9-10.9 61.2-55.1 67.5-56.8 1.4-.3 3.5-.8 5.9-1.3h18.5z" />
    <path d="m-48.2 447.8 15.3 1.2 17.9-69c-3-.1-30.1-2.7-33.6-3.3zM-50.8 458.9l.1 16.8 7.7.7 8.4.6 2.5-16.5-8.9-.4z" />
  </svg>
);
export default SvgLogo;
