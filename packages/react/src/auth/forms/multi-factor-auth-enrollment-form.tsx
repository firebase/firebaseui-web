import { FactorId } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { type ComponentProps, useState } from "react";

import { SmsMultiFactorEnrollmentForm } from "./mfa/sms-multi-factor-enrollment-form";
import { TotpMultiFactorEnrollmentForm } from "./mfa/totp-multi-factor-enrollment-form";
import { Button } from "~/components/button";
import { useUI } from "~/hooks";

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

  // If only a single hint is provided, select it by default to improve UX.
  const [hint, setHint] = useState<Hint | undefined>(hints.length === 1 ? hints[0] : undefined);

  if (hint) {
    if (hint === FactorId.TOTP) {
      return <TotpMultiFactorEnrollmentForm onSuccess={props.onEnrollment} />;
    }

    if (hint === FactorId.PHONE) {
      return <SmsMultiFactorEnrollmentForm onSuccess={props.onEnrollment} />;
    }

    throw new Error(`Unknown multi-factor enrollment type: ${hint}`);
  }

  return (
    <div className="fui-content">
      {hints.map((hint) => {
        if (hint === FactorId.TOTP) {
          return <TotpButton key={hint} onClick={() => setHint(hint)} />;
        }

        if (hint === FactorId.PHONE) {
          return <SmsButton key={hint} onClick={() => setHint(hint)} />;
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
