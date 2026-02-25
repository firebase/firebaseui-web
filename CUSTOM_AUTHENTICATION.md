# Custom Authentication Flows

## Configuring Custom OIDC providers

For the purpose of demonstration, we'll look at how to setup LINE authentication.

Follow the below steps:

1. Enable Identity Platform for your Firebase project. See [Authenticate Using OpenID Connect in web apps](https://firebase.google.com/docs/auth/web/openid-connect).
2. [Create a LINE developer account and create a new channel](https://developers.line.biz/en/docs/line-login/getting-started).
3. Create a new Sign-in provider under `Sign in methods` in your Firebase console and fill it in with the following:
   1. **Name:** "LINE"
   2. **Client ID:** Fill in with your LINE channel ID found in LINE developer console.
   3. **Issuer (URL):** "https://access.line.me"
   4. **Client Secret:** Fill in with your LINE channel secret found in LINE developer console.
4. In your LINE developer console (Click into your channel -> LINE login -> update "Callback URL"), you need to add the callback URL which is the auth callback handler. It should look like `https://[FIREBASE_PROJECT_NAME].firebaseapp.com/__/auth/handler`.


5. After you've configured your app, you can test in your web application by creating a button that wraps around `OAuthButton` component.

```tsx
export function LineSignInButton() {
  return (
    <OAuthButton provider={new OAuthProvider("oidc.line")}>
      <span
        className="fui-provider__icon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1em",
          height: "1em",
          borderRadius: 2,
          backgroundColor: "#00c300",
          color: "#fff",
          fontSize: "0.65em",
          fontWeight: 700,
        }}
        aria-hidden
      >
        LINE
      </span>
      <span>Sign in with LINE</span>
    </OAuthButton>
  );
}
```
> NOTE: The provider ID passed into `OAuthProvider` is the name used to create the Provider in your Firebase console. If you created the provider in your Firebase console as "line", use "oidc.line" as the provider ID. 
 
A LINE button example can be found in `examples/react/src/custom-auth-buttons/line-sign-in-button.tsx` and is used on the Custom auth screen (`examples/react/src/screens/custom-auth-screen.tsx`).


## OAuth 2.0 login using Firebase Admin

Firebase Auth cannot be configured as a generic OAuth 2.0 provider for services that only offer OAuth 2.0 (and not OpenID Connect). Out of the box, Firebase supports (a) [built-in providers](https://firebase.google.com/docs/auth/web/start#sign_in_existing_users) (Google, Apple, etc.), (b) [SAML / OpenID Connect (OIDC)](https://firebase.google.com/docs/auth/web/openid-connect) providers (with Identity Platform), or (c) [Custom Authentication](https://firebase.google.com/docs/auth/admin/create-custom-tokens): you mint Firebase custom tokens yourself on a backend.

Providers like Snapchat expose [OAuth 2.0 (Login Kit)](https://developers.snap.com/snap-kit/login-kit/overview) and are not presented as standard OIDC IdPs you can add in Firebase’s OIDC provider config. The practical approach is to run the OAuth 2.0 flow in your app, send the authorization result to your backend, then have the backend mint a Firebase custom token and sign the user in with it.

The following steps use Snapchat as an example but apply to any OAuth 2.0–only provider.

### 1. Create the third-party app and configure OAuth

In the provider’s developer portal (e.g. [Snapchat Login Kit](https://developers.snap.com/snap-kit/login-kit/overview)), create an app and configure:

- **Client ID** and **Client Secret**
- **Redirect URI(s)** (your app’s callback URL)
- **Scopes** needed for identity (e.g. user ID, display name, or email if available)

### 2. Client: Run the OAuth 2.0 Authorization Code flow

Your app starts the provider’s login (e.g. browser redirect, or platform-specific flows such as Chrome Custom Tabs). The user signs in at the provider and is redirected back to your **redirect URI** with an **authorization code**. Your client then sends this code to your backend (do not exchange it for tokens in the client; keep the client secret on the server).


### 3. Backend: Exchange code for tokens and get user identity

On your server:

1. Exchange the authorization code for access (and optionally refresh) tokens at the provider’s token endpoint.
2. Use the access token to call the provider’s user-info or profile API to get a **stable user identifier** (and any profile fields you need).
3. Use this identifier as the canonical key for that user (e.g. `snapchat:<snap_user_id>`).

### 4. Backend: Mint a Firebase custom token (Admin SDK)

Using the [Firebase Admin SDK](https://firebase.google.com/docs/auth/admin/create-custom-tokens), create a **custom token** for a Firebase UID you choose. Typically:

- Set `uid` to a stable value such as `"snapchat:<provider_user_id>"`, or map the provider user to an existing Firebase UID (see account linking below).
- Optionally set [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) (e.g. `provider: "snapchat"`).

Custom tokens expire after about one hour. Return this token to your client (over a secure channel).

An example backend lives in `examples/custom-auth-server`.The React example app's **Custom auth** screen (`examples/react` → Custom auth) uses it for the Snapchat sign-in button.

### 5. Client: Sign in to Firebase with the custom token

The client calls Firebase Auth’s `signInWithCustomToken(auth, customToken)`. After that, the user has a normal Firebase session and can use Firebase services like any other signed-in user.

### 6. Account linking (recommended for better UX)

If users can sign in with multiple methods (e.g. Google, Apple, email, and this OAuth 2.0 provider), you should link identities where possible:

- In your backend, when you receive the OAuth 2.0 user identifier, check whether you already have a Firebase user for that person (e.g. by email if the provider returns it, or by a mapping table).
- If an existing user is found, mint the custom token for **that existing UID** so the new sign-in method is linked to the same account.
- Otherwise, create a new Firebase user (e.g. `uid = "snapchat:<provider_user_id>"`).

Linking ensures one account per person across providers. Note that not all OAuth 2.0 providers return email; use whatever stable identifier and mapping strategy the provider offers.

### Snapchat-specific notes

When testing this flow with [Snapchat Login Kit](https://developers.snap.com/snap-kit/login-kit/overview):

- Use the **Confidential OAuth 2.0 Client ID** and its **Client Secret** from the [Snap Developer Portal](https://kit.snapchat.com/manage) for the server-side flow (authorization redirect and token exchange).
- In the portal, under Login Kit: add your **Redirect URI** (e.g. `http://localhost:5173/auth/snapchat/callback` for dev) and, under **Platform Identifiers**, add a **Trusted Origin** (e.g. `http://localhost:5173`) for the stage you use (e.g. Staging).
- For **Staging**, add **Demo Users** (Snapchat usernames) so those accounts can complete login.
- The user-info endpoint for fetching the stable user ID (e.g. for `uid`) is **`https://kit.snapchat.com/v1/me`** with `Authorization: Bearer <access_token>`.

