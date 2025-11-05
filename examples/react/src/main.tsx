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

import { BrowserRouter, Routes, Route, Outlet, NavLink } from "react-router";

import ReactDOM from "react-dom/client";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import { ui, auth } from "./firebase/firebase";
import App from "./App";
import { hiddenRoutes, routes } from "./routes";

const root = document.getElementById("root")!;

const allRoutes = [...routes, ...hiddenRoutes];

// Hacky way to ensure we have an auth state before showing the app...
auth.authStateReady().then(() => {
  ReactDOM.createRoot(root).render(
    <BrowserRouter>
      <FirebaseUIProvider
        ui={ui}
        policies={{
          termsOfServiceUrl: "https://www.google.com",
          privacyPolicyUrl: "https://www.google.com",
        }}
      >
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<App />} />
          <Route element={<ScreenRoute />}>
            {allRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>
        </Routes>
      </FirebaseUIProvider>
    </BrowserRouter>
  );
});

function ScreenRoute() {
  return (
    <div className="p-8">
      <NavLink
        to="/"
        className="border border-gray-300 dark:border-gray-700 border-rounded px-4 py-2 rounded-md text-sm"
      >
        &larr; Back to overview
      </NavLink>
      <div className="pt-12">
        <Outlet />
      </div>
    </div>
  );
}

function ThemeToggle() {
  return (
    <button
      className="fixed z-10 top-8 right-8 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
      onClick={() => {
        document.documentElement.classList.toggle("dark", !document.documentElement.classList.contains("dark"));
        localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      }}
      title="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4.5"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
