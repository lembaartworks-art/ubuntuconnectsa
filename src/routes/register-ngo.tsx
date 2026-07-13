import { createFileRoute } from "@tanstack/react-router";
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
import { CheckCircle2 } from "lucide-react";

const provinces = [
  "Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape",
];

const schema = z.object({
  org_name: z.string().trim().min(2).max(200),
  reg_number: z.string().trim().max(100).optional(),
  contact_person: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  province: z.string().min(1),
  city: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  description: z.string().trim().min(20).max(2000),
});

export const Route = createFileRoute("/register-ngo")({
  head: () => ({
    meta: [
      { title: "Register your NGO — Ubuntu Connect SA" },
      { name: "description", content: "Apply to have your NGO verified and listed on Ubuntu Connect SA." },
      { property: "og:title", content: "Register your NGO — Ubuntu Connect SA" },
      { property: "og:description", content: "Apply to be verified and start connecting with donors and requests." },
    ],
  }),
  component: RegisterNgoPage,
});

function RegisterNgoPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [province, setProvince] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(fd) as Record<string, string>;
    values.province = province;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete all required fields.");
      return;
    }
    setLoading(true);

    const files = (fd.getAll("documents") as File[]).filter((f) => f && f.size > 0);
    const uploaded: { path: string; name: string; size: number }[] = [];
    const folder = `applications/${crypto.randomUUID()}`;

    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        setLoading(false);
        return toast.error(`${f.name} is larger than 10MB.`);
      }
      const path = `${folder}/${Date.now()}-${f.name}`;
      const up = await supabase.storage.from("ngo-documents").upload(path, f);
      if (up.error) {
        setLoading(false);
        return toast.error(`Upload failed: ${up.error.message}`);
      }
      uploaded.push({ path: up.data.path, name: f.name, size: f.size });
    }

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("ngos").insert({
      ...parsed.data,
      documents: uploaded,
      user_id: userData.user?.id ?? null,
    });

    setLoading(false);
    if (error) return toast.error(error.message);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PageShell>
        <section className="container mx-auto max-w-xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[color:var(--color-success)]" />
          <h1 className="mt-6 font-display text-3xl font-bold">Application received</h1>
          <p className="mt-3 text-muted-foreground">
            Your NGO application is now <strong>pending admin approval</strong>. Our team will review your submission and supporting documents. You will be notified once a decision is made.
          </p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Register your NGO</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in your organisation details and upload supporting documents. Applications are reviewed by our admin team.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="org_name">Organisation name *</Label>
            <Input id="org_name" name="org_name" required maxLength={200} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="reg_number">Registration number</Label>
              <Input id="reg_number" name="reg_number" maxLength={100} placeholder="If available" />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact person *</Label>
              <Input id="contact_person" name="contact_person" required maxLength={120} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required maxLength={30} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Province *</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" name="city" required maxLength={120} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Physical address *</Label>
            <Input id="address" name="address" required maxLength={300} />
          </div>
          <div>
            <Label htmlFor="description">Description of your work *</Label>
            <Textarea id="description" name="description" required rows={5} maxLength={2000} />
          </div>
          <div>
            <Label htmlFor="documents">Supporting documents</Label>
            <Input
              id="documents"
              name="documents"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Registration certificates, tax exemption, board profiles etc. (Max 10MB each)
            </p>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit application"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}