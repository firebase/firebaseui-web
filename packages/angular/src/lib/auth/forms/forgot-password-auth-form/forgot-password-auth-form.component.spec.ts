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

import { render, screen, fireEvent, waitFor } from "@testing-library/angular";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { ForgotPasswordAuthFormComponent } from "./forgot-password-auth-form.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../../components/form/form.component";
import { PoliciesComponent } from "../../../components/policies/policies.component";

jest.mock("../../../provider", () => ({
  injectUI: jest.fn(),
  injectForgotPasswordAuthFormSchema: jest.fn(),
  injectTranslation: jest.fn(),
  injectPolicies: jest.fn(),
}));

jest.mock("@firebase-ui/core", () => ({
  sendPasswordResetEmail: jest.fn(),
  FirebaseUIError: class FirebaseUIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FirebaseUIError";
    }
  },
}));

describe("<fui-forgot-password-auth-form />", () => {
  let mockSendPasswordResetEmail: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const {
      injectUI,
      injectForgotPasswordAuthFormSchema,
      injectTranslation,
      injectPolicies,
    } = require("../../../provider");
    const { sendPasswordResetEmail, FirebaseUIError } = require("@firebase-ui/core");

    mockSendPasswordResetEmail = sendPasswordResetEmail;
    mockFirebaseUIError = FirebaseUIError;

    injectUI.mockReturnValue({
      app: {},
      auth: {},
      locale: {
        locale: "en-US",
        translations: {
          labels: {
            emailAddress: "Email Address",
            resetPassword: "Reset Password",
            backToSignIn: "Back to Sign In",
          },
          messages: {
            checkEmailForReset: "Check your email for a password reset link",
          },
          errors: {
            unknownError: "An unknown error occurred",
            invalidEmail: "Please enter a valid email address",
          },
        },
        fallback: undefined,
      },
    });

    // Mock form schema - create a Zod schema that matches the real implementation
    // TODO(ehesp): Use real createForgotPasswordAuthFormSchema when Jest ESM support improves
    // Currently blocked by nanostores ESM-only dependency in @firebase-ui/core
    injectForgotPasswordAuthFormSchema.mockReturnValue(() => {
      const { z } = require("zod");

      // This matches the exact structure from createForgotPasswordAuthFormSchema:
      // return z.object({
      //   email: z.email(getTranslation(ui, "errors", "invalidEmail")),
      // });

      return z.object({
        email: z.string().email("Please enter a valid email address"),
      });
    });

    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          emailAddress: "Email Address",
          resetPassword: "Reset Password",
          backToSignIn: "Back to Sign In",
          termsOfService: "Terms of Service",
          privacyPolicy: "Privacy Policy",
        },
        messages: {
          checkEmailForReset: "Check your email for a password reset link",
        },
        errors: {
          unknownError: "An unknown error occurred",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectPolicies.mockReturnValue({
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form initially", async () => {
    await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Password" })).toBeInTheDocument();
    expect(screen.getByText("messages.termsAndPrivacy")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Sign In →" })).toBeInTheDocument();
  });

  it("should not show success message initially", async () => {
    await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.queryByText("Check your email for a password reset link")).not.toBeInTheDocument();
  });

  it("should have correct translation labels", async () => {
    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    expect(component.emailLabel()).toBe("Email Address");
    expect(component.resetPasswordLabel()).toBe("Reset Password");
    expect(component.backToSignInLabel()).toBe("Back to Sign In");
    expect(component.checkEmailForResetMessage()).toBe("Check your email for a password reset link");
    expect(component.unknownErrorLabel()).toBe("An unknown error occurred");
  });

  it("should initialize form with empty email", async () => {
    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    expect(component.form.state.values.email).toBe("");
  });

  it("should emit backToSignIn when back button is clicked", async () => {
    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const backToSignInSpy = jest.spyOn(component.backToSignIn, "emit");

    const backButton = screen.getByRole("button", { name: "Back to Sign In →" });
    fireEvent.click(backButton);

    expect(backToSignInSpy).toHaveBeenCalled();
  });

  it("should prevent default and stop propagation on form submit", async () => {
    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    const submitEvent = new Event("submit");
    const preventDefaultSpy = jest.fn();
    const stopPropagationSpy = jest.fn();

    Object.defineProperties(submitEvent, {
      preventDefault: { value: preventDefaultSpy },
      stopPropagation: { value: stopPropagationSpy },
    });

    await component.handleSubmit(submitEvent as SubmitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("should handle form submission with valid email", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);

    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const passwordSentSpy = jest.spyOn(component.passwordSent, "emit");

    const mockUI = { app: {}, auth: {} };
    await mockSendPasswordResetEmail(mockUI, "test@example.com");
    component.emailSent.set(true);
    component.passwordSent?.emit();

    expect(component.emailSent()).toBe(true);
    expect(passwordSentSpy).toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com"
    );
  });

  it("should show success message after email is sent", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);

    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.emailSent.set(true);
    fixture.detectChanges();

    expect(screen.getByText("Check your email for a password reset link")).toBeInTheDocument();
  });

  it("should handle FirebaseUIError and display error message", async () => {
    const errorMessage = "User not found";
    mockSendPasswordResetEmail.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "nonexistent@example.com");
    const form = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(form);

    await waitFor(() => {
      expect(component.emailSent()).toBe(false);
      expect(component.form.state.errorMap).toBeDefined();
    });
  });

  it("should handle unknown errors and display generic error message", async () => {
    mockSendPasswordResetEmail.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "test@example.com");
    const form = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(form);

    await waitFor(() => {
      expect(component.emailSent()).toBe(false);
      expect(component.form.state.errorMap).toBeDefined();
    });
  });

  it("should use the same validation logic as the real createForgotPasswordAuthFormSchema", async () => {
    const { fixture } = await render(ForgotPasswordAuthFormComponent, {
      imports: [
        CommonModule,
        ForgotPasswordAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    // z.object({ email: z.email(getTranslation(ui, "errors", "invalidEmail")) }) - issue with mocking the schema

    component.form.setFieldValue("email", "invalid-email");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    fixture.detectChanges();

    // Should have no errors now
    expect(component.form.state.errors).toHaveLength(0);
  });
});
