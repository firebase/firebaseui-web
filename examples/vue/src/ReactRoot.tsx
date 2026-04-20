import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, NavLink } from "react-router";
import { FirebaseUIProvider, useUI } from "@firebase-oss/ui-react";
import { ui, auth } from "./react_app/firebase/firebase";
import App from "./react_app/App";
import SnapchatCallbackScreen from "./react_app/screens/snapchat-callback-screen";
import { hiddenRoutes, routes } from "./react_app/routes";
import { enUs } from "@firebase-oss/ui-translations";
import { pirate } from "./react_app/pirate";
import "./react_app/index.css";

const allRoutes = [...routes, ...hiddenRoutes];

export default function ReactRoot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    auth.authStateReady().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <FirebaseUIProvider
        ui={ui}
        policies={{
          termsOfServiceUrl: "https://www.google.com",
          privacyPolicyUrl: "https://www.google.com",
        }}
      >
        <ThemeToggle />
        <PirateToggle />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/snapchat/callback" element={<SnapchatCallbackScreen />} />
          <Route element={<ScreenRoute />}>
            {allRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>
        </Routes>
      </FirebaseUIProvider>
    </BrowserRouter>
  );
}

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
      className="fixed z-10 size-10 top-8 right-8 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
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

function PirateToggle() {
  const ui = useUI();
  const isPirate = ui.locale.locale === "pirate";

  return (
    <button
      className="fixed z-10 size-10 top-8 right-20 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
      onClick={() => {
        if (isPirate) {
          ui.setLocale(enUs);
        } else {
          ui.setLocale(pirate);
        }
      }}
    >
      {isPirate ? "🇺🇸" : "🏴‍☠️"}
    </button>
  );
}
