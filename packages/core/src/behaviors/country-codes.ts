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

import { type CountryCode, countryData } from "../country-data";

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
