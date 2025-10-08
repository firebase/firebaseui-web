import { describe, it, expect } from "vitest";
import { countryData, formatPhoneNumber, CountryData, CountryCode } from "./country-data";

describe("CountryData", () => {
  describe("CountryData interface", () => {
    it("should have correct structure for all countries", () => {
      countryData.forEach((country) => {
        expect(country).toHaveProperty("name");
        expect(country).toHaveProperty("dialCode");
        expect(country).toHaveProperty("code");
        expect(country).toHaveProperty("emoji");

        expect(typeof country.name).toBe("string");
        expect(typeof country.dialCode).toBe("string");
        expect(typeof country.code).toBe("string");
        expect(typeof country.emoji).toBe("string");

        expect(country.name.length).toBeGreaterThan(0);
        expect(country.dialCode).toMatch(/^\+\d+$/);
        expect(country.code).toMatch(/^[A-Z]{2}$/);
        expect(country.emoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe("countryData array", () => {
    it("should have valid dial codes", () => {
      countryData.forEach((country) => {
        expect(country.dialCode).toMatch(/^\+\d{1,4}$/);
        expect(country.dialCode.length).toBeGreaterThanOrEqual(2); // +1
        expect(country.dialCode.length).toBeLessThanOrEqual(5); // +1234
      });
    });

    it("should have valid country codes (ISO 3166-1 alpha-2)", () => {
      countryData.forEach((country) => {
        expect(country.code).toMatch(/^[A-Z]{2}$/);
      });
    });

    it("should have valid emojis", () => {
      countryData.forEach((country) => {
        // Emojis should be flag emojis (typically 2 characters in UTF-16)
        expect(country.emoji.length).toBeGreaterThan(0);
        // Most flag emojis are 4 bytes in UTF-8, but some might be different
        expect(country.emoji).toMatch(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
      });
    });
  });

  describe("CountryCode type", () => {
    it("should have proper literal types", () => {
      // These should be valid CountryCode values
      const validCodes: CountryCode[] = ["US", "GB", "CA", "AU", "DE", "FR"];
      expect(validCodes).toBeDefined();

      // Test that we can find countries by their codes
      const usCountry = countryData.find((country) => country.code === "US");
      const gbCountry = countryData.find((country) => country.code === "GB");

      expect(usCountry).toBeDefined();
      expect(gbCountry).toBeDefined();
      expect(usCountry?.code).toBe("US");
      expect(gbCountry?.code).toBe("GB");
    });
  });

  describe("formatPhoneNumber", () => {
    const ukCountry: CountryData = { name: "United Kingdom", dialCode: "+44", code: "GB", emoji: "🇬🇧" };
    const usCountry: CountryData = { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" };
    const kzCountry: CountryData = { name: "Kazakhstan", dialCode: "+7", code: "KZ", emoji: "🇰🇿" };

    describe("basic formatting", () => {
      it("should format phone number with country dial code", () => {
        expect(formatPhoneNumber("1234567890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("1234567890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("1234567890", kzCountry)).toBe("+71234567890");
      });

      it("should handle phone numbers with spaces and special characters", () => {
        expect(formatPhoneNumber("123 456 7890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("(123) 456-7890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("123-456-7890", kzCountry)).toBe("+71234567890");
      });

      it("should return cleaned number when no country data provided", () => {
        expect(formatPhoneNumber("1234567890")).toBe("1234567890");
        expect(formatPhoneNumber("+44 1234567890")).toBe("+441234567890");
        expect(formatPhoneNumber("(123) 456-7890")).toBe("1234567890");
      });
    });

    describe("handling numbers with existing country codes", () => {
      it("should preserve correct country code", () => {
        expect(formatPhoneNumber("+441234567890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("+11234567890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("+71234567890", kzCountry)).toBe("+71234567890");
      });

      it("should replace incorrect country code", () => {
        expect(formatPhoneNumber("+11234567890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("+441234567890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("+441234567890", kzCountry)).toBe("+71234567890");
      });

      it("should handle numbers with different country codes", () => {
        expect(formatPhoneNumber("+7707480842372", ukCountry)).toBe("+44707480842372");
        expect(formatPhoneNumber("+7707480842372", usCountry)).toBe("+17707480842372");
        expect(formatPhoneNumber("+447480842372", kzCountry)).toBe("+774480842372");
      });
    });

    describe("handling numbers starting with 0", () => {
      it("should remove leading 0 and add country code", () => {
        expect(formatPhoneNumber("07480842372", ukCountry)).toBe("+447480842372");
        expect(formatPhoneNumber("01234567890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("07123456789", kzCountry)).toBe("+77123456789");
      });

      it("should handle numbers with 0 and existing country code", () => {
        expect(formatPhoneNumber("+4407480842372", ukCountry)).toBe("+4407480842372");
        expect(formatPhoneNumber("+101234567890", usCountry)).toBe("+101234567890");
      });
    });

    describe("handling numbers with country dial code without +", () => {
      it("should add + to numbers starting with country dial code", () => {
        expect(formatPhoneNumber("441234567890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("11234567890", usCountry)).toBe("+11234567890");
        expect(formatPhoneNumber("71234567890", kzCountry)).toBe("+71234567890");
      });
    });

    describe("edge cases", () => {
      it("should handle empty phone numbers", () => {
        expect(formatPhoneNumber("", ukCountry)).toBe("+44");
        expect(formatPhoneNumber("   ", ukCountry)).toBe("+44");
        expect(formatPhoneNumber("")).toBe("");
      });

      it("should handle very long phone numbers", () => {
        const longNumber = "12345678901234567890";
        expect(formatPhoneNumber(longNumber, ukCountry)).toBe("+4412345678901234567890");
      });

      it("should handle numbers with multiple + signs", () => {
        expect(formatPhoneNumber("++441234567890", ukCountry)).toBe("+441234567890");
        expect(formatPhoneNumber("+44+1234567890", ukCountry)).toBe("+441234567890");
      });

      it("should handle numbers with mixed formatting", () => {
        expect(formatPhoneNumber("+44 (0) 1234 567890", ukCountry)).toBe("+4401234567890");
        expect(formatPhoneNumber("+1-800-123-4567", usCountry)).toBe("+18001234567");
      });
    });

    describe("real-world examples", () => {
      it("should handle UK mobile numbers", () => {
        expect(formatPhoneNumber("07480842372", ukCountry)).toBe("+447480842372");
        expect(formatPhoneNumber("+447480842372", ukCountry)).toBe("+447480842372");
        expect(formatPhoneNumber("447480842372", ukCountry)).toBe("+447480842372");
      });

      it("should handle US phone numbers", () => {
        expect(formatPhoneNumber("(555) 123-4567", usCountry)).toBe("+15551234567");
        expect(formatPhoneNumber("555-123-4567", usCountry)).toBe("+15551234567");
        expect(formatPhoneNumber("+15551234567", usCountry)).toBe("+15551234567");
      });

      it("should handle Kazakhstan numbers", () => {
        expect(formatPhoneNumber("+7707480842372", kzCountry)).toBe("+7707480842372");
        expect(formatPhoneNumber("707480842372", kzCountry)).toBe("+707480842372");
        expect(formatPhoneNumber("077480842372", kzCountry)).toBe("+77480842372");
      });
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle countries with multiple dial codes", () => {
      const kosovoCountries = countryData.filter((country) => country.code === "XK");
      expect(kosovoCountries.length).toBeGreaterThan(1);

      // Test that Kosovo has multiple entries with different dial codes
      const dialCodes = kosovoCountries.map((country) => country.dialCode);
      expect(dialCodes).toContain("+377");
      expect(dialCodes).toContain("+381");
      expect(dialCodes).toContain("+386");
    });
  });
});
