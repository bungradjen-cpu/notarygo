# LEGACY DATABASE MAP (Sheets to PostgreSQL Planning)

Tabel berikut memetakan *Google Sheets* (Tabs) pada versi Legacy ke dalam potensi struktur Entitas/Tabel untuk PostgreSQL (Supabase) beserta relasinya.

## Master Data Entities

### 1. Tab `Users` -> Tabel `users`
- **Fields Legacy**: `email`, `passwordHash`, `salt`, `name`, `role`, `status`, `lastLogin`
- **Mapping SaaS**: Dihandle oleh `auth.users` (Supabase Auth) dan tabel ekstensi `public.user_profiles` (Role, Status).

### 2. Tab `Clients` -> Tabel `clients`
- **Fields Legacy**: `clientId`, `clientType`, `name`, `identifier`, `phone`, `email`, `address`, `notes`
- **Mapping SaaS**: Tabel `clients`. `clientId` menjadi `uuid`, penambahan kolom `tenant_id` wajib untuk isolasi SaaS.

### 3. Tab `Organizations` -> Tabel `organizations`
- **Fields Legacy**: `organizationId`, `type`, `name`, `contactPerson`, `phone`, `email`
- **Mapping SaaS**: Tabel `organizations` dengan `tenant_id`.

### 4. Tab `Config` -> Tabel `tenant_settings` & `service_types`
- **Fields Legacy**: Key-Value pairs (`OFFICE_NAME`, `SERVICES_JSON`)
- **Mapping SaaS**: Dipecah menjadi dua tabel: `tenants` (profil kantor) dan `service_templates` (JSON / Relasional).

## Transactional Entities (Perkara & Operasional)

### 5. Tab `Matters` -> Tabel `matters`
- **Fields Legacy**: `matterId`, `matterNumber`, `serviceTypeId`, `clientId`, `organizationId`, `title`, `status`, `assignedPIC`, `supervisor`, `deadline`
- **Mapping SaaS**: Tabel inti operasional. `matterNumber` direalisasikan menggunakan *Sequence* PostgreSQL atau trigger.

### 6. Tab `Tasks` -> Tabel `tasks`
- **Fields Legacy**: `taskId`, `matterId`, `title`, `description`, `status`, `assignedTo`, `deadline`
- **Mapping SaaS**: Relasi (Foreign Key) `matter_id` mengarah ke tabel `matters` dengan `ON DELETE CASCADE`.

### 7. Tab `Documents` -> Tabel `documents`
- **Fields Legacy**: `documentId`, `matterId`, `documentType`, `title`, `fileId`, `driveUrl`, `status`
- **Mapping SaaS**: URL Google Drive akan digantikan dengan URL dari Supabase Storage. `file_path`.

### 8. Tab `Checklists` -> Tabel `matter_checklists`
- **Fields Legacy**: `checklistId`, `matterId`, `itemType`, `status`, `receivedDate`
- **Mapping SaaS**: Bisa direpresentasikan dengan tabel relasional atau kolom `JSONB` pada `matters` (tergantung kebutuhan querying).

### 9. Tab `Signings` -> Tabel `signings`
- **Fields Legacy**: `signingId`, `matterId`, `scheduledDate`, `location`, `status`
- **Mapping SaaS**: Tabel penjadwalan. Akan memiliki integrasi dengan API eksternal (Calendar).

### 10. Tab `Pendings` & `FollowUps` -> Tabel `matter_logs` / `pending_items`
- **Mapping SaaS**: Lebih baik digabung menjadi sistem log/tracker perkara yang lebih fleksibel.

## Keuangan (Billing Entities)

### 11. Tab `Invoices` -> Tabel `invoices`
- **Fields Legacy**: `invoiceId`, `matterId`, `clientId`, `invoiceNumber`, `subtotal`, `tax`, `total`, `paidAmount`, `outstanding`, `status`
- **Mapping SaaS**: Tabel khusus Invoices. Total dan agregasi dapat dikalkulasi menggunakan `Computed Columns` (Postgres) alih-alih disimpan statis, atau dipertahankan jika dibutuhkan untuk keperluan auditing faktur historis.

### 12. Tab `Payments` & `Receipts` -> Tabel `payments`
- **Fields Legacy**: `paymentId`, `invoiceId`, `amount`, `paymentDate`, `method`
- **Mapping SaaS**: Tabel pencatatan pembayaran cicilan/lunas.

## Infrastruktur (System Entities)

### 13. Tab `AuditLog` -> Tabel `audit_logs`
- **Fields Legacy**: `logId`, `timestamp`, `userEmail`, `action`, `entityType`, `entityId`, `details`
- **Mapping SaaS**: Tabel khusus untuk kepatuhan (Compliance). Sangat disarankan dipartisi (Partitioning) atau diletakkan di skema berbeda untuk kecepatan.

### 14. Tab `Sequence` -> PostgreSQL Sequences
- **Fields Legacy**: Menyimpan *counter* nomor urut terakhir (`INV_2026` = 12).
- **Mapping SaaS**: DIBUANG sepenuhnya. Posisinya digantikan oleh fitur bawaan RDBMS: `CREATE SEQUENCE` atau Trigger kustom per-tenant.
