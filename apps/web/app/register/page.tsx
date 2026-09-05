"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { LogoMark } from "../../components/Logo";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import { registerUser } from "../actions/auth-actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await registerUser(email, password);

      if (result.success) {
        router.push("/login?registered=true");
      } else {
        setError(result.error || "An error occurred during registration");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-background selection:bg-signal selection:text-background scanlines">
      <div className="sm:mx-auto sm:w-full sm:max-w-[400px] px-6">
        <Link href="/" className="flex justify-center mb-8 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 border-2 border-border bg-foreground flex items-center justify-center">
            <LogoMark className="h-5 w-5 text-background" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-terminal tracking-wide">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground mb-8">
          Start finding high-intent leads today
        </p>

        <div className="pixel-frame bg-card border-2 border-border shadow-pixel p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="border-2 border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive font-medium text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              By clicking continue, you agree to our{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-foreground">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
