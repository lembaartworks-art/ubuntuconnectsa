import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Ubuntu Connect SA" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function statusVariant(s: string) {
  if (s === "approved" || s === "completed" || s === "matched") return "default";
  if (s === "rejected") return "destructive";
  return "secondary";
}

function Dashboard() {
  const { user, roles } = useAuth();
  const isNgo = roles.includes("ngo");
  const isAdmin = roles.includes("admin");

  const { data: donations } = useQuery({
    queryKey: ["my-donations", user?.id],
    queryFn: async () => (await supabase.from("donations").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const { data: requests } = useQuery({
    queryKey: ["my-requests", user?.id],
    queryFn: async () => (await supabase.from("support_requests").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const { data: ngoRow } = useQuery({
    queryKey: ["my-ngo", user?.id],
    queryFn: async () =>
      (await supabase.from("ngos").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  return (
    <PageShell>
      <section className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Your dashboard</h1>
            <p className="text-muted-foreground">Signed in as {user?.email}</p>
            <div className="mt-2 flex gap-2">
              {roles.map((r) => (
                <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>
              ))}
            </div>
          </div>
          {isAdmin && (
            <Button asChild variant="outline"><Link to="/admin">Admin dashboard</Link></Button>
          )}
        </div>

        {isNgo && ngoRow && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{ngoRow.org_name}</span>
                <Badge variant={statusVariant(ngoRow.status)} className="capitalize">{ngoRow.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {ngoRow.status === "pending" && "Your application is awaiting admin approval."}
              {ngoRow.status === "approved" && "Your NGO is verified. You can now be matched with donations and requests."}
              {ngoRow.status === "rejected" && (ngoRow.rejection_reason || "Your application was not approved.")}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My donations</CardTitle>
              <Button asChild size="sm"><Link to="/donate">New</Link></Button>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <ul className="space-y-3">
                  {donations.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <div className="font-medium">{d.type}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{d.description}</div>
                      </div>
                      <Badge variant={statusVariant(d.status)} className="capitalize">{d.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't made any donations yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My requests</CardTitle>
              <Button asChild size="sm"><Link to="/request-support">New</Link></Button>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <ul className="space-y-3">
                  {requests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{r.category} · {r.location}</div>
                      </div>
                      <Badge variant={statusVariant(r.status)} className="capitalize">{r.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't submitted any requests yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}