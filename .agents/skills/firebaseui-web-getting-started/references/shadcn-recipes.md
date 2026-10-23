# FirebaseUI Web: shadcn/ui Recipes

Companion to [`shadcn.md`](shadcn.md). Complete files for the Firebase module, provider, pages and routes. They assume the components from `shadcn.md` section 1 were added and the type fix was applied. Change paths, routes and the post-sign-in destination to fit the app; reuse the project's Firebase config and router.

## 1. Firebase Module and Provider

Use the project's own Firebase config (project notes, env files) and do not invent values. Connect the Auth emulator before `initializeUI` when the project notes say to use it, with the host and port they give (`firebase.json` has them too).

**`src/firebase.ts`**

```ts
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { autoUpgradeAnonymousUsers, initializeUI } from '@firebase-oss/ui-core'

const app = initializeApp({ /* the project's Firebase config */ })

export const auth = getAuth(app)

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}

export const ui = initializeUI({ app, auth, behaviors: [autoUpgradeAnonymousUsers()] })
```

**`src/main.tsx`** (keep the app's existing router; the provider goes inside it)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FirebaseUIProvider } from '@firebase-oss/ui-react'
import App from './App.tsx'
import { ui } from './firebase.ts'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FirebaseUIProvider ui={ui}>
        <App />
      </FirebaseUIProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

## 2. Pages

One file with every auth page. `Page` gives each card the same centred layout, and the guest and account pages are cards like the screens. `RequireUser` redirects to `/sign-in` when nobody is signed in, and `useCurrentUser` is the auth-state hook it uses. Sign-out is `signOut` from `firebase/auth` (`@firebase-oss/ui-core` has no sign-out).

**`src/auth-pages.tsx`**

```tsx
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FactorId, onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { signInAnonymously } from '@firebase-oss/ui-core'
import { useUI } from '@firebase-oss/ui-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailLinkAuthScreen } from '@/components/email-link-auth-screen'
import { ForgotPasswordAuthScreen } from '@/components/forgot-password-auth-screen'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { MultiFactorAuthEnrollmentScreen } from '@/components/multi-factor-auth-enrollment-screen'
import { OAuthScreen } from '@/components/oauth-screen'
import { PhoneAuthScreen } from '@/components/phone-auth-screen'
import { SignInAuthScreen } from '@/components/sign-in-auth-screen'
import { SignUpAuthScreen } from '@/components/sign-up-auth-screen'

const Page = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto w-full max-w-sm px-4 py-16">{children}</main>
)

function useCurrentUser() {
  const { auth } = useUI()
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({ user: auth.currentUser, ready: false })
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, ready: true })), [auth])
  return state
}

function RequireUser({ children }: { children: ReactNode }) {
  const { user, ready } = useCurrentUser()
  if (!ready) return null
  return user ? children : <Navigate to="/sign-in" replace />
}

export function SignInPage() {
  const navigate = useNavigate()
  return (
    <Page>
      <SignInAuthScreen
        onSignIn={() => navigate('/account')}
        onForgotPasswordClick={() => navigate('/forgot-password')}
        onSignUpClick={() => navigate('/sign-up')}
      />
    </Page>
  )
}

export function SignUpPage() {
  const navigate = useNavigate()
  return (
    <Page>
      <SignUpAuthScreen onSignUp={() => navigate('/account')} onSignInClick={() => navigate('/sign-in')} />
    </Page>
  )
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  return <Page><ForgotPasswordAuthScreen onBackToSignInClick={() => navigate('/sign-in')} /></Page>
}

export function EmailLinkPage() {
  const navigate = useNavigate()
  return <Page><EmailLinkAuthScreen onSignIn={() => navigate('/account')} /></Page>
}

export function PhonePage() {
  const navigate = useNavigate()
  return <Page><PhoneAuthScreen onSignIn={() => navigate('/account')} /></Page>
}

export function OAuthPage() {
  const navigate = useNavigate()
  return (
    <Page>
      <OAuthScreen onSignIn={() => navigate('/account')}>
        <GoogleSignInButton />
      </OAuthScreen>
    </Page>
  )
}

export function AnonymousPage() {
  const ui = useUI()
  const navigate = useNavigate()
  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>Continue as guest</CardTitle>
          <CardDescription>Try the app without an account. You can add an email later and keep your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signInAnonymously(ui).then(() => navigate('/account'))}>
            Continue as guest
          </Button>
        </CardContent>
      </Card>
    </Page>
  )
}

export function LinkEmailPage() {
  const navigate = useNavigate()
  return <RequireUser><Page><SignUpAuthScreen onSignUp={() => navigate('/account')} /></Page></RequireUser>
}

export function MfaEnrollPage() {
  const navigate = useNavigate()
  return (
    <RequireUser>
      <Page>
        <MultiFactorAuthEnrollmentScreen hints={[FactorId.PHONE]} onEnrollment={() => navigate('/account')} />
      </Page>
    </RequireUser>
  )
}

export function AccountPage() {
  const { auth } = useUI()
  return (
    <RequireUser>
      <Page>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>uid: {auth.currentUser?.uid}</p>
            <p>email: {auth.currentUser?.email ?? ''}</p>
            <Button className="w-full" variant="outline" onClick={() => signOut(auth)}>Sign out</Button>
          </CardContent>
        </Card>
      </Page>
    </RequireUser>
  )
}
```

## 3. Routes

Edit `src/App.tsx` in place: keep every existing page, route and import (such as `Home` at `/`), add one import line for the pages, and add the new `<Route>` lines inside the existing `<Routes>`, with whatever paths the project asks for. Never replace the file or drop a route.

```tsx
import { Route, Routes } from 'react-router-dom'
import { AccountPage, AnonymousPage, EmailLinkPage, ForgotPasswordPage, LinkEmailPage, MfaEnrollPage, OAuthPage, PhonePage, SignInPage, SignUpPage } from './auth-pages.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* existing routes stay as they are */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/email-link" element={<EmailLinkPage />} />
      <Route path="/phone" element={<PhonePage />} />
      <Route path="/oauth" element={<OAuthPage />} />
      <Route path="/anonymous" element={<AnonymousPage />} />
      <Route path="/link-email" element={<LinkEmailPage />} />
      <Route path="/mfa/enroll" element={<MfaEnrollPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  )
}
```

Link the new pages from the existing UI (for example `<Link to="/sign-in">Sign in</Link>` on the home page) so people can reach them.

## 4. Notes on the Pages

- **Guest, then add an email:** `AnonymousPage` signs in anonymously with the `FirebaseUI` state object from `useUI()`. `LinkEmailPage` mounts the same `SignUpAuthScreen`: with `autoUpgradeAnonymousUsers()` in `initializeUI` it links the email and password to the guest and keeps its `uid`. Never call `linkWithCredential` yourself.
- **Guest and email link:** `EmailLinkAuthScreen`'s `onSignIn` does not fire when the link upgrades a guest. For that case add `@firebase/email-link-auth-form` and render `<EmailLinkAuthForm onSignIn={(credential) => ...} />`.
- **Sign-in with a second factor:** nothing to write. `SignInAuthScreen` (and the sign-up, email-link, phone and OAuth screens) show the code screen when the account has an SMS second factor, then finish the sign-in.
- **Multi-factor enrollment** needs a signed-in, non-anonymous user, so `/mfa/enroll` sits behind `RequireUser`.
- **Social:** more providers are separate registry buttons (`@firebase/github-sign-in-button` and so on). Nest them in the screen's `children`, or in `OAuthScreen`.
