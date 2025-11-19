"use client";

import type { SignUpAuthFormSchema } from "@firebase-oss/ui-core";
import {
  useSignUpAuthFormAction,
  useSignUpAuthFormSchema,
  useUI,
  type SignUpAuthFormProps,
  useRequireDisplayName,
} from "@firebase-oss/ui-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";

export type { SignUpAuthFormProps };

export function SignUpAuthForm(props: SignUpAuthFormProps) {
  const ui = useUI();
  const schema = useSignUpAuthFormSchema();
  const action = useSignUpAuthFormAction();
  const requireDisplayName = useRequireDisplayName();

  const form = useForm<SignUpAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      displayName: requireDisplayName ? "" : undefined,
    },
  });

  async function onSubmit(values: SignUpAuthFormSchema) {
    try {
      const credential = await action(values);
      props.onSignUp?.(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        {requireDisplayName ? (
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getTranslation(ui, "labels", "displayName")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "password")}</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "createAccount")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
        {props.onSignInClick ? (
          <Button type="button" variant="link" size="sm" onClick={props.onSignInClick}>
            <span className="text-xs">
              {getTranslation(ui, "prompts", "haveAccount")} {getTranslation(ui, "labels", "signIn")}
            </span>
          </Button>
        ) : null}
      </form>
    </Form>
  );
}
