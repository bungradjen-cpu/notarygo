import { createClient } from "@/utils/supabase/server";
import { emailProvider } from "./EmailProvider";

type NotificationType = 
  | 'WELCOME' | 'VERIFY_EMAIL' | 'INVITE_STAFF' | 'RESET_PASSWORD'
  | 'TASK_ASSIGNED' | 'DEADLINE_REMINDER' | 'OVERDUE' | 'PENDING_TOO_LONG'
  | 'SIGNING_REMINDER' | 'INVOICE_DUE' | 'TRIAL_ENDING'
  | 'SUBSCRIPTION_ACTIVATED' | 'SUBSCRIPTION_PAYMENT_FAILED' | 'SUBSCRIPTION_RENEWED' | 'DAILY_BRIEF';

export class NotificationService {
  /**
   * Main dispatcher. Handles routing (In-App vs Email) and deduplication.
   */
  static async dispatch(
    userId: string,
    orgId: string | null,
    type: NotificationType,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string,
    idempotencySuffix?: string // e.g., the current date for daily alerts
  ) {
    const supabase = await createClient();

    // 1. Get user preferences and email
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();
    if (!profile?.email) return;

    let { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single();
    
    // Default preferences if none exist
    if (!prefs) {
      prefs = {
        in_app_enabled: true,
        email_task_assigned: true,
        email_deadline_reminder: true,
        email_overdue: true,
        email_invoice_due: true,
        email_daily_brief: true,
        email_subscription_events: true
      };
    }

    const idempotencyKey = `${type}_${entityId || 'GLOBAL'}_${idempotencySuffix || Date.now()}`;

    // 2. IN-APP NOTIFICATION
    if (prefs.in_app_enabled) {
      // Check deduplication
      const { data: existingAppLog } = await supabase
        .from("notification_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("channel", 'IN_APP')
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (!existingAppLog) {
        // Insert alert
        await supabase.from("notifications").insert({
          user_id: userId,
          org_id: orgId,
          type: type,
          title: title,
          message: message,
          entity_type: entityType,
          entity_id: entityId
        });

        // Log to prevent duplicate
        await supabase.from("notification_logs").insert({
          user_id: userId,
          type: type,
          channel: 'IN_APP',
          entity_type: entityType,
          entity_id: entityId,
          idempotency_key: idempotencyKey
        });
      }
    }

    // 3. EMAIL NOTIFICATION
    let shouldSendEmail = false;
    switch(type) {
      case 'TASK_ASSIGNED': shouldSendEmail = prefs.email_task_assigned; break;
      case 'DEADLINE_REMINDER': shouldSendEmail = prefs.email_deadline_reminder; break;
      case 'OVERDUE': shouldSendEmail = prefs.email_overdue; break;
      case 'INVOICE_DUE': shouldSendEmail = prefs.email_invoice_due; break;
      case 'DAILY_BRIEF': shouldSendEmail = prefs.email_daily_brief; break;
      case 'SUBSCRIPTION_ACTIVATED':
      case 'SUBSCRIPTION_PAYMENT_FAILED':
      case 'SUBSCRIPTION_RENEWED':
      case 'TRIAL_ENDING':
        shouldSendEmail = prefs.email_subscription_events; break;
      case 'WELCOME':
      case 'INVITE_STAFF':
      case 'RESET_PASSWORD':
        shouldSendEmail = true; // Always send critical account emails
        break;
      default:
        shouldSendEmail = true;
    }

    if (shouldSendEmail) {
      // Check deduplication for email
      const { data: existingEmailLog } = await supabase
        .from("notification_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("channel", 'EMAIL')
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (!existingEmailLog) {
        // Build simple HTML payload
        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>${title}</h2>
            <p>${message}</p>
            <br/>
            <p style="color: gray; font-size: 12px;">Powered by NotaryGo</p>
          </div>
        `;

        const sent = await emailProvider.sendEmail({
          to: profile.email,
          subject: title,
          html: html
        });

        if (sent) {
          // Log to prevent duplicate
          await supabase.from("notification_logs").insert({
            user_id: userId,
            type: type,
            channel: 'EMAIL',
            entity_type: entityType,
            entity_id: entityId,
            idempotency_key: idempotencyKey
          });
        }
      }
    }
  }

  /**
   * Helper: Send Task Assigned Notification
   */
  static async notifyTaskAssigned(assigneeId: string, orgId: string, taskId: string, taskTitle: string) {
    await this.dispatch(
      assigneeId,
      orgId,
      'TASK_ASSIGNED',
      'New Task Assigned',
      `You have been assigned to the task: ${taskTitle}.`,
      'TASK',
      taskId,
      'INITIAL' // Only send once ever for this task assignment
    );
  }

  /**
   * Helper: Send Overdue Notification
   */
  static async notifyTaskOverdue(assigneeId: string, orgId: string, taskId: string, taskTitle: string) {
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. 2026-08-29
    
    // Idempotency suffix is the date, meaning it will only send 1 overdue alert per day per task
    await this.dispatch(
      assigneeId,
      orgId,
      'OVERDUE',
      'Task Overdue',
      `The task "${taskTitle}" is now overdue. Please take action immediately.`,
      'TASK',
      taskId,
      todayStr 
    );
  }
}
