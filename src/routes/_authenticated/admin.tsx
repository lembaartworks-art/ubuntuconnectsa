import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { addAdmin, removeAdmin, setAdminActive, listAdmins, approveNgo, getSignedDocUrl } from "@/lib/admin.functions";
import { Trash2, Check, X, FileText, Plus, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Ubuntu Connect SA" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !roles.includes("admin")) navigate({ to: "/dashboard" });
  }, [roles, loading, navigate]);

  if (loading) return <PageShell><div className="container mx-auto p-8">Loading...</div></PageShell>;
  if (!roles.includes("admin")) return null;

  return (
    <PageShell>
      <section className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground">Manage NGOs, donations, requests, admins and testimonials.</p>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ngos">NGOs</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="ngos"><NgosTab /></TabsContent>
          <TabsContent value="donations"><DonationsTab /></TabsContent>
          <TabsContent value="requests"><RequestsTab /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="admins"><AdminsTab /></TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
}

// ================= OVERVIEW =================
function OverviewTab() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [d, r, n, u, m] = await Promise.all([
        supabase.from("donations").select("id", { count: "exact", head: true }),
        supabase.from("support_requests").select("id", { count: "exact", head: true }),
        supabase.from("ngos").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      return {
        donations: d.count ?? 0,
        requests: r.count ?? 0,
        ngos: n.count ?? 0,
        users: u.count ?? 0,
        matches: m.count ?? 0,
      };
    },
  });
  const items = [
    { label: "Donations", value: data?.donations ?? 0 },
    { label: "Requests", value: data?.requests ?? 0 },
    { label: "NGOs", value: data?.ngos ?? 0 },
    { label: "Users", value: data?.users ?? 0 },
    { label: "Completed matches", value: data?.matches ?? 0 },
  ];
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
      {items.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader>
          <CardContent><div className="font-display text-3xl font-bold">{s.value}</div></CardContent>
        </Card>
      ))}
    </div>
  );
}

function statusVariant(s: string) {
  if (s === "approved" || s === "completed" || s === "matched") return "default";
  if (s === "rejected") return "destructive";
  return "secondary";
}

