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
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
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
      expect(container.querySelector('label[for="foo"]')).toHaveTextContent("Foo");
      expect(container.querySelector('input[name="foo"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="foo"]')).toHaveValue("bar");
      expect(container.querySelector('input[name="foo"]')).toHaveAttribute("aria-invalid", "false");
    });

    it("should render the Input children when provided", () => {
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
                <div data-testid="test-child">Test Child</div>
              </field.Input>
            )}
          </hook.AppField>
        </hook.AppForm>
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("should render the Input metadata when available", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          defaultValues: { foo: "" },
        });
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.AppField
            validators={{
              onSubmit: () => {
                return "error!";
              },
            }}
            name="foo"
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
      expect(error).toHaveClass("fui-form__error");
    });
  });

  describe("<Action />", () => {
    it("should render the Action component", () => {
      const { result } = renderHook(() => {
        return form.useAppForm({});
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.Action>Action</hook.Action>
        </hook.AppForm>
      );

      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action" })).toHaveClass("fui-form__action");
      expect(screen.getByRole("button", { name: "Action" })).toHaveTextContent("Action");
      expect(screen.getByRole("button", { name: "Action" })).toHaveAttribute("type", "button");
    });
  });

  describe("<SubmitButton />", () => {
    it("should render the SubmitButton component", () => {
      const { result } = renderHook(() => {
        return form.useAppForm({});
      });

      const hook = result.current;

      render(
        <hook.AppForm>
          <hook.SubmitButton>Submit</hook.SubmitButton>
        </hook.AppForm>
      );

      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Submit" })).toHaveTextContent("Submit");
      expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should subscribe to the isSubmitting state", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          validators: {
            onSubmitAsync: async () => {
              // Simulate a slow async operation
              await new Promise((resolve) => setTimeout(resolve, 100));
              return undefined;
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

      const submitButton = screen.getByTestId("submit-button");

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toHaveAttribute("disabled");

      act(() => {
        hook.handleSubmit();
      });

      await waitFor(() => {
        expect(submitButton).toHaveAttribute("disabled");
      });
    });
  });

  describe("<ErrorMessage />", () => {
    it("should render the ErrorMessage if the onSubmit error is set", async () => {
      const { result } = renderHook(() => {
        return form.useAppForm({
          validators: {
            onSubmitAsync: async () => {
              return "error!";
            },
          },
        });
      });

      const hook = result.current;

      const { container } = render(
        <hook.AppForm>
          <hook.ErrorMessage />
        </hook.AppForm>
      );

      act(async () => {
        await hook.handleSubmit();
      });

      await waitFor(() => {
        const error = container.querySelector(".fui-form__error");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent("error!");
      });
    });
  });
});
