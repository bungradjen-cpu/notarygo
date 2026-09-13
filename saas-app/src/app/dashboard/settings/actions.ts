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
  const password = (formData.get("password") as string)?.trim();
  const role = (formData.get("role") as string) || "STAFF";

  if (!email || !fullName) {
    throw new Error("Nama lengkap dan email staf wajib diisi.");
  }
  if (!password || password.length < 6) {
    throw new Error("Kata sandi staf wajib diisi minimal 6 karakter.");
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

  // Use Admin Client to create or update Auth User and Profile
  const adminClient = createAdminClient();
  let targetUserId: string | undefined;

  // Search if user already exists in auth
  const { data: listData } = await adminClient.auth.admin.listUsers();
  const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === email);

  if (existingUser) {
    targetUserId = existingUser.id;
    // Update password and user metadata so the staff can immediately login
    await adminClient.auth.admin.updateUserById(targetUserId, {
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
  } else {
    // Create new user in auth
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (authErr) {
      throw new Error("Gagal membuat akun staf: " + authErr.message);
    }
    targetUserId = authData?.user?.id;
  }

  if (!targetUserId) {
    throw new Error("Gagal mendapatkan ID pengguna staf.");
  }

  // Always ensure profile exists in public.profiles (WITHOUT non-existent updated_at column)
  const { error: profileErr } = await adminClient.from("profiles").upsert({
    id: targetUserId,
    email: email,
    full_name: fullName,
  });

  if (profileErr) {
    console.error("Profile upsert error:", profileErr);
    throw new Error("Gagal menyimpan data profil staf: " + profileErr.message);
  }

  // Check if already a member of this organization
  const { data: existingMember } = await adminClient
    .from("organization_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("profile_id", targetUserId)
    .maybeSingle();

  if (existingMember) {
    // Update role
    const { error: updateMemErr } = await adminClient
      .from("organization_members")
      .update({ role: role })
      .eq("id", existingMember.id);
    if (updateMemErr) throw new Error("Gagal memperbarui role staf: " + updateMemErr.message);
  } else {
    // Insert new membership
    const { error: memberErr } = await adminClient.from("organization_members").insert({
      org_id: orgId,
      profile_id: targetUserId,
      role: role,
    });

    if (memberErr) {
      console.error("Member insert error:", memberErr);
      throw new Error(memberErr.message || "Gagal menambahkan staf ke kantor.");
    }
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/team");
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
  revalidatePath("/dashboard/team");
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
  revalidatePath("/dashboard/team");
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
