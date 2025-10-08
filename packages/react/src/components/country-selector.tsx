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

"use client";

import { type CountryCode, countryData, getCountryByCode } from "@firebase-ui/core";
import { type ComponentProps } from "react";
import { cn } from "~/utils/cn";

export type CountrySelectorProps = ComponentProps<"div"> & {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  allowedCountries?: CountryCode[];
};

export function CountrySelector({ value, onChange, allowedCountries, className, ...props }: CountrySelectorProps) {
  const country = getCountryByCode(value);
  const countries = allowedCountries ? countryData.filter((c) => allowedCountries.includes(c.code)) : countryData;

  if (!country) {
    return null;
  }

  return (
    <div className={cn("fui-country-selector", className)} {...props}>
      <div className="fui-country-selector__wrapper">
        <span className="fui-country-selector__flag">{country.emoji}</span>
        <div className="fui-country-selector__select-wrapper">
          <span className="fui-country-selector__dial-code">{country.dialCode}</span>
          <select
            className="fui-country-selector__select"
            value={country.code}
            onChange={(e) => {
              const country = getCountryByCode(e.target.value as CountryCode);
              if (country) {
                onChange(country.code);
              }
            }}
          >
            {countries.map((country) => (
              <option key={`${country.code}-${country.dialCode}`} value={country.code}>
                {country.dialCode} ({country.name})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
