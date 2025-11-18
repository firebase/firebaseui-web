import { getTranslation } from "@firebase-oss/ui-core";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { useUI } from "~/hooks";
import {
  MultiFactorAuthEnrollmentForm,
  type MultiFactorAuthEnrollmentFormProps,
} from "../forms/multi-factor-auth-enrollment-form";

/** Props for the MultiFactorAuthEnrollmentScreen component. */
export type MultiFactorAuthEnrollmentScreenProps = MultiFactorAuthEnrollmentFormProps;

/**
 * A screen component for multi-factor authentication enrollment.
 *
 * Displays a card with the multi-factor enrollment form.
 *
 * @returns The multi-factor auth enrollment screen component.
 */
export function MultiFactorAuthEnrollmentScreen(props: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorEnrollment");
  const subtitleText = getTranslation(ui, "prompts", "mfaEnrollmentPrompt");

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthEnrollmentForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
