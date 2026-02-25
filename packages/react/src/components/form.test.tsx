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

import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { form } from "./form";
import { ComponentProps } from "react";

vi.mock("~/components/button", () => {
  return {
    Button: (props: ComponentProps<"button">) => <button {...props} data-testid="submit-button" />,
  };
});

describe("form export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow rendering of all composed components", () => {
    const { result } = renderHook(() => {
      return form.useAppForm({
        defaultValues: { foo: "bar" },
      });
    });

    const hook = result.current;

    render(
      <hook.AppForm>
        <hook.AppField name="foo">{(field) => <field.Input label="Foo" />}</hook.AppField>
        <hook.ErrorMessage />
        <hook.SubmitButton>Submit</hook.SubmitButton>
        <hook.Action>Action</hook.Action>
      </hook.AppForm>
    );

    expect(screen.getByRole("textbox", { name: "Foo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  describe("<Input />", () => {
    it("should render the Input component", () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          defaultValues: { foo: "bar" },
        });
      });

      const hook = result.current;

      const { container } = render(
        <hook.AppForm>
          <hook.AppField name="foo">{(field) => <field.Input label="Foo" />}</hook.AppField>
        </hook.AppForm>
      );

      expect(container.querySelector('label[for="foo"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="foo"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="foo"]')).toHaveValue("bar");
      expect(container.querySelector('input[name="foo"]')).toHaveAttribute("aria-invalid", "false");
    });

    it("should render children when provided", () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          defaultValues: { foo: "bar" },
        });
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.AppField name="foo">
            {(field) => (
              <field.Input label="Foo">
                <div data-testid="child">Child</div>
              </field.Input>
            )}
          </hook.AppField>
        </hook.AppForm>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should render validation error after submit", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          defaultValues: { foo: "" },
        });
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.AppField
            name="foo"
            validators={{
              onSubmit: () => "error!",
            }}
          >
            {(field) => <field.Input label="Foo" />}
          </hook.AppField>
        </hook.AppForm>
      );

      await act(async () => {
        await hook.handleSubmit();
      });

      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass("fui-error");
    });
  });

  describe("<SubmitButton />", () => {
    it("should disable button while submitting", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          validators: {
            onSubmitAsync: async () => {
              await new Promise((r) => setTimeout(r, 100));
            },
          },
        });
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.SubmitButton>Submit</hook.SubmitButton>
        </hook.AppForm>
      );

      const btn = screen.getByTestId("submit-button");

      act(() => {
        hook.handleSubmit();
      });

      await waitFor(() => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe("<ErrorMessage />", () => {
    it("should show submit error message", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          validators: {
            onSubmitAsync: async () => "error!",
          },
        });
      });

      const hook = result.current;

      const { container } = render(
        <hook.AppForm>
          <hook.ErrorMessage />
        </hook.AppForm>
      );

      await act(async () => {
        await hook.handleSubmit();
      });

      await waitFor(() => {
        const error = container.querySelector(".fui-error");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent("error!");
      });
    });
  });
});
