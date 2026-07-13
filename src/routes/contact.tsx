import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(5).max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ubuntu Connect SA" },
      { name: "description", content: "Get in touch with Ubuntu Connect SA." },
      { property: "og:title", content: "Contact Ubuntu Connect SA" },
      { property: "og:description", content: "Send us a message and our team will reply." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      from_name: parsed.data.name,
      from_email: parsed.data.email,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not send message. Please try again.");
      return;
    }
    setSent(true);
    toast.success("Message sent — thank you!");
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold">Contact us</h1>
        <p className="mt-3 text-muted-foreground">Have a question, an idea or want to partner with us? Send us a message.</p>
        {sent ? (
          <div className="mt-8 rounded-2xl border bg-secondary/40 p-6 text-center">
            <h2 className="font-display text-xl font-semibold">Thank you</h2>
            <p className="mt-2 text-muted-foreground">Your message has been received. Our team will be in touch.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" name="body" required rows={6} maxLength={2000} />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Send message"}
            </Button>
          </form>
        )}
      </section>
    </PageShell>
  );
}