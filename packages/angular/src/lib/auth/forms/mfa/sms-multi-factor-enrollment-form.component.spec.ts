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
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { SmsMultiFactorEnrollmentFormComponent } from "./sms-multi-factor-enrollment-form.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
} from "../../../components/form/form.component";
import { CountrySelectorComponent } from "../../../components/country-selector/country-selector.component";
import { PoliciesComponent } from "../../../components/policies/policies.component";

describe("<fui-sms-multi-factor-enrollment-form />", () => {
  let mockVerifyPhoneNumber: any;
  let mockEnrollWithMultiFactorAssertion: any;
  let mockFormatPhoneNumber: any;
  let mockFirebaseUIError: any;
  let mockMultiFactor: any;
  let mockPhoneAuthProvider: any;
  let mockPhoneMultiFactorGenerator: any;

  beforeEach(() => {
    const {
      verifyPhoneNumber,
      enrollWithMultiFactorAssertion,
      formatPhoneNumber,
      FirebaseUIError,
    } = require("@firebase-ui/core");
    const { PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor } = require("firebase/auth");

    mockVerifyPhoneNumber = verifyPhoneNumber;
    mockEnrollWithMultiFactorAssertion = enrollWithMultiFactorAssertion;
    mockFormatPhoneNumber = formatPhoneNumber;
    mockFirebaseUIError = FirebaseUIError;
    mockMultiFactor = multiFactor;
    mockPhoneAuthProvider = PhoneAuthProvider;
    mockPhoneMultiFactorGenerator = PhoneMultiFactorGenerator;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render phone number form initially", async () => {
    await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  it("should render verification form after phone number is submitted", async () => {
    const mockVerificationId = "test-verification-id";
    mockVerifyPhoneNumber.mockResolvedValue(mockVerificationId);

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set(mockVerificationId);
    fixture.detectChanges();

    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should handle phone number submission", async () => {
    const mockVerificationId = "test-verification-id";
    mockVerifyPhoneNumber.mockResolvedValue(mockVerificationId);

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.phoneForm.setFieldValue("displayName", "Test User");
    component.phoneForm.setFieldValue("phoneNumber", "1234567890");
    component.country.set("US" as any);
    fixture.detectChanges();

    await component.phoneForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.verificationId()).toBe(mockVerificationId);
    expect(component.displayName()).toBe("Test User");
  });

  it("should handle verification code submission", async () => {
    mockEnrollWithMultiFactorAssertion.mockResolvedValue(undefined);

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    component.displayName.set("Test User");
    fixture.detectChanges();

    const enrollmentSpy = jest.spyOn(component.onEnrollment, "emit");

    component.verificationForm.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.verificationForm.handleSubmit();
    await fixture.whenStable();

    expect(enrollmentSpy).toHaveBeenCalled();
  });

  it("should handle FirebaseUIError in phone verification", async () => {
    const errorMessage = "Invalid phone number";
    mockVerifyPhoneNumber.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.phoneForm.setFieldValue("displayName", "Test User");
    component.phoneForm.setFieldValue("phoneNumber", "1234567890");
    fixture.detectChanges();

    await component.phoneForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(component.verificationId()).toBeNull();
  });

  it("should handle FirebaseUIError in code verification", async () => {
    const errorMessage = "Invalid verification code";
    mockEnrollWithMultiFactorAssertion.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    component.displayName.set("Test User");
    fixture.detectChanges();

    component.verificationForm.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.verificationForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should format phone number correctly", async () => {
    const formattedNumber = "+1 (234) 567-8900";
    mockFormatPhoneNumber.mockReturnValue(formattedNumber);
    mockVerifyPhoneNumber.mockResolvedValue("test-verification-id");

    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.phoneForm.setFieldValue("displayName", "Test User");
    component.phoneForm.setFieldValue("phoneNumber", "1234567890");
    component.country.set("US" as any);
    fixture.detectChanges();

    await component.phoneForm.handleSubmit();
    await fixture.whenStable();

    expect(mockFormatPhoneNumber).toHaveBeenCalledWith("1234567890", expect.objectContaining({ code: "US" }));
    expect(mockVerifyPhoneNumber).toHaveBeenCalledWith(
      expect.any(Object),
      formattedNumber,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it("should throw error if user is not authenticated", async () => {
    const { fixture } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    // Mock UI to return null currentUser
    const mockUI = {
      auth: { currentUser: null },
    };
    jest.spyOn(component as any, "ui").mockReturnValue(() => mockUI);

    component.phoneForm.setFieldValue("displayName", "Test User");
    component.phoneForm.setFieldValue("phoneNumber", "1234567890");
    fixture.detectChanges();

    await component.phoneForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText("User must be authenticated to enroll with multi-factor authentication")).toBeInTheDocument();
  });

  it("should have correct CSS classes", async () => {
    const { container } = await render(SmsMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        SmsMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        CountrySelectorComponent,
        PoliciesComponent,
      ],
    });

    expect(container.querySelector(".fui-form-container")).toBeInTheDocument();
    expect(container.querySelector(".fui-form")).toBeInTheDocument();
    expect(container.querySelector(".fui-recaptcha-container")).toBeInTheDocument();
  });
});
