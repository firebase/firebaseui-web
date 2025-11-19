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

import { cn } from "@/lib/utils";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, PolicyContext } from "@invertase/firebaseui-react";
import { cloneElement, useContext } from "react";

export function Policies() {
  const ui = useUI();
  const policies = useContext(PolicyContext);

  if (!policies) {
    return null;
  }

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const termsAndPrivacyText = getTranslation(ui, "messages", "termsAndPrivacy");
  const parts = termsAndPrivacyText.split(/(\{tos\}|\{privacy\})/);

  const className = cn("hover:underline font-semibold");
  const Handler = onNavigate ? (
    <button className={className} />
  ) : (
    <a target="_blank" rel="noopener noreferrer" className={className} />
  );

  return (
    <div className="text-text-muted text-center text-xs">
      {parts.map((part: string, index: number) => {
        if (part === "{tos}") {
          return cloneElement(Handler, {
            key: index,
            onClick: onNavigate ? () => onNavigate(termsOfServiceUrl) : undefined,
            href: onNavigate ? undefined : termsOfServiceUrl,
            children: getTranslation(ui, "labels", "termsOfService"),
          });
        }

        if (part === "{privacy}") {
          return cloneElement(Handler, {
            key: index,
            onClick: onNavigate ? () => onNavigate(privacyPolicyUrl) : undefined,
            href: onNavigate ? undefined : privacyPolicyUrl,
            children: getTranslation(ui, "labels", "privacyPolicy"),
          });
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
