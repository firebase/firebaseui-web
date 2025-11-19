"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useUI } from "@firebase-oss/ui-react";
import {
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type MultiFactorInfo,
  type UserCredential,
} from "firebase/auth";
import { useState, type ComponentProps } from "react";
import { useMultiFactorAssertionCleanup } from "@firebase-oss/ui-react";

import { SmsMultiFactorAssertionForm } from "@/components/sms-multi-factor-assertion-form";
import { TotpMultiFactorAssertionForm } from "@/components/totp-multi-factor-assertion-form";
import { Button } from "@/components/ui/button";

export type MultiFactorAuthAssertionFormProps = {
  onSuccess?: (credential: UserCredential) => void;
};

export function MultiFactorAuthAssertionForm({ onSuccess }: MultiFactorAuthAssertionFormProps) {
  const ui = useUI();
  const resolver = ui.multiFactorResolver;
  const mfaAssertionFactorPrompt = getTranslation(ui, "prompts", "mfaAssertionFactorPrompt");

  useMultiFactorAssertionCleanup();

  if (!resolver) {
    throw new Error("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  }

  // If only a single hint is provided, select it by default to improve UX.
  const [hint, setHint] = useState<MultiFactorInfo | undefined>(
    resolver.hints.length === 1 ? resolver.hints[0] : undefined
  );

  if (hint) {
    if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
      return <SmsMultiFactorAssertionForm hint={hint} onSuccess={onSuccess} />;
    }

    if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
      return <TotpMultiFactorAssertionForm hint={hint} onSuccess={onSuccess} />;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{mfaAssertionFactorPrompt}</p>
      {resolver.hints.map((hint) => {
        if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
          return <TotpButton key={hint.factorId} onClick={() => setHint(hint)} />;
        }

        if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
          return <SmsButton key={hint.factorId} onClick={() => setHint(hint)} />;
        }

        return null;
      })}
    </div>
  );
}

function TotpButton(props: ComponentProps<typeof Button>) {
  const ui = useUI();
  const labelText = getTranslation(ui, "labels", "mfaTotpVerification");
  return <Button {...props}>{labelText}</Button>;
}

function SmsButton(props: ComponentProps<typeof Button>) {
  const ui = useUI();
  const labelText = getTranslation(ui, "labels", "mfaSmsVerification");
  return <Button {...props}>{labelText}</Button>;
}
