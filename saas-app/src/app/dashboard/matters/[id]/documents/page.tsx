import { createClient } from "@/utils/supabase/server";
import { uploadDocumentAction, getSignedDownloadUrl } from "./actions";

export default async function MatterDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: matterId } = await params;

  // 1. Fetch Matter details for org context
  const { data: matter } = await supabase
    .from("matters")
    .select("org_id, matter_number, title")
    .eq("id", matterId)
    .single();

  if (!matter) return <div>Matter not found</div>;

  // 2. Fetch Documents and their Versions
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      id, title, status, current_version_id,
      document_versions ( id, version_number, file_path, file_size, created_at, profiles (full_name) )
    `)
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  // Upload action pre-bound with matterId
  const handleUpload = uploadDocumentAction.bind(null, matterId);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Center: {matter.matter_number}
          </h2>
          <p className="text-gray-500">{matter.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
            <form action={handleUpload} className="space-y-4">
              <input type="hidden" name="orgId" value={matter.org_id} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Title</label>
                <input type="text" name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" placeholder="e.g. Identity Card" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File (PDF, Word, Image. Max 20MB)</label>
                <input type="file" name="file" required accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800">
                Upload Document
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Document List & Versions */}
        <div className="lg:col-span-2 space-y-6">
          {documents?.map((doc) => {
            const currentVersion = doc.document_versions?.find((v: any) => v.id === doc.current_version_id);
            const olderVersions = doc.document_versions?.filter((v: any) => v.id !== doc.current_version_id).sort((a: any, b: any) => b.version_number - a.version_number) || [];

            return (
              <div key={doc.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{doc.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Status: {doc.status}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">Current: V{currentVersion?.version_number}</span>
                    <br />
                    {(currentVersion?.file_size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <div className="px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                      <dt className="text-sm font-medium text-gray-500">
                        Upload New Version
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <form action={handleUpload} className="flex items-center space-x-2">
                          <input type="hidden" name="orgId" value={matter.org_id} />
                          <input type="hidden" name="documentId" value={doc.id} />
                          <input type="file" name="file" required accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100" />
                          <button type="submit" className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold">Upload V{currentVersion ? currentVersion.version_number + 1 : 1}</button>
                        </form>
                      </dd>
                    </div>

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Version History</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {/* Current Version */}
                          {currentVersion && (
                            <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm bg-blue-50">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">V{currentVersion.version_number} (Current) - {new Date(currentVersion.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <a
                                  href={`/api/documents/${doc.id}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-[#001f3f] hover:underline flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[15px] text-[#fc8f34]">download</span>
                                  <span>Unduh File</span>
                                </a>
                              </div>
                            </li>
                          )}
                          
                          {/* Older Versions */}
                          {olderVersions.map((v: any) => (
                            <li key={v.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate text-gray-500">V{v.version_number} - {new Date(v.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="text-gray-400">Archived</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            );
          })}
          {documents?.length === 0 && (
            <div className="text-center py-10 bg-white shadow rounded-lg border border-dashed border-gray-300 text-gray-500">
              No documents have been uploaded for this matter yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
