"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { EmailLinkAuthFormSchema } from "@firebase-oss/ui-core";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  useEmailLinkAuthFormAction,
  useEmailLinkAuthFormCompleteSignIn,
  useEmailLinkAuthFormSchema,
  useUI,
  type EmailLinkAuthFormProps,
} from "@firebase-oss/ui-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Policies } from "@/components/policies";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type { EmailLinkAuthFormProps };

export function EmailLinkAuthForm(props: EmailLinkAuthFormProps) {
  const { onEmailSent, onSignIn } = props;
  const ui = useUI();
  const schema = useEmailLinkAuthFormSchema();
  const action = useEmailLinkAuthFormAction();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailLinkAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  useEmailLinkAuthFormCompleteSignIn(onSignIn);

  async function onSubmit(values: EmailLinkAuthFormSchema) {
    try {
      await action(values);
      setEmailSent(true);
      onEmailSent?.();
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  if (emailSent) {
    return (
      <Alert>
        <AlertDescription>{getTranslation(ui, "messages", "signInLinkSent")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "emailAddress")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "sendSignInLink")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
      </form>
    </Form>
  );
}
