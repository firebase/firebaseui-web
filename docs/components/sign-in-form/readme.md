# firebase-sign-in-form



<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                      | Description                                                                                                  | Type                  | Default     |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------- | ----------- |
| `assetBasePath`             | `asset-base-path`              |                                                                                                              | `string`              | `'assets'`  |
| `autoUpgradeAnonymousUsers` | `auto-upgrade-anonymous-users` | Whether to automatically upgrade existing anonymous users on sign-in/sign-up. See Upgrading anonymous users. | `boolean`             | `false`     |
| `privacyPolicyUrl`          | `privacy-policy-url`           | The URL of the Privacy Policy page.                                                                          | `string \| undefined` | `undefined` |
| `signInSuccessUrl`          | `sign-in-success-url`          |                                                                                                              | `string \| undefined` | `undefined` |
| `tosUrl`                    | `tos-url`                      | The URL of the Terms of Service page.                                                                        | `string \| undefined` | `undefined` |


## Events

| Event              | Description | Type                          |
| ------------------ | ----------- | ----------------------------- |
| `signInSuccessful` |             | `CustomEvent<UserCredential>` |


## Methods

### `setAuth(auth: FirebaseAuth) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with love!*
