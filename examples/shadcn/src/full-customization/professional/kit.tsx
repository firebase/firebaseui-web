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

import { useContext, useId, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, Eye, EyeOff, Shield } from "lucide-react";
import type { CountryData } from "@firebase-oss/ui-core";
import { PolicyContext, useCountries } from "@firebase-oss/ui-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import "./professional.css";

type Icon = ComponentType<{ className?: string }>;

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

export function ProHeader({
  title,
  subtitle,
  icon: IconComponent,
  brand,
}: Omit<ProPageProps, "children" | "footer" | "onBack">) {
  return (
    <header>
      {brand && (
        <div className="pro-brand">
          <span className="pro-tile pro-tile--brand" aria-hidden="true">
            <Shield />
          </span>
          FirebaseUI Demo
        </div>
      )}
      {IconComponent && (
        <span className="pro-tile pro-tile--header" aria-hidden="true">
          <IconComponent />
        </span>
      )}
      <h1 className="pro-title">{title}</h1>
      {subtitle && <p className="pro-subtitle">{subtitle}</p>}
    </header>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="pro-back" onClick={onClick}>
      <ChevronLeft size={22} aria-hidden="true" />
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

/** A labelled shadcn Input, with a show/hide toggle for passwords. */
export function ProField({ label, action, hint, invalid, type, ...props }: ProFieldProps) {
  const id = useId();
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
        <Input
          id={id}
          className="pro-input"
          type={isPassword && revealed ? "text" : type}
          aria-invalid={invalid || undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="pro-toggle"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      {hint && <p className="pro-hint">{hint}</p>}
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
        <Select
          value={country.code}
          onValueChange={(code) => onCountryChange(countries.find((c) => c.code === code) ?? country)}
        >
          <SelectTrigger className="pro-select" aria-label="Country code">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.emoji} {c.dialCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="pro-phone__divider" aria-hidden="true" />
        <Input
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
    <Button
      className={`pro-btn pro-btn--${variant}`}
      variant={variant === "primary" ? "default" : variant === "outline" ? "outline" : "ghost"}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}

export function ProDivider({ children }: { children: ReactNode }) {
  return (
    <div className="pro-divider" role="separator">
      {children}
    </div>
  );
}

export function ProError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="pro-error" role="alert">
      <CircleAlert aria-hidden="true" />
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
};

/** A settings row: icon, title, value, chevron. A button when it has an action. */
export function ProRow({ title, icon: IconComponent, value, tone = "muted", chevron, onClick, disabled }: ProRowProps) {
  const content = (
    <>
      {IconComponent && <IconComponent aria-hidden="true" />}
      <span className={!value && tone !== "muted" ? `pro-row__title pro-row__value--${tone}` : "pro-row__title"}>
        {title}
      </span>
      {value && (
        <span className={tone === "muted" ? "pro-row__value" : `pro-row__value pro-row__value--${tone}`}>{value}</span>
      )}
      {chevron && <ChevronRight className="pro-chevron" size={20} aria-hidden="true" />}
    </>
  );
  const className = IconComponent ? "pro-row" : "pro-row pro-row--plain";

  return onClick ? (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

type ProChoiceProps = {
  icon: Icon;
  title: string;
  detail: string;
  checked: boolean;
  onSelect: () => void;
};

/** A radio-style row for picking a second factor. */
export function ProChoice({ icon: IconComponent, title, detail, checked, onSelect }: ProChoiceProps) {
  return (
    <button type="button" role="radio" aria-checked={checked} className="pro-choice" onClick={onSelect}>
      <span className="pro-tile" aria-hidden="true">
        <IconComponent />
      </span>
      <span className="pro-choice__text">
        <span className="pro-choice__title">{title}</span>
        <span className="pro-choice__detail">{detail}</span>
      </span>
      <span className="pro-radio" aria-hidden="true" />
    </button>
  );
}
