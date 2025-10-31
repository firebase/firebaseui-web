import { cn } from "@/lib/utils";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, PolicyContext } from "@firebase-oss/ui-react";
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
