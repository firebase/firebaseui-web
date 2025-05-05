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

import type { FieldApi } from "@tanstack/react-form";
import { HTMLAttributes } from "react";
import { cn } from "~/utils/cn";

interface FieldInfoProps<TData> extends HTMLAttributes<HTMLDivElement> {
  field: FieldApi<TData, any>;
}

export function FieldInfo<TData>({
  field,
  className,
  ...props
}: FieldInfoProps<TData>) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <div
          role="alert"
          aria-live="polite"
          className={cn("fui-form__error", className)}
          {...props}
        >
          {field.state.meta.errors[0]}
        </div>
      ) : null}
    </>
  );
}
