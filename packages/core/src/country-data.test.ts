import { describe, it, expect } from "vitest";
import { countryData, getCountryByDialCode, getCountryByCode, formatPhoneNumberWithCountry } from "./country-data";

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

  describe("getCountryByDialCode", () => {
    it("should return correct country for valid dial code", () => {
      const usCountry = getCountryByDialCode("+1");
      expect(usCountry).toBeDefined();
      expect(usCountry?.code).toBe("US");
      expect(usCountry?.name).toBe("United States");

      const ukCountry = getCountryByDialCode("+44");
      expect(ukCountry).toBeDefined();
      expect(ukCountry?.code).toBe("GB");
      expect(ukCountry?.name).toBe("United Kingdom");

      const japanCountry = getCountryByDialCode("+81");
      expect(japanCountry).toBeDefined();
      expect(japanCountry?.code).toBe("JP");
      expect(japanCountry?.name).toBe("Japan");
    });

    it("should return undefined for invalid dial code", () => {
      expect(getCountryByDialCode("+999")).toBeUndefined();
      expect(getCountryByDialCode("invalid")).toBeUndefined();
      expect(getCountryByDialCode("")).toBeUndefined();
    });

    it("should handle dial codes with multiple countries", () => {
      const countries = countryData.filter((country) => country.dialCode === "+1");
      expect(countries.length).toBeGreaterThan(1);

      // Should return the first match (US)
      const result = getCountryByDialCode("+1");
      expect(result?.code).toBe("US");
    });
  });

  describe("getCountryByCode", () => {
    it("should return correct country for valid country code", () => {
      const usCountry = getCountryByCode("US");
      expect(usCountry).toBeDefined();
      expect(usCountry?.code).toBe("US");
      expect(usCountry?.name).toBe("United States");
      expect(usCountry?.dialCode).toBe("+1");

      const ukCountry = getCountryByCode("GB");
      expect(ukCountry).toBeDefined();
      expect(ukCountry?.code).toBe("GB");
      expect(ukCountry?.name).toBe("United Kingdom");
      expect(ukCountry?.dialCode).toBe("+44");
    });

    it("should handle case insensitive country codes", () => {
      // @ts-expect-error - we want to test case insensitivity
      expect(getCountryByCode("us")).toBeDefined();
      // @ts-expect-error - we want to test case insensitivity
      expect(getCountryByCode("Us")).toBeDefined();
      // @ts-expect-error - we want to test case insensitivity
      expect(getCountryByCode("uS")).toBeDefined();

      expect(getCountryByCode("US")).toBeDefined();
      // @ts-expect-error - we want to test case insensitivity
      const result = getCountryByCode("us");
      expect(result?.code).toBe("US");
    });

    it("should return undefined for invalid country code", () => {
      // @ts-expect-error - we want to test invalid country code
      expect(getCountryByCode("XX")).toBeUndefined();
      // @ts-expect-error - we want to test invalid country code
      expect(getCountryByCode("INVALID")).toBeUndefined();
      // @ts-expect-error - we want to test case insensitivity
      expect(getCountryByCode("")).toBeUndefined();
      // @ts-expect-error - we want to test invalid country code
      expect(getCountryByCode("U")).toBeUndefined();
      // @ts-expect-error - we want to test invalid country code
      expect(getCountryByCode("USA")).toBeUndefined();
    });

    it("should handle special characters in country codes", () => {
      expect(getCountryByCode("XK")).toBeDefined(); // Kosovo
    });
  });

  describe("formatPhoneNumberWithCountry", () => {
    it("should format phone number with country dial code", () => {
      expect(formatPhoneNumberWithCountry("1234567890", "US")).toBe("+11234567890");
      expect(formatPhoneNumberWithCountry("1234567890", "GB")).toBe("+441234567890");
      expect(formatPhoneNumberWithCountry("1234567890", "JP")).toBe("+811234567890");
    });

    it("should handle phone numbers with spaces", () => {
      expect(formatPhoneNumberWithCountry("123 456 7890", "US")).toBe("+1123 456 7890");
      expect(formatPhoneNumberWithCountry(" 1234567890 ", "US")).toBe("+11234567890");
    });

    it("should handle empty phone numbers", () => {
      expect(formatPhoneNumberWithCountry("", "US")).toBe("+1");
      expect(formatPhoneNumberWithCountry("   ", "US")).toBe("+1");
    });

    it("should handle phone numbers with dashes and parentheses", () => {
      expect(formatPhoneNumberWithCountry("(123) 456-7890", "US")).toBe("+1(123) 456-7890");
      expect(formatPhoneNumberWithCountry("123-456-7890", "US")).toBe("+1123-456-7890");
    });

    it("should handle international numbers with existing dial codes", () => {
      expect(formatPhoneNumberWithCountry("+44 20 7946 0958", "US")).toBe("+120 7946 0958");
      expect(formatPhoneNumberWithCountry("+81 3 1234 5678", "GB")).toBe("+443 1234 5678");
    });

    it("should handle edge cases", () => {
      expect(formatPhoneNumberWithCountry("1234567890", "MC")).toBe("+3771234567890");
      expect(formatPhoneNumberWithCountry("1234567890", "RU")).toBe("+71234567890");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle very long phone numbers", () => {
      const longNumber = "12345678901234567890";
      expect(formatPhoneNumberWithCountry(longNumber, "US")).toBe("+112345678901234567890");
    });

    it("should handle countries with multiple dial codes", () => {
      const kosovoCountries = countryData.filter((country) => country.code === "XK");
      expect(kosovoCountries.length).toBeGreaterThan(1);

      const result1 = getCountryByDialCode("+377");
      const result2 = getCountryByDialCode("+381");
      const result3 = getCountryByDialCode("+386");

      expect(result1?.code).toBe("XK");
      expect(result2?.code).toBe("XK");
      expect(result3?.code).toBe("XK");
    });
  });
});
