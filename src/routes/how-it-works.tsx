import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Ubuntu Connect SA" },
      { name: "description", content: "Learn how donations, requests and NGO partnerships work on Ubuntu Connect SA." },
      { property: "og:title", content: "How Ubuntu Connect SA Works" },
      { property: "og:description", content: "From donation to delivery — see the four steps that connect help with need." },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  { n: "01", title: "Someone asks for help", body: "A family, individual, school or elder submits a request through our secure form." },
  { n: "02", title: "A donor offers support", body: "Donors pledge uniforms, food, clothing, funds, books or their time." },
  { n: "03", title: "An NGO or admin verifies", body: "Verified NGOs and admins review requests and match them with the right donations." },
  { n: "04", title: "Impact is delivered", body: "Support reaches the family — safely, with dignity, and with community backing." },
];

function HowItWorksPage() {
  return (
    <PageShell>
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold">How Ubuntu Connect SA works</h1>
        <p className="mt-4 text-lg text-muted-foreground">A simple, transparent path from compassion to real impact.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="font-display text-4xl font-bold text-accent">{s.n}</div>
              <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border bg-secondary/40 p-8">
          <h2 className="font-display text-2xl font-semibold">Are you an NGO?</h2>
          <p className="mt-2 text-muted-foreground">
            Register your organisation to receive requests, offer support, and be publicly listed once approved by our admin team.
          </p>
          <Button asChild className="mt-4">
            <Link to="/register-ngo">Register your NGO</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}