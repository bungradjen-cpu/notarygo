"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type AuthActionResult = {
  success: boolean;
  redirectUrl?: string;
  error?: string;
};

export async function login(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const data = {
    email: ((formData.get("email") as string) || "").trim(),
    password: (formData.get("password") as string) || "",
  };
  const next = (formData.get("next") as string) || "";

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");

  if (authData.user) {
    if (next && next.startsWith("/admin")) {
      return { success: true, redirectUrl: next };
    }

    // Check if user has an organization
    let { data: member } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("profile_id", authData.user.id)
      .maybeSingle();

    // If not found by direct user.id, check if user was invited via email
    if (!member && authData.user.email) {
      const normalizedEmail = authData.user.email.toLowerCase().trim();
      const { data: invitedProfiles } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail);

      if (invitedProfiles && invitedProfiles.length > 0) {
        const invitedIds = invitedProfiles.map((p) => p.id);
        const { data: invitedMember } = await supabase
          .from("organization_members")
          .select("id, org_id")
          .in("profile_id", invitedIds)
          .maybeSingle();

        if (invitedMember) {
          // Reconcile: link organization_members to the real authenticated user ID
          await supabase
            .from("organization_members")
            .update({ profile_id: authData.user.id })
            .eq("id", invitedMember.id);

          member = { org_id: invitedMember.org_id };
        }
      }
    }

    if (!member) {
      return { success: true, redirectUrl: "/onboarding/create-org" };
    }
  }

  if (next) {
    return { success: true, redirectUrl: next };
  }

  return { success: true, redirectUrl: "/dashboard" };
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const fullName = ((formData.get("full_name") as string) || "Notary Owner").trim();
  const data = {
    email: ((formData.get("email") as string) || "").trim(),
    password: (formData.get("password") as string) || "",
    options: {
      data: {
        full_name: fullName,
      },
    },
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If user was created and session active, ensure profile exists
  if (authData.user) {
    const userEmail = (authData.user.email || data.email).toLowerCase().trim();
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      email: userEmail,
      full_name: fullName,
    });

    // Check if this newly signed up user was pre-invited to an existing office
    const { data: invitedProfiles } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", userEmail)
      .neq("id", authData.user.id);

    if (invitedProfiles && invitedProfiles.length > 0) {
      const invitedIds = invitedProfiles.map((p) => p.id);
      const { data: invitedMember } = await supabase
        .from("organization_members")
        .select("id, org_id")
        .in("profile_id", invitedIds)
        .maybeSingle();

      if (invitedMember) {
        await supabase
          .from("organization_members")
          .update({ profile_id: authData.user.id })
          .eq("id", invitedMember.id);

        revalidatePath("/", "layout");
        return { success: true, redirectUrl: "/dashboard" };
      }
    }
  }

  revalidatePath("/", "layout");
  return { success: true, redirectUrl: "/onboarding/create-org" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

