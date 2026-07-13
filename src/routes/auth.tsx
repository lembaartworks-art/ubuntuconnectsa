import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ubuntu Connect SA" },
      { name: "description", content: "Sign in or register on Ubuntu Connect SA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")).trim(),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const role = String(fd.get("role") ?? "donor");
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")).trim(),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: String(fd.get("full_name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          role,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email if confirmation is required.");
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Welcome</h1>
        <p className="mt-2 text-muted-foreground">Sign in or create a free account to donate or request support.</p>
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4">
                <div>
                  <Label>I am registering as</Label>
                  <RadioGroup defaultValue="donor" name="role" className="mt-2 grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value="donor" /> Donor
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value="community" /> Community member
                    </label>
                  </RadioGroup>
                  <p className="mt-2 text-xs text-muted-foreground">
                    NGOs register through the <Link to="/register-ngo" className="underline">NGO application</Link>.
                  </p>
                </div>
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="full_name" required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="su-phone">Phone (optional)</Label>
                  <Input id="su-phone" name="phone" maxLength={30} />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" name="password" type="password" required autoComplete="new-password" minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PageShell>
  );
}