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

import { type ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariant, type ButtonVariant } from "@firebase-oss/ui-styles";
import { cn } from "~/utils/cn";

/** Props for the Button component. */
export type ButtonProps = ComponentProps<"button"> & {
  /** The visual variant of the button. */
  variant?: ButtonVariant;
  /** If true, the button will render as a child component using Radix UI's Slot. */
  asChild?: boolean;
};

/**
 * A customizable button component with multiple variants.
 *
 * @returns The button component.
 */
export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariant({ variant }), className)} {...props} />;
}
