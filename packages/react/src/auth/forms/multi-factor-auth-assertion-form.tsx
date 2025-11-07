import {
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type UserCredential,
  type MultiFactorInfo,
} from "firebase/auth";
import { type ComponentProps, useEffect, useState } from "react";
import { useUI } from "~/hooks";
import { TotpMultiFactorAssertionForm } from "../forms/mfa/totp-multi-factor-assertion-form";
import { SmsMultiFactorAssertionForm } from "../forms/mfa/sms-multi-factor-assertion-form";
import { Button } from "~/components/button";
import { getTranslation } from "@invertase/firebaseui-core";

export type MultiFactorAuthAssertionFormProps = {
  onSuccess?: (credential: UserCredential) => void;
};

export function useMultiFactorAssertionCleanup() {
  const ui = useUI();

  useEffect(() => {
    return () => {
      ui.setMultiFactorResolver();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- UI isn't stable enough to be a dependency here. Could we use useEffectEvent here instead once we depend on 19.2?
  }, []);
}

export function MultiFactorAuthAssertionForm(props: MultiFactorAuthAssertionFormProps) {
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
      return (
        <SmsMultiFactorAssertionForm
          hint={hint}
          onSuccess={(credential) => {
            props.onSuccess?.(credential);
          }}
        />
      );
    }

    if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
      return (
        <TotpMultiFactorAssertionForm
          hint={hint}
          onSuccess={(credential) => {
            props.onSuccess?.(credential);
          }}
        />
      );
    }
  }

  return (
    <div className="fui-content">
      <p>{mfaAssertionFactorPrompt}</p>
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
