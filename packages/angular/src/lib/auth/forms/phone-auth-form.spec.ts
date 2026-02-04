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
import { PhoneAuthFormComponent, PhoneNumberFormComponent, VerificationFormComponent } from "./phone-auth-form";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";
import { UserCredential } from "@angular/fire/auth";

// Mock the @firebase-oss/ui-core module but preserve Angular providers
jest.mock("@firebase-oss/ui-core", () => {
  const originalModule = jest.requireActual("@firebase-oss/ui-core");
  return {
    ...originalModule,
    verifyPhoneNumber: jest.fn(),
    confirmPhoneNumber: jest.fn(),
    FirebaseUIError: class FirebaseUIError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "FirebaseUIError";
      }
    },
  };
});

describe("<fui-phone-auth-form />", () => {
  let mockVerifyPhoneNumber: any;
  let mockConfirmPhoneNumber: any;
  let mockFormatPhoneNumber: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const {
      verifyPhoneNumber,
      confirmPhoneNumber,
      formatPhoneNumber,
      FirebaseUIError,
    } = require("@firebase-oss/ui-core");
    const { injectRecaptchaVerifier } = require("../../tests/test-helpers");
    mockVerifyPhoneNumber = verifyPhoneNumber;
    mockConfirmPhoneNumber = confirmPhoneNumber;
    mockFormatPhoneNumber = formatPhoneNumber;
    mockFirebaseUIError = FirebaseUIError;

    injectRecaptchaVerifier.mockImplementation(() => {
      return () => ({
        clear: jest.fn(),
        render: jest.fn(),
        verify: jest.fn(),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render phone number form initially", async () => {
    const { container } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    expect(container.querySelector('input[name="phoneNumber"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  it("should render verification form after phone number is submitted", async () => {
    const mockVerificationId = "test-verification-id";

    // Mock verifier with render() that completes asynchronously
    // The form should wait for render() to complete before allowing submission
    // This test will FAIL if the bug exists (form submits before render() completes, causing auth/internal-error)
    const { injectRecaptchaVerifier } = require("../../tests/test-helpers");
    let renderCompleted = false;
    let renderPromise: Promise<unknown> | null = null;
    const mockVerifier = {
      clear: jest.fn(),
      render: jest.fn().mockImplementation(() => {
        // Simulate async render() that takes time to complete
        renderPromise = new Promise((resolve) => {
          setTimeout(() => {
            renderCompleted = true;
            resolve(123);
          }, 10);
        });
        return renderPromise;
      }),
      verify: jest.fn(),
    };

    // Create mock signals that return the current values
    const renderCompletedSignal = jest.fn(() => renderCompleted);
    const renderPromiseSignal = jest.fn(() => renderPromise);

    // Set up the mock to return a function that returns the verifier, with signal properties
    injectRecaptchaVerifier.mockImplementation(() => {
      const verifierFn = () => mockVerifier;
      // Add signal properties that can be called
      (verifierFn as any).renderCompleted = renderCompletedSignal;
      (verifierFn as any).renderPromise = renderPromiseSignal;
      return verifierFn;
    });

    // Simulate the effect in injectRecaptchaVerifier that calls render()
    // This needs to happen before the component tries to use it
    setTimeout(() => {
      if (mockVerifier && !renderPromise) {
        mockVerifier.render();
      }
    }, 0);

    // Mock verifyPhoneNumber to fail with auth/internal-error if render() hasn't completed
    mockVerifyPhoneNumber.mockImplementation(async () => {
      if (!renderCompleted) {
        throw new mockFirebaseUIError("Firebase: Error (auth/internal-error)");
      }
      return mockVerificationId;
    });

    const { fixture, container } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;

    // Get the phone number form component
    const phoneFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof PhoneNumberFormComponent
    )?.componentInstance as PhoneNumberFormComponent;

    expect(phoneFormComponent).toBeTruthy();

    // render() has been called but hasn't completed yet
    // The form should wait for it to complete before allowing submission
    // This test also detects if the form submits before render() completes, causing auth/internal-error

    // Set phone number and submit (form should wait for render() to complete)
    phoneFormComponent.form.setFieldValue("phoneNumber", "1234567890");
    phoneFormComponent.country.set("US" as any);
    fixture.detectChanges();

    await phoneFormComponent.form.handleSubmit();
    fixture.detectChanges();

    // Wait for verification form to appear
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /Verification Code/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();

    // Verify the description is displayed
    const description = container.querySelector("[data-input-description]");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Enter the verification code sent to your phone number");

    // Verify that verifyPhoneNumber was called successfully (not with auth/internal-error)
    // This will FAIL if the bug exists (form submitted before render() completed)
    expect(mockVerifyPhoneNumber).toHaveBeenCalled();
    expect(component.verificationId()).toBe(mockVerificationId);

    // Verify no error message is displayed (this will FAIL if bug exists)
    expect(screen.queryByText(/auth\/internal-error/i)).not.toBeInTheDocument();
    expect(screen.queryByText("An unknown error occurred")).not.toBeInTheDocument();
  });

  it("should handle phone number submission", async () => {
    const mockVerificationId = "test-verification-id";
    mockVerifyPhoneNumber.mockResolvedValue(mockVerificationId);

    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;

    // Simulate the phone number form submission
    component.handlePhoneSubmit({ verificationId: mockVerificationId, phoneNumber: "+1234567890" });
    fixture.detectChanges();

    expect(component.verificationId()).toBe(mockVerificationId);
  });

  it("should handle verification code submission", async () => {
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockConfirmPhoneNumber.mockResolvedValue(mockCredential);

    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    fixture.detectChanges();

    const signInSpy = jest.spyOn(component.signIn, "emit");

    // Simulate the verification form emitting the signIn event
    component.signIn.emit(mockCredential);

    expect(signInSpy).toHaveBeenCalledWith(mockCredential);
  });

  it("should handle FirebaseUIError in phone verification", async () => {
    const errorMessage = "Invalid phone number";
    mockVerifyPhoneNumber.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;

    // Get the phone number form component and trigger form submission
    const phoneFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof PhoneNumberFormComponent
    )?.componentInstance as PhoneNumberFormComponent;

    expect(phoneFormComponent).toBeTruthy();

    phoneFormComponent.form.setFieldValue("phoneNumber", "1234567890");
    fixture.detectChanges();

    await phoneFormComponent.form.handleSubmit();
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(component.verificationId()).toBeNull();
    });
  });

  it("should handle FirebaseUIError in code verification", async () => {
    const errorMessage = "Invalid verification code";
    mockConfirmPhoneNumber.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    fixture.detectChanges();

    // Get the verification form component and trigger form submission
    const verificationFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof VerificationFormComponent
    )?.componentInstance as VerificationFormComponent;

    expect(verificationFormComponent).toBeTruthy();

    verificationFormComponent.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await verificationFormComponent.form.handleSubmit();
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(component.verificationId()).toBe("test-verification-id");
    });
  });

  it("should format phone number correctly", async () => {
    const formattedNumber = "+1 (234) 567-8900";
    mockFormatPhoneNumber.mockReturnValue(formattedNumber);
    mockVerifyPhoneNumber.mockResolvedValue("test-verification-id");

    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;

    // Get the phone number form component and trigger form submission
    const phoneFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof PhoneNumberFormComponent
    )?.componentInstance as PhoneNumberFormComponent;

    expect(phoneFormComponent).toBeTruthy();

    phoneFormComponent.form.setFieldValue("phoneNumber", "1234567890");
    phoneFormComponent.country.set("US" as any);
    fixture.detectChanges();

    await phoneFormComponent.form.handleSubmit();
    await waitFor(() => {
      expect(mockFormatPhoneNumber).toHaveBeenCalledWith("1234567890", expect.objectContaining({ code: "US" }));
      expect(mockVerifyPhoneNumber).toHaveBeenCalledWith(expect.any(Object), formattedNumber, expect.any(Object));
      expect(component.verificationId()).toBe("test-verification-id");
    });
  });

  it("should reset form when going back to phone number step", async () => {
    const { fixture, container } = await render(PhoneAuthFormComponent, {
      imports: [
        CommonModule,
        PhoneAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    fixture.detectChanges();

    component.verificationId.set(null);
    fixture.detectChanges();

    expect(container.querySelector('input[name="phoneNumber"]')).toBeInTheDocument();
    expect(screen.queryByLabelText("Verification Code")).toBeNull();
  });
});
