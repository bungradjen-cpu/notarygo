import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SubscriptionLockGate } from "@/components/billing/SubscriptionLockGate";
import { isEmailGrantActive, getEmailGrant } from "@/config/active_grants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch member & organization details
  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role, organizations(name)")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  // 1. Check if user has explicit active grant
  const emailGrant = getEmailGrant(user.email);
  let isSubActive = !!emailGrant;

  if (member) {
    // 2. Check subscriptions table
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("org_id", member.org_id)
      .maybeSingle();

    if (sub && sub.status === "ACTIVE") {
      if (!sub.current_period_end || new Date(sub.current_period_end) > new Date()) {
        isSubActive = true;
      }
    }

    // 3. Auto-sync: If user has an active grant but DB subscription is missing or not active, sync it!
    if (emailGrant && (!sub || sub.status !== "ACTIVE")) {
      try {
        await supabase
          .from("subscriptions")
          .upsert(
            {
              org_id: member.org_id,
              status: "ACTIVE",
              current_period_start: new Date().toISOString(),
              current_period_end: emailGrant.expiresAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "org_id" }
          );
      } catch {}
      isSubActive = true;
    }
  }



  const officeName =
    (member?.organizations as any)?.name || "Kantor Notaris & PPAT";
  const userName = profile?.full_name || user.email?.split("@")[0] || "User";
  const userRole = member?.role || "STAFF";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* If Subscription is Unpaid / Inactive, Show Paywall Gate */}
      {!isSubActive && (
        <SubscriptionLockGate
          officeName={officeName}
          userEmail={user.email || ""}
        />
      )}

      {/* Fixed Left Sidebar for Desktop */}
      <Sidebar userRole={userRole} userName={userName} />

      {/* Main Content Area offset by sidebar on desktop */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          officeName={officeName}
          userEmail={user.email || ""}
          userName={userName}
          userRole={userRole}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

