"use client";

import { useRedirectError } from "@invertase/firebaseui-react";

export function RedirectError() {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return <div className="text-sm text-red-600 dark:text-red-400">{error}</div>;
}
