"use client";

import { useRedirectError } from "@invertase/firebaseui-react";

export function RedirectError() {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return <div className="text-sm text-destructive">{error}</div>;
}
