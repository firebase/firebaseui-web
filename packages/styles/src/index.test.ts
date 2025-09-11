/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE/2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect } from "vitest";
import { buttonVariant, type ButtonVariant } from "./index";

describe("buttonVariant", () => {
  it("should return base class when no variant is provided", () => {
    const result = buttonVariant();
    expect(result).toBe("fui-button");
  });

  it("should return base class with primary variant (default)", () => {
    const result = buttonVariant({ variant: "primary" });
    expect(result).toBe("fui-button");
  });

  it("should return base class with secondary variant", () => {
    const result = buttonVariant({ variant: "secondary" });
    expect(result).toBe("fui-button fui-button--secondary");
  });

  it("should handle empty variant object", () => {
    const result = buttonVariant({});
    expect(result).toBe("fui-button");
  });

  it("should handle undefined variant", () => {
    const result = buttonVariant({ variant: undefined });
    expect(result).toBe("fui-button");
  });
});

describe("ButtonVariant type", () => {
  it("should accept valid variant values", () => {
    const primaryVariant: ButtonVariant = "primary";
    const secondaryVariant: ButtonVariant = "secondary";
    
    expect(primaryVariant).toBe("primary");
    expect(secondaryVariant).toBe("secondary");
  });

  it("should work with buttonVariant function", () => {
    const variants: ButtonVariant[] = ["primary", "secondary"];
    
    variants.forEach((variant) => {
      const result = buttonVariant({ variant });
      expect(typeof result).toBe("string");
      expect(result).toContain("fui-button");
    });
  });
});
