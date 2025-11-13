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

import { type ComponentProps, type PropsWithChildren, type ReactNode } from "react";
import { type AnyFieldApi, createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Button } from "./button";
import { cn } from "~/utils/cn";

const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

function FieldMetadata({ className, ...props }: ComponentProps<"div"> & { field: AnyFieldApi }) {
  if (!props.field.state.meta.isTouched || !props.field.state.meta.errors.length) {
    return null;
  }

  return (
    <div>
      <div role="alert" aria-live="polite" className={cn("fui-error", className)} {...props}>
        {props.field.state.meta.errors.map((error) => error.message).join(", ")}
      </div>
    </div>
  );
}

function Input({
  children,
  before,
  label,
  action,
  description,
  ...props
}: PropsWithChildren<
  ComponentProps<"input"> & { label: string; before?: ReactNode; action?: ReactNode; description?: ReactNode }
>) {
  const field = useFieldContext<string>();

  return (
    <label htmlFor={field.name}>
      <div data-input-label>
        <div>{label}</div>
        {action ? <div>{action}</div> : null}
      </div>
      {description ? <div data-input-description>{description}</div> : null}
      <div data-input-group>
        {before}
        <input
          {...props}
          aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={() => {
            field.handleBlur();
          }}
          onChange={(e) => {
            field.handleChange(e.target.value);
          }}
        />
      </div>
      {children ? <>{children}</> : null}
      <FieldMetadata field={field} />
    </label>
  );
}

function Action({ className, ...props }: ComponentProps<"button">) {
  return <button type="button" {...props} className={cn("fui-form__action", className)} />;
}

function SubmitButton(props: ComponentProps<"button">) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <Button {...props} type="submit" disabled={isSubmitting} />}
    </form.Subscribe>
  );
}

function ErrorMessage() {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.errorMap]}>
      {([errorMap]) => {
        // We only care about errors thrown from the form submission, rather than validation errors
        if (errorMap?.onSubmit && typeof errorMap.onSubmit === "string") {
          return <div className="fui-error">{errorMap.onSubmit}</div>;
        }

        return null;
      }}
    </form.Subscribe>
  );
}

export const form = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    SubmitButton,
    ErrorMessage,
    Action,
  },
  fieldContext,
  formContext,
});
