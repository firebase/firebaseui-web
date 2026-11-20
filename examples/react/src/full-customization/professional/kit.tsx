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

import { useContext, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import type { CountryData } from "@firebase-oss/ui-core";
import { PolicyContext, useCountries } from "@firebase-oss/ui-react";

import "./professional.css";

/** A Material Symbols icon name, from the font loaded by full-customization.css. */
export type Icon = string;

export function Sym({ name }: { name: Icon }) {
  return (
    <span className="fc-icon pro-sym" aria-hidden="true">
      {name}
    </span>
  );
}

type ProPageProps = {
  title: string;
  subtitle?: ReactNode;
  /** A header icon tile, shown above the title. */
  icon?: Icon;
  /** The brand row, shown on the first screen only. */
  brand?: boolean;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** A flat, left-aligned page: header, content, then a footer pinned to the bottom when content is short. */
export function ProPage({ title, subtitle, icon, brand, onBack, children, footer }: ProPageProps) {
  return (
    <main className="pro-page">
      {onBack && <BackButton onClick={onBack} />}
      <ProHeader title={title} subtitle={subtitle} icon={icon} brand={brand} />
      <div className="pro-content">{children}</div>
      <div className="pro-spacer" />
      {footer}
    </main>
  );
}

type ProHeaderProps = Omit<ProPageProps, "children" | "footer" | "onBack"> & {
  /** Heading level and ids, for headers inside a dialog. */
  as?: "h1" | "h2";
  titleId?: string;
  subtitleId?: string;
};

export function ProHeader({ title, subtitle, icon, brand, as: Heading = "h1", titleId, subtitleId }: ProHeaderProps) {
  return (
    <header>
      {brand && (
        <div className="pro-brand">
          <span className="pro-tile pro-tile--brand">
            <Sym name="shield" />
          </span>
          FirebaseUI Demo
        </div>
      )}
      {icon && (
        <span className="pro-tile pro-tile--header">
          <Sym name={icon} />
        </span>
      )}
      <Heading id={titleId} className="pro-title">
        {title}
      </Heading>
      {subtitle && (
        <p id={subtitleId} className="pro-subtitle">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="pro-back" onClick={onClick}>
      <Sym name="chevron_left" />
      Back
    </button>
  );
}

type ProFieldProps = Omit<ComponentProps<"input">, "className" | "id"> & {
  label: string;
  /** A link on the right of the label row, such as "Forgot password?". */
  action?: { label: string; onClick: () => void };
  hint?: ReactNode;
  invalid?: boolean;
};

/** A labelled input, with a show/hide toggle for passwords. */
export function ProField({ label, action, hint, invalid, type, ...props }: ProFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <div className="pro-label-row">
        <label className="pro-label" htmlFor={id}>
          {label}
        </label>
        {action && (
          <button type="button" className="pro-label-action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <div className="pro-input-wrap">
        <input
          id={id}
          className="pro-input"
          type={isPassword && revealed ? "text" : type}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="pro-toggle"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            <Sym name={revealed ? "visibility_off" : "visibility"} />
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className={invalid ? "pro-hint pro-hint--error" : "pro-hint"}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** The code entry used by phone sign in, MFA setup and the MFA challenge: a labelled six digit field. */
export function ProCodeField({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  return (
    <ProField
      label="Verification code"
      placeholder="6-digit code"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      // Authenticator apps show codes as "123 456"; keep only the digits.
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
      autoFocus
    />
  );
}

type ProPhoneFieldProps = {
  country: CountryData;
  onCountryChange: (country: CountryData) => void;
  value: string;
  onChange: (value: string) => void;
};

/** One bordered box holding the country picker and the number, as on Android and iOS. */
export function ProPhoneField({ country, onCountryChange, value, onChange }: ProPhoneFieldProps) {
  const id = useId();
  const countries = useCountries();

  return (
    <div>
      <div className="pro-label-row">
        <label className="pro-label" htmlFor={id}>
          Phone number
        </label>
      </div>
      <div className="pro-phone">
        <select
          className="pro-select"
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
        <span className="pro-phone__divider" aria-hidden="true" />
        <input
          id={id}
          className="pro-input"
          type="tel"
          autoComplete="tel-national"
          placeholder="555 123 4567"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

type ProButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "outline" | "text";
  loading?: boolean;
  icon?: ReactNode;
};

export function ProButton({
  variant = "primary",
  loading,
  disabled,
  icon,
  children,
  type = "button",
  ...props
}: ProButtonProps) {
  return (
    <button
      className={`pro-btn pro-btn--${variant}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function ProDivider({ children }: { children: ReactNode }) {
  return <div className="pro-divider">{children}</div>;
}

export function ProError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="pro-error" role="alert">
      <Sym name="error" />
      {children}
    </p>
  );
}

/** "Don't have an account? Create account" */
export function ProPrompt({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="pro-prompt">
      {prompt}{" "}
      <button type="button" onClick={onClick}>
        {action}
      </button>
    </p>
  );
}

/** The terms line, from the policies configured on FirebaseUIProvider. */
export function ProLegal({ lead }: { lead: string }) {
  const policies = useContext(PolicyContext);
  if (!policies) return null;
  const link = (url: string | URL, label: string) => (
    <a href={String(url)} target="_blank" rel="noreferrer">
      {label}
    </a>
  );

  return (
    <p className="pro-legal">
      {lead} {link(policies.termsOfServiceUrl, "Terms of Service")} and{" "}
      {link(policies.privacyPolicyUrl, "Privacy Policy")}.
    </p>
  );
}

export function ProSection({ children }: { children: ReactNode }) {
  return <h2 className="pro-section">{children}</h2>;
}

export function ProGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="pro-group" role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function ProSeparator({ inset = 48 }: { inset?: number }) {
  return <div className="pro-separator" style={{ ["--pro-inset" as string]: `${inset}px` }} aria-hidden="true" />;
}

type ProRowProps = {
  title: string;
  icon?: Icon;
  value?: string;
  tone?: "muted" | "accent" | "danger";
  chevron?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** For a row that toggles an inline form below it. */
  expanded?: boolean;
};

/** A settings row: icon, title, value, chevron. A button when it has an action. */
export function ProRow({ title, icon, value, tone = "muted", chevron, onClick, disabled, expanded }: ProRowProps) {
  const content = (
    <>
      {icon && <Sym name={icon} />}
      <span className={!value && tone !== "muted" ? `pro-row__title pro-row__value--${tone}` : "pro-row__title"}>
        {title}
      </span>
      {value && (
        <span className={tone === "muted" ? "pro-row__value" : `pro-row__value pro-row__value--${tone}`}>{value}</span>
      )}
      {chevron && (
        <span className="pro-chevron">
          <Sym name="chevron_right" />
        </span>
      )}
    </>
  );
  const className = icon ? "pro-row" : "pro-row pro-row--plain";

  return onClick ? (
    <button type="button" className={className} onClick={onClick} disabled={disabled} aria-expanded={expanded}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

type ProChoiceProps = {
  /** Shared by the choices in one group, so the arrow keys move between them. */
  name: string;
  icon: Icon;
  title: string;
  detail: string;
  checked: boolean;
  onSelect: () => void;
};

/** A radio row for picking a second factor, built on a native radio for keyboard support. */
export function ProChoice({ name, icon, title, detail, checked, onSelect }: ProChoiceProps) {
  return (
    <label className="pro-choice">
      <input type="radio" name={name} checked={checked} onChange={onSelect} />
      <span className="pro-tile">
        <Sym name={icon} />
      </span>
      <span className="pro-choice__text">
        <span className="pro-choice__title">{title}</span>
        <span className="pro-choice__detail">{detail}</span>
      </span>
      <span className="pro-radio" aria-hidden="true" />
    </label>
  );
}

type ProDialogProps = {
  title: string;
  subtitle: ReactNode;
  icon?: Icon;
  onClose: () => void;
  /** Whether a click outside closes it. The reauth step keeps it, so the reCAPTCHA popup can't dismiss it. */
  lightDismiss?: boolean;
  children: ReactNode;
};

/** A native modal dialog, shown on mount; Escape calls onClose. */
export function ProDialog({ title, subtitle, icon, onClose, lightDismiss, children }: ProDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="pro-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-subtitle`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (lightDismiss && event.target === event.currentTarget) onClose();
      }}
    >
      {/* The body fills the dialog, so a click that lands on the dialog itself is on the backdrop. */}
      <div className="pro-dialog__body">
        <ProHeader
          as="h2"
          icon={icon}
          title={title}
          subtitle={subtitle}
          titleId={`${id}-title`}
          subtitleId={`${id}-subtitle`}
        />
        <div className="pro-content">{children}</div>
      </div>
    </dialog>
  );
}
