import { useRedirectError } from "~/hooks";

export function RedirectError() {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return <div className="fui-error">{error}</div>;
}
