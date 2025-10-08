import { describe, it, expect, vi } from "vitest";
import { countryCodesHandler, CountryCodesOptions } from "./country-codes";
import { countryData } from "../country-data";

describe("countryCodesHandler", () => {
  describe("default behavior", () => {
    it("should return all countries when no options provided", () => {
      const result = countryCodesHandler();

      expect(result.allowedCountries).toEqual(countryData);
      expect(result.defaultCountry).toEqual(countryData.find((country) => country.code === "US"));
    });

    it("should return all countries when empty options provided", () => {
      const result = countryCodesHandler({});

      expect(result.allowedCountries).toEqual(countryData);
      expect(result.defaultCountry).toEqual(countryData.find((country) => country.code === "US"));
    });
  });

  describe("allowedCountries filtering", () => {
    it("should filter countries based on allowedCountries", () => {
      const options: CountryCodesOptions = {
        allowedCountries: ["US", "GB", "CA"],
      };

      const result = countryCodesHandler(options);

      expect(result.allowedCountries).toHaveLength(3);
      // Order is preserved from original countryData array, not from allowedCountries
      expect(result.allowedCountries.map((c) => c.code)).toEqual(["CA", "GB", "US"]);
    });

    it("should handle single allowed country", () => {
      const options: CountryCodesOptions = {
        allowedCountries: ["US"],
      };

      const result = countryCodesHandler(options);

      expect(result.allowedCountries).toHaveLength(1);
      expect(result.allowedCountries[0]!.code).toBe("US");
    });

    it("should handle empty allowedCountries array", () => {
      const options: CountryCodesOptions = {
        allowedCountries: [],
      };

      const result = countryCodesHandler(options);

      expect(result.allowedCountries).toEqual(countryData);
    });
  });

  describe("defaultCountry setting", () => {
    it("should set default country when provided", () => {
      const options: CountryCodesOptions = {
        defaultCountry: "GB",
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("GB");
      expect(result.defaultCountry.name).toBe("United Kingdom");
    });

    it("should default to US when no defaultCountry provided", () => {
      const result = countryCodesHandler();

      expect(result.defaultCountry.code).toBe("US");
    });

    it("should default to US when defaultCountry is undefined", () => {
      const options: CountryCodesOptions = {
        defaultCountry: undefined,
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("US");
    });
  });

  describe("defaultCountry validation with allowedCountries", () => {
    it("should keep defaultCountry when it's in allowedCountries", () => {
      const options: CountryCodesOptions = {
        allowedCountries: ["US", "GB", "CA"],
        defaultCountry: "GB",
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("GB");
      expect(result.allowedCountries.map((c) => c.code)).toEqual(["CA", "GB", "US"]);
    });

    it("should override defaultCountry when it's not in allowedCountries", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options: CountryCodesOptions = {
        allowedCountries: ["US", "GB", "CA"],
        defaultCountry: "FR", // France is not in allowed countries
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("CA"); // Should default to first allowed country (CA comes first in original array)
      expect(result.allowedCountries.map((c) => c.code)).toEqual(["CA", "GB", "US"]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'The "defaultCountry" option is not in the "allowedCountries" list, the default country has been set to CA'
      );

      consoleSpy.mockRestore();
    });

    it("should override defaultCountry to first allowed country when not in list", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options: CountryCodesOptions = {
        allowedCountries: ["GB", "CA", "AU"], // US is not in this list
        defaultCountry: "US",
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("AU"); // Should default to first allowed country (AU comes first in original array)
      expect(consoleSpy).toHaveBeenCalledWith(
        'The "defaultCountry" option is not in the "allowedCountries" list, the default country has been set to AU'
      );

      consoleSpy.mockRestore();
    });

    it("should not warn when defaultCountry is in allowedCountries", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options: CountryCodesOptions = {
        allowedCountries: ["US", "GB", "CA"],
        defaultCountry: "CA",
      };

      const result = countryCodesHandler(options);

      expect(result.defaultCountry.code).toBe("CA");
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle invalid country codes gracefully", () => {
      const options: CountryCodesOptions = {
        allowedCountries: ["US", "INVALID", "GB"] as any,
      };

      const result = countryCodesHandler(options);

      // Should only include valid countries
      expect(result.allowedCountries).toHaveLength(2);
      expect(result.allowedCountries.map((c) => c.code)).toEqual(["GB", "US"]);
    });

    it("should handle case sensitivity", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options: CountryCodesOptions = {
        allowedCountries: ["us", "gb"] as any, // lowercase
        defaultCountry: "US", // This will trigger the validation logic
      };

      const result = countryCodesHandler(options);

      // Should fall back to all countries when no matches found
      expect(result.allowedCountries).toEqual(countryData);
      expect(consoleSpy).toHaveBeenCalledWith(
        'No countries matched the "allowedCountries" list, falling back to all countries'
      );

      consoleSpy.mockRestore();
    });

    it("should handle special country codes like Kosovo", () => {
      const options: CountryCodesOptions = {
        allowedCountries: ["XK", "US", "GB"],
      };

      const result = countryCodesHandler(options);

      expect(result.allowedCountries.length).toBeGreaterThan(2); // Kosovo has multiple entries
      expect(result.allowedCountries.some((c) => c.code === "XK")).toBe(true);
      expect(result.allowedCountries.some((c) => c.code === "US")).toBe(true);
      expect(result.allowedCountries.some((c) => c.code === "GB")).toBe(true);
    });
  });

  describe("return type validation", () => {
    it("should return objects with correct structure", () => {
      const result = countryCodesHandler();

      expect(result).toHaveProperty("allowedCountries");
      expect(result).toHaveProperty("defaultCountry");
      expect(Array.isArray(result.allowedCountries)).toBe(true);
      expect(typeof result.defaultCountry).toBe("object");

      // Check structure of country objects
      result.allowedCountries.forEach((country) => {
        expect(country).toHaveProperty("name");
        expect(country).toHaveProperty("dialCode");
        expect(country).toHaveProperty("code");
        expect(country).toHaveProperty("emoji");
      });

      expect(result.defaultCountry).toHaveProperty("name");
      expect(result.defaultCountry).toHaveProperty("dialCode");
      expect(result.defaultCountry).toHaveProperty("code");
      expect(result.defaultCountry).toHaveProperty("emoji");
    });
  });
});
