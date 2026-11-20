"use client";

import { useCallback, useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI } from "@firebase-oss/ui-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Accessible label for the button that reveals the password; defaults to the translated "Show password". */
  showPasswordLabel?: string;
  /** Accessible label for the button that hides the password; defaults to the translated "Hide password". */
  hidePasswordLabel?: string;
};

export function PasswordInput({ className, showPasswordLabel, hidePasswordLabel, ref, ...props }: PasswordInputProps) {
  const ui = useUI();
  const generatedId = useId();
  const id = props.id ?? generatedId;
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

  // Hide the password again on submit; checked per event, so it holds however the form mounts.
  useEffect(() => {
    const hide = (event: SubmitEvent) => {
      const input = inputRef.current;
      if (!input || event.target !== input.form) return;
      input.type = "password";
      setVisible(false);
    };
    document.addEventListener("submit", hide, { capture: true });
    return () => document.removeEventListener("submit", hide, { capture: true });
  }, []);

  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
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
        aria-controls={id}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        <span className="sr-only">
          {visible
            ? (hidePasswordLabel ?? getTranslation(ui, "labels", "hidePassword"))
            : (showPasswordLabel ?? getTranslation(ui, "labels", "showPassword"))}
        </span>
      </Button>
    </div>
  );
}
