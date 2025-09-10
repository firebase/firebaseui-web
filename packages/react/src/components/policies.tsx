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

import { getTranslation } from "@firebase-ui/core";
import { createContext, useContext } from "react";
import { useUI } from "~/hooks";

type Url =
  | string
  | URL
  | (() => string | URL | void)
  | Promise<string | URL | void>
  | (() => Promise<string | URL | void>);

export interface PolicyProps {
  termsOfServiceUrl: Url;
  privacyPolicyUrl: Url;
}

const PolicyContext = createContext<PolicyProps | undefined>(
  undefined
);

export function PolicyProvider({ children, policies }: { children: React.ReactNode, policies?: PolicyProps }) {
  return <PolicyContext.Provider value={policies}>{children}</PolicyContext.Provider>;
}

export function Policies() {
  const ui = useUI();
  const policies = useContext(PolicyContext);

  if (!policies) {
    return null;
  }

  const { termsOfServiceUrl, privacyPolicyUrl } = policies;

  async function handleUrl(urlOrFunction: Url) {
    let url: string | URL | void;

    if (typeof urlOrFunction === "function") {
      const urlOrPromise = urlOrFunction();
      if (typeof urlOrPromise === "string" || urlOrPromise instanceof URL) {
        url = urlOrPromise;
      } else {
        url = await urlOrPromise;
      }
    } else if (urlOrFunction instanceof Promise) {
      url = await urlOrFunction;
    } else {
      url = urlOrFunction;
    }

    if (url) {
      window.open(url.toString(), "_blank");
    }
  }

  const termsText = getTranslation(ui, "labels", "termsOfService");
  const privacyText = getTranslation(ui, "labels", "privacyPolicy");
  const termsAndPrivacyText = getTranslation(ui, "messages", "termsAndPrivacy");

  const parts = termsAndPrivacyText.split(/(\{tos\}|\{privacy\})/);

  return (
    <div className="text-text-muted text-xs text-start">
      {parts.map((part: string, index: number) => {
        if (part === "{tos}") {
          return (
            <a
              key={index}
              onClick={() => handleUrl(termsOfServiceUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:underline font-semibold"
            >
              {termsText}
            </a>
          );
        }
        if (part === "{privacy}") {
          return (
            <a
              key={index}
              onClick={() => handleUrl(privacyPolicyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:underline font-semibold"
            >
              {privacyText}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
