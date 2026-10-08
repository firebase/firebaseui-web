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

import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Accessible label for the button that reveals the password. */
  showPasswordLabel: string;
  /** Accessible label for the button that hides the password. */
  hidePasswordLabel: string;
};

export function PasswordInput({ className, showPasswordLabel, hidePasswordLabel, ref, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep one ref callback across renders, so react-hook-form's ref is not detached on every keystroke.
  const setRefs = useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref]
  );

  // Hide the password again on submit, so it is not left on screen and password managers see a password field.
  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    const hide = () => {
      input.type = "password";
      setVisible(false);
    };
    form.addEventListener("submit", hide, { capture: true });
    return () => form.removeEventListener("submit", hide, { capture: true });
  }, []);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={setRefs}
        type={visible ? "text" : "password"}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn("pe-10 [&::-ms-reveal]:hidden", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-0.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? hidePasswordLabel : showPasswordLabel}
        aria-controls={props.id}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
      </Button>
    </div>
  );
}
