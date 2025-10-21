import { PhoneMultiFactorGenerator, TotpMultiFactorGenerator, type MultiFactorInfo } from "firebase/auth";
import { useState } from "react";
import { useUI } from "~/hooks";
import { TotpMultiFactorAssertionForm } from "../forms/mfa/totp-multi-factor-assertion-form";
import { SmsMultiFactorAssertionForm } from "../forms/mfa/sms-multi-factor-assertion-form";

export function MultiFactorAuthAssertionForm() {
  const ui = useUI();
  const resolver = ui.multiFactorResolver;

  if (!resolver) {
    throw new Error("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  }

  // If only a single hint is provided, select it by default to improve UX.
  const [factor, setFactor] = useState<MultiFactorInfo | undefined>(
    resolver.hints.length === 1 ? resolver.hints[0] : undefined
  );

  if (factor) {
    if (factor.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
      return <SmsMultiFactorAssertionForm />;
    }

    if (factor.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
      return <TotpMultiFactorAssertionForm />;
    }
  }

  return (
    <>
      {resolver.hints.map((hint) => (
        <div key={hint.factorId} onClick={() => setFactor(hint)}>
          {hint.factorId}
        </div>
      ))}
    </>
  );
}
