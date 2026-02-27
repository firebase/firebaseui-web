import { useNavigate } from "react-router";
import { useUI } from "@firebase-oss/ui-react";
import {
  SignUpAuthScreen,
  GoogleSignInButton,
  FacebookSignInButton,
  AppleSignInButton,
  GitHubSignInButton,
  MicrosoftSignInButton,
  TwitterSignInButton,
  YahooSignInButton,
} from "@firebase-oss/ui-react";

import { getDatabase, ref, set } from "firebase/database";

export default function SignUpAuthScreenProviderGuidancePage() {
  const navigate = useNavigate();
  const db = getDatabase();

  return (
    <SignUpAuthScreen
      onSignUp={async (user) => {
        if (!user?.email) return;
        const safeEmail = user.email.replace(/\./g, ",");
        await set(ref(db, `usersByEmail/${safeEmail}`), {
          provider: user.providerData[0]?.providerId,
          email: user.email,
          uid: user.uid,
        });
        navigate("/");
      }}
    >
      <GoogleSignInButton />
      <FacebookSignInButton />
      <AppleSignInButton />
      <GitHubSignInButton />
      <MicrosoftSignInButton />
      <TwitterSignInButton />
      <YahooSignInButton />
    </SignUpAuthScreen>
  );
}
