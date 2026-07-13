import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Heart, HandHeart, Building2, Users, Package, HeartHandshake, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const [ngos, donations, requests] = await Promise.all([
        supabase.from("ngos").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("donations").select("id", { count: "exact", head: true }),
        supabase.from("support_requests").select("id", { count: "exact", head: true }),
      ]);
      return {
        ngos: ngos.count ?? 0,
        donations: donations.count ?? 0,
        requests: requests.count ?? 0,
      };
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
          <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-2 w-2 rounded-full bg-accent" /> A South African movement
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl">
                No child should miss school because they lack a uniform. No elder should face hardship alone. No family should suffer in silence.{" "}
                <span className="text-accent">Together, we can change someone's tomorrow.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Ubuntu Connect SA connects compassionate people, verified NGOs, churches, businesses, schools, and volunteers with individuals and families who need support across South Africa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <Link to="/donate">❤️ Donate</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/request-support">🤲 Request Support</Link>
                </Button>
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/register-ngo">🏢 Register as NGO</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-6 rounded-full bg-accent/10 blur-3xl" />
              <img
                src={logoAsset.url}
                alt="Ubuntu Connect SA logo"
                className="relative w-full max-w-md rounded-full shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-primary text-primary-foreground">
          <div className="container mx-auto grid grid-cols-3 gap-4 px-4 py-8 text-center">
            <div>
              <div className="font-display text-3xl font-bold">{stats?.ngos ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider text-primary-foreground/80">Verified NGOs</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold">{stats?.donations ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider text-primary-foreground/80">Donations</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold">{stats?.requests ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider text-primary-foreground/80">Support Requests</div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              A platform built on Ubuntu
            </h2>
            <p className="mt-4 text-muted-foreground">
              "I am because we are." Every donation, every request, every match is a step toward a stronger South Africa.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { icon: Package, title: "Give what you can", body: "Uniforms, food, books, clothing, or time — every contribution counts." },
              { icon: HandHeart, title: "Request with dignity", body: "Families and individuals can safely ask for the help they need." },
              { icon: Users, title: "Verified NGOs", body: "Every partner organisation is reviewed and approved by our admin team." },
              { icon: Home, title: "Community-first", body: "We prioritise long-term impact, not one-off charity." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-secondary/50 py-16">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
            <HeartHandshake className="h-12 w-12 text-primary" />
            <h2 className="font-display text-3xl font-bold">Ready to make a difference?</h2>
            <p className="max-w-xl text-muted-foreground">
              Join our community of donors, volunteers, and organisations across South Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
