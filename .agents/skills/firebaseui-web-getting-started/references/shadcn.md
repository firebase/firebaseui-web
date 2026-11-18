# FirebaseUI Web: shadcn/ui Reference (`@firebase` registry)

For a React + Tailwind app with `components.json`. `npx shadcn add @firebase/<name>` copies FirebaseUI's screens, forms and OAuth buttons into `src/components` as source. Hooks, `FirebaseUIProvider` and the auth actions still come from packages. Page, routing and Firebase-module recipes are in [`shadcn-recipes.md`](shadcn-recipes.md); `initializeUI`, behaviors and core actions are in [`core.md`](core.md).

## 0. Read First

Read these in one parallel batch: `package.json`, `components.json`, `src/main.tsx`, `src/App.tsx`, plus `shadcn-recipes.md` and `core.md`. From them note: the `@/` alias (`aliases.components` in `components.json`, which must be `@/components`), whether `registries["@firebase"]` exists, the router in use and the existing routes (all of them stay), and which of `firebase`, `@firebase-oss/ui-core`, `@firebase-oss/ui-react` are installed. Do not search `node_modules`: the props you need are in section 4, and the copied components are in `src/components`.

## 1. Setup (in this order)

1. Install only what is missing. **Do not install or import `@firebase-oss/ui-styles`**: none of the registry components imports it (they are Tailwind classes on shadcn primitives), so it is not needed.

   ```bash
   npm install firebase @firebase-oss/ui-core @firebase-oss/ui-react
   ```

2. Make sure `components.json` has the registry entry (add it next to the existing keys, keep the rest):

   ```json
   { "registries": { "@firebase": "https://firebaseopensource.com/r/{name}.json" } }
   ```

3. Add every screen you need in **one** command. `-y` skips the confirmation prompt. The registry resolves its own dependencies (`card`, `input`, `field`, `separator`, `input-otp`, the form and MFA assertion components, `react-hook-form`), so add nothing else by hand.

   ```bash
   npx shadcn@latest add @firebase/sign-in-auth-screen @firebase/sign-up-auth-screen @firebase/forgot-password-auth-screen @firebase/email-link-auth-screen @firebase/phone-auth-screen @firebase/oauth-screen @firebase/google-sign-in-button @firebase/multi-factor-auth-enrollment-screen -y
   ```

   It writes about 24 files into `src/components` and 8 into `src/components/ui`, and appends a Google button rule to `src/index.css` (keep it). A second `add` stops at an "already exists, overwrite?" prompt that a non-interactive shell cannot answer, and `--overwrite` would undo the fix in section 2. Decide the whole list first.

   If the install step fails with `ERESOLVE` (seen with npm 10; npm 11 is fine), run it as `npm_config_legacy_peer_deps=true npx shadcn@latest add ... -y`.

4. Apply the type fix in section 2, then wire the Firebase module and provider (section 3).

### Which component for which flow

| Flow | `shadcn add` name | Import from `@/components/...` |
| --- | --- | --- |
| Email + password sign-in (and MFA code step) | `sign-in-auth-screen` | `SignInAuthScreen` |
| Email + password sign-up, and adding an email to a guest | `sign-up-auth-screen` | `SignUpAuthScreen` |
| Password reset | `forgot-password-auth-screen` | `ForgotPasswordAuthScreen` |
| Email link | `email-link-auth-screen` | `EmailLinkAuthScreen` |
| Phone (number, then SMS code) | `phone-auth-screen` | `PhoneAuthScreen` |
| Social | `oauth-screen` + `google-sign-in-button` (others: `github-`, `apple-`, `microsoft-`, `facebook-`, `twitter-`, `yahoo-sign-in-button`, `oauth-button`) | `OAuthScreen`, `GoogleSignInButton` |
| SMS / TOTP multi-factor enrollment | `multi-factor-auth-enrollment-screen` | `MultiFactorAuthEnrollmentScreen` |
| Multi-factor sign-in | nothing to add: `sign-in-auth-screen` already pulls in `multi-factor-auth-assertion-screen` and shows it when a code is needed | n/a |
| Guest (anonymous), then add an email | no component: `signInAnonymously` from `@firebase-oss/ui-core`, then `SignUpAuthScreen` ([recipe](shadcn-recipes.md)) | n/a |

## 2. Known Type Errors in the Registry Copies (7.1.0)

`ui-core@7.1.0` returns `Promise<UserCredential | void>` from `signInWithEmailAndPassword`, `createUserWithEmailAndPassword` and `confirmPhoneNumber` (`void` when a multi-factor challenge is pending), but three copied forms pass the result on as a `UserCredential`. `tsc -b` then fails with TS2345 in `phone-auth-form.tsx`, `sign-in-auth-form.tsx` and `sign-up-auth-form.tsx` even if the app never mounts them, so `npm run build` fails until they are fixed. Right after `add`, guard each call, from the project root:

```bash
perl -pi -e 's/^(\s*)(props\.on(?:SignIn|SignUp)\?\.\(credential\);)/$1if (credential) $2/' src/components/sign-in-auth-form.tsx src/components/sign-up-auth-form.tsx
perl -pi -e 's/^(\s*)(props\.onSuccess\(credential\);)/$1if (credential) $2/' src/components/phone-auth-form.tsx
```

That changes `props.onSignIn?.(credential);` to `if (credential) props.onSignIn?.(credential);` (same for `onSignUp` and, in the phone form, `props.onSuccess(credential);`). Edit by hand if a line differs. All other copies compile as generated.

## 3. Firebase Module and Provider

Put the Firebase module, emulator connection and `<FirebaseUIProvider>` wiring in place as shown in [`shadcn-recipes.md`](shadcn-recipes.md) section 1 (`src/firebase.ts`, `src/main.tsx`). Rules:

- Every FirebaseUI screen and button must be inside `<FirebaseUIProvider ui={ui}>`, which goes inside the router. Pass the **store** `ui` to the provider.
- Pass the **state object** to core actions: `useUI()` in components, `ui.get()` elsewhere. Passing the store fails at runtime (`setState is not a function`).
- Put `autoUpgradeAnonymousUsers()` in `initializeUI` when guests can add an email later. Behaviors you pass are merged with the defaults (reCAPTCHA for phone and SMS multi-factor stays on).

## 4. Props of the Copied Components

The copies re-export their prop types from `@firebase-oss/ui-react`, so the definitions are not in `src/components`. Use these tables. `User` and `UserCredential` are from `firebase/auth`.

| Component | Props |
| --- | --- |
| `SignInAuthScreen` | `onSignIn?(user: User)`, `onForgotPasswordClick?()`, `onSignUpClick?()`, `showLegacySignInRecovery?: boolean`, `children?` (OAuth buttons) |
| `SignUpAuthScreen` | `onSignUp?(user: User)`, `onSignInClick?()`, `children?` |
| `ForgotPasswordAuthScreen` | `onPasswordSent?()`, `onBackToSignInClick?()` |
| `EmailLinkAuthScreen` | `onEmailSent?()`, `onSignIn?(user: User)`, `children?` |
| `PhoneAuthScreen` | `onSignIn?(user: User)`, `children?` |
| `OAuthScreen` | `onSignIn?(user: User)`, `showLegacySignInRecovery?: boolean`, `children?` |
| `MultiFactorAuthEnrollmentScreen` | `onEnrollment?()`, `hints?: Hint[]` (`FactorId.PHONE`, `FactorId.TOTP` from `firebase/auth`; default both, empty is an error) |
| `GoogleSignInButton` (and the other branded buttons) | `provider?`, `themed?: boolean \| 'neutral'`, `onSignIn?(credential: UserCredential)` |
| `OAuthButton` | `provider` (required `AuthProvider`), `themed?`, `onSignIn?(credential)`, `children` (label) |
| `SignInAuthForm`, `SignUpAuthForm`, `EmailLinkAuthForm`, `PhoneAuthForm` | card-less forms; callbacks receive a `UserCredential` |

Behavior to know:

- "Forgot password?" and "Sign up" links render only when `onForgotPasswordClick` and `onSignUpClick` are set; "Sign in" on sign-up only with `onSignInClick`; "Back to sign in" only with `onBackToSignInClick`.
- `onSignIn` on the screens follows auth-state changes for **non-anonymous** users, so it does not fire after `signInAnonymously`, and not when a link upgrades a guest (linking emits no auth-state event). `PhoneAuthScreen` has the same limit: a guest upgraded by phone gets no callback. Navigate yourself after a guest sign-in; on `/email-link` for guests use `EmailLinkAuthForm` (`npx shadcn@latest add @firebase/email-link-auth-form`), whose `onSignIn` gets the credential.
- `*AuthScreen` children are rendered below a separator inside the card: put OAuth buttons there. Put other controls (such as a guest button) outside it.
- Sign-in, sign-up, email-link, phone and OAuth screens switch to the multi-factor code screen on their own when a second factor is required. Multi-factor enrollment needs a signed-in, non-anonymous user. The Auth emulator cannot do TOTP: pass `hints={[FactorId.PHONE]}`.
- Email link: `sendSignInLinkToEmail(ui, email)` has no `actionCodeSettings`. The link returns to the page that sent it, so mount `EmailLinkAuthScreen` once on the route the link should return to; it completes the sign-in on mount, in the same browser.

## 5. Styling and Finding Things

- Screens follow the shadcn theme (`bg-card`, `border`, the app's CSS variables). Do not add FirebaseUI CSS.
- Each screen is a `max-w-sm mx-auto` card with no page padding or vertical spacing. Wrap it in a page container such as `<main className="mx-auto w-full max-w-sm px-4 py-16">` so every auth page has the same centred layout.
- To see the markup, text keys or props a copy uses, read `src/components/<name>.tsx`. To change wording or layout, edit the copy: it is the app's code now.
- Validate with `npm run build`, which type-checks the copies too.
