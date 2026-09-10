import { createClient } from "@/utils/supabase/server";
import { updateNotificationPreferences } from "./actions";

export default async function NotificationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Default true if not explicitly set yet
  const getPref = (key: string) => prefs ? prefs[key] : true;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-8">
        Notification Preferences
      </h2>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form action={updateNotificationPreferences}>
            <div className="space-y-6">
              
              <fieldset>
                <legend className="text-base font-medium text-gray-900">In-App Notifications</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="in_app_enabled" name="in_app_enabled" type="checkbox" defaultChecked={getPref('in_app_enabled')} className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="in_app_enabled" className="font-medium text-gray-700">Enable In-App Alerts</label>
                      <p className="text-gray-500">Receive alerts via the bell icon in the dashboard.</p>
                    </div>
                  </div>
                </div>
              </fieldset>

              <hr className="border-gray-200" />

              <fieldset>
                <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                <p className="text-sm text-gray-500 mb-4">Choose which emails you want to receive.</p>
                <div className="mt-4 space-y-4">
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="email_daily_brief" name="email_daily_brief" type="checkbox" defaultChecked={getPref('email_daily_brief')} className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_daily_brief" className="font-medium text-gray-700">Daily Brief</label>
                      <p className="text-gray-500">A daily summary of overdues, deadlines, and new matters.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="email_task_assigned" name="email_task_assigned" type="checkbox" defaultChecked={getPref('email_task_assigned')} className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_task_assigned" className="font-medium text-gray-700">Task Assigned</label>
                      <p className="text-gray-500">When someone assigns a new task to you.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="email_deadline_reminder" name="email_deadline_reminder" type="checkbox" defaultChecked={getPref('email_deadline_reminder')} className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_deadline_reminder" className="font-medium text-gray-700">Deadline Reminders</label>
                      <p className="text-gray-500">When a task or matter deadline is approaching.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="email_overdue" name="email_overdue" type="checkbox" defaultChecked={getPref('email_overdue')} className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email_overdue" className="font-medium text-gray-700">Overdue Alerts</label>
                      <p className="text-gray-500">When a task misses its deadline.</p>
                    </div>
                  </div>

                </div>
              </fieldset>
            </div>
            <div className="mt-8">
              <button type="submit" className="bg-black border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-800 focus:outline-none">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
