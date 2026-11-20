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

import { createContext, useContext, useLayoutEffect, useState } from "react";

import doggoPattern from "./assets/doggo-pattern.svg";
import gridPattern from "./assets/grid-pattern.svg";
import sparkBlob from "./assets/spark-blob.webp";

export const themes = [
  { id: "doggo", label: "Doggo" },
  { id: "spark", label: "Coffee Spark", short: "Spark" },
  { id: "grid", label: "Grid" },
  { id: "professional", label: "Professional" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

/** The active theme, for the screens whose layout differs per theme (Professional has its own). */
export const ThemeIdContext = createContext<ThemeId>("doggo");

export function useThemeId() {
  return useContext(ThemeIdContext);
}

const STORAGE_KEY = "firebaseui:full-customization:theme";

function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return themes.some((theme) => theme.id === stored) ? (stored as ThemeId) : "doggo";
  } catch {
    return "doggo";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme);

  // Set on <body> before paint, so portalled components (Dialog, Select) are themed and nothing flashes.
  useLayoutEffect(() => {
    document.body.dataset.fcTheme = theme;
    return () => {
      delete document.body.dataset.fcTheme;
    };
  }, [theme]);

  const changeTheme = (next: ThemeId) => {
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode), the switch still works for this visit.
    }
  };

  return [theme, changeTheme] as const;
}

export function ThemeSwitcher({ theme, onChange }: { theme: ThemeId; onChange: (theme: ThemeId) => void }) {
  return (
    <div className="fc-theme-switcher" role="group" aria-label="Theme">
      <span className="fc-icon" aria-hidden="true">
        palette
      </span>
      {themes.map((t) => (
        <button key={t.id} type="button" aria-pressed={theme === t.id} onClick={() => onChange(t.id)}>
          {"short" in t ? (
            <>
              <span className="fc-label--long">{t.label}</span>
              <span className="fc-label--short">{t.short}</span>
            </>
          ) : (
            t.label
          )}
        </button>
      ))}
      {theme === "professional" && <DarkModeToggle />}
    </div>
  );
}

/** The example's light/dark toggle is hidden on this route, so Professional, which follows it, gets its own. */
function DarkModeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  return (
    <button
      type="button"
      className="fc-theme-switcher__mode"
      aria-pressed={dark}
      aria-label="Dark mode"
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle("dark", next);
        try {
          window.localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
          // Storage can be unavailable (private mode), the switch still works for this visit.
        }
        setDark(next);
      }}
    >
      <span className="fc-icon" aria-hidden="true">
        {dark ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );
}

/**
 * Background art for each theme, positioned with the offsets of the matching layer in its Figma
 * frame: "pattern" in 20:6031, "grid" in 20:7310 and "avatar spark" in 20:6675.
 */
export function ThemeArt({ theme }: { theme: ThemeId }) {
  return (
    <div className="fc-art" aria-hidden="true">
      {theme === "doggo" && (
        <img src={doggoPattern} alt="" style={{ left: -16, top: -1505, width: 2366, height: 2391 }} />
      )}
      {theme === "grid" && <img src={gridPattern} alt="" style={{ left: 96, top: -336, width: 1585, height: 1585 }} />}
      {theme === "spark" && <img src={sparkBlob} alt="" style={{ left: 160, top: -259, width: 1122, height: 1096 }} />}
    </div>
  );
}
