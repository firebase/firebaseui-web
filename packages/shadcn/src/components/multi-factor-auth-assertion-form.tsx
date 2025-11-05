"use client";

import {
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type UserCredential,
  type MultiFactorInfo,
} from "firebase/auth";
import { type ComponentProps, useState } from "react";
import { getTranslation } from "@firebase-ui/core";
import { useUI } from "@firebase-ui/react";

import { SmsMultiFactorAssertionForm } from "@/components/sms-multi-factor-assertion-form";
import { TotpMultiFactorAssertionForm } from "@/components/totp-multi-factor-assertion-form";
import { Button } from "@/components/ui/button";

export type MultiFactorAuthAssertionFormProps = {
  onSuccess?: (credential: UserCredential) => void;
};

export function MultiFactorAuthAssertionForm({ onSuccess }: MultiFactorAuthAssertionFormProps) {
  const ui = useUI();
  const resolver = ui.multiFactorResolver;

  if (!resolver) {
    throw new Error("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  }

  // If only a single hint is provided, select it by default to improve UX.
  const [hint, setHint] = useState<MultiFactorInfo | undefined>(
    resolver.hints.length === 1 ? resolver.hints[0] : undefined
  );

  if (hint) {
    if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
      return <SmsMultiFactorAssertionForm hint={hint} onSuccess={(credential) => onSuccess?.(credential)} />;
    }

    if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
      return <TotpMultiFactorAssertionForm hint={hint} onSuccess={(credential) => onSuccess?.(credential)} />;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">TODO:Select a multi-factor authentication method</p>
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
  return (
    <Button {...props} variant="outline">
      {labelText}
    </Button>
  );
}

function SmsButton(props: ComponentProps<typeof Button>) {
  const ui = useUI();
  const labelText = getTranslation(ui, "labels", "mfaSmsVerification");
  return (
    <Button {...props} variant="outline">
      {labelText}
    </Button>
  );
}
