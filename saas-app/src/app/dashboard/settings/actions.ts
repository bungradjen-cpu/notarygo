"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

  // Use Admin Client to create or fetch Auth User
  const adminClient = createAdminClient();
  let targetUserId: string | undefined;

  // Try to create the user in Auth
  const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password: "NotaryGoPassword123!", // Default initial password
    email_confirm: true, // Auto-confirm so they can login immediately
    user_metadata: { full_name: fullName },
  });

  if (authErr) {
    // If user already exists in Auth, fetch their ID instead
    if (authErr.status === 422 || authErr.message.includes("already registered")) {
      // List users by email (Admin API doesn't have a direct getUserByEmail, but listUsers with filter works, or we query profiles)
      // Since profiles might not exist if they signed up but failed midway, let's query profiles first.
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      
      if (existingProfile) {
        targetUserId = existingProfile.id;
      } else {
        throw new Error("Pengguna sudah terdaftar di sistem namun profilnya tidak ditemukan. Silakan hubungi Support.");
      }
    } else {
      throw new Error("Gagal membuat akun staf: " + authErr.message);
    }
  } else if (authData.user) {
    targetUserId = authData.user.id;
    // Insert into profiles for the newly created Auth user
    await adminClient.from("profiles").upsert({
      id: targetUserId,
      email: email,
      full_name: fullName,
    });
  }

  if (!targetUserId) {
    throw new Error("Gagal mendapatkan ID pengguna.");
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
  const { error: memberErr } = await adminClient.from("organization_members").insert({
    org_id: orgId,
    profile_id: targetUserId,
    role: role,
  });

  if (memberErr) {
    throw new Error(memberErr.message || "Gagal menambahkan staf ke kantor.");
  }

  revalidatePath("/dashboard/settings");
}

export async function adminResetPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const targetUserId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!targetUserId || !newPassword || newPassword.length < 6) {
    throw new Error("Sandi baru minimal 6 karakter.");
  }

  // Verify caller is OWNER or ADMIN
  const { data: callerMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("profile_id", user.id)
    .single();

  if (!callerMember || !["OWNER", "ADMIN"].includes(callerMember.role)) {
    throw new Error("Hanya Notaris (Owner) atau Admin yang dapat mengubah sandi staf.");
  }

  // Verify target is in the same organization
  const { data: targetMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("profile_id", targetUserId)
    .single();

  if (!targetMember) {
    throw new Error("Staf tidak ditemukan di kantor ini.");
  }

  // Prevent modifying another OWNER's password for security
  if (targetMember.role === "OWNER" && callerMember.role !== "OWNER") {
    throw new Error("Admin tidak dapat mengubah sandi Owner.");
  }
  if (targetMember.role === "OWNER" && targetUserId !== user.id) {
    throw new Error("Anda tidak dapat mengubah sandi sesama Owner dari halaman ini.");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) {
    throw new Error("Gagal mereset sandi: " + error.message);
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
