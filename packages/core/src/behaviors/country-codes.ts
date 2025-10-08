import { CountryCode, countryData } from "../country-data";

export type CountryCodesOptions = {
  // The allowed countries are the countries that will be shown in the country selector
  // or `getCountries` is called.
  allowedCountries?: CountryCode[];
  // The default country is the country that will be selected by default when
  // the country selector is rendered, or `getDefaultCountry` is called.
  defaultCountry?: CountryCode;
};

export const countryCodesHandler = (options?: CountryCodesOptions) => {
  // Determine allowed countries
  let allowedCountries = options?.allowedCountries?.length
    ? countryData.filter((country) => options.allowedCountries!.includes(country.code))
    : countryData;

  // If no countries match, fall back to all countries
  if (options?.allowedCountries?.length && allowedCountries.length === 0) {
    console.warn(`No countries matched the "allowedCountries" list, falling back to all countries`);
    allowedCountries = countryData;
  }

  // Determine default country
  let defaultCountry = options?.defaultCountry
    ? countryData.find((country) => country.code === options.defaultCountry)!
    : countryData.find((country) => country.code === "US")!;

  // If default country is not in allowed countries, use first allowed country
  if (!allowedCountries.some((country) => country.code === defaultCountry.code)) {
    defaultCountry = allowedCountries[0]!;
    console.warn(
      `The "defaultCountry" option is not in the "allowedCountries" list, the default country has been set to ${defaultCountry.code}`
    );
  }

  return {
    allowedCountries,
    defaultCountry,
  };
};
