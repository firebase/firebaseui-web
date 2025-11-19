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

import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import type { CountryCode, CountryData } from "@firebase-oss/ui-core";
import {
  type CountrySelectorRef,
  type CountrySelectorProps,
  useCountries,
  useDefaultCountry,
} from "@firebase-oss/ui-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type { CountrySelectorRef };

export const CountrySelector = forwardRef<CountrySelectorRef, CountrySelectorProps>((_props, ref) => {
  const countries = useCountries();
  const defaultCountry = useDefaultCountry();
  const [selected, setSelected] = useState<CountryData>(defaultCountry);

  const setCountry = useCallback(
    (code: CountryCode) => {
      const foundCountry = countries.find((country) => country.code === code);
      setSelected(foundCountry!);
    },
    [countries]
  );

  useImperativeHandle(
    ref,
    () => ({
      getCountry: () => selected,
      setCountry,
    }),
    [selected, setCountry]
  );

  return (
    <Select value={selected.code} onValueChange={setCountry}>
      <SelectTrigger className="w-[120px]">
        <SelectValue>
          {selected.emoji} {selected.dialCode}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.dialCode} ({country.name})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

CountrySelector.displayName = "CountrySelector";
