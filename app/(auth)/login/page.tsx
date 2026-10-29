"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo.kara@kurosolutions.co.za");
  const [password, setPassword] = useState("DemoAccess2026!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/demo/login", { method: "POST" });
      if (res.ok) {
        router.push("/hoffman-audiology/inbox");
      } else {
        router.push("/hoffman-audiology/inbox");
      }
    } catch {
      router.push("/hoffman-audiology/inbox");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLaunchDemo();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-8">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kuro Solutions CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Appointment-Led CRM SaaS Platform
          </p>
        </div>

        {/* Demo Mode Notice Box */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-700 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>Hoffman Audiology Sales Demonstration</span>
          </div>
          <p className="leading-relaxed">
            This workspace is prepared for <strong className="font-semibold">Dr. Kara Hoffman</strong> with 100% synthetic demonstration patient inquiries, Durban & Ballito clinic locations, and simulated multi-channel integrations.
          </p>
          <div className="pt-1 flex items-center gap-1 text-[11px] text-amber-700/80 dark:text-amber-300/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Isolated Demo Environment • Zero Real PHI</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Address (Demo Account)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo.kara@kurosolutions.co.za"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 mt-2 font-medium" disabled={loading}>
            <span>{loading ? "Authenticating Demo Workspace..." : "Sign in to Practice"}</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleLaunchDemo}
            className="w-full h-10 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>1-Click Launch Sales Demo Workspace</span>
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <span>Need a new organization workspace? </span>
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register practice
          </Link>
        </div>
      </div>
    </div>
  );
}
