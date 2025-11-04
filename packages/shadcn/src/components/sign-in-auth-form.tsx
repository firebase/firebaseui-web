"use client";

import type { SignInAuthFormSchema } from "@invertase/firebaseui-core";
import { useSignInAuthFormAction, useSignInAuthFormSchema, useUI, type SignInAuthFormProps } from "@invertase/firebaseui-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@invertase/firebaseui-core";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "@/components/policies";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                <div className="flex items-center gap-2">
                  <Input {...field} type="password" className="flex-grow" />
                  {props.onForgotPasswordClick ? (
                    <Button type="button" variant="secondary" onClick={props.onForgotPasswordClick}>
                      {getTranslation(ui, "labels", "forgotPassword")}
                    </Button>
                  ) : null}
                </div>
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
            <Button type="button" variant="secondary" onClick={props.onSignUpClick}>
              {getTranslation(ui, "prompts", "noAccount")} {getTranslation(ui, "labels", "signUp")}
            </Button>
          </>
        ) : null}
      </form>
    </Form>
  );
}
