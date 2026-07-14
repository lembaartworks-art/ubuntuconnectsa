# Ubuntu Connect SA — MVP Build Plan

Backend is already on Lovable Cloud. I'll build the full MVP in the following stages.

## 1. Design System & Branding
- Logo (uploaded) added to `src/assets/`
- Color palette from logo: navy `#0f1e3d`, red `#a4171f`, gold `#e5a11a`, green `#0f5d2e`
- Update `src/styles.css` tokens (primary=navy, accent=gold, destructive=red, success=green)
- Typography: bold display for headings (Poppins/Manrope), Inter for body

## 2. Database Schema (single migration)
- `profiles` (id → auth.users, full_name, phone, avatar_url, role_label)
- `user_roles` (id, user_id, role) — enum: `admin`, `ngo`, `donor`, `community`, `volunteer`
- `has_role()` security-definer function
- `ngos` (id, user_id, org_name, reg_number, contact_person, email, phone, province, city, address, description, documents jsonb, status enum pending/approved/rejected, created_at)
- `donations` (id, donor_id, type, description, amount, location, status enum, created_at)
- `support_requests` (id, requester_id, category, title, description, urgency, location, status enum, created_at)
- `matches` (id, donation_id, request_id, ngo_id, status, created_at)
- `testimonials` (id, author_name, quote, image_url, published bool, hidden bool, created_at)
- `messages` (id, from_user, to_user, subject, body, read bool, created_at)
- Storage bucket `ngo-documents` (private, NGO owner + admin access)
- RLS + GRANTs on every table; policies use `has_role()`
- Trigger: on `auth.users` insert → create profile + assign role from raw_user_meta_data

## 3. Auth Flows
- `/auth` — combined sign in / sign up with role selector (Donor / Community Member)
- `/register-ngo` — dedicated NGO registration form (multi-field + document upload)
- `/admin/login` — admin-only login screen (linked from mobile menu only)
- First admin: seeded by SQL using `admin@ubuntuconnectsa.org` — password set via `secrets--add_secret` (ADMIN_INITIAL_PASSWORD), applied by a one-shot server function `seedInitialAdmin` that creates the user via Auth Admin and grants `admin` role (idempotent)
- No public admin signup route anywhere

## 4. Pages / Routes
- `/` Homepage: new hero with copy provided, 3 CTAs, "How It Works" preview, stats strip (real counts)
- `/about`
- `/how-it-works`
- `/contact` (with functional contact form saving to `messages`)
- `/donate` — authenticated donors submit donation offers
- `/request-support` — authenticated community members submit requests
- `/register-ngo` — public form; after submit → "Pending approval" screen
- `/_authenticated/dashboard` — role-aware dashboard (donor sees own donations, community sees own requests, NGO sees profile + assigned matches)
- `/_authenticated/admin` — gated by `has_role('admin')`; tabs:
  - Overview (5 real counters)
  - Pending NGOs (approve/reject/delete + view docs)
  - Donations (approve/reject/delete)
  - Requests (approve/reject/delete)
  - Users
  - Admins (add / disable / remove — first admin only can add)
  - Testimonials (add/edit/delete/publish/hide)
  - Messages
- `/_authenticated/ngo` — NGO profile & their matches (only accessible when approved)

## 5. Navigation
- Desktop top nav: Home, About, How It Works, Contact + right-side user menu (Sign in / Account)
- Mobile hamburger: Home, About, How It Works, Contact, Donate, Request Support, Register NGO, Admin Login

## 6. Server Functions (`createServerFn` + `requireSupabaseAuth`)
- `submitNgoApplication` (public, service role insert)
- `submitDonation`, `submitRequest`, `submitContactMessage`
- Admin fns: `approveNgo`, `rejectNgo`, `deleteNgo`, `approveDonation`, `rejectDonation`, `deleteDonation`, `approveRequest`, `rejectRequest`, `deleteRequest`, `addAdmin`, `disableAdmin`, `removeAdmin`, `listAdmins`, testimonial CRUD, `getStats`
- All admin fns verify `has_role(userId,'admin')` server-side

## 7. Testimonials
- Empty by default. Homepage does NOT render testimonials. Admin section owns full CRUD + publish/hide.

## 8. Analytics
- Simple counters only (donations, requests, NGOs, users, matches). No AI features anywhere.

## 9. Quality
- Zod validation on every form (client + server)
- Toasts for success/error via `sonner`
- Loading + empty + error states
- SEO head per route

## Out of scope for this build (explicit)
- Payment processing for donations (donations are logged/matched, not charged)
- Email delivery for approvals (status is visible in dashboard)
- Volunteer approval flow beyond schema stub

Ready to build on approval.