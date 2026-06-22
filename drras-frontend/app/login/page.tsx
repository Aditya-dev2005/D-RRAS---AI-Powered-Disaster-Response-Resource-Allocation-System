"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ username, password });
  }

  return (
    <AuthShell
      eyebrow="Operations Access"
      title="Sign in to the command center"
      subtitle="Use your operator credentials to access live disaster operations."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="admin"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Sign in
        </Button>
      </form>

      <div className="rounded-md border border-dashed border-border bg-surface p-3 text-xs text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">Demo credentials</p>
        <p className="data-mono">admin / Admin@123 (admin)</p>
        <p className="data-mono">aditya / User@123 (operator)</p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New operator?{" "}
        <Link href="/register" className="font-medium text-signal hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
