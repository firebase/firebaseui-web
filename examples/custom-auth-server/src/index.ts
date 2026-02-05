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

import cors from "cors";
import "dotenv/config";
import express from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const SNAPCHAT_AUTH_URL = "https://accounts.snapchat.com/accounts/oauth2/auth";
const SNAPCHAT_TOKEN_URL = "https://accounts.snapchat.com/accounts/oauth2/token";
const SNAPCHAT_USER_URL = "https://kit.snapchat.com/v1/me";

const clientId = process.env.SNAPCHAT_CLIENT_ID;
const clientSecret = process.env.SNAPCHAT_CLIENT_SECRET;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const port = Number(process.env.PORT) || 4000;

if (!clientId || !clientSecret) {
  console.warn("Missing SNAPCHAT_CLIENT_ID or SNAPCHAT_CLIENT_SECRET. See https://kit.snapchat.com/manage");
}

if (!serviceAccountPath) {
  console.warn(
    "Missing FIREBASE_SERVICE_ACCOUNT_PATH. Firebase Admin will use GOOGLE_APPLICATION_CREDENTIALS or default credentials."
  );
}

if (serviceAccountPath) {
  const keyPath = path.resolve(process.cwd(), serviceAccountPath);
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  admin.initializeApp({ credential: admin.credential.cert(key) });
} else {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/auth/snapchat/token", async (req: express.Request, res: express.Response) => {
  const { code, redirect_uri } = req.body as { code?: string; redirect_uri?: string };

  if (!code || !redirect_uri) {
    res.status(400).json({ error: "Missing code or redirect_uri" });
    return;
  }

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "Server missing Snapchat credentials" });
    return;
  }

  try {
    const tokenRes = await fetch(SNAPCHAT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Snapchat token exchange failed:", tokenRes.status, err);
      res.status(400).json({ error: "Snapchat token exchange failed" });
      return;
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    let externalId: string | null = null;
    const userRes = await fetch(SNAPCHAT_USER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
      },
      body: JSON.stringify({
        query: "{me{externalId displayName}}",
      }),
    });

    if (userRes.ok) {
      const user = await userRes.json();
      externalId = user?.data?.me?.externalId ?? null;
      console.log("user", user);
      console.log("externalId", externalId);
    } else {
      console.error("Snapchat /v1/me failed:", userRes.status, await userRes.text());
    }

    const uid = externalId ? `snapchat:${externalId}` : `snapchat:${tokens.access_token.slice(0, 32)}`;
    const customToken = await admin.auth().createCustomToken(uid, { provider: "snapchat" });

    res.json({ customToken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create custom token" });
  }
});

app.get("/auth/snapchat/config", (_req: express.Request, res: express.Response) => {
  if (!clientId) {
    res.status(500).json({ error: "Server missing Snapchat client ID" });
    return;
  }
  const scopes = [
    "https://auth.snapchat.com/oauth2/api/user.display_name",
    "https://auth.snapchat.com/oauth2/api/user.external_id",
  ];
  res.json({
    clientId,
    authUrl: SNAPCHAT_AUTH_URL,
    scopes,
  });
});

app.listen(port, () => {
  console.log(`Custom auth server listening on http://localhost:${port}`);
});
