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
import { MultiFactorAuthEnrollmentFormComponent } from "./multi-factor-auth-enrollment-form";
import { SmsMultiFactorEnrollmentFormComponent } from "./mfa/sms-multi-factor-enrollment-form";
import { TotpMultiFactorEnrollmentFormComponent } from "./mfa/totp-multi-factor-enrollment-form";
import { ButtonComponent } from "../../components/button";
import { FactorId } from "firebase/auth";

describe("<fui-multi-factor-auth-enrollment-form />", () => {
  it("should create", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render selection buttons when multiple hints are provided", async () => {
    await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP, FactorId.PHONE],
      },
    });

    expect(screen.getByRole("button", { name: "SMS Verification" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "TOTP Verification" })).toBeInTheDocument();
  });

  it("should auto-select single hint when only one is provided", async () => {
    await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.PHONE],
      },
    });

    expect(screen.queryByRole("button", { name: "SMS Verification" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "TOTP Verification" })).not.toBeInTheDocument();

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
  });

  it("should show SMS form when SMS hint is selected", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP, FactorId.PHONE],
      },
    });

    const smsButton = screen.getByRole("button", { name: "SMS Verification" });
    fireEvent.click(smsButton);
    fixture.detectChanges();

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  it("should show TOTP form when TOTP hint is selected", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP, FactorId.PHONE],
      },
    });

    const totpButton = screen.getByRole("button", { name: "TOTP Verification" });
    fireEvent.click(totpButton);
    fixture.detectChanges();

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate QR Code" })).toBeInTheDocument();
  });

  it("should emit onEnrollment when SMS form completes enrollment", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.PHONE],
      },
    });

    const component = fixture.componentInstance;
    const enrollmentSpy = jest.spyOn(component.onEnrollment, "emit");

    const smsFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof SmsMultiFactorEnrollmentFormComponent
    )?.componentInstance as SmsMultiFactorEnrollmentFormComponent;

    expect(smsFormComponent).toBeTruthy();
    smsFormComponent.onEnrollment.emit();

    expect(enrollmentSpy).toHaveBeenCalled();
  });

  it("should emit onEnrollment when TOTP form completes enrollment", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP],
      },
    });

    const component = fixture.componentInstance;
    const enrollmentSpy = jest.spyOn(component.onEnrollment, "emit");

    const totpFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof TotpMultiFactorEnrollmentFormComponent
    )?.componentInstance as TotpMultiFactorEnrollmentFormComponent;

    expect(totpFormComponent).toBeTruthy();
    totpFormComponent.onEnrollment.emit();

    expect(enrollmentSpy).toHaveBeenCalled();
  });

  it("should have correct CSS classes", async () => {
    const { container } = await render(MultiFactorAuthEnrollmentFormComponent, {
      imports: [
        CommonModule,
        MultiFactorAuthEnrollmentFormComponent,
        SmsMultiFactorEnrollmentFormComponent,
        TotpMultiFactorEnrollmentFormComponent,
        ButtonComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP, FactorId.PHONE],
      },
    });

    expect(container.querySelector(".fui-content")).toBeInTheDocument();
  });

  it("should throw error when hints array is empty", async () => {
    await expect(
      render(MultiFactorAuthEnrollmentFormComponent, {
        imports: [
          CommonModule,
          MultiFactorAuthEnrollmentFormComponent,
          SmsMultiFactorEnrollmentFormComponent,
          TotpMultiFactorEnrollmentFormComponent,
          ButtonComponent,
        ],
        componentInputs: {
          hints: [],
        },
      })
    ).rejects.toThrow("MultiFactorAuthEnrollmentForm must have at least one hint");
  });

  it("should throw error for unknown hint type", async () => {
    const unknownHint = "unknown" as any;

    await expect(
      render(MultiFactorAuthEnrollmentFormComponent, {
        imports: [
          CommonModule,
          MultiFactorAuthEnrollmentFormComponent,
          SmsMultiFactorEnrollmentFormComponent,
          TotpMultiFactorEnrollmentFormComponent,
          ButtonComponent,
        ],
        componentInputs: {
          hints: [unknownHint],
        },
      })
    ).rejects.toThrow("Unknown multi-factor enrollment type: unknown");
  });
});
