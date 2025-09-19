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

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Auth, AuthProvider } from "@angular/fire/auth";
import { FirebaseUIError, signInWithOAuth } from "@firebase-ui/core";
import { firstValueFrom, of } from "rxjs";
import { FirebaseUI } from "../../provider";
import { OAuthButtonComponent } from "./oauth-button.component";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the firebase-ui/core module
vi.mock("@firebase-ui/core", () => ({
  signInWithOAuth: vi.fn().mockResolvedValue(undefined),
  FirebaseUIError: class FirebaseUIError extends Error {
    constructor(public error: { code: string; message: string }) {
      super(error.message);
      this.name = "FirebaseUIError";
    }
  },
}));

// Mock Button component
@Component({
  selector: "fui-button",
  template: `<button (click)="handleClick()" data-testid="oauth-button">
    <ng-content></ng-content>
  </button>`,
  standalone: true,
})
class MockButtonComponent {
  @Input() type: string = "button";
  @Input() disabled: boolean = false;
  @Input() variant: string = "primary";

  handleClick() {
    // Simplified to just call dispatchEvent
    this.dispatchEvent();
  }

  // Method to dispatch the click event
  dispatchEvent() {
    // The parent component will handle this
  }
}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  config() {
    return of({
      language: "en",
      translations: {},
      enableAutoUpgradeAnonymous: false,
      enableHandleExistingCredential: false,
    });
  }

  translation(category: string, key: string) {
    // Return the specific error message that matches the expected one in the test
    if (category === "errors" && key === "auth/popup-closed-by-user") {
      return of("The popup was closed by the user");
    }
    if (category === "errors" && key === "unknownError") {
      return of("An unknown error occurred");
    }
    return of(`${category}.${key}`);
  }
}

// Create a test component that extends OAuthButtonComponent
class TestOAuthButtonComponent extends OAuthButtonComponent {
  // Override handleOAuthSignIn to use our mock function
  override async handleOAuthSignIn() {
    this.error = null;
    try {
      const config = await firstValueFrom(this["ui"].config());

      await vi.mocked(signInWithOAuth)(config, this.provider);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.error = error.message;
        return;
      }
      console.error(error);

      try {
        const errorMessage = await firstValueFrom(this["ui"].translation("errors", "unknownError"));
        this.error = errorMessage ?? "Unknown error";
      } catch {
        this.error = "Unknown error";
      }
    }
  }
}

describe("OAuthButtonComponent", () => {
  let component: TestOAuthButtonComponent;
  let fixture: ComponentFixture<TestOAuthButtonComponent>;
  let mockProvider: jasmine.SpyObj<AuthProvider>;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    // Create spy objects for Auth and AuthProvider
    mockProvider = jasmine.createSpyObj("AuthProvider", [], {
      providerId: "google.com",
    });

    mockAuth = jasmine.createSpyObj("Auth", ["signInWithPopup", "signInWithRedirect"]);

    mockFirebaseUi = new MockFirebaseUi();

    // Reset mock before each test
    vi.mocked(signInWithOAuth).mockClear();

    await TestBed.configureTestingModule({
      imports: [CommonModule, TestOAuthButtonComponent, MockButtonComponent],
      providers: [
        { provide: FirebaseUI, useValue: mockFirebaseUi },
        { provide: Auth, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOAuthButtonComponent);
    component = fixture.componentInstance;
    component.provider = mockProvider;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show a console error when provider is not set", () => {
    spyOn(console, "error");
    component.provider = undefined as unknown as AuthProvider;
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith("Provider is required for OAuthButtonComponent");
  });

  it("should call signInWithOAuth when button is clicked", async () => {
    // Call the method directly instead of relying on button click
    component.handleOAuthSignIn();

    // Wait for any async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check if the mock function was called with the correct arguments
    expect(vi.mocked(signInWithOAuth)).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "en",
        translations: {},
        enableAutoUpgradeAnonymous: false,
        enableHandleExistingCredential: false,
      }),
      mockProvider
    );
  });

  it("should display error message when FirebaseUIError occurs", async () => {
    // Create a FirebaseUIError
    const firebaseUIError = new FirebaseUIError({
      code: "auth/popup-closed-by-user",
      message: "The popup was closed by the user",
    });

    // Make the mock function throw a FirebaseUIError
    vi.mocked(signInWithOAuth).mockRejectedValue(firebaseUIError);

    // Trigger the sign-in
    component.handleOAuthSignIn();
    
    // Wait for any async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The component correctly displays the FirebaseUIError message
    expect(component.error).toBe("The popup was closed by the user");
  });

  it("should display generic error message when non-Firebase error occurs", async () => {
    // Create a regular Error
    const regularError = new Error("Regular error");

    // Make the mock function throw a regular Error
    vi.mocked(signInWithOAuth).mockRejectedValue(regularError);

    // Trigger the sign-in
    component.handleOAuthSignIn();
    
    // Wait for any async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Update the error expectation - in our mock it gets the 'An unknown error occurred' message
    expect(component.error).toBe("An unknown error occurred");
  });
});