// ================= NGOs =================
function NgosTab() {
  const qc = useQueryClient();
  const approveFn = useServerFn(approveNgo);
  const signFn = useServerFn(getSignedDocUrl);
  const { data: ngos } = useQuery({
    queryKey: ["admin-ngos"],
    queryFn: async () => (await supabase.from("ngos").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const approve = useMutation({
    mutationFn: async (id: string) => approveFn({ data: { ngo_id: id } }),
    onSuccess: () => { toast.success("NGO approved."); qc.invalidateQueries({ queryKey: ["admin-ngos"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.from("ngos").update({ status: "rejected", rejection_reason: reason }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("NGO rejected."); qc.invalidateQueries({ queryKey: ["admin-ngos"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ngos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-ngos"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openDoc(path: string) {
    try {
      const res = await signFn({ data: { path } });
      window.open(res.url, "_blank", "noopener");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="mt-4 space-y-4">
      {(ngos ?? []).length === 0 && <p className="text-sm text-muted-foreground">No NGO applications yet.</p>}
      {(ngos ?? []).map((n) => (
        <Card key={n.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>{n.org_name}</span>
              <Badge variant={statusVariant(n.status)} className="capitalize">{n.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div><strong>Contact:</strong> {n.contact_person} · {n.email} · {n.phone}</div>
              <div><strong>Location:</strong> {n.city}, {n.province}</div>
              <div className="md:col-span-2"><strong>Address:</strong> {n.address}</div>
              <div className="md:col-span-2"><strong>Reg #:</strong> {n.reg_number || "—"}</div>
              <div className="md:col-span-2"><strong>Description:</strong> {n.description}</div>
            </div>
            {Array.isArray(n.documents) && n.documents.length > 0 && (
              <div>
                <strong>Documents:</strong>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {(n.documents as { path: string; name: string }[]).map((d) => (
                    <li key={d.path}>
                      <Button variant="outline" size="sm" onClick={() => openDoc(d.path)}>
                        <FileText className="mr-1 h-3 w-3" /> {d.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={() => approve.mutate(n.id)} disabled={n.status === "approved"}><Check className="mr-1 h-4 w-4" /> Approve</Button>
              <RejectDialog onConfirm={(reason) => reject.mutate({ id: n.id, reason })} />
              <DeleteButton onConfirm={() => del.mutate(n.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RejectDialog({ onConfirm }: { onConfirm: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><X className="mr-1 h-4 w-4" /> Reject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Reject application</DialogTitle></DialogHeader>
        <Textarea placeholder="Reason (shown to applicant)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onConfirm(reason); setOpen(false); }}>Confirm reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ================= DONATIONS =================
function DonationsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => (await supabase.from("donations").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("donations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-donations"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("donations").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-donations"] }); },
  });
  return (
    <div className="mt-4 space-y-3">
      {(data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No donations yet.</p>}
      {(data ?? []).map((d) => (
        <Card key={d.id}>
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <div className="font-semibold">{d.type} {d.amount ? `— R${d.amount}` : ""}</div>
              <div className="text-muted-foreground">{d.donor_name} · {d.donor_email} · {d.location}</div>
              <div className="text-muted-foreground line-clamp-2">{d.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(d.status)} className="capitalize">{d.status}</Badge>
              <Button size="sm" onClick={() => update.mutate({ id: d.id, status: "approved" })} disabled={d.status === "approved"}><Check className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => update.mutate({ id: d.id, status: "rejected" })} disabled={d.status === "rejected"}><X className="h-4 w-4" /></Button>
              <DeleteButton onConfirm={() => del.mutate(d.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================= REQUESTS =================
function RequestsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => (await supabase.from("support_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("support_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-requests"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("support_requests").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-requests"] }); },
  });
  return (
    <div className="mt-4 space-y-3">
      {(data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No support requests yet.</p>}
      {(data ?? []).map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <div className="font-semibold">{r.title} <span className="text-xs uppercase text-muted-foreground">· {r.urgency}</span></div>
              <div className="text-muted-foreground">{r.category} · {r.requester_name} · {r.requester_email} · {r.location}</div>
              <div className="text-muted-foreground line-clamp-2">{r.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(r.status)} className="capitalize">{r.status}</Badge>
              <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "approved" })} disabled={r.status === "approved"}><Check className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, status: "rejected" })} disabled={r.status === "rejected"}><X className="h-4 w-4" /></Button>
              <DeleteButton onConfirm={() => del.mutate(r.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================= TESTIMONIALS =================
function TestimonialsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: async (v: { author_name: string; author_role: string; quote: string; image_url: string }) => {
      const { error } = await supabase.from("testimonials").insert(v);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Testimonial added."); setOpen(false); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { published?: boolean; hidden?: boolean } }) => {
      const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); },
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Add testimonial</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New testimonial</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                create.mutate({
                  author_name: String(fd.get("author_name")),
                  author_role: String(fd.get("author_role")),
                  quote: String(fd.get("quote")),
                  image_url: String(fd.get("image_url")),
                });
              }}
              className="space-y-3"
            >
              <div><Label>Author name</Label><Input name="author_name" required /></div>
              <div><Label>Author role</Label><Input name="author_role" placeholder="e.g. Donor, NGO director" /></div>
              <div><Label>Image URL (optional)</Label><Input name="image_url" type="url" /></div>
              <div><Label>Quote</Label><Textarea name="quote" required rows={4} /></div>
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {(data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No testimonials yet. Add one when you have a real success story.</p>
      )}
      {(data ?? []).map((t) => (
        <Card key={t.id}>
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 text-sm">
              <div className="font-semibold">{t.author_name} <span className="text-xs text-muted-foreground">{t.author_role}</span></div>
              <p className="mt-1 italic text-muted-foreground">"{t.quote}"</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={t.published ? "default" : "secondary"}>{t.published ? "Published" : "Draft"}</Badge>
              {t.hidden && <Badge variant="outline">Hidden</Badge>}
              <Button size="sm" variant="outline" onClick={() => update.mutate({ id: t.id, patch: { published: !t.published } })}>
                {t.published ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => update.mutate({ id: t.id, patch: { hidden: !t.hidden } })}>
                {t.hidden ? <><Eye className="mr-1 h-4 w-4" /> Show</> : <><EyeOff className="mr-1 h-4 w-4" /> Hide</>}
              </Button>
              <DeleteButton onConfirm={() => del.mutate(t.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================= MESSAGES =================
function MessagesTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("messages").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("messages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-messages"] }); },
  });
  return (
    <div className="mt-4 space-y-3">
      {(data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      {(data ?? []).map((m) => (
        <Card key={m.id} className={m.read ? "" : "border-primary"}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm">
                <div className="font-semibold">{m.subject}</div>
                <div className="text-xs text-muted-foreground">{m.from_name} · {m.from_email} · {new Date(m.created_at).toLocaleString()}</div>
                <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleRead.mutate({ id: m.id, read: !m.read })}>
                  {m.read ? "Mark unread" : "Mark read"}
                </Button>
                <DeleteButton onConfirm={() => del.mutate(m.id)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================= ADMINS =================
function AdminsTab() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const listFn = useServerFn(listAdmins);
  const addFn = useServerFn(addAdmin);
  const removeFn = useServerFn(removeAdmin);
  const setActiveFn = useServerFn(setAdminActive);
  const { data } = useQuery({ queryKey: ["admins"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);

  const add = useMutation({
    mutationFn: async (v: { email: string; password: string; full_name: string }) => addFn({ data: v }),
    onSuccess: () => { toast.success("Admin created."); setOpen(false); qc.invalidateQueries({ queryKey: ["admins"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => removeFn({ data: { user_id: id } }),
    onSuccess: () => { toast.success("Admin removed."); qc.invalidateQueries({ queryKey: ["admins"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async (v: { user_id: string; is_active: boolean }) => setActiveFn({ data: v }),
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admins"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Add admin</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create administrator</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                add.mutate({
                  email: String(fd.get("email")),
                  password: String(fd.get("password")),
                  full_name: String(fd.get("full_name")),
                });
              }}
              className="space-y-3"
            >
              <div><Label>Full name</Label><Input name="full_name" required /></div>
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Temporary password</Label><Input name="password" type="text" minLength={8} required /></div>
              <p className="text-xs text-muted-foreground">Share this password with the new administrator securely. They should change it after first sign-in.</p>
              <DialogFooter><Button type="submit" disabled={add.isPending}>{add.isPending ? "Creating..." : "Create admin"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {(data ?? []).map((a) => (
        <Card key={a.user_id}>
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <div className="font-semibold">{a.email} {a.is_primary && <Badge className="ml-2">Primary</Badge>} {a.user_id === user?.id && <Badge variant="outline" className="ml-1">You</Badge>}</div>
              <div className="text-xs text-muted-foreground">Created {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs">Active</span>
                <Switch
                  checked={a.is_active}
                  disabled={a.is_primary || a.user_id === user?.id}
                  onCheckedChange={(v) => toggle.mutate({ user_id: a.user_id, is_active: v })}
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                disabled={a.is_primary || a.user_id === user?.id}
                onClick={() => remove.mutate(a.user_id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}