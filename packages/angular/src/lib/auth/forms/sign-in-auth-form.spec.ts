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

import { render, screen, fireEvent } from "@testing-library/angular";
import { CommonModule } from "@angular/common";
import { EventEmitter } from "@angular/core";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { SignInAuthFormComponent } from "./sign-in-auth-form";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";
import { PoliciesComponent } from "../../components/policies";
import { UserCredential } from "@angular/fire/auth";

describe("<fui-sign-in-auth-form />", () => {
  let mockSignInWithEmailAndPassword: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const { signInWithEmailAndPassword, FirebaseUIError } = require("@invertase/firebaseui-core");
    mockSignInWithEmailAndPassword = signInWithEmailAndPassword;
    mockFirebaseUIError = FirebaseUIError;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    const forgotPasswordEmitter = new EventEmitter<void>();
    const signUpEmitter = new EventEmitter<void>();
    forgotPasswordEmitter.subscribe(() => {});
    signUpEmitter.subscribe(() => {});

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        forgotPassword: forgotPasswordEmitter,
        signUp: signUpEmitter,
      },
    });
    fixture.detectChanges();

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByText("By continuing, you agree to our")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forgot Password" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Don't have an account? Sign Up" })).toBeInTheDocument();
  });

  it("should not render forgot password button when output is not bound", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    fixture.detectChanges();

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Forgot Password" })).not.toBeInTheDocument();
  });

  it("should not render sign up button when output is not bound", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    fixture.detectChanges();

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Don't have an account? Sign Up" })).not.toBeInTheDocument();
  });

  it("should conditionally render buttons based on which outputs are bound", async () => {
    const forgotPasswordEmitter = new EventEmitter<void>();
    forgotPasswordEmitter.subscribe(() => {});

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        forgotPassword: forgotPasswordEmitter,
      },
    });
    fixture.detectChanges();

    expect(screen.getByRole("button", { name: "Forgot Password" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Don't have an account? Sign Up" })).not.toBeInTheDocument();
  });

  it("should have correct translation labels", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    expect(component.passwordLabel()).toBe("Password");
    expect(component.forgotPasswordLabel()).toBe("Forgot Password");
    expect(component.signInLabel()).toBe("Sign In");
    expect(component.noAccountLabel()).toBe("Don't have an account?");
    expect(component.signUpLabel()).toBe("Sign Up");
    expect(component.unknownErrorLabel()).toBe("An unknown error occurred");
  });

  it("should initialize form with empty values", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    expect(component.form.getFieldValue("password")).toBe("");
  });

  it("should emit forgotPassword when forgot password button is clicked", async () => {
    const forgotPasswordEmitter = new EventEmitter<void>();
    forgotPasswordEmitter.subscribe(() => {});

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        forgotPassword: forgotPasswordEmitter,
      },
    });
    fixture.detectChanges();
    const forgotPasswordSpy = jest.spyOn(forgotPasswordEmitter, "emit");

    const forgotPasswordButton = screen.getByRole("button", { name: "Forgot Password" });
    fireEvent.click(forgotPasswordButton);
    expect(forgotPasswordSpy).toHaveBeenCalled();
  });

  it("should emit signUp when sign up button is clicked", async () => {
    const signUpEmitter = new EventEmitter<void>();
    signUpEmitter.subscribe(() => {});

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        signUp: signUpEmitter,
      },
    });
    fixture.detectChanges();
    const signUpSpy = jest.spyOn(signUpEmitter, "emit");

    const signUpButton = screen.getByRole("button", { name: "Don't have an account? Sign Up" });
    fireEvent.click(signUpButton);
    expect(signUpSpy).toHaveBeenCalled();
  });

  it("should prevent default and stop propagation on form submit", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    const submitEvent = new Event("submit") as SubmitEvent;
    const preventDefaultSpy = jest.fn();
    const stopPropagationSpy = jest.fn();

    Object.defineProperties(submitEvent, {
      preventDefault: { value: preventDefaultSpy },
      stopPropagation: { value: stopPropagationSpy },
    });

    component.handleSubmit(submitEvent);
    await fixture.whenStable();

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("should handle form submission with valid credentials", async () => {
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockSignInWithEmailAndPassword.mockResolvedValue(mockCredential);

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    const signInSpy = jest.spyOn(component.signIn, "emit");

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signInSpy).toHaveBeenCalledWith(mockCredential);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com",
      "password123"
    );
  });

  it("should handle FirebaseUIError and display error message", async () => {
    const errorMessage = "Invalid credentials";
    mockSignInWithEmailAndPassword.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    component.form.setFieldValue("password", "wrongpassword");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should handle unknown errors and display generic error message", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
  });

  it("should use the same validation logic as the real createSignInAuthFormSchema", async () => {
    const { fixture } = await render(SignInAuthFormComponent, {
      imports: [
        CommonModule,
        SignInAuthFormComponent,
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
    component.form.setFieldValue("password", "");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    expect(component.form.state.errors).toHaveLength(0);
  });
});
