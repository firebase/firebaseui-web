import { getTranslation } from "@firebase-ui/core";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { useUI } from "~/hooks";
import {
  MultiFactorAuthEnrollmentForm,
  type MultiFactorAuthEnrollmentFormProps,
} from "../forms/multi-factor-auth-enrollment-form";

export type MultiFactorAuthEnrollmentScreenProps = MultiFactorAuthEnrollmentFormProps;

export function MultiFactorAuthEnrollmentScreen({}: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "register");
  const subtitleText = getTranslation(ui, "prompts", "enterDetailsToCreate");

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthEnrollmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
