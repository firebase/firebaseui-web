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
      <div role="alert" aria-live="polite" className={cn("fui-form__error", className)} {...props}>
        {props.field.state.meta.errors.map((error) => error.message).join(", ")}
      </div>
    </div>
  );
}

function Input(props: PropsWithChildren<ComponentProps<"input"> & { label: string; before?: ReactNode }>) {
  const field = useFieldContext<string>();

  return (
    <label htmlFor={field.name}>
      <span>{props.label}</span>
      <div data-input-group>
        {props.before}
        <input
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
      {props.children ? <>{props.children}</> : null}
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
        if (errorMap?.onSubmit) {
          return <div className="fui-form__error">{String(errorMap.onSubmit)}</div>;
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
