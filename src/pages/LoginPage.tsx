import { Button } from "@/components/ui/button";

interface LoginPageProps {
  onSignInClick?: () => void;
}

export function LoginPage({ onSignInClick }: LoginPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to CPOS</h1>
          <p className="text-muted-foreground">
            Please sign in to access your dashboard and manage your subscriptions.
          </p>
        </div>
        <Button onClick={onSignInClick} size="lg" className="w-full">
          Sign In
        </Button>
      </div>
    </div>
  );
}
