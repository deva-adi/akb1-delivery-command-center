import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}): JSX.Element {
  const from = searchParams.from ?? "/home";
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-gold grid place-items-center">
              <span className="text-bg-base font-bold text-lg">A1</span>
            </div>
            <div className="text-left">
              <div className="text-text-primary font-semibold tracking-tight">
                AKB1 Delivery Command Center
              </div>
              <div className="text-text-muted text-xs">
                Sign in to continue
              </div>
            </div>
          </div>
        </header>
        <LoginForm redirectTo={from} />
      </div>
    </main>
  );
}
