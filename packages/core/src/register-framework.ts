import { registerVersion } from "firebase/app";

/**
 * Register a framework with the FirebaseUI configuration.
 * @internal
 * @param framework The type of framework being registered.
 * @param version The version of the framework being registered.
 */
export function registerFramework(framework: string, version: string) {
  registerVersion("firebase-ui-web", version, framework);
}