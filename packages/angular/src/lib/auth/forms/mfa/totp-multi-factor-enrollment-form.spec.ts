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
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { TotpMultiFactorEnrollmentFormComponent } from "./totp-multi-factor-enrollment-form";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import { PoliciesComponent } from "../../../components/policies";

describe("<fui-totp-multi-factor-enrollment-form />", () => {
  let mockGenerateTotpSecret: any;
  let mockEnrollWithMultiFactorAssertion: any;
  let mockGenerateTotpQrCode: any;
  let mockFirebaseUIError: any;
  let mockTotpMultiFactorGenerator: any;

  beforeEach(() => {
    const {
      generateTotpSecret,
      enrollWithMultiFactorAssertion,
      generateTotpQrCode,
      FirebaseUIError,
      TotpMultiFactorGenerator,
      injectTranslation,
      injectUI,
      injectMultiFactorTotpAuthEnrollmentFormSchema,
      injectMultiFactorTotpAuthVerifyFormSchema,
    } = require("../../../tests/test-helpers");

    mockGenerateTotpSecret = generateTotpSecret;
    mockEnrollWithMultiFactorAssertion = enrollWithMultiFactorAssertion;
    mockGenerateTotpQrCode = generateTotpQrCode;
    mockFirebaseUIError = FirebaseUIError;
    mockTotpMultiFactorGenerator = TotpMultiFactorGenerator;

    // Mock provider functions
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          displayName: "Display Name",
          generateQrCode: "Generate QR Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
        errors: {
          unknownError: "An unknown error occurred",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectUI.mockImplementation(() => {
      return () => ({
        auth: {
          currentUser: { uid: "test-user" },
        },
      });
    });

    injectMultiFactorTotpAuthEnrollmentFormSchema.mockImplementation(() => {
      return () => jest.fn();
    });

    injectMultiFactorTotpAuthVerifyFormSchema.mockImplementation(() => {
      return () => jest.fn();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", async () => {
    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render display name form initially", async () => {
    await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate QR Code" })).toBeInTheDocument();
  });

  it("should render QR code and verification form after display name is submitted", async () => {
    const mockSecret = {
      generateQrCodeUrl: jest.fn(),
      sessionInfo: {},
      auth: {},
      secretKey: new Uint8Array(),
      hashingAlgorithm: "SHA1",
      codeLength: 6,
      timeStepSize: 30,
    } as any;
    mockGenerateTotpSecret.mockResolvedValue(mockSecret);
    mockGenerateTotpQrCode.mockReturnValue("data:image/png;base64,test-qr-code");

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.enrollment.set({ secret: mockSecret, displayName: "Test User" });
    fixture.detectChanges();

    expect(screen.getByAltText("TOTP QR Code")).toBeInTheDocument();
    expect(screen.getByText("TODO: Scan this QR code with your authenticator app")).toBeInTheDocument();
    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should handle display name submission", async () => {
    const mockSecret = {
      generateQrCodeUrl: jest.fn(),
      sessionInfo: {},
      auth: {},
      secretKey: new Uint8Array(),
      hashingAlgorithm: "SHA1",
      codeLength: 6,
      timeStepSize: 30,
    } as any;
    mockGenerateTotpSecret.mockResolvedValue(mockSecret);

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.displayNameForm.setFieldValue("displayName", "Test User");
    fixture.detectChanges();

    await component.displayNameForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.enrollment()).toEqual({ secret: mockSecret, displayName: "Test User" });
  });

  it("should handle verification code submission", async () => {
    const mockSecret = {
      generateQrCodeUrl: jest.fn(),
      sessionInfo: {},
      auth: {},
      secretKey: new Uint8Array(),
      hashingAlgorithm: "SHA1",
      codeLength: 6,
      timeStepSize: 30,
    } as any;
    mockEnrollWithMultiFactorAssertion.mockResolvedValue(undefined);

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.enrollment.set({ secret: mockSecret, displayName: "Test User" });
    fixture.detectChanges();

    const enrollmentSpy = jest.spyOn(component.onEnrollment, "emit");

    component.verificationForm.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.verificationForm.handleSubmit();
    await fixture.whenStable();

    expect(enrollmentSpy).toHaveBeenCalled();
  });

  it("should handle FirebaseUIError in secret generation", async () => {
    const errorMessage = "Failed to generate TOTP secret";
    mockGenerateTotpSecret.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.displayNameForm.setFieldValue("displayName", "Test User");
    fixture.detectChanges();

    await component.displayNameForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(component.enrollment()).toBeNull();
  });

  it("should handle FirebaseUIError in verification", async () => {
    const errorMessage = "Invalid verification code";
    mockEnrollWithMultiFactorAssertion.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const mockSecret = {
      generateQrCodeUrl: jest.fn(),
      sessionInfo: {},
      auth: {},
      secretKey: new Uint8Array(),
      hashingAlgorithm: "SHA1",
      codeLength: 6,
      timeStepSize: 30,
    } as any;
    component.enrollment.set({ secret: mockSecret, displayName: "Test User" });
    fixture.detectChanges();

    component.verificationForm.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.verificationForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should throw error if user is not authenticated", async () => {
    // Override the injectUI mock for this test
    const { injectUI } = require("../../../tests/test-helpers");
    injectUI.mockImplementation(() => {
      return () => ({
        auth: {
          currentUser: null,
        },
      });
    });

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.displayNameForm.setFieldValue("displayName", "Test User");
    fixture.detectChanges();

    await component.displayNameForm.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      screen.getByText("User must be authenticated to enroll with multi-factor authentication")
    ).toBeInTheDocument();
  });

  it("should generate QR code with correct parameters", async () => {
    const mockSecret = {
      generateQrCodeUrl: jest.fn(),
      sessionInfo: {},
      auth: {},
      secretKey: new Uint8Array(),
      hashingAlgorithm: "SHA1",
      codeLength: 6,
      timeStepSize: 30,
    } as any;
    const mockQrCodeDataUrl = "data:image/png;base64,test-qr-code";
    mockGenerateTotpSecret.mockResolvedValue(mockSecret);
    mockGenerateTotpQrCode.mockReturnValue(mockQrCodeDataUrl);

    const { fixture } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.enrollment.set({ secret: mockSecret, displayName: "Test User" });
    fixture.detectChanges();

    expect(component.qrCodeDataUrl()).toBe(mockQrCodeDataUrl);
    expect(mockGenerateTotpQrCode).toHaveBeenCalledWith(expect.any(Object), mockSecret, "Test User");
  });

  it("should have correct CSS classes", async () => {
    const { container } = await render(TotpMultiFactorEnrollmentFormComponent, {
      imports: [
        CommonModule,
        TotpMultiFactorEnrollmentFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        PoliciesComponent,
      ],
    });

    expect(container.querySelector(".fui-form-container")).toBeInTheDocument();
    expect(container.querySelector(".fui-form")).toBeInTheDocument();
  });
});
