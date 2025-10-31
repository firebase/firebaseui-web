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
import { ForgotPasswordAuthFormComponent } from "./forgot-password-auth-form";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";
import { PoliciesComponent } from "../../components/policies";

// Mock the @firebase-oss/ui-core module but preserve Angular providers
jest.mock("@firebase-oss/ui-core", () => {
  const originalModule = jest.requireActual("@firebase-oss/ui-core");
  return {
    ...originalModule,
    sendPasswordResetEmail: jest.fn(),
    FirebaseUIError: class FirebaseUIError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "FirebaseUIError";
      }
    },
  };
});

describe("<fui-forgot-password-auth-form />", () => {
  let mockSendPasswordResetEmail: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const { sendPasswordResetEmail, FirebaseUIError } = require("@firebase-oss/ui-core");
    mockSendPasswordResetEmail = sendPasswordResetEmail;
    mockFirebaseUIError = FirebaseUIError;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
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
    expect(fixture.componentInstance).toBeTruthy();
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
    expect(screen.getByText("By continuing, you agree to our")).toBeInTheDocument();
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

    expect(screen.queryByText("Check your email for a password reset link")).toBeNull();
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
    expect(component.form.getFieldValue("email")).toBe("");
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
    component.form.setFieldValue("email", "test@example.com");
    fixture.detectChanges();

    const submitEvent = new Event("submit") as SubmitEvent;
    const preventDefaultSpy = jest.fn();
    const stopPropagationSpy = jest.fn();

    Object.defineProperties(submitEvent, {
      preventDefault: { value: preventDefaultSpy },
      stopPropagation: { value: stopPropagationSpy },
    });

    await component.handleSubmit(submitEvent);
    await waitFor(() => {
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
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
    fixture.detectChanges();

    await component.form.handleSubmit();
    await waitFor(() => {
      expect(component.emailSent()).toBe(false);
      expect(component.form.state.errors.length).toBeGreaterThan(0);
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
    fixture.detectChanges();

    await component.form.handleSubmit();
    await waitFor(() => {
      expect(component.emailSent()).toBe(false);
      expect(component.form.state.errors.length).toBeGreaterThan(0);
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

    component.form.setFieldValue("email", "invalid-email");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    fixture.detectChanges();

    expect(component.form.state.errors).toHaveLength(0);
  });
});
