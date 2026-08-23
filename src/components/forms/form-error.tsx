import type { ActionResult } from "@/lib/forms/result";

type FormErrorProps = {
  result: ActionResult | null | undefined;
};

/**
 * Renders an `ActionResult`'s error message inline (`role="alert"`) so the
 * page never falls back to Next's error overlay for a business error.
 * Renders nothing for `null`/`undefined` (no submission yet) or `ok:true`.
 */
export function FormError({ result }: FormErrorProps) {
  if (!result || result.ok) {
    return null;
  }

  return (
    <p role="alert" data-testid="form-error">
      {result.error}
    </p>
  );
}
