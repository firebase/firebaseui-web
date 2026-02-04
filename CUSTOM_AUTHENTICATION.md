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

``tsx
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