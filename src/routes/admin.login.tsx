import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { seedInitialAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin login — Ubuntu Connect SA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, roles, refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const seedFn = useServerFn(seedInitialAdmin);
  const [seeding, setSeeding] = useState(false);

  async function onSeed() {
    setSeeding(true);
    try {
      const res = await seedFn();
      if (res.ok) toast.success(res.reason === "already_seeded" ? "Admin already exists." : `Admin created: ${res.email}`);
      else toast.error(res.reason ?? "Seed failed.");
    } catch (e) { toast.error((e as Error).message); }
    setSeeding(false);
  }

  useEffect(() => {
    if (user && roles.includes("admin")) navigate({ to: "/admin" });
  }, [user, roles, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")).trim(),
      password: String(fd.get("password")),
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Verify admin role
    const { data: r } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    if (!r || r.length === 0) {
      await supabase.auth.signOut();
      setLoading(false);
      return toast.error("This account is not an administrator.");
    }
    await refreshRoles();
    setLoading(false);
    toast.success("Signed in as admin.");
    navigate({ to: "/admin" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Admin login</h1>
              <p className="text-xs text-muted-foreground">Administrators only.</p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="a-email">Email</Label>
              <Input id="a-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="a-pw">Password</Label>
              <Input id="a-pw" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-xs text-muted-foreground">First-time setup: create the initial admin using the pre-configured email + password.</p>
            <Button variant="outline" size="sm" className="w-full" onClick={onSeed} disabled={seeding}>
              {seeding ? "Setting up..." : "Set up initial admin"}
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}