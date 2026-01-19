import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { user } = useAuthenticator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.signInDetails?.loginId || "User"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Information</CardTitle>
            <CardDescription>Your subscription overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="font-medium">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/subscriptions">View Subscriptions</Link>
        </Button>
      </div>
    </div>
  );
}
