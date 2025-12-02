"use client";

import type { SignInAuthFormSchema } from "@firebase-oss/ui-core";
import {
  useSignInAuthFormAction,
  useSignInAuthFormSchema,
  useUI,
  type SignInAuthFormProps,
} from "@firebase-oss/ui-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";

export type { SignInAuthFormProps };

export function SignInAuthForm(props: SignInAuthFormProps) {
  const ui = useUI();
  const schema = useSignInAuthFormSchema();
  const action = useSignInAuthFormAction();

  const form = useForm<SignInAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInAuthFormSchema) {
    try {
      const credential = await action(values);
      props.onSignIn?.(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <span className="grow">{getTranslation(ui, "labels", "password")}</span>
                {props.onForgotPasswordClick ? (
                  <Button type="button" variant="link" onClick={props.onForgotPasswordClick} size="sm">
                    <span className="text-xs">{getTranslation(ui, "labels", "forgotPassword")}</span>
                  </Button>
                ) : null}
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "signIn")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
        {props.onSignUpClick ? (
          <>
            <Button type="button" variant="link" size="sm" onClick={props.onSignUpClick}>
              <span className="text-xs">
                {getTranslation(ui, "prompts", "noAccount")} {getTranslation(ui, "labels", "signUp")}
              </span>
            </Button>
          </>
        ) : null}
      </form>
    </Form>
  );
}
