"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
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
        ref={(element) => {
          inputRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        type={visible ? "text" : "password"}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-0.5 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? hidePasswordLabel : showPasswordLabel}
        aria-controls={props.id}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
      </Button>
    </div>
  );
}
