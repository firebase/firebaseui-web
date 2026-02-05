# Custom Auth Server (Snapchat → Firebase custom token)

This server exchanges a Snapchat OAuth authorization code for a Firebase custom token so the React app can sign in with `signInWithCustomToken`.

## Setup

1. Copy `.env.example` to `.env`.
2. In the [Snapchat Developer Portal](https://kit.snapchat.com/manage), create an app. For this server-side flow use the **Confidential OAuth 2.0 Client ID** and its **Client Secret**. Under Login Kit, add a redirect URI:
   - Dev: `http://localhost:5173/auth/snapchat/callback`
   - Production: `https://your-domain.com/auth/snapchat/callback`
3. In `.env`, set `SNAPCHAT_CLIENT_ID` to the Confidential OAuth 2.0 Client ID (or set `SNAPCHAT_CONFIDENTIAL_CLIENT_ID`), and set `SNAPCHAT_CLIENT_SECRET`.
4. For Firebase Admin, either:
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` to the path to your service account JSON (e.g. `./serviceAccountKey.json`), or
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to that path and leave `FIREBASE_SERVICE_ACCOUNT_PATH` unset.

## Run

```bash
pnpm install
pnpm run build
pnpm start
```

For development with auto-restart:

```bash
pnpm run dev
```

Server listens on `http://localhost:4000` by default. The React example uses `VITE_CUSTOM_AUTH_SERVER_URL=http://localhost:4000` (default) so the Snapchat button and callback can reach it.

## Endpoints

- `GET /auth/snapchat/config` – returns `clientId`, `authUrl`, and `scopes` for the client to start the OAuth redirect.
- `POST /auth/snapchat/token` – body `{ code, redirect_uri }`; exchanges with Snapchat, fetches user id, mints a Firebase custom token; returns `{ customToken }`.
