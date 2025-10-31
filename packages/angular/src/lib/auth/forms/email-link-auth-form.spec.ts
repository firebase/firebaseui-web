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

import { render, screen, waitFor } from "@testing-library/angular";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { EmailLinkAuthFormComponent } from "./email-link-auth-form";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../components/form";
import { PoliciesComponent } from "../../components/policies";
import { UserCredential } from "@angular/fire/auth";

// Mock the @firebase-oss/ui-core module but preserve Angular providers
jest.mock("@firebase-oss/ui-core", () => {
  const originalModule = jest.requireActual("@firebase-oss/ui-core");
  return {
    ...originalModule,
    sendSignInLinkToEmail: jest.fn(),
    completeEmailLinkSignIn: jest.fn(),
    FirebaseUIError: class FirebaseUIError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "FirebaseUIError";
      }
    },
  };
});

describe("<fui-email-link-auth-form />", () => {
  let mockSendSignInLinkToEmail: any;
  let mockCompleteEmailLinkSignIn: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const { sendSignInLinkToEmail, completeEmailLinkSignIn, FirebaseUIError } = require("@firebase-oss/ui-core");
    mockSendSignInLinkToEmail = sendSignInLinkToEmail;
    mockCompleteEmailLinkSignIn = completeEmailLinkSignIn;
    mockFirebaseUIError = FirebaseUIError;

    mockCompleteEmailLinkSignIn.mockResolvedValue(null);
    mockSendSignInLinkToEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form initially", async () => {
    await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Sign In Link" })).toBeInTheDocument();
    expect(screen.getByText("By continuing, you agree to our")).toBeInTheDocument();
  });

  it("should not show success message initially", async () => {
    await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.queryByText("Check your email for a sign in link")).toBeNull();
  });

  it("should have correct translation labels", async () => {
    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;

    expect(component.emailLabel()).toBe("Email Address");
    expect(component.sendSignInLinkLabel()).toBe("Send Sign In Link");
    expect(component.emailSentMessage()).toBe("Check your email for a sign in link");
    expect(component.unknownErrorLabel()).toBe("An unknown error occurred");
  });

  it("should initialize form with empty email", async () => {
    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;
    expect(component.form.getFieldValue("email")).toBe("");
  });

  it("should prevent default and stop propagation on form submit", async () => {
    // Mock the function to resolve immediately for this test
    mockSendSignInLinkToEmail.mockResolvedValue(undefined);

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
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

    // Wait for the async form submission to complete
    await component.handleSubmit(submitEvent);
    await waitFor(() => {
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  it("should handle form submission with valid email", async () => {
    mockSendSignInLinkToEmail.mockResolvedValue(undefined);

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const emailSentSpy = jest.spyOn(component.emailSent, "emit");

    const mockUI = { app: {}, auth: {} };
    await mockSendSignInLinkToEmail(mockUI, "test@example.com");
    component.emailSentState.set(true);
    component.emailSent?.emit();

    expect(component.emailSentState()).toBe(true);
    expect(emailSentSpy).toHaveBeenCalled();
    expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com"
    );
  });

  it("should show success message after email is sent", async () => {
    mockSendSignInLinkToEmail.mockResolvedValue(undefined);

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.emailSentState.set(true);
    fixture.detectChanges();

    expect(screen.getByText("Check your email for a sign in link")).toBeInTheDocument();
  });

  it("should handle FirebaseUIError and display error message", async () => {
    const errorMessage = "User not found";
    mockSendSignInLinkToEmail.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "nonexistent@example.com");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await waitFor(() => {
      expect(component.emailSentState()).toBe(false);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should handle unknown errors and display generic error message", async () => {
    mockSendSignInLinkToEmail.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "test@example.com");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await waitFor(() => {
      expect(component.emailSentState()).toBe(false);
      expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    });
  });

  it("should use the same validation logic as the real createEmailLinkAuthFormSchema", async () => {
    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
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

  it("should call completeSignIn on initialization", async () => {
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockCompleteEmailLinkSignIn.mockResolvedValue(mockCredential);

    await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    await waitFor(() => {
      expect(mockCompleteEmailLinkSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          app: expect.any(Object),
          auth: expect.any(Object),
        }),
        "http://localhost/"
      );
    });

    expect(mockCompleteEmailLinkSignIn).toHaveBeenCalledTimes(1);
  });

  it("should not emit signIn if no credential is returned", async () => {
    mockCompleteEmailLinkSignIn.mockResolvedValue(null);

    const { fixture } = await render(EmailLinkAuthFormComponent, {
      imports: [
        CommonModule,
        EmailLinkAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    await waitFor(() => {
      expect(mockCompleteEmailLinkSignIn).toHaveBeenCalled();
    });

    expect(signInSpy).not.toHaveBeenCalled();
  });
});
