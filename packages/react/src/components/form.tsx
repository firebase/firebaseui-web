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

import { type ComponentProps, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from "react";
import { type AnyFieldApi, createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Button } from "./button";
import { cn } from "~/utils/cn";

const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function shouldShowValidationErrors(state: unknown): boolean {
  const s = state as Record<string, unknown> | null | undefined;
  const attempts =
    asNumber(s?.["submissionAttempts"]) ?? asNumber(s?.["submitAttempts"]) ?? asNumber(s?.["submitCount"]) ?? 0;
  return attempts > 0;
}

function FieldMetadata({ className, ...props }: ComponentProps<"div"> & { field: AnyFieldApi }) {
  if (!props.field.state.meta.errors.length) {
    return null;
  }

  return (
    <div role="alert" aria-live="polite" className={cn("fui-error", className)} {...props}>
      {props.field.state.meta.errors.map((error) => error.message).join(", ")}
    </div>
  );
}

type InputProps = PropsWithChildren<
  ComponentProps<"input"> & {
    label: string;
    before?: ReactNode;
    after?: ReactNode;
    action?: ReactNode;
    description?: ReactNode;
  }
>;

function Input({ children, before, after, label, action, description, ...props }: InputProps) {
  const field = useFieldContext<string>();
  const form = useFormContext();
  const descriptionId = `${field.name}-description`;
  const errorId = `${field.name}-error`;

  return (
    <form.Subscribe selector={(state) => shouldShowValidationErrors(state)}>
      {(showValidation) => {
        const showErrors = (showValidation || field.state.meta.isTouched) && field.state.meta.errors.length > 0;
        const describedBy = [props["aria-describedby"], description ? descriptionId : null, showErrors ? errorId : null]
          .filter(Boolean)
          .join(" ");

        return (
          <div data-input-field>
            <div data-input-label>
              <label htmlFor={field.name}>{label}</label>
              {action ? <div>{action}</div> : null}
            </div>
            {description ? (
              <div data-input-description id={descriptionId}>
                {description}
              </div>
            ) : null}
            <div data-input-group>
              {before}
              <input
                {...props}
                aria-describedby={describedBy || undefined}
                aria-invalid={showErrors}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  // Clear form-level submission errors when user starts typing
                  const errorMap = form.state.errorMap;
                  if (errorMap?.onSubmit) {
                    form.setErrorMap({});
                  }
                }}
              />
              {after}
            </div>
            {children ? <>{children}</> : null}
            {showValidation || field.state.meta.isTouched ? <FieldMetadata field={field} id={errorId} /> : null}
          </div>
        );
      }}
    </form.Subscribe>
  );
}

// Icon paths from Lucide (ISC), inlined so the package needs no icon dependency.
function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {off ? (
        <>
          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
          <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
          <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
          <path d="m2 2 20 20" />
        </>
      ) : (
        <>
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function PasswordInput({
  showPasswordLabel,
  hidePasswordLabel,
  ...props
}: Omit<InputProps, "type" | "after"> & { showPasswordLabel: string; hidePasswordLabel: string }) {
  const field = useFieldContext<string>();
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide the password again on submit, so it is not left on screen and password managers see a password field.
  useEffect(() => {
    const input = inputRef.current;
    const formElement = input?.form;
    if (!input || !formElement) return;

    const hide = () => {
      input.type = "password";
      setVisible(false);
    };
    formElement.addEventListener("submit", hide, { capture: true });
    return () => formElement.removeEventListener("submit", hide, { capture: true });
  }, []);

  return (
    <Input
      {...props}
      ref={inputRef}
      type={visible ? "text" : "password"}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      after={
        <button
          type="button"
          className="fui-form__password-toggle"
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-controls={field.name}
          onClick={() => setVisible((v) => !v)}
        >
          <EyeIcon off={visible} />
        </button>
      }
    />
  );
}

function Action({ className, ...props }: ComponentProps<"button">) {
  return <button type="button" {...props} className={cn("fui-form__action", className)} />;
}

function SubmitButton(props: ComponentProps<"button">) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button {...props} type="submit" disabled={Boolean(props.disabled) || isSubmitting} aria-busy={isSubmitting} />
      )}
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

/**
 * A form hook factory for creating forms with validation and error handling.
 *
 * Provides field components (Input, PasswordInput) and form components (SubmitButton, ErrorMessage, Action)
 * for building accessible forms with TanStack Form.
 */
export const form = createFormHook({
  fieldComponents: {
    Input,
    PasswordInput,
  },
  formComponents: {
    SubmitButton,
    ErrorMessage,
    Action,
  },
  fieldContext,
  formContext,
});
