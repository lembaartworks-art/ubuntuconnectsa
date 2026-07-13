import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2 } from "lucide-react";

const types = ["Money","Food","Clothing","School uniforms","Books & stationery","Furniture","Time / Volunteering","Other"];

const schema = z.object({
  type: z.string().min(1),
  description: z.string().trim().min(5).max(2000),
  amount: z.string().optional(),
  location: z.string().trim().min(2).max(200),
});

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Ubuntu Connect SA" },
      { name: "description", content: "Offer a donation to Ubuntu Connect SA — money, food, clothing, uniforms, books or your time." },
      { property: "og:title", content: "Donate — Ubuntu Connect SA" },
      { property: "og:description", content: "Every donation, big or small, changes someone's tomorrow." },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [done, setDone] = useState(false);

  if (!authLoading && !user) {
    return (
      <PageShell>
        <section className="container mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Sign in to donate</h1>
          <p className="mt-3 text-muted-foreground">Create a free account or sign in to submit a donation.</p>
          <Button asChild className="mt-6"><Link to="/auth">Sign in / Register</Link></Button>
        </section>
      </PageShell>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = { ...Object.fromEntries(fd), type } as Record<string, string>;
    const parsed = schema.safeParse(values);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Please complete the form.");

    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      donor_id: user!.id,
      donor_name: String(fd.get("donor_name") ?? user!.email),
      donor_email: user!.email!,
      donor_phone: String(fd.get("donor_phone") ?? ""),
      type: parsed.data.type,
      description: parsed.data.description,
      amount: parsed.data.amount ? Number(parsed.data.amount) : null,
      location: parsed.data.location,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Donation submitted — thank you!");
  }

  if (done) {
    return (
      <PageShell>
        <section className="container mx-auto max-w-xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[color:var(--color-success)]" />
          <h1 className="mt-6 font-display text-3xl font-bold">Thank you</h1>
          <p className="mt-3 text-muted-foreground">Your donation offer is now pending admin review. We'll match it to families or NGOs and follow up soon.</p>
          <Button className="mt-6" onClick={() => navigate({ to: "/dashboard" })}>Go to dashboard</Button>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Offer a donation</h1>
        <p className="mt-2 text-muted-foreground">Every donation is reviewed and matched with families or NGOs who need it.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="donor_name">Your name</Label>
              <Input id="donor_name" name="donor_name" defaultValue={user?.email?.split("@")[0]} />
            </div>
            <div>
              <Label htmlFor="donor_phone">Phone (optional)</Label>
              <Input id="donor_phone" name="donor_phone" />
            </div>
          </div>
          <div>
            <Label>Type of donation *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount (ZAR, if money)</Label>
            <Input id="amount" name="amount" type="number" min={0} step="0.01" />
          </div>
          <div>
            <Label htmlFor="location">City / location *</Label>
            <Input id="location" name="location" required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="description">Describe what you're donating *</Label>
            <Textarea id="description" name="description" required rows={5} maxLength={2000} />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit donation"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}