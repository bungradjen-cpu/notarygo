"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const preferences = {
    user_id: user.id,
    email_daily_brief: formData.get("email_daily_brief") === 'on',
    email_task_assigned: formData.get("email_task_assigned") === 'on',
    email_deadline_reminder: formData.get("email_deadline_reminder") === 'on',
    email_overdue: formData.get("email_overdue") === 'on',
    email_invoice_due: formData.get("email_invoice_due") === 'on',
    email_subscription_events: formData.get("email_subscription_events") === 'on',
    in_app_enabled: formData.get("in_app_enabled") === 'on',
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(preferences);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings/notifications");
}
