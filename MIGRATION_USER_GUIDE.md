# NotaryGo™ Legacy GAS Migration User Guide

This guide describes how to migrate your existing data from a legacy single-tenant Google Apps Script (GAS) installation into the modern NotaryGo SaaS platform safely and without downtime.

---

## 1. Safety & Principles

1. **Non-Destructive & Opt-in**: The SaaS platform will **never** automatically touch or modify your legacy Google Sheets data.
2. **Dry-Run Validation**: You can preview the exact counts of clients, matters, and tasks before committing to an import.
3. **Idempotency**: Every record imported retains its original `legacy_id`. Re-uploading an export file will safely skip already-imported records rather than creating duplicates.
4. **Unsupported Fields**: Any legacy custom columns not supported by the SaaS schema are flagged in the report and safely omitted without corrupting standard data.

---

## 2. Step-by-Step Migration Process

### Step 1: Export Legacy Data
From your legacy Google Sheets spreadsheet, you can export your data as a JSON payload structured as follows:

```json
{
  "version": "1.0",
  "clients": [
    {
      "clientId": "CLI-001",
      "name": "PT Maju Bersama",
      "clientType": "CORPORATE",
      "phone": "+6281234567890",
      "email": "contact@majubersama.com",
      "address": "Jl. Sudirman No. 10, Jakarta"
    }
  ],
  "matters": [
    {
      "matterId": "MAT-001",
      "matterNumber": "AJB/2026/0001",
      "clientId": "CLI-001",
      "title": "Akta Jual Beli Tanah Kavling A",
      "status": "ACTIVE",
      "priority": "HIGH",
      "deadline": "2026-09-15"
    }
  ],
  "tasks": [
    {
      "taskId": "TSK-001",
      "matterId": "MAT-001",
      "title": "Cek Sertifikat ke BPN",
      "status": "COMPLETED",
      "deadline": "2026-09-01"
    }
  ]
}
```

### Step 2: Open Migration Settings in SaaS
1. Log in to your NotaryGo SaaS dashboard as an **OWNER** or **ADMIN**.
2. Navigate to **Settings** → **Legacy Data Migration** (`/dashboard/settings/migration`).

### Step 3: Run Dry-Run Preview
1. Choose your `.json` export file or paste the JSON content directly into the editor.
2. Click **Run Dry-Run Validation & Preview**.
3. Review the prospective records vs skipped duplicate counts, as well as any unsupported field warnings.

### Step 4: Confirm & Execute Migration
1. When satisfied with the preview numbers, click **Confirm & Execute Migration**.
2. The system will create an audited `migration_batch` record and import your clients, matters, and tasks in topological order.
3. Review the final confirmation and audit trail at the bottom of the page.

---

## 3. Supported Entity Mappings

| Legacy GAS Entity | SaaS Target Table | Key Mappings |
| :--- | :--- | :--- |
| `Clients` | `public.clients` | `clientId` → `legacy_id`, `name`, `clientType`, `phone`, `email`, `address` |
| `Matters` | `public.matters` | `matterId` → `legacy_id`, `matterNumber`, `title`, `status`, `deadline` |
| `Tasks` | `public.tasks` | `taskId` → `legacy_id`, `matter_id` (foreign key mapped to SaaS matter UUID), `title`, `status` |
| `Invoices` | `public.invoices` | `invoiceId` → `legacy_id`, `invoiceNumber`, `total`, `status` |
| `Documents` | `public.documents` | `documentId` → `legacy_id`, `title`, `documentType` |

---

## 4. Troubleshooting & FAQ

- **Q: What happens if a task references a matter that wasn't in the export?**  
  *A:* The migration engine's validation check will report an error (`Task [TSK-X] references unknown matterId [MAT-Y]`) and block the import until resolved.
- **Q: Can I run the migration twice if new matters were added to the legacy system?**  
  *A:* Yes! The engine checks `legacy_id` per organization. Existing items will be skipped as duplicates, and only newly created legacy items will be imported.
