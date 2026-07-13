import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ubuntu Connect SA" },
      { name: "description", content: "Learn about Ubuntu Connect SA — our mission to connect donors, NGOs and families across South Africa." },
      { property: "og:title", content: "About Ubuntu Connect SA" },
      { property: "og:description", content: "Our mission is to connect compassion with need across South Africa." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold">About Ubuntu Connect SA</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Ubuntu means <em>"I am because we are."</em> It's the belief that our humanity is bound together — that when one of us struggles, we all do; and when one of us rises, we all rise.
        </p>
        <div className="mt-8 space-y-6 text-base leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold">Our mission</h2>
            <p className="mt-2 text-muted-foreground">
              We connect compassionate donors, verified NGOs, churches, businesses, schools and volunteers with individuals and families who need support across South Africa — with dignity, transparency and long-term impact.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Why we exist</h2>
            <p className="mt-2 text-muted-foreground">
              Too often, help doesn't reach the people who need it most. Ubuntu Connect SA bridges that gap by creating a trusted platform where offers of help and requests for support can meet — verified, safe, and easy for anyone to use.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Our values</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
              <li><strong>Dignity</strong> — every person asking for help is treated with respect.</li>
              <li><strong>Transparency</strong> — every NGO is reviewed and approved.</li>
              <li><strong>Community</strong> — we build long-term relationships, not one-off transactions.</li>
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}