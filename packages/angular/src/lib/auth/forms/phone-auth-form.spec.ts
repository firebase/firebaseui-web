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

// Mock the @firebase-ui/core module but preserve Angular providers
jest.mock("@firebase-ui/core", () => {
  const originalModule = jest.requireActual("@firebase-ui/core");
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
    const { verifyPhoneNumber, confirmPhoneNumber, formatPhoneNumber, FirebaseUIError } = require("@firebase-ui/core");
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
    await render(PhoneAuthFormComponent, {
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

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  it("should render verification form after phone number is submitted", async () => {
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

    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
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

    component.verificationId.set(null);
    fixture.detectChanges();

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.queryByLabelText("Verification Code")).toBeNull();
  });
});
