import { FactorId } from "firebase/auth";
import { useState } from "react";

import { SmsMultiFactorEnrollmentForm } from "./mfa/sms-multi-factor-enrollment-form";
import { TotpMultiFactorEnrollmentForm } from "./mfa/totp-multi-factor-enrollment-form";

type Hint = (typeof FactorId)[keyof typeof FactorId];

export type MultiFactorAuthEnrollmentFormProps = {
  onEnrollment?: () => void;
  hints?: Hint[];
};

const DEFAULT_HINTS = [FactorId.TOTP, FactorId.PHONE] as const;

export function MultiFactorAuthEnrollmentForm(props: MultiFactorAuthEnrollmentFormProps) {
  const hints = props.hints ?? DEFAULT_HINTS;

  if (hints.length === 0) {
    throw new Error("MultiFactorAuthEnrollmentForm must have at least one hint");
  }

  const [selectedHint, setSelectedHint] = useState<Hint | undefined>(hints.length === 1 ? hints[0] : undefined);

  if (selectedHint) {
    if (selectedHint === FactorId.TOTP) {
      return <TotpMultiFactorEnrollmentForm onSuccess={props.onEnrollment} />;
    }

    if (selectedHint === FactorId.PHONE) {
      return <SmsMultiFactorEnrollmentForm onSuccess={props.onEnrollment} />;
    }

    throw new Error(`Unknown multi-factor enrollment type: ${selectedHint}`);
  }

  return (
    <>
      {hints.map((hint) => (
        <div key={hint} onClick={() => setSelectedHint(hint)}>
          {hint}
        </div>
      ))}
    </>
  );
}
