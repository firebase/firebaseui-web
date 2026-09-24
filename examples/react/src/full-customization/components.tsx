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

import { createRef, useCallback, useState, type ComponentProps, type ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { FirebaseUIError, type CountryData } from "@firebase-oss/ui-core";
import { GoogleLogo, useCountries, useRecaptchaVerifier, useUI } from "@firebase-oss/ui-react";

import mascot from "./assets/doggo-mascot.svg";

type PageProps = {
  /** Shown in the Doggo welcome bubble, and read by screen readers in every theme. */
  title: string;
  /** The line above the form. Spark and Grid use it as their visible heading. */
  prompt: ReactNode;
  children: ReactNode;
  /** Rendered pinned to the bottom of the page, below the form. */
  footer?: ReactNode;
};

export function Page({ title, prompt, children, footer }: PageProps) {
  return (
    <>
      <main className="fc-main">
        <div className="fc-headline">
          <span className="fc-icon" aria-hidden="true">
            coffee
          </span>
          Coffee Spark
        </div>
        <img className="fc-mascot" src={mascot} alt="" />
        <h1 className="fc-intro">
          <span className="fc-intro__text">{title}</span>
        </h1>
        <div className="fc-card">
          <p className="fc-prompt">{prompt}</p>
          {children}
        </div>
      </main>
      {footer}
    </>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "className"> & {
  /** A Material Symbols icon name for the leading slot. */
  icon?: string;
  invalid?: boolean;
  variant?: "code";
};

export function TextField({ icon, invalid, variant, type, placeholder, ...props }: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={variant === "code" ? "fc-field fc-field--code" : "fc-field"} data-invalid={invalid || undefined}>
      {icon && (
        <span className="fc-field__icon fc-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <input
        className="fc-field__input"
        type={isPassword && revealed ? "text" : type}
        placeholder={placeholder}
        aria-label={props["aria-label"] ?? placeholder}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className="fc-field__toggle fc-icon"
          onClick={() => setRevealed(!revealed)}
          aria-label={revealed ? "Hide password" : "Show password"}
        >
          {revealed ? "visibility_off" : "visibility"}
        </button>
      )}
    </div>
  );
}

export function CodeField(props: Omit<TextFieldProps, "variant" | "icon" | "type">) {
  return (
    <TextField
      variant="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      aria-label="Verification code"
      {...props}
    />
  );
}

type CodeFormProps = {
  task: ReturnType<typeof useAuthTask>;
  onSubmit: (code: string) => Promise<unknown>;
  links?: ReactNode;
  submitLabel?: string;
};

/** The six digit code step shared by phone sign in, SMS and TOTP enrollment, and the MFA challenge. */
export function CodeForm({ task, onSubmit, links, submitLabel = "Verify" }: CodeFormProps) {
  const [code, setCode] = useState("");

  return (
    <form
      className="fc-form"
      onSubmit={(event) => {
        event.preventDefault();
        void task.run(() => onSubmit(code));
      }}
    >
      <CodeField value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} autoFocus />
      <ErrorText>{task.error}</ErrorText>
      {links && <Links>{links}</Links>}
      <Actions>
        <Button type="submit" disabled={code.length !== 6} loading={task.pending}>
          {submitLabel}
        </Button>
      </Actions>
    </form>
  );
}

type PhoneFieldsProps = {
  country: CountryData;
  onCountryChange: (country: CountryData) => void;
  value: string;
  onChange: (value: string) => void;
};

/** A country picker and phone number field, fed by the countryCodes behavior configured in initializeUI. */
export function PhoneFields({ country, onCountryChange, value, onChange }: PhoneFieldsProps) {
  const countries = useCountries();

  return (
    <div className="fc-row">
      <div className="fc-field" style={{ flex: "0 0 128px" }}>
        <select
          className="fc-field__input"
          aria-label="Country code"
          value={country.code}
          onChange={(event) => onCountryChange(countries.find((c) => c.code === event.target.value) ?? country)}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.emoji} {c.dialCode}
            </option>
          ))}
        </select>
      </div>
      <TextField
        icon="phone"
        type="tel"
        autoComplete="tel-national"
        placeholder="Phone number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({ variant = "primary", loading, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      className="fc-button"
      data-variant={variant}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}

/** A row of buttons. `stacked` gives each button the full width, for choices with longer labels. */
export function Actions({ children, stacked }: { children: ReactNode; stacked?: boolean }) {
  return <div className={stacked ? "fc-actions fc-actions--stacked" : "fc-actions"}>{children}</div>;
}

export function Links({ children }: { children: ReactNode }) {
  return <div className="fc-links">{children}</div>;
}

export function TextLink({ children, ...props }: Omit<ComponentProps<"button">, "className" | "type">) {
  return (
    <button type="button" className="fc-link" {...props}>
      {children}
    </button>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="fc-error" role="alert">
      {children}
    </p>
  );
}

type ProviderButtonProps = Omit<ComponentProps<"button">, "className" | "type"> & {
  provider: "google" | "phone" | "guest";
};

const providerIcons = {
  google: <GoogleLogo />,
  phone: (
    <span className="fc-icon" aria-hidden="true">
      phone
    </span>
  ),
  guest: (
    <span className="fc-icon" aria-hidden="true">
      person
    </span>
  ),
};

export function ProviderButton({ provider, children, ...props }: ProviderButtonProps) {
  return (
    <button type="button" className="fc-provider" data-provider={provider} {...props}>
      {providerIcons[provider]}
      {children}
    </button>
  );
}

/**
 * useRecaptchaVerifier, plus a way to start over. A reCAPTCHA token is single use, so after each
 * send (failed, or before a resend) the container is swapped for a new one with a fresh verifier.
 */
export function useResettableRecaptcha() {
  // The ref and the element key change together, so each reset gets a new element and a new verifier.
  const [slot, setSlot] = useState(() => ({ key: 0, ref: createRef<HTMLDivElement>() }));
  const verifier = useRecaptchaVerifier(slot.ref);

  return {
    verifier,
    container: <div key={slot.key} ref={slot.ref} />,
    reset: () => setSlot(({ key }) => ({ key: key + 1, ref: createRef<HTMLDivElement>() })),
  };
}

/**
 * Runs an auth call, tracking whether it is in flight and the message to show if it fails.
 *
 * The ui-react action hooks throw errors whose message is already translated. Calls made straight
 * to firebase/auth throw a raw FirebaseError, which is translated here with FirebaseUIError.
 */
export function useAuthTask() {
  const ui = useUI();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await task();
      } catch (e) {
        if (e instanceof FirebaseError && !(e instanceof FirebaseUIError)) {
          setError(new FirebaseUIError(ui, e).message);
        } else if (!(e instanceof ReauthCancelledError)) {
          setError(e instanceof Error ? e.message : String(e));
        }
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [ui]
  );

  return { pending, error, setError, run };
}

/** Thrown when the user dismisses the reauthentication dialog, which is a cancellation rather than a failure. */
export class ReauthCancelledError extends Error {
  constructor() {
    super("Reauthentication cancelled");
  }
}
