import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockUI } from "~/tests/utils";
import {
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  getBehavior,
  hasBehavior,
  recaptchaVerification,
  requireDisplayName,
  defaultBehaviors,
} from "./index";

vi.mock("./anonymous-upgrade", () => ({
  autoUpgradeAnonymousCredentialHandler: vi.fn(),
  autoUpgradeAnonymousProviderHandler: vi.fn(),
  autoUpgradeAnonymousUserRedirectHandler: vi.fn(),
}));

vi.mock("./require-display-name", () => ({
  requireDisplayNameHandler: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hasBehavior", () => {
  it("should return true if the behavior is enabled", () => {
    const mockBehavior = { type: "init" as const, handler: vi.fn() };
    const ui = createMockUI({
      behaviors: {
        autoAnonymousLogin: mockBehavior,
      } as any,
    });

    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(true);
    expect(mockBehavior.handler).not.toHaveBeenCalled();
  });

  it("should return false if the behavior is not enabled", () => {
    const ui = createMockUI();
    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(false);
  });

  it("should work with all behavior types", () => {
    const mockUI = createMockUI({
      behaviors: {
        autoAnonymousLogin: { type: "init" as const, handler: vi.fn() },
        autoUpgradeAnonymousCredential: { type: "callable" as const, handler: vi.fn() },
        autoUpgradeAnonymousProvider: { type: "callable" as const, handler: vi.fn() },
        recaptchaVerification: { type: "callable" as const, handler: vi.fn() },
        requireDisplayName: { type: "callable" as const, handler: vi.fn() },
      } as any,
    });

    expect(hasBehavior(mockUI, "autoAnonymousLogin")).toBe(true);
    expect(hasBehavior(mockUI, "autoUpgradeAnonymousCredential")).toBe(true);
    expect(hasBehavior(mockUI, "autoUpgradeAnonymousProvider")).toBe(true);
    expect(hasBehavior(mockUI, "recaptchaVerification")).toBe(true);
    expect(hasBehavior(mockUI, "requireDisplayName")).toBe(true);
  });
});

describe("getBehavior", () => {
  it("should throw if the behavior is not enabled", () => {
    const ui = createMockUI();
    expect(() => getBehavior(ui, "autoAnonymousLogin")).toThrow("Behavior autoAnonymousLogin not found");
  });

  it("should return the behavior handler if it is enabled", () => {
    const mockBehavior = { type: "init" as const, handler: vi.fn() };
    const ui = createMockUI({
      behaviors: {
        autoAnonymousLogin: mockBehavior,
      } as any,
    });

    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(true);
    expect(getBehavior(ui, "autoAnonymousLogin")).toBe(mockBehavior.handler);
  });

  it("should work with all behavior types", () => {
    const mockBehaviors = {
      autoAnonymousLogin: { type: "init" as const, handler: vi.fn() },
      autoUpgradeAnonymousCredential: { type: "callable" as const, handler: vi.fn() },
      autoUpgradeAnonymousProvider: { type: "callable" as const, handler: vi.fn() },
      recaptchaVerification: { type: "callable" as const, handler: vi.fn() },
      requireDisplayName: { type: "callable" as const, handler: vi.fn() },
    };

    const ui = createMockUI({ behaviors: mockBehaviors as any });

    expect(getBehavior(ui, "autoAnonymousLogin")).toBe(mockBehaviors.autoAnonymousLogin.handler);
    expect(getBehavior(ui, "autoUpgradeAnonymousCredential")).toBe(
      mockBehaviors.autoUpgradeAnonymousCredential.handler
    );
    expect(getBehavior(ui, "autoUpgradeAnonymousProvider")).toBe(mockBehaviors.autoUpgradeAnonymousProvider.handler);
    expect(getBehavior(ui, "recaptchaVerification")).toBe(mockBehaviors.recaptchaVerification.handler);
    expect(getBehavior(ui, "requireDisplayName")).toBe(mockBehaviors.requireDisplayName.handler);
  });
});

describe("autoAnonymousLogin", () => {
  it("should return behavior with correct structure", () => {
    const behavior = autoAnonymousLogin();

    expect(behavior).toHaveProperty("autoAnonymousLogin");
    expect(behavior.autoAnonymousLogin).toHaveProperty("type", "init");
    expect(behavior.autoAnonymousLogin).toHaveProperty("handler");
    expect(typeof behavior.autoAnonymousLogin.handler).toBe("function");
  });

  it("should not include other behaviors", () => {
    const behavior = autoAnonymousLogin();

    expect(behavior).not.toHaveProperty("autoUpgradeAnonymousCredential");
    expect(behavior).not.toHaveProperty("autoUpgradeAnonymousProvider");
    expect(behavior).not.toHaveProperty("recaptchaVerification");
  });
});

describe("autoUpgradeAnonymousUsers", () => {
  it("should return behaviors with correct structure", () => {
    const behavior = autoUpgradeAnonymousUsers();

    expect(behavior).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(behavior).toHaveProperty("autoUpgradeAnonymousProvider");
    expect(behavior).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");

    expect(behavior.autoUpgradeAnonymousCredential).toHaveProperty("type", "callable");
    expect(behavior.autoUpgradeAnonymousProvider).toHaveProperty("type", "callable");
    expect(behavior.autoUpgradeAnonymousUserRedirectHandler).toHaveProperty("type", "redirect");

    expect(typeof behavior.autoUpgradeAnonymousCredential.handler).toBe("function");
    expect(typeof behavior.autoUpgradeAnonymousProvider.handler).toBe("function");
    expect(typeof behavior.autoUpgradeAnonymousUserRedirectHandler.handler).toBe("function");
  });

  it("should work with onUpgrade callback option", () => {
    const mockOnUpgrade = vi.fn();
    const behavior = autoUpgradeAnonymousUsers({ onUpgrade: mockOnUpgrade });

    expect(behavior).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(behavior).toHaveProperty("autoUpgradeAnonymousProvider");
    expect(behavior).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");

    expect(typeof behavior.autoUpgradeAnonymousCredential.handler).toBe("function");
    expect(typeof behavior.autoUpgradeAnonymousProvider.handler).toBe("function");
    expect(typeof behavior.autoUpgradeAnonymousUserRedirectHandler.handler).toBe("function");
  });

  it("should pass onUpgrade callback to handlers when called", async () => {
    const mockOnUpgrade = vi.fn();
    const behavior = autoUpgradeAnonymousUsers({ onUpgrade: mockOnUpgrade });

    const mockUI = createMockUI();
    const mockCredential = { providerId: "password" } as any;
    const mockProvider = { providerId: "google.com" } as any;
    const mockUserCredential = { user: { uid: "upgraded-123" } } as any;

    const {
      autoUpgradeAnonymousCredentialHandler,
      autoUpgradeAnonymousProviderHandler,
      autoUpgradeAnonymousUserRedirectHandler,
    } = await import("./anonymous-upgrade");

    await behavior.autoUpgradeAnonymousCredential.handler(mockUI, mockCredential);
    await behavior.autoUpgradeAnonymousProvider.handler(mockUI, mockProvider);
    await behavior.autoUpgradeAnonymousUserRedirectHandler.handler(mockUI, mockUserCredential);

    expect(autoUpgradeAnonymousCredentialHandler).toHaveBeenCalledWith(mockUI, mockCredential, mockOnUpgrade);
    expect(autoUpgradeAnonymousProviderHandler).toHaveBeenCalledWith(mockUI, mockProvider, mockOnUpgrade);
    expect(autoUpgradeAnonymousUserRedirectHandler).toHaveBeenCalledWith(mockUI, mockUserCredential, mockOnUpgrade);
  });

  it("should not include other behaviors", () => {
    const behavior = autoUpgradeAnonymousUsers();

    expect(behavior).not.toHaveProperty("autoAnonymousLogin");
    expect(behavior).not.toHaveProperty("recaptchaVerification");
  });
});

describe("recaptchaVerification", () => {
  it("should return behavior with correct structure", () => {
    const behavior = recaptchaVerification();

    expect(behavior).toHaveProperty("recaptchaVerification");
    expect(behavior.recaptchaVerification).toHaveProperty("type", "callable");
    expect(behavior.recaptchaVerification).toHaveProperty("handler");
    expect(typeof behavior.recaptchaVerification.handler).toBe("function");
  });

  it("should work with custom options", () => {
    const customOptions = {
      size: "normal" as const,
      theme: "dark" as const,
      tabindex: 5,
    };

    const behavior = recaptchaVerification(customOptions);

    expect(behavior).toHaveProperty("recaptchaVerification");
    expect(behavior.recaptchaVerification).toHaveProperty("type", "callable");
    expect(behavior.recaptchaVerification).toHaveProperty("handler");
    expect(typeof behavior.recaptchaVerification.handler).toBe("function");
  });

  it("should not include other behaviors", () => {
    const behavior = recaptchaVerification();

    expect(behavior).not.toHaveProperty("autoAnonymousLogin");
    expect(behavior).not.toHaveProperty("autoUpgradeAnonymousCredential");
    expect(behavior).not.toHaveProperty("autoUpgradeAnonymousProvider");
  });
});

describe("requireDisplayName", () => {
  it("should return behavior with correct structure", () => {
    const behavior = requireDisplayName();

    expect(behavior).toHaveProperty("requireDisplayName");
    expect(behavior.requireDisplayName).toHaveProperty("type", "callable");
    expect(behavior.requireDisplayName).toHaveProperty("handler");
    expect(typeof behavior.requireDisplayName.handler).toBe("function");
  });

  it("should call the requireDisplayNameHandler when executed", async () => {
    const behavior = requireDisplayName();
    const mockUI = createMockUI();
    const mockUser = { uid: "test-user-123" } as any;
    const displayName = "John Doe";

    const { requireDisplayNameHandler } = await import("./require-display-name");

    await behavior.requireDisplayName.handler(mockUI, mockUser, displayName);

    expect(requireDisplayNameHandler).toHaveBeenCalledWith(mockUI, mockUser, displayName);
  });
});

describe("defaultBehaviors", () => {
  it("should include recaptchaVerification by default", () => {
    expect(defaultBehaviors).toHaveProperty("recaptchaVerification");
    expect(defaultBehaviors).toHaveProperty("providerSignInStrategy");
    expect(defaultBehaviors).toHaveProperty("providerLinkStrategy");
    expect(defaultBehaviors).toHaveProperty("countryCodes");
  });

  it("should not include other behaviors by default", () => {
    expect(defaultBehaviors).not.toHaveProperty("autoAnonymousLogin");
    expect(defaultBehaviors).not.toHaveProperty("autoUpgradeAnonymousCredential");
    expect(defaultBehaviors).not.toHaveProperty("autoUpgradeAnonymousProvider");
    expect(defaultBehaviors).not.toHaveProperty("requireDisplayName");
  });
});
