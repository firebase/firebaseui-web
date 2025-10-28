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

import { render, screen } from "@testing-library/angular";
import { Component, signal } from "@angular/core";

import { FormMetadataComponent, FormActionComponent, FormSubmitComponent, FormErrorMessageComponent } from "./form";
import { ButtonComponent } from "./button";

// Test host component for FormMetadataComponent
@Component({
  template: `<fui-form-metadata [field]="field()"></fui-form-metadata>`,
  standalone: true,
  imports: [FormMetadataComponent],
})
class TestFormMetadataHostComponent {
  field = signal({
    state: {
      meta: {
        isTouched: true,
        errors: [{ message: "Test error" }],
      },
    },
  } as any);
}

// Test host component for FormActionComponent
@Component({
  template: `<button fui-form-action data-testid="test-action">Action Button</button>`,
  standalone: true,
  imports: [FormActionComponent],
})
class TestFormActionHostComponent {}

// FormSubmitComponent test host component
@Component({
  template: `<fui-form-submit [state]="state()" [class]="customClass()">Submit</fui-form-submit>`,
  standalone: true,
  imports: [FormSubmitComponent, ButtonComponent],
})
class TestFormSubmitHostComponent {
  state = signal({
    isSubmitting: false,
  } as any);
  customClass = signal("custom-submit-class");
}

// FormErrorMessageComponent test host component
@Component({
  template: `<fui-form-error-message [state]="state()"></fui-form-error-message>`,
  standalone: true,
  imports: [FormErrorMessageComponent],
})
class TestFormErrorMessageHostComponent {
  state = signal({
    errorMap: {
      onSubmit: "Test error message",
    },
  } as any);
}

describe("Form Components", () => {
  describe("<fui-form-metadata>", () => {
    it("renders error message when field has errors and is touched", async () => {
      await render(TestFormMetadataHostComponent);

      const errorElement = screen.getByRole("alert");

      expect(errorElement).toBeTruthy();
      expect(errorElement).toHaveClass("fui-form__error");
      expect(errorElement).toHaveTextContent("Test error");
    });

    it("does not render error message when field has no errors", async () => {
      const component = await render(TestFormMetadataHostComponent);

      // Update the field to have no errors
      component.fixture.componentInstance.field.set({
        state: {
          meta: {
            isTouched: true,
            errors: [],
          },
        },
      } as any);
      component.fixture.detectChanges();

      const errorElement = screen.queryByRole("alert");
      expect(errorElement).toBeFalsy();
    });

    it("does not render error message when field is not touched", async () => {
      const component = await render(TestFormMetadataHostComponent);

      // Update the field to not be touched
      component.fixture.componentInstance.field.set({
        state: {
          meta: {
            isTouched: false,
            errors: [{ message: "Test error" }],
          },
        },
      } as any);
      component.fixture.detectChanges();

      const errorElement = screen.queryByRole("alert");
      expect(errorElement).toBeFalsy();
    });
  });

  describe("<button fui-form-action>", () => {
    it("renders a button with correct attributes", async () => {
      await render(TestFormActionHostComponent);

      const button = screen.getByTestId("test-action");

      expect(button).toBeTruthy();
      expect(button).toHaveClass("fui-form__action");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveTextContent("Action Button");
    });
  });

  describe("<fui-form-submit>", () => {
    it("renders a submit button", async () => {
      const { container } = await render(TestFormSubmitHostComponent);

      const button = screen.getByRole("button", { name: "Submit" });
      const hostElement = container.querySelector("fui-form-submit");

      expect(button).toBeTruthy();
      expect(button).toHaveClass("fui-form__action");
      expect(button).toHaveClass("custom-submit-class");
      expect(hostElement).toHaveAttribute("type", "submit");
      expect(button).not.toHaveAttribute("disabled");
    });

    it("disables button when form is submitting", async () => {
      const component = await render(TestFormSubmitHostComponent);

      component.fixture.componentInstance.state.set({
        isSubmitting: true,
      } as any);
      component.fixture.detectChanges();

      const button = screen.getByRole("button", { name: "Submit" });

      expect(button).toHaveAttribute("disabled");
    });

    it("applies custom class", async () => {
      await render(TestFormSubmitHostComponent);

      const button = screen.getByRole("button", { name: "Submit" });

      expect(button).toHaveClass("custom-submit-class");
    });
  });

  describe("<fui-form-error-message>", () => {
    it("renders error message when onSubmit error exists", async () => {
      await render(TestFormErrorMessageHostComponent);

      const errorElement = screen.getByText("Test error message");

      expect(errorElement).toBeTruthy();
      expect(errorElement).toHaveClass("fui-form__error");
    });

    it("does not render error message when no onSubmit error", async () => {
      const component = await render(TestFormErrorMessageHostComponent);

      component.fixture.componentInstance.state.set({
        errorMap: {},
      } as any);
      component.fixture.detectChanges();

      const errorElement = screen.queryByText("Test error message");
      expect(errorElement).toBeFalsy();
    });

    it("does not render error message when errorMap is null", async () => {
      const component = await render(TestFormErrorMessageHostComponent);

      component.fixture.componentInstance.state.set({
        errorMap: null,
      } as any);
      component.fixture.detectChanges();

      const errorElement = screen.queryByText("Test error message");
      expect(errorElement).toBeFalsy();
    });
  });
});
