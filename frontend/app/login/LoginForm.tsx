"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  redirectTo: string;
}

interface ProxyError {
  status: number;
  detail: string;
  retryAfter: string | null;
}

export function LoginForm({ redirectTo }: LoginFormProps): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ProxyError | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      const body = (await response.json()) as { detail?: string; retryAfter?: string | null };
      setError({
        status: response.status,
        detail: body.detail ?? "Sign-in failed",
        retryAfter: body.retryAfter ?? null,
      });
    } catch (err) {
      setError({
        status: 0,
        detail: err instanceof Error ? err.message : "Network error",
        retryAfter: null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-bg-surface border border-border-subtle rounded-lg p-6"
      aria-label="Sign in"
    >
      <label className="block mb-4">
        <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-gold"
        />
      </label>
      <label className="block mb-5">
        <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">
          Password
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-gold"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent-gold text-bg-base font-semibold rounded-md py-2 text-sm disabled:opacity-60"
      >
        {submitting ? "Signing in" : "Sign in"}
      </button>

      {error !== null ? (
        <ErrorBanner error={error} />
      ) : null}
    </form>
  );
}

function ErrorBanner({ error }: { error: ProxyError }): JSX.Element {
  const isLockout = error.status === 429;
  const retrySeconds = parseRetryAfter(error.retryAfter);
  const message = isLockout && retrySeconds !== null
    ? `Too many attempts. Try again in ${retrySeconds} seconds.`
    : error.detail;
  return (
    <div
      role="alert"
      data-status={error.status}
      className="mt-4 border border-status-red bg-bg-surface-subtle text-status-red rounded-md px-3 py-2 text-sm"
    >
      {message}
    </div>
  );
}

function parseRetryAfter(value: string | null): number | null {
  if (value === null) return null;
  const seconds = Number.parseInt(value, 10);
  if (Number.isFinite(seconds) && seconds > 0) return seconds;
  return null;
}
