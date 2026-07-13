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

const categories = ["School uniforms","Food","Clothing","Elderly care","Housing","Medical","Books & stationery","Other"];
const urgencies = ["low","medium","high","critical"];

const schema = z.object({
  category: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  urgency: z.string().min(1),
  location: z.string().trim().min(2).max(200),
});

export const Route = createFileRoute("/request-support")({
  head: () => ({
    meta: [
      { title: "Request support — Ubuntu Connect SA" },
      { name: "description", content: "Confidentially request support from Ubuntu Connect SA — for you, your family, a school or an elder." },
      { property: "og:title", content: "Request support — Ubuntu Connect SA" },
      { property: "og:description", content: "Ask for help with dignity. We'll match you with donors and verified NGOs." },
    ],
  }),
  component: RequestPage,
});

function RequestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [done, setDone] = useState(false);

  if (!authLoading && !user) {
    return (
      <PageShell>
        <section className="container mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Sign in to request support</h1>
          <p className="mt-3 text-muted-foreground">Create a free account to submit your request confidentially.</p>
          <Button asChild className="mt-6"><Link to="/auth">Sign in / Register</Link></Button>
        </section>
      </PageShell>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = { ...Object.fromEntries(fd), category, urgency } as Record<string, string>;
    const parsed = schema.safeParse(values);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Please complete the form.");

    setLoading(true);
    const { error } = await supabase.from("support_requests").insert({
      requester_id: user!.id,
      requester_name: String(fd.get("requester_name") ?? user!.email),
      requester_email: user!.email!,
      requester_phone: String(fd.get("requester_phone") ?? ""),
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      urgency: parsed.data.urgency,
      location: parsed.data.location,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <PageShell>
        <section className="container mx-auto max-w-xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[color:var(--color-success)]" />
          <h1 className="mt-6 font-display text-3xl font-bold">Request received</h1>
          <p className="mt-3 text-muted-foreground">Your request is under review. We'll match you with a donor or verified NGO and follow up as soon as possible.</p>
          <Button className="mt-6" onClick={() => navigate({ to: "/dashboard" })}>Go to dashboard</Button>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Request support</h1>
        <p className="mt-2 text-muted-foreground">Your request is confidential and reviewed by our admin team and verified NGOs.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="requester_name">Your name</Label>
              <Input id="requester_name" name="requester_name" defaultValue={user?.email?.split("@")[0]} />
            </div>
            <div>
              <Label htmlFor="requester_phone">Phone (optional)</Label>
              <Input id="requester_phone" name="requester_phone" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urgency *</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {urgencies.map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="title">Short title *</Label>
            <Input id="title" name="title" required maxLength={200} placeholder="e.g. School uniforms for 2 children" />
          </div>
          <div>
            <Label htmlFor="location">City / location *</Label>
            <Input id="location" name="location" required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="description">Describe your situation *</Label>
            <Textarea id="description" name="description" required rows={6} maxLength={2000} />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}