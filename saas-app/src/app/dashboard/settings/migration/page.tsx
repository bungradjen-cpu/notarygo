import { createClient } from "@/utils/supabase/server";
import MigrationWizardClient from "./MigrationWizardClient";

export default async function MigrationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role, organizations(name)")
    .eq("user_id", user.id)
    .single();

  if (!member) return <div>No organization found.</div>;

  const orgId = member.org_id;

  // Fetch past migration history for this organization
  const { data: batches } = await supabase
    .from("migration_batches")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Legacy Data Migration
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Seamlessly import historical clients, matters, and tasks from your single-tenant Google Apps Script (GAS) installation into <strong>{(member.organizations as any)?.name || 'your Organization'}</strong>.
        </p>
      </div>

      {/* Migration Wizard Client Component */}
      <MigrationWizardClient orgId={orgId} isOwnerOrAdmin={member.role === 'OWNER' || member.role === 'ADMIN'} />

      {/* Past Migrations Audit Table */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Migration Audit Trail</h3>
          <p className="mt-1 text-sm text-gray-500">Historical records of all data import batches for this organization.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imported Counts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!batches || batches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                    No migration batches executed yet.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">{b.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">
                      Clients: {b.counts_summary?.clients?.prospective || 0} | 
                      Matters: {b.counts_summary?.matters?.prospective || 0} | 
                      Tasks: {b.counts_summary?.tasks?.prospective || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(b.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
