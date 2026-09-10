"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addStaffAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) || "STAFF";

  if (!email || !fullName) {
    throw new Error("Nama lengkap dan email staf wajib diisi.");
  }

  // 1. Check if caller is OWNER or ADMIN
  const { data: callerMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("profile_id", user.id)
    .single();

  if (!callerMember || !["OWNER", "ADMIN"].includes(callerMember.role)) {
    throw new Error("Hanya Notaris (Owner) atau Admin yang dapat menambah staf.");
  }

  // 2. Check if profile exists for this email
  let { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  let targetUserId = targetProfile?.id;

  if (!targetUserId) {
    // Generate a temporary UUID for profile if not yet created via Auth signup
    targetUserId = crypto.randomUUID();
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: targetUserId,
      email: email,
      full_name: fullName,
    });

    if (profileErr) {
      // If error occurs, try to find again in case of race condition
      const { data: retryProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (retryProfile) {
        targetUserId = retryProfile.id;
      }
    }
  }

  // 3. Check if already member
  const { data: existingMember } = await supabase
    .from("organization_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("profile_id", targetUserId)
    .maybeSingle();

  if (existingMember) {
    throw new Error(`Pengguna dengan email ${email} sudah terdaftar di kantor ini.`);
  }

  // 4. Add to organization_members
  const { error: memberErr } = await supabase.from("organization_members").insert({
    org_id: orgId,
    profile_id: targetUserId,
    role: role,
  });

  if (memberErr) {
    throw new Error(memberErr.message || "Gagal menambahkan staf ke kantor.");
  }

  revalidatePath("/dashboard/settings");
}

export async function removeStaffAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const memberId = formData.get("memberId") as string;

  // Verify caller is OWNER or ADMIN
  const { data: callerMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("profile_id", user.id)
    .single();

  if (!callerMember || !["OWNER", "ADMIN"].includes(callerMember.role)) {
    throw new Error("Hanya Notaris (Owner) atau Admin yang dapat menghapus staf.");
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("org_id", orgId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}

export async function updateOfficeProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const name = (formData.get("name") as string)?.trim();
  const notaryName = (formData.get("notaryName") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      notary_name: notaryName,
      city,
      email,
      address,
    })
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
