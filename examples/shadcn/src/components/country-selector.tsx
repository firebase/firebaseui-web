"use client";

import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import type { CountryCode, CountryData } from "@invertase/firebaseui-core";
import {
  type CountrySelectorRef,
  type CountrySelectorProps,
  useCountries,
  useDefaultCountry,
} from "@invertase/firebaseui-react";

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
