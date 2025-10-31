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

import { BrowserRouter, Routes, Route } from "react-router";

import ReactDOM from "react-dom/client";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
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
        <Routes>
          <Route path="/" element={<App />} />
          {allRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Routes>
      </FirebaseUIProvider>
    </BrowserRouter>
  );
});
