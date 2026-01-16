import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuthenticator();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-semibold">
              CPOS
            </Link>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/subscriptions"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Subscriptions
              </Link>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
