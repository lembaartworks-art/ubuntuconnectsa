import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Idempotent seed of the initial admin account. Reads email + password from env.
// Safe to expose: it can only run once (returns "already exists" thereafter).
export const seedInitialAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env.ADMIN_INITIAL_EMAIL || "admin@ubuntuconnectsa.org";
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password) {
    return { ok: false, reason: "ADMIN_INITIAL_PASSWORD not configured." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Check if any admin already exists
  const { data: existingRoles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1);
  if (existingRoles && existingRoles.length > 0) {
    return { ok: true, reason: "already_seeded" };
  }

  // Create the admin user
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Primary Admin", role: "donor" },
  });
  if (createErr || !created.user) {
    return { ok: false, reason: createErr?.message ?? "Failed to create admin user." };
  }

  await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
  await supabaseAdmin.from("admin_status").insert({
    user_id: created.user.id,
    is_active: true,
    is_primary: true,
  });
  return { ok: true, email };
});

const addAdminSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  full_name: z.string().trim().min(2).max(120),
});

export const addAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addAdminSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, role: "donor" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create admin.");

    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    await supabaseAdmin
      .from("admin_status")
      .insert({ user_id: created.user.id, is_active: true, is_primary: false });
    return { ok: true, user_id: created.user.id };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.user_id === context.userId) throw new Error("You cannot remove your own admin account.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("admin_status")
      .select("is_primary")
      .eq("user_id", data.user_id)
      .maybeSingle();
    if (target?.is_primary) throw new Error("The primary admin cannot be removed.");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", "admin");
    await supabaseAdmin.from("admin_status").delete().eq("user_id", data.user_id);
    return { ok: true };
  });

export const setAdminActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ user_id: z.string().uuid(), is_active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("admin_status")
      .select("is_primary")
      .eq("user_id", data.user_id)
      .maybeSingle();
    if (target?.is_primary && !data.is_active) throw new Error("The primary admin cannot be disabled.");

    await supabaseAdmin
      .from("admin_status")
      .upsert({ user_id: data.user_id, is_active: data.is_active });
    return { ok: true };
  });

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [];

    const { data: statuses } = await supabaseAdmin
      .from("admin_status")
      .select("user_id, is_active, is_primary")
      .in("user_id", ids);
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });

    return ids.map((id) => {
      const u = users?.users.find((x) => x.id === id);
      const s = statuses?.find((x) => x.user_id === id);
      return {
        user_id: id,
        email: u?.email ?? "",
        created_at: u?.created_at ?? null,
        is_active: s?.is_active ?? true,
        is_primary: s?.is_primary ?? false,
      };
    });
  });

export const getSignedDocUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ path: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("ngo-documents")
      .createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

export const approveNgo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ ngo_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ngo } = await supabaseAdmin.from("ngos").select("user_id").eq("id", data.ngo_id).maybeSingle();
    await supabaseAdmin.from("ngos").update({ status: "approved", rejection_reason: null }).eq("id", data.ngo_id);
    if (ngo?.user_id) {
      await supabaseAdmin.from("user_roles").insert({ user_id: ngo.user_id, role: "ngo" }).select();
    }
    return { ok: true };
  });