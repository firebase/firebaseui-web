import { getTranslation } from "@firebase-ui/core";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { useUI } from "~/hooks";
import {
  MultiFactorAuthAssertionForm,
  type MultiFactorAuthAssertionFormProps,
} from "../forms/multi-factor-auth-assertion-form";

export type MultiFactorAuthAssertionScreenProps = MultiFactorAuthAssertionFormProps;

export function MultiFactorAuthAssertionScreen(props: MultiFactorAuthAssertionScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorAssertion");
  const subtitleText = getTranslation(ui, "prompts", "mfaAssertionPrompt");

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthAssertionForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
