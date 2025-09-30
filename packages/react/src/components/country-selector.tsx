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

import { CountryData } from "@firebase-ui/core";
import { getCountries, getDefaultCountry } from "@firebase-ui/core";
import { ComponentProps, useImperativeHandle, useState } from "react";
import { useUI } from "~/hooks";
import { cn } from "~/utils/cn";

export type CountrySelectorProps = ComponentProps<"div"> & { ref?: React.Ref<CountrySelectorRef> };

export interface CountrySelectorRef {
  getCountry: () => CountryData;
  setCountry: (country: CountryData) => void;
}

export function CountrySelector({ className, ref, ...props }: CountrySelectorProps) {
  const ui = useUI();
  const [selected, setSelected] = useState<CountryData>(getDefaultCountry(ui));
  const countries = getCountries(ui);

  useImperativeHandle(ref, () => ({
    getCountry: () => selected,
    setCountry: (country: CountryData) => setSelected(country),
  }));

  return (
    <div className={cn("fui-country-selector", className)} {...props}>
      <div className="fui-country-selector__wrapper">
        <span className="fui-country-selector__flag">{selected.emoji}</span>
        <div className="fui-country-selector__select-wrapper">
          <span className="fui-country-selector__dial-code">{selected.dialCode}</span>
          <select
            className="fui-country-selector__select"
            value={selected.code}
            onChange={(e) => {
              const country = countries.find((country) => country.code === e.target.value);

              if (country) {
                setSelected(country);
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
