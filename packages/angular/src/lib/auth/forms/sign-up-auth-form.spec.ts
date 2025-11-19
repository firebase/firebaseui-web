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
import { SignUpAuthFormComponent } from "./sign-up-auth-form";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";
import { PoliciesComponent } from "../../components/policies";
import { UserCredential } from "@angular/fire/auth";

describe("<fui-sign-up-auth-form />", () => {
  let mockCreateUserWithEmailAndPassword: any;
  let mockHasBehavior: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const { createUserWithEmailAndPassword, hasBehavior, FirebaseUIError } = require("@invertase/firebaseui-core");
    mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
    mockHasBehavior = hasBehavior;
    mockFirebaseUIError = FirebaseUIError;

    // no display name required by default
    mockHasBehavior.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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

  it("should render the form initially without display name field", async () => {
    const signInEmitter = new EventEmitter<void>();
    signInEmitter.subscribe(() => {});

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        signIn: signInEmitter,
      },
    });
    fixture.detectChanges();

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Display Name")).toBeNull();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByText("By continuing, you agree to our")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Already have an account? Sign In" })).toBeInTheDocument();
  });

  it("should render display name field when hasBehavior returns true", async () => {
    mockHasBehavior.mockReturnValue(true);

    await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("should have correct translation labels", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    expect(component.displayNameLabel()).toBe("Display Name");
    expect(component.createAccountLabel()).toBe("Create Account");
    expect(component.haveAccountLabel()).toBe("Already have an account?");
    expect(component.signInLabel()).toBe("Sign In");
    expect(component.unknownErrorLabel()).toBe("An unknown error occurred");
  });

  it("should initialize form with empty values", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    expect(component.form.getFieldValue("displayName")).toBeUndefined();
  });

  it("should emit signIn when sign in button is clicked", async () => {
    const signInEmitter = new EventEmitter<void>();
    signInEmitter.subscribe(() => {});

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
      componentInputs: {
        signIn: signInEmitter,
      },
    });
    fixture.detectChanges();
    const signInSpy = jest.spyOn(signInEmitter, "emit");

    const signInButton = screen.getByRole("button", { name: "Already have an account? Sign In" });
    fireEvent.click(signInButton);
    expect(signInSpy).toHaveBeenCalled();
  });

  it("should prevent default and stop propagation on form submit", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    const signUpSpy = jest.spyOn(component.signUp, "emit");

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signUpSpy).toHaveBeenCalledWith(mockCredential);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com",
      "password123",
      undefined // displayName is undefined when hasBehavior returns false
    );
  });

  it("should handle form submission with display name when hasBehavior is true", async () => {
    mockHasBehavior.mockReturnValue(true);
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    const signUpSpy = jest.spyOn(component.signUp, "emit");

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    component.form.setFieldValue("displayName", "John Doe");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signUpSpy).toHaveBeenCalledWith(mockCredential);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com",
      "password123",
      "John Doe" // displayName is passed when hasBehavior returns true
    );
  });

  it("should handle FirebaseUIError and display error message", async () => {
    const errorMessage = "Email already in use";
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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

    component.form.setFieldValue("email", "existing@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should handle unknown errors and display generic error message", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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

  it("should use the same validation logic as the real createSignUpAuthFormSchema", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
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
    component.form.setFieldValue("password", "123");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    expect(component.form.state.errors).toHaveLength(0);
  });
});
