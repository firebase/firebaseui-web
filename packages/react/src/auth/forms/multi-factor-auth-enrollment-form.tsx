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

import { FactorId } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { type ComponentProps, useState } from "react";

import { SmsMultiFactorEnrollmentForm } from "./mfa/sms-multi-factor-enrollment-form";
import { TotpMultiFactorEnrollmentForm } from "./mfa/totp-multi-factor-enrollment-form";
import { Button } from "~/components/button";
import { useUI } from "~/hooks";

type Hint = (typeof FactorId)[keyof typeof FactorId];

/** Props for the MultiFactorAuthEnrollmentForm component. */
export type MultiFactorAuthEnrollmentFormProps = {
  /** Optional callback function called when enrollment is successful. */
  onEnrollment?: () => void;
  /** Optional array of factor IDs to allow enrollment for. Defaults to TOTP and PHONE. */
  hints?: Hint[];
};

const DEFAULT_HINTS = [FactorId.TOTP, FactorId.PHONE] as const;

/**
 * A form component for multi-factor authentication enrollment.
 *
 * Displays the appropriate MFA enrollment form (SMS or TOTP) based on the provided hints.
 * If only one hint is provided, it is automatically selected.
 *
 * @returns The multi-factor auth enrollment form component.
 * @throws {Error} Throws an error if no hints are provided or if an unknown hint type is encountered.
 */
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
  return (
    <Button variant="secondary" {...props}>
      {labelText}
    </Button>
  );
}

function SmsButton(props: ComponentProps<typeof Button>) {
  const ui = useUI();
  const labelText = getTranslation(ui, "labels", "mfaSmsVerification");
  return (
    <Button variant="secondary" {...props}>
      {labelText}
    </Button>
  );
}
