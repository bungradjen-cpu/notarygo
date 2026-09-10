# PRODUCT REQUIREMENTS DOCUMENT

# NOTARYGO™
## Notary Office Operational Control System

**Versi PRD:** 2.0  
**Tanggal:** 26 Agustus 2026  
**Platform:** Google Apps Script Web App  
**Frontend:** HTML Service + HTML/CSS/JavaScript  
**Database:** Google Spreadsheet  
**Document Storage:** Google Drive  
**Document Generator:** Google Docs → PDF  
**Notification:** Gmail / MailApp  
**Calendar:** Google Calendar  
**Timezone:** Asia/Jakarta  
**Target Development Environment:** Google Antigravity  
**Target Release Pertama:** NOTARYGO™ Production V1 + V1.5

---

# 1. PRODUCT VISION

NOTARYGO™ adalah **sistem operasional kantor Notaris & PPAT** yang membantu Owner, Admin, Supervisor, dan Staff mengendalikan pekerjaan kantor dari satu pusat operasional.

NOTARYGO™ bukan sekadar:

- task manager;
- spreadsheet digital;
- penyimpanan file;
- dashboard statistik;
- kumpulan SOP;
- aplikasi invoice.

NOTARYGO™ berfungsi sebagai:

> **Operational Control System yang membuat setiap perkara memiliki status, PIC, workflow, deadline, dokumen, next action, riwayat, dan tingkat perhatian yang dapat diketahui tanpa Owner harus menanyakan progress satu per satu kepada staff.**

Transformasi utama:

**Operasional berbasis chat, ingatan, spreadsheet terpisah, dan kontrol Owner**

menjadi:

**Operasional berbasis workflow, accountability, deadline, exception, dan system of record.**

---

# 2. PRODUCT PROMISE

NOTARYGO™ harus mampu membuat Owner menjawab lima pertanyaan dalam waktu kurang dari 30 detik:

1. Apa saja perkara aktif saat ini?
2. Perkara mana yang membutuhkan perhatian?
3. Siapa PIC setiap pekerjaan?
4. Apa yang terlambat atau sedang berhenti?
5. Apa tindakan yang harus dilakukan hari ini?

Staff harus mampu menjawab:

1. Apa pekerjaan saya hari ini?
2. Mana yang harus diprioritaskan?
3. Perkara ini sudah berada pada tahap apa?
4. Dokumen apa yang masih kurang?
5. Apa next action dan deadline-nya?

---

# 3. CORE PRODUCT PRINCIPLE

NOTARYGO™ menggunakan prinsip:

**VISIBILITY → ACCOUNTABILITY → DEADLINE → BOTTLENECK → ACTION → ESCALATION → COMPLETION → ARCHIVE**

Setiap perkara harus mempunyai:

- identitas;
- client;
- jenis layanan;
- PIC;
- workflow;
- current stage;
- status;
- priority;
- deadline;
- checklist;
- task;
- follow-up;
- next action;
- pending reason jika ada;
- activity history;
- dokumen terkait;
- financial status jika digunakan;
- completion/cancellation record.

Tidak boleh ada perkara aktif tanpa ownership dan status yang jelas.

---

# 4. PRODUCT GOALS

## 4.1 Primary Goals

NOTARYGO™ harus:

1. Menjadi pusat data operasional kantor.
2. Mengurangi ketergantungan operasional kepada Owner.
3. Memberikan visibility seluruh perkara aktif.
4. Mengurangi pekerjaan terlewat.
5. Mengurangi deadline yang tidak terkontrol.
6. Mengontrol perkara yang pending terlalu lama.
7. Membuat pembagian tanggung jawab staff jelas.
8. Menstandarisasi workflow pekerjaan.
9. Mengintegrasikan checklist dokumen dengan perkara.
10. Menyediakan audit trail setiap perubahan penting.
11. Menghasilkan dokumen operasional dan PDF profesional.
12. Mengendalikan invoice dan pembayaran dasar.
13. Memberikan notifikasi penting melalui Gmail.
14. Menyediakan sistem arsip untuk perkara selesai dan batal.
15. Memungkinkan setiap kantor menggunakan branding sendiri.

---

# 5. NON-GOALS V1

V1 **tidak** bertujuan menjadi:

- software accounting penuh;
- payroll;
- HRIS;
- absensi;
- ERP;
- cloud storage replacement;
- WhatsApp replacement;
- Microsoft Word replacement;
- Google Docs replacement;
- aplikasi resmi pemerintah;
- sistem AHU;
- sistem ATR/BPN;
- sistem perpajakan resmi;
- pengganti Protokol Notaris;
- AI drafting akta;
- native Android/iOS application.

Integrasi sistem eksternal hanya dikembangkan apabila tersedia mekanisme resmi dan kebutuhan sudah tervalidasi.

---

# 6. TARGET USER

## 6.1 Primary Market

Kantor Notaris & PPAT yang:

- memiliki beberapa staff;
- menangani banyak perkara simultan;
- mempunyai volume transaksi menengah–tinggi;
- mulai mengalami masalah koordinasi;
- menangani developer;
- bekerja sama dengan bank/KPR;
- menangani transaksi properti;
- menangani corporate legal;
- masih bergantung pada WhatsApp;
- menggunakan spreadsheet terpisah;
- Owner sering harus mengecek pekerjaan satu per satu.

---

# 7. USER ROLES

Sistem minimal mempunyai:

## 7.1 OWNER

Hak tertinggi.

Dapat:

- melihat seluruh data;
- melihat dashboard Owner;
- mengelola user;
- mengubah role;
- mengakses financial;
- membuat/mengedit/membatalkan perkara;
- mengarsipkan perkara;
- restore perkara;
- melakukan permanent purge jika fitur diaktifkan;
- mengelola workflow;
- mengatur Office Profile;
- mengatur notification rules;
- mengakses activity logs;
- mengakses laporan seluruh kantor;
- mengatur template dokumen;
- melakukan backup;
- mengakses system settings.

---

## 7.2 ADMIN

Dapat:

- membuat perkara;
- mengedit perkara;
- membatalkan perkara;
- mengarsipkan perkara;
- membuat client;
- mengelola task;
- mengelola follow-up;
- mengelola checklist;
- membuat invoice;
- generate PDF;
- mengatur jadwal;
- melihat operational reports;
- mengelola user Staff apabila diberikan permission.

Tidak dapat:

- menghapus audit log;
- mengubah Owner;
- permanent purge secara default;
- mengubah konfigurasi keamanan kritis.

---

## 7.3 SUPERVISOR / REVIEWER

Dapat:

- melihat perkara sesuai scope;
- memberikan task;
- melakukan review;
- approve;
- request revision;
- melihat workload staff;
- melihat pending;
- melihat deadline;
- melakukan escalation.

---

## 7.4 STAFF

Dapat:

- melihat `My Work`;
- melihat perkara yang diberikan kepadanya;
- memperbarui workflow sesuai permission;
- menyelesaikan task;
- menambahkan follow-up;
- mengupdate checklist;
- menambahkan catatan;
- upload/link dokumen;
- download task PDF;
- download checklist PDF;
- melihat calendar terkait dirinya.

Tidak dapat secara default:

- melihat financial kantor;
- membatalkan perkara;
- menghapus perkara;
- mengelola user;
- mengubah settings;
- melihat audit log seluruh kantor.

---

## 7.5 FINANCE

Opsional V1.5.

Dapat:

- melihat invoice;
- mencatat pembayaran;
- membuat receipt;
- melihat outstanding payment;
- menghasilkan laporan billing.

---

# 8. AUTHENTICATION & AUTHORIZATION

## 8.1 Prinsip

Authentication menjawab:

> Siapa pengguna?

Authorization menjawab:

> Apa yang boleh dilakukan pengguna?

Keduanya harus dipisahkan.

---

## 8.2 Google Account Integration

NOTARYGO™ harus mendukung identitas Google.

Terdapat dua deployment profile:

### PROFILE A — Google Workspace Office

Digunakan jika staff berada dalam Google Workspace/domain kantor yang sama.

Identitas Google digunakan untuk mengenali pengguna.

Email harus terdapat pada `Users`.

Contoh:

`staff@kantornotaris.com`

Jika email tidak terdaftar:

**ACCESS DENIED**

---

### PROFILE B — Mixed Gmail / External Google Account

Digunakan apabila kantor menggunakan kombinasi:

- Gmail pribadi;
- Workspace;
- akun Google eksternal.

Authentication harus menggunakan mekanisme Google Identity/OAuth yang tervalidasi.

---

## 8.3 Authorization

Setelah identitas diketahui:

```text
Google Identity
      ↓
Users Database
      ↓
Status ACTIVE?
      ↓
Role
      ↓
Permission
      ↓
Application Access
```

User dengan status:

`INACTIVE`

atau

`SUSPENDED`

tidak boleh masuk.

---

# 9. OFFICE SETUP

Menu:

**Settings → Office Profile**

Data:

- officeId;
- nama kantor;
- nama Notaris;
- gelar;
- alamat;
- kota;
- provinsi;
- kode pos;
- telepon;
- WhatsApp;
- email;
- website;
- logo;
- document footer;
- payment information;
- office timezone;
- invoice prefix;
- matter prefix.

---

# 10. OFFICE BRANDING

Logo dan Office Profile harus otomatis digunakan pada:

- login;
- sidebar;
- dashboard;
- laporan;
- invoice;
- receipt;
- task PDF;
- checklist PDF;
- matter summary;
- generated documents.

Format utama:

```text
[LOGO]

KANTOR NOTARIS & PPAT
Nama Notaris, S.H., M.Kn.

Powered by NOTARYGO™
```

NOTARYGO™ tetap muncul sebagai technology brand.

---

# 11. FIRST-TIME SETUP WIZARD

Saat instalasi pertama:

### STEP 1
Setup Database

### STEP 2
Office Profile

### STEP 3
Upload Logo

### STEP 4
Create Owner

### STEP 5
Add Staff

### STEP 6
Configure Service Types

### STEP 7
Configure Workflow

### STEP 8
Configure Notification

### STEP 9
Create Drive Folder Structure

### STEP 10
System Health Check

### STEP 11
Finish

Status:

`SYSTEM_READY = TRUE`

---

# 12. APPLICATION NAVIGATION

```text
NOTARYGO™

OVERVIEW
├── Dashboard
├── My Work
├── Attention Required
└── Calendar

OPERATIONS
├── Perkara
├── Workflow
├── Tasks
├── Pending
├── Follow-Up
├── Signing
└── Clients

DOCUMENTS
├── Checklist
├── Generated Documents
├── Templates
└── Document Center

FINANCE
├── Invoice
├── Payments
└── Outstanding

CONTROL
├── Reports
├── Staff Workload
├── Activity Logs
└── Archive

SYSTEM
├── Users
├── Office Profile
├── Service Types
├── Workflow Templates
├── Notification
├── Document Settings
├── Backup
└── Settings
```

Menu ditampilkan berdasarkan permission.

---

# 13. DASHBOARD OWNER

Dashboard Owner adalah **exception dashboard**, bukan sekadar dashboard statistik.

## 13.1 KPI

Tampilkan:

- active matters;
- new matters;
- completed matters;
- overdue matters;
- pending matters;
- deadlines today;
- deadlines next 7 days;
- signing today;
- follow-up today;
- tasks overdue;
- files without PIC;
- files no update > X days;
- outstanding invoice.

---

# 14. ATTENTION REQUIRED ENGINE

Sistem menghasilkan daftar perkara bermasalah.

Rule contoh:

### CRITICAL

- deadline lewat;
- signing hari ini tetapi readiness belum complete;
- perkara tanpa PIC;
- task critical overdue.

### WARNING

- deadline ≤3 hari;
- pending >7 hari;
- tidak ada update >5 hari;
- approval >2 hari;
- invoice overdue.

### WATCH

- deadline ≤7 hari;
- pending >3 hari.

Setiap alert mempunyai:

- alertId;
- entity;
- reason;
- severity;
- generatedAt;
- owner;
- status;
- resolvedAt.

---

# 15. MY WORK

Default homepage Staff.

Tampilkan:

## Today

- task hari ini;
- overdue;
- follow-up;
- signing;
- deadline;
- approval/revision request.

Sorting:

1. overdue;
2. critical priority;
3. deadline terdekat;
4. task lainnya.

Staff harus dapat menyelesaikan aktivitas utama tanpa membuka banyak menu.

---

# 16. CLIENT INTAKE

Client belum otomatis menjadi perkara.

Status intake:

```text
NEW
CONSULTATION
WAITING_DOCUMENT
QUOTATION_SENT
ACCEPTED
CONVERTED
NOT_PROCEEDING
```

Saat `ACCEPTED`:

button:

**Convert to Matter**

Sistem:

1. membuat Client jika belum ada;
2. membuat Matter;
3. memilih Workflow Template;
4. membuat checklist;
5. membuat initial tasks;
6. membuat Drive folder;
7. membuat activity log.

---

# 17. CLIENT MANAGEMENT

Entity Client:

- clientId;
- clientType;
- nama;
- NIK/identifier opsional;
- phone;
- email;
- address;
- company;
- notes;
- status;
- createdAt;
- updatedAt.

Client mempunyai hubungan one-to-many dengan Matters.

Client Profile menampilkan:

- seluruh perkara;
- active;
- completed;
- cancelled;
- invoice;
- communication history.

---

# 18. ORGANIZATION / PARTNER

Entity terpisah untuk:

- bank;
- developer;
- corporate;
- agency;
- partner lain.

Field:

- organizationId;
- name;
- type;
- contactPerson;
- phone;
- email;
- notes.

Satu organization dapat terkait banyak perkara.

---

# 19. REGISTER PERKARA

Matter adalah entity pusat NOTARYGO™.

Field minimal:

```text
matterId
matterNumber
clientId
clientNameSnapshot
serviceTypeId
serviceTypeNameSnapshot
organizationId
title
description
priority
assignedPIC
supervisor
currentWorkflowStep
matterStatus
deadline
pendingStatus
pendingReason
nextAction
driveFolderId
financialStatus
createdBy
createdAt
updatedBy
updatedAt
completedAt
cancelledAt
cancelledBy
cancellationReason
archivedAt
```

---

# 20. MATTER NUMBER

Format configurable.

Default:

`NG-2026-000001`

Contoh customizable:

`AJB/2026/0001`

Running number harus atomic.

Gunakan `LockService` saat menghasilkan sequence.

Nomor tidak boleh duplicate.

---

# 21. MATTER STATUS

Canonical status:

```text
DRAFT
ACTIVE
PENDING
WAITING_APPROVAL
COMPLETED
CANCELLED
ARCHIVED
```

`DELETED` tidak digunakan untuk pembatalan client.

---

# 22. CANCEL MATTER

Owner/Admin dapat melakukan:

**Cancel Matter**

Wajib memasukkan:

- cancellation reason;
- cancellation note;
- confirmation.

Reason:

```text
CLIENT_CANCELLED
NOT_PROCEEDING
DUPLICATE
WRONG_INPUT
MOVED_TO_OTHER_PROCESS
OTHER
```

---

# 23. CANCEL BUSINESS RULE

Jika client benar-benar membatalkan kerja sama:

status:

`CANCELLED`

Data **tidak dihapus dari database**.

Matter:

- hilang dari Active Dashboard;
- masuk `Archive → Cancelled`;
- tetap mempunyai audit history;
- tetap mempertahankan invoice/dokumen/activity.

---

# 24. WRONG INPUT / DUPLICATE

Untuk data salah input/duplicate:

status dapat:

`ARCHIVED`

dengan archive reason.

Permanent delete tidak menjadi tindakan normal.

---

# 25. RESTORE MATTER

Owner dapat:

**Restore Matter**

dari Cancelled/Archive jika diperlukan.

Activity Log wajib dibuat.

---

# 26. WORKFLOW ENGINE

Workflow harus configurable per jenis layanan.

Contoh generic:

```text
INCOMING
↓
DOCUMENT_CHECKING
↓
WAITING_DOCUMENT
↓
DRAFTING
↓
INTERNAL_REVIEW
↓
NOTARY_APPROVAL
↓
CLIENT_APPROVAL
↓
SIGNING
↓
PROCESSING
↓
COMPLETED
↓
ARCHIVED
```

---

# 27. WORKFLOW TEMPLATE

Entity:

`WorkflowTemplate`

berisi:

- workflowId;
- name;
- serviceType;
- active;
- version.

Workflow Steps:

- stepId;
- workflowId;
- stepOrder;
- stepName;
- defaultPICRole;
- defaultDeadlineDays;
- approvalRequired;
- checklistTemplate;
- sopReference;
- nextStep.

---

# 28. WORKFLOW HISTORY

Current status saja tidak cukup.

Setiap perubahan harus menghasilkan record:

```text
workflowHistoryId
matterId
fromStep
toStep
changedBy
changedAt
note
durationPreviousStep
```

Tujuan:

- aging;
- audit trail;
- bottleneck analysis;
- average processing time.

---

# 29. WORKFLOW TRANSITION RULE

Staff tidak boleh bebas memilih status apa saja.

Transition harus mengikuti workflow.

Contoh:

`DRAFTING → INTERNAL_REVIEW`

valid.

`DRAFTING → COMPLETED`

invalid kecuali Owner override.

Owner override wajib:

- reason;
- audit log.

---

# 30. PENDING CONTROL

Pending bukan hanya teks.

Entity:

```text
pendingId
matterId
reasonCode
reasonDetail
pendingSince
expectedResumeDate
responsibleParty
PIC
nextFollowUp
status
resolvedAt
resolvedBy
```

Reason:

```text
CLIENT
BANK
DEVELOPER
BPN
TAX
APPROVAL
DOCUMENT
SIGNATURE
INTERNAL
OTHER
```

---

# 31. PENDING AGING

System menghitung:

`pendingDays`

Dashboard menampilkan:

- >3 hari;
- >7 hari;
- >14 hari;
- >30 hari.

Pending > threshold menghasilkan Attention Alert.

---

# 32. TASK MANAGEMENT

Task entity:

```text
taskId
matterId
title
description
assignedTo
assignedBy
priority
startDate
deadline
status
progress
notes
createdAt
completedAt
```

Task status:

```text
TODO
IN_PROGRESS
WAITING
DONE
CANCELLED
```

Priority:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 33. TASK BUSINESS RULE

Setiap task harus mempunyai:

- title;
- PIC;
- status.

Task dengan deadline harus masuk reminder engine.

Task completed:

- completedBy;
- completedAt;
- activity log.

---

# 34. TASK PDF

Staff dapat:

**Download Task PDF**

PDF berisi:

- branding kantor;
- Task Number;
- Matter Number;
- Client;
- Service;
- Title;
- Description;
- PIC;
- Priority;
- Assigned Date;
- Deadline;
- Notes.

---

# 35. MY TASKS PDF

Staff dapat:

**Download My Tasks**

Pilihan:

- Today;
- This Week;
- Overdue;
- Custom.

---

# 36. DEADLINE ENGINE

Deadline dapat berasal dari:

- matter;
- workflow step;
- task;
- follow-up;
- signing;
- invoice;
- document requirement.

Risk state:

```text
SAFE
WATCH
WARNING
CRITICAL
OVERDUE
```

Default:

```text
>7 hari     SAFE
≤7 hari     WATCH
≤3 hari     WARNING
≤1 hari     CRITICAL
<0          OVERDUE
```

Threshold harus configurable.

---

# 37. FOLLOW-UP MANAGEMENT

Field:

```text
followUpId
matterId
targetType
targetName
contact
method
followUpDate
result
nextFollowUpDate
PIC
status
createdBy
createdAt
```

Method:

- WhatsApp;
- Phone;
- Email;
- Meeting;
- Other.

---

# 38. FOLLOW-UP STATUS

```text
SCHEDULED
DONE
RESCHEDULED
CANCELLED
```

Follow-up due harus muncul pada My Work.

---

# 39. DOCUMENT CHECKLIST

Checklist harus berasal dari Service Type.

Contoh AJB:

```text
KTP Penjual
KTP Pembeli
KK
NPWP
Sertifikat
SPPT PBB
Bukti PBB
Dokumen pendukung
```

Setiap item:

```text
checklistItemId
matterId
documentType
required
status
receivedDate
verifiedBy
verifiedAt
note
driveFileId
```

Status:

```text
MISSING
RECEIVED
NEED_REVISION
VERIFIED
NOT_APPLICABLE
```

---

# 40. DOCUMENT COMPLETENESS

System menghitung:

`verified required document / total required document`

Contoh:

**8/10 — 80%**

Signing readiness dapat menggunakan data ini.

---

# 41. REQUEST DOCUMENT GENERATOR

Staff dapat memilih missing items lalu:

**Generate Document Request**

Output:

- PDF;
- copyable message.

Contoh:

> Dokumen yang masih dibutuhkan:
> 1. NPWP
> 2. SPPT PBB
> 3. Bukti Pembayaran PBB

---

# 42. DOCUMENT CENTER

Central document registry.

Field:

```text
documentId
matterId
documentType
title
version
status
driveFileId
driveUrl
generatedBy
generatedAt
visibility
```

---

# 43. DOCUMENT VERSION CONTROL

Status:

```text
DRAFT
REVIEW
REVISION
APPROVED
FINAL
SIGNED
ARCHIVED
```

Dokumen tidak overwrite tanpa version history.

Contoh:

```text
Draft V1
Draft V2
Reviewed V3
Final V4
Signed
```

---

# 44. SIGNING MANAGEMENT

Entity:

```text
signingId
matterId
date
startTime
location
participants
PIC
status
notes
```

Status:

```text
DRAFT
SCHEDULED
READY
COMPLETED
RESCHEDULED
CANCELLED
```

---

# 45. SIGNING READINESS

Checklist:

- required documents complete;
- final draft;
- approval;
- client confirmation;
- signing parties confirmation;
- relevant payment/tax check;
- meeting schedule.

Display:

```text
READY
NOT_READY
```

Jika signing H-1 tetapi `NOT_READY`:

generate CRITICAL alert.

---

# 46. APPROVAL ENGINE

Entity:

```text
approvalId
matterId
entityType
entityId
requestedBy
reviewer
status
requestDate
reviewDate
comment
```

Status:

```text
WAITING
APPROVED
REVISION_REQUESTED
REJECTED
CANCELLED
```

---

# 47. REVISION FLOW

```text
Staff Submit
↓
WAITING REVIEW
↓
Reviewer
├── APPROVED → Continue
└── REVISION REQUESTED
          ↓
        Staff
          ↓
       Resubmit
```

Semua loop tercatat.

---

# 48. CALENDAR

Office Calendar menggabungkan:

- signing;
- task deadline;
- matter deadline;
- follow-up;
- appointment;
- meeting;
- invoice due.

Filter:

- Mine;
- All Office;
- User;
- Event type.

---

# 49. GOOGLE CALENDAR

Event tertentu dapat disinkronisasi ke Google Calendar.

Simpan:

`googleCalendarEventId`

untuk mencegah duplicate event.

---

# 50. NOTIFICATION ENGINE

Notification harus menggunakan queue.

Jangan langsung mengirim email di setiap business function.

Flow:

```text
BUSINESS EVENT
↓
CREATE NOTIFICATION
↓
NOTIFICATION QUEUE
↓
SCHEDULER
↓
EMAIL
↓
DELIVERY STATUS
```

---

# 51. NOTIFICATION QUEUE

Field:

```text
notificationId
recipientUserId
recipientEmail
type
entityType
entityId
subject
payload
scheduledAt
status
attemptCount
sentAt
lastError
deduplicationKey
```

Status:

```text
QUEUED
PROCESSING
SENT
FAILED
CANCELLED
```

---

# 52. EMAIL NOTIFICATION RULE

Jenis notifikasi:

- task assigned;
- task H-1;
- task overdue;
- deadline H-7;
- H-3;
- H-1;
- deadline today;
- overdue;
- pending too long;
- follow-up due;
- signing reminder;
- approval waiting;
- revision requested;
- matter reassigned;
- invoice due;
- invoice overdue.

---

# 53. USER NOTIFICATION SETTINGS

Per user:

```text
taskAssigned
deadlineH7
deadlineH3
deadlineH1
overdue
followUp
signing
approval
dailySummary
```

User dapat menonaktifkan notifikasi non-critical.

Critical alert Owner tidak boleh semuanya dimatikan.

---

# 54. OWNER DAILY BRIEF

Default:

**07:30 Asia/Jakarta**

Subject:

`[NOTARYGO] Daily Operational Brief — 26 Aug 2026`

Isi:

- active matters;
- overdue;
- pending;
- deadline;
- signing;
- follow-up;
- outstanding;
- top attention required.

Email tidak perlu berisi semua perkara.

Hanya exception utama.

---

# 55. NOTIFICATION DEDUPLICATION

Rule:

Satu event tidak boleh menghasilkan email identik berkali-kali.

Contoh key:

`TASK_OVERDUE:TASK-123:2026-08-26`

Jika sudah `SENT`, jangan kirim ulang hari yang sama kecuali escalation rule.

---

# 56. ESCALATION ENGINE

Contoh default:

```text
Deadline approaching
→ PIC

Deadline today
→ PIC

Overdue 1 day
→ PIC + Supervisor

Overdue 3 days
→ Admin

Overdue 5 days
→ Owner
```

Rule configurable di V2.

---

# 57. COMMUNICATION LOG

Catat komunikasi penting.

Field:

```text
communicationId
matterId
party
channel
dateTime
summary
nextAction
PIC
createdBy
```

Tidak perlu menyimpan seluruh chat WhatsApp.

NOTARYGO™ adalah `system of record`, bukan chat archive.

---

# 58. HANDOVER / REASSIGNMENT

Owner/Admin dapat memindahkan:

- matter;
- task;
- follow-up;
- signing responsibility.

Flow:

```text
Select Staff
↓
View Active Responsibilities
↓
Select Items
↓
Select New PIC
↓
Confirm
↓
Reassign
↓
Activity Log
```

---

# 59. BILLING

V1.5.

Entity Invoice:

```text
invoiceId
invoiceNumber
matterId
clientId
invoiceDate
dueDate
subtotal
discount
tax
total
paidAmount
outstanding
status
notes
pdfFileId
```

---

# 60. INVOICE STATUS

```text
DRAFT
ISSUED
PARTIAL
PAID
OVERDUE
CANCELLED
```

---

# 61. INVOICE NUMBER

Configurable.

Default:

`INV/NG/2026/00001`

Gunakan atomic running number.

---

# 62. INVOICE PDF

PDF wajib menampilkan:

- logo;
- nama kantor;
- alamat;
- contact;
- invoice number;
- client;
- matter;
- items;
- total;
- paid;
- outstanding;
- due date;
- payment info;
- footer.

---

# 63. PAYMENT

Entity:

```text
paymentId
invoiceId
matterId
paymentDate
amount
method
reference
receivedBy
notes
```

---

# 64. RECEIPT

Jika payment tercatat:

button:

**Generate Receipt**

Jika outstanding = 0:

status:

`PAID`

Receipt:

**LUNAS**

---

# 65. PDF GENERATOR

Document types:

```text
TASK
MY_TASKS
MATTER_SUMMARY
DOCUMENT_CHECKLIST
DOCUMENT_REQUEST
INVOICE
RECEIPT
REPORT
```

Arsitektur:

```text
Data
↓
Google Docs Template
↓
Placeholder Replacement
↓
PDF
↓
Drive
↓
Document Registry
```

---

# 66. PDF PREVIEW

Flow:

```text
Generate
↓
Preview
↓
Confirm
↓
Save to Drive
↓
Download / Print
```

---

# 67. GOOGLE DRIVE STRUCTURE

Setup otomatis:

```text
NOTARYGO/
│
├── 00_SYSTEM/
│   ├── LOGO/
│   ├── TEMPLATES/
│   └── BACKUP/
│
├── 01_MATTERS/
│   └── 2026/
│       └── NG-2026-000001_Client/
│           ├── 01_CLIENT_DOCUMENT/
│           ├── 02_DRAFT/
│           ├── 03_REVIEW/
│           ├── 04_SIGNING/
│           ├── 05_INVOICE/
│           └── 06_FINAL/
│
├── 02_REPORTS/
├── 03_INVOICES/
└── 04_ARCHIVE/
```

Folder ID disimpan dalam database.

Jangan mencari folder berdasarkan nama apabila ID tersedia.

---

# 68. SOP LIBRARY

SOP tidak hanya menjadi download.

Workflow Step dapat mempunyai:

`sopId`

Saat Staff membuka step:

`DOCUMENT_CHECKING`

sistem dapat menampilkan:

**SOP Pemeriksaan Dokumen**

Ini membuat SOP context-sensitive.

---

# 69. SERVICE TYPES

Owner dapat membuat:

- AJB;
- PPJB;
- APHT;
- SKMHT;
- Roya;
- Balik Nama;
- Pendirian PT;
- Perubahan PT;
- corporate;
- legalisasi;
- layanan lainnya.

Tidak boleh hard-coded.

---

# 70. SERVICE TEMPLATE

Satu Service Type dapat mempunyai:

- workflow template;
- checklist template;
- task template;
- SLA/default deadline;
- SOP;
- invoice item template.

---

# 71. ACTIVITY LOG

Semua perubahan penting dicatat.

Field:

```text
logId
actorUserId
actorEmail
action
entityType
entityId
beforeSnapshot
afterSnapshot
description
timestamp
requestId
```

---

# 72. ACTIVITIES THAT MUST BE LOGGED

Minimal:

- login;
- create matter;
- edit matter;
- cancel matter;
- restore matter;
- workflow change;
- PIC change;
- deadline change;
- task assignment;
- task completed;
- approval;
- revision request;
- invoice created;
- payment recorded;
- document generated;
- user created;
- user role changed;
- user deactivated;
- settings changed;
- backup;
- restore.

---

# 73. AUDIT RULE

Activity Log:

- append-only;
- Staff tidak dapat delete;
- Admin tidak dapat delete;
- Owner tidak dapat mengedit log melalui UI.

---

# 74. REPORTING

V1:

### Operational

- active matters;
- incoming;
- completed;
- cancelled;
- overdue;
- pending.

### Aging

```text
0–7
8–14
15–30
31–60
>60 days
```

### Staff

- active assigned;
- tasks completed;
- overdue.

### Service Type

- matter count;
- completion.

### Billing

- issued;
- paid;
- outstanding.

---

# 75. STAFF WORKLOAD

Dashboard:

```text
User
Active Matters
Open Tasks
Overdue Tasks
Follow-Ups
Signing
```

Digunakan sebagai decision support.

Tidak boleh langsung dijadikan penilaian kinerja formal tanpa konteks.

---

# 76. BOTTLENECK ANALYTICS

V2.

Gunakan WorkflowHistory dan Pending.

Output:

- average duration per step;
- longest step;
- pending reason distribution;
- average pending duration;
- matter cycle time.

---

# 77. SEARCH

Global Search harus dapat mencari:

- Matter Number;
- client;
- phone;
- service;
- organization;
- PIC.

Target usability:

Perkara dapat ditemukan dalam <10 detik.

---

# 78. FILTER

Register Matters:

- status;
- service;
- PIC;
- priority;
- deadline;
- pending;
- organization;
- date range.

---

# 79. SECURITY PRINCIPLES

Gunakan:

- least privilege;
- role based access control;
- server-side authorization;
- session validation;
- input validation;
- output encoding;
- no secret in client JavaScript;
- PropertiesService untuk configuration secret;
- LockService untuk concurrent write;
- audit logging;
- inactive account revocation.

---

# 80. SERVER-SIDE AUTHORIZATION

UI hiding **bukan security**.

Setiap server function harus menjalankan:

```text
authenticate
↓
authorize
↓
validate
↓
business logic
↓
write
↓
audit
```

Staff yang memanggil backend secara manual tetap tidak boleh menjalankan function Owner.

---

# 81. CONCURRENCY

Critical operations gunakan `LockService`:

- matter numbering;
- invoice numbering;
- payment posting;
- setup database;
- migration;
- bulk update;
- workflow transition kritis.

---

# 82. DATABASE PRINCIPLE

Spreadsheet digunakan sebagai database tabular.

Jangan menggunakan cell address seperti:

`B27`

sebagai business storage.

Gunakan schema dan header.

Backend membaca object berdasarkan header.

---

# 83. DATABASE SHEETS

Minimal:

```text
Config
Office
Users
Clients
Organizations
ServiceTypes
WorkflowTemplates
WorkflowSteps
Matters
WorkflowHistory
Tasks
Pending
FollowUps
ChecklistTemplates
ChecklistItems
Documents
Approvals
Signing
Communications
Invoices
Payments
Notifications
Alerts
ActivityLogs
Sequences
Backups
```

---

# 84. ID FORMAT

Semua entity mempunyai immutable ID.

Contoh:

```text
USR_xxx
CLI_xxx
ORG_xxx
MAT_xxx
TASK_xxx
FU_xxx
DOC_xxx
INV_xxx
PAY_xxx
LOG_xxx
```

Human readable number terpisah dari technical ID.

---

# 85. SOFT DELETE

Database tidak melakukan hard delete normal.

Field standard:

```text
isArchived
archivedAt
archivedBy
archiveReason
```

atau lifecycle status sesuai entity.

---

# 86. DATA SNAPSHOT

Matter menyimpan snapshot nama client/service yang relevan agar histori tidak rusak ketika master data berubah.

---

# 87. BACKUP

Automatic backup minimal:

**Daily database backup**

atau sesuai batas layanan yang tersedia.

Backup:

- Spreadsheet copy;
- system config;
- critical templates reference.

---

# 88. BACKUP HISTORY

Field:

```text
backupId
createdAt
createdBy
fileId
status
notes
```

Owner dapat melihat:

**Last Successful Backup**

---

# 89. HEALTH CHECK

Menu:

**System → Health**

Cek:

- database available;
- required sheets;
- schema;
- Drive folder;
- templates;
- notification trigger;
- backup trigger;
- timezone;
- Owner account.

Output:

```text
HEALTHY
WARNING
ERROR
```

---

# 90. TRIGGERS

Minimum installable triggers:

### Notification Processor
Setiap 15–60 menit sesuai konfigurasi.

### Daily Brief
Sekitar 07:30 WIB.

### Alert Generator
Periodic.

### Backup
Daily.

### Maintenance
Daily/weekly.

Jangan membuat trigger duplicate.

`setupTriggers()` harus idempotent.

---

# 91. ERROR HANDLING

Gunakan standardized response:

```javascript
{
  success: false,
  code: "MATTER_NOT_FOUND",
  message: "Perkara tidak ditemukan.",
  requestId: "REQ_xxx"
}
```

UI tidak menampilkan stack trace.

Stack/error detail dicatat server-side.

---

# 92. REQUEST ID

Setiap mutating operation mempunyai `requestId`.

Digunakan untuk:

- debugging;
- audit;
- duplicate prevention.

---

# 93. IDEMPOTENCY

Operation seperti:

- setupDatabase;
- setupDrive;
- setupTriggers;
- database migration;

harus aman dijalankan ulang.

---

# 94. FRONTEND UX PRINCIPLE

Design:

- professional;
- premium;
- modern;
- clean;
- suitable for legal office;
- desktop first;
- responsive mobile.

Tidak terlihat seperti default Google Sheet.

---

# 95. VISUAL SYSTEM

Suggested:

- Navy;
- White;
- Slate;
- subtle Gold accent.

Status color:

```text
Green   = Safe / Completed
Yellow  = Watch
Orange  = Warning
Red     = Critical / Overdue
Gray    = Archived
Blue    = Active
```

Jangan hanya menggunakan warna sebagai informasi.

Tambahkan text/icon.

---

# 96. DASHBOARD RESPONSIVENESS

Target:

- Desktop optimal;
- Tablet supported;
- Mobile operational.

Mobile Staff harus dapat:

- melihat My Work;
- update task;
- update workflow;
- follow-up;
- checklist;
- calendar.

---

# 97. PERFORMANCE TARGET

Target awal:

- dashboard load normal <3–5 detik pada dataset kantor kecil–menengah;
- common action feedback <2 detik jika memungkinkan;
- heavy report boleh asynchronous UI request tetapi Apps Script execution tetap synchronous server-side;
- pagination digunakan untuk data besar;
- hindari membaca seluruh spreadsheet berulang kali.

Gunakan batch read/write.

---

# 98. CACHE

`CacheService` dapat digunakan untuk:

- configuration;
- service types;
- workflow definitions;
- dashboard aggregates sementara.

Jangan cache security authorization terlalu lama.

---

# 99. ARCHITECTURE LAYERS

```text
UI
↓
Controller / API Functions
↓
Authentication & Authorization
↓
Service Layer
↓
Repository / Data Layer
↓
Google Sheets / Drive / Gmail / Calendar
```

Business logic tidak boleh ditulis langsung di HTML.

---

# 100. RECOMMENDED APPS SCRIPT FILE STRUCTURE

```text
appsscript.json

Code.gs
Config.gs
Bootstrap.gs

Auth.gs
Permissions.gs

Database.gs
Repository.gs
Migration.gs
Sequence.gs

OfficeService.gs
UserService.gs
ClientService.gs
OrganizationService.gs
MatterService.gs
WorkflowService.gs
TaskService.gs
PendingService.gs
FollowUpService.gs
ChecklistService.gs
DocumentService.gs
ApprovalService.gs
SigningService.gs
CommunicationService.gs
BillingService.gs
NotificationService.gs
AlertService.gs
ReportService.gs
BackupService.gs

DriveService.gs
CalendarService.gs
MailService.gs
PdfService.gs

AuditService.gs
Security.gs
Validation.gs
Utils.gs

Tests.gs

Index.html
Styles.html
App.html
Components.html
Scripts.html
```

Antigravity boleh memecah lebih lanjut jika diperlukan, tetapi domain separation tidak boleh dihapus.

---

# 101. FRONTEND STATE

Frontend tidak menjadi source of truth.

Setelah mutating action:

1. backend melakukan write;
2. backend return canonical result;
3. UI update berdasarkan result;
4. reload data jika perlu.

---

# 102. MODAL CONFIRMATION

Required untuk:

- cancel matter;
- archive;
- restore;
- change critical deadline;
- remove user;
- record payment;
- cancel invoice;
- Owner override.

---

# 103. TOAST / FEEDBACK

Setiap action memberi feedback:

**Success**

**Warning**

**Error**

Tidak boleh silent failure.

---

# 104. V1 SCOPE — DAILY OPERATIONS

Production V1 wajib mempunyai:

1. Authentication
2. RBAC
3. Office Setup
4. Office Branding
5. User Management
6. Dashboard
7. My Work
8. Attention Required
9. Client
10. Organization
11. Register Perkara
12. Cancel/Archive/Restore
13. Workflow
14. Workflow History
15. Tasks
16. Deadline
17. Pending
18. Follow-Up
19. Checklist
20. Calendar
21. Activity Log
22. Gmail Notification
23. Daily Owner Brief
24. Drive Folder
25. Backup
26. Reports dasar

---

# 105. V1.5 SCOPE — PROFESSIONAL OFFICE

Tambahkan:

1. Approval
2. Revision Workflow
3. Document Center
4. Version Control
5. Signing Management
6. Signing Readiness
7. PDF Generator
8. Task PDF
9. Checklist PDF
10. Matter Summary PDF
11. Document Request PDF
12. Invoice
13. Payments
14. Receipt
15. Communication Log
16. Staff Handover

---

# 106. V2 — CONTROL & AUTOMATION

Tambahkan:

- configurable escalation;
- advanced notifications;
- workload analytics;
- aging;
- bottleneck analytics;
- Bank/Developer workspace;
- advanced reporting;
- bulk operations;
- dashboard customization.

---

# 107. V3 — CLIENT EXPERIENCE

Tambahkan:

- Client Portal;
- secure progress link;
- client document request;
- Google Calendar deeper sync;
- controlled WhatsApp integration;
- automated client progress notification.

---

# 108. V4 — INTELLIGENCE

Tambahkan:

- AI Daily Brief;
- risk detection;
- suggested action;
- anomaly detection;
- workload recommendation;
- bottleneck explanation;
- natural language operational query.

AI tidak boleh mengubah data kritis tanpa explicit user confirmation.

---

# 109. CORE END-TO-END FLOW

```text
CLIENT INQUIRY
↓
CLIENT INTAKE
↓
ACCEPTED
↓
CREATE MATTER
↓
SELECT SERVICE
↓
AUTO LOAD WORKFLOW
↓
AUTO LOAD CHECKLIST
↓
AUTO CREATE DRIVE FOLDER
↓
ASSIGN PIC
↓
DOCUMENT CHECK
↓
TASK EXECUTION
↓
FOLLOW-UP / PENDING
↓
REVIEW
↓
APPROVAL
↓
SIGNING
↓
PROCESSING
↓
INVOICE / PAYMENT
↓
COMPLETED
↓
ARCHIVE
```

Parallel process:

```text
DEADLINE
↓
MONITOR
↓
ALERT
↓
NOTIFICATION
↓
ESCALATION
↓
ACTION
```

---

# 110. MATTER CANCELLATION FLOW

```text
Active Matter
↓
Owner/Admin → Cancel Matter
↓
Select Reason
↓
Add Note
↓
Confirmation
↓
Status = CANCELLED
↓
Remove From Active Dashboard
↓
Keep Database
↓
Keep Documents
↓
Activity Log
↓
Cancelled Archive
```

---

# 111. TASK FLOW

```text
Create Task
↓
Assign PIC
↓
Email Notification
↓
My Work
↓
In Progress
↓
Done
↓
Activity Log
```

Jika deadline terlewat:

```text
Overdue
↓
Alert
↓
Notification
↓
Escalation
```

---

# 112. DOCUMENT FLOW

```text
Upload/Create
↓
Draft
↓
Review
↓
Revision?
├── Yes → New Version
└── No
↓
Approved
↓
Final
↓
Signed
↓
Archive
```

---

# 113. INVOICE FLOW

```text
Matter
↓
Create Invoice
↓
Preview
↓
Issue
↓
PDF
↓
Payment
├── Partial → Outstanding
└── Full
↓
Paid
↓
Receipt
```

---

# 114. BUSINESS RULE — MATTER COMPLETION

Matter tidak boleh menjadi `COMPLETED` jika required completion criteria belum terpenuhi, kecuali Owner override.

Default criteria dapat meliputi:

- required workflow complete;
- mandatory task complete;
- critical document verified;
- signing complete jika applicable.

Financial payment tidak harus menjadi blocker apabila kantor memilih configuration tersebut.

---

# 115. BUSINESS RULE — MATTER WITHOUT ACTIVITY

Jika:

`lastOperationalUpdate > X hari`

dan matter masih ACTIVE:

generate:

`NO_ACTIVITY_ALERT`

Default X:

5 hari.

---

# 116. BUSINESS RULE — FILE WITHOUT PIC

Matter ACTIVE tanpa PIC:

severity:

`CRITICAL`

Harus muncul di Attention Required.

---

# 117. BUSINESS RULE — PENDING

Saat Matter berubah ke `PENDING`:

wajib:

- reason;
- pendingSince;
- PIC;
- nextAction atau nextFollowUp.

---

# 118. BUSINESS RULE — DEADLINE CHANGE

Perubahan deadline wajib mencatat:

- old deadline;
- new deadline;
- actor;
- timestamp;
- reason jika deadline dimundurkan.

---

# 119. ACCEPTANCE CRITERIA — AUTH

- User tidak terdaftar tidak dapat masuk.
- User inactive tidak dapat masuk.
- Staff tidak dapat memanggil Owner action.
- Permission berlaku server-side.
- Login activity tercatat.

---

# 120. ACCEPTANCE CRITERIA — MATTER

- Admin dapat membuat perkara.
- Nomor perkara unique.
- Matter muncul pada dashboard.
- Workflow template otomatis terhubung.
- PIC tersimpan.
- Drive folder dibuat.
- Activity log tercipta.
- Cancel tidak menghapus database.
- Cancelled matter tidak muncul pada active list.
- Owner dapat restore.

---

# 121. ACCEPTANCE CRITERIA — WORKFLOW

- Current step diketahui.
- Invalid transition ditolak.
- Valid transition tersimpan.
- WorkflowHistory dibuat.
- Step duration dapat dihitung.
- Owner override tercatat.

---

# 122. ACCEPTANCE CRITERIA — TASK

- Task dapat assigned.
- Task muncul di My Work.
- PIC menerima notification jika aktif.
- Staff dapat mark Done.
- Completion tercatat.
- Overdue menghasilkan alert.

---

# 123. ACCEPTANCE CRITERIA — NOTIFICATION

- Queue bekerja.
- Duplicate email dicegah.
- Failed email memiliki status FAILED.
- attemptCount tercatat.
- Daily Brief hanya sekali per hari.
- Notification preferences dihormati.

---

# 124. ACCEPTANCE CRITERIA — DOCUMENT

- PDF menggunakan branding kantor.
- PDF disimpan di Drive.
- File ID disimpan.
- Dokumen dapat di-download.
- Version history tidak tertimpa.

---

# 125. ACCEPTANCE CRITERIA — INVOICE

- Invoice number unique.
- Total dihitung backend.
- Payment tidak boleh melebihi outstanding tanpa override.
- Paid status otomatis ketika outstanding = 0.
- Receipt dapat dibuat.
- Financial activity tercatat.

---

# 126. ACCEPTANCE CRITERIA — AUDIT

Tidak boleh ada perubahan kritis tanpa Audit Log.

Critical entity:

- User;
- Matter;
- Workflow;
- Task;
- Approval;
- Invoice;
- Payment;
- Settings.

---

# 127. AUTOMATED TEST REQUIREMENTS

Antigravity harus membuat testing untuk:

### Database

- setupDatabase idempotent;
- required sheets;
- schema integrity.

### Auth

- unauthorized;
- inactive;
- Staff privilege escalation.

### Matter

- create;
- update;
- cancel;
- restore;
- duplicate number.

### Workflow

- valid transition;
- invalid transition;
- history.

### Task

- create;
- complete;
- overdue.

### Invoice

- calculations;
- payment;
- outstanding.

### Notification

- queue;
- duplicate prevention.

### Backup

- create backup;
- history.

---

# 128. TEST DATA

Seed development data:

- 1 Owner;
- 1 Admin;
- 1 Supervisor;
- 3 Staff;
- 20 Clients;
- 5 Organizations;
- 30 Matters;
- multiple states;
- overdue;
- pending;
- completed;
- cancelled;
- tasks;
- follow-ups;
- invoices.

Production setup **tidak boleh** menggunakan test credentials.

---

# 129. PRODUCTION SAFETY

Environment:

```text
DEV
TEST
PRODUCTION
```

Test functions tidak boleh merusak production database.

---

# 130. MANIFEST

`appsscript.json` harus menentukan:

- timezone Asia/Jakarta;
- V8 runtime;
- minimal required OAuth scopes;
- web app configuration;
- advanced services hanya jika benar-benar diperlukan.

Jangan menggunakan scope lebih luas dari kebutuhan.

---

# 131. APPS SCRIPT QUOTA PRINCIPLE

Sistem harus dirancang sadar quota.

Gunakan:

- batching;
- queue;
- caching;
- pagination;
- scheduled jobs;
- deduplication;
- limited spreadsheet calls.

Jangan mengirim notification dalam loop tanpa kontrol.

---

# 132. MIGRATION SYSTEM

Database mempunyai:

`SCHEMA_VERSION`

Contoh:

`2.0.0`

Migration harus:

```text
Current Schema
↓
Detect Version
↓
Apply Missing Migration
↓
Validate
↓
Update Version
```

Tidak boleh menghancurkan data existing.

---

# 133. CONFIGURATION

Gunakan `PropertiesService` untuk:

- database ID;
- Drive root ID;
- environment;
- schema version;
- authentication configuration;
- template IDs;
- system secrets.

Business settings dapat berada pada Settings sheet.

---

# 134. INITIAL BUILD ORDER FOR ANTIGRAVITY

Antigravity **tidak boleh membangun UI terlebih dahulu**.

Urutan:

### PHASE A — FOUNDATION

1. Manifest
2. Config
3. Error model
4. Database schema
5. SetupDatabase
6. Migration
7. Repository layer
8. IDs
9. Sequences
10. Lock
11. Audit framework

### PHASE B — SECURITY

12. Authentication
13. User
14. Roles
15. Permissions
16. Session/access validation

### PHASE C — CORE DOMAIN

17. Office
18. Client
19. Organizations
20. ServiceTypes
21. Matters
22. Cancellation
23. Archive
24. Restore

### PHASE D — OPERATION ENGINE

25. Workflow
26. WorkflowHistory
27. Tasks
28. Pending
29. Deadline
30. FollowUps
31. Checklist

### PHASE E — CONTROL

32. Alerts
33. My Work
34. Dashboard
35. Reports
36. ActivityLogs

### PHASE F — GOOGLE INTEGRATION

37. Drive
38. Gmail notification
39. Calendar
40. Backup

### PHASE G — PROFESSIONAL DOCUMENTS

41. Documents
42. Approval
43. Signing
44. PDF generator
45. Invoice
46. Payment
47. Receipt

### PHASE H — FRONTEND

48. Login
49. Layout
50. Dashboard
51. All functional pages
52. Responsive
53. Loading/error/empty states

### PHASE I — QA

54. Automated tests
55. Integration tests
56. Permission tests
57. Regression
58. Production acceptance.

---

# 135. ANTIGRAVITY IMPLEMENTATION RULE

Antigravity harus:

1. Membaca PRD sebagai source of truth.
2. Membuat implementation plan sebelum coding.
3. Tidak mengurangi requirement tanpa alasan teknis.
4. Tidak menambah fitur di luar scope.
5. Tidak mengganti architecture tanpa dokumentasi.
6. Tidak hard-code data kantor.
7. Tidak menyimpan password/secret di HTML.
8. Tidak menghapus audit trail.
9. Tidak menggunakan hard delete untuk Matter.
10. Membuat code modular.
11. Membuat reusable repository/services.
12. Membuat validation server-side.
13. Membuat automated tests.
14. Menjalankan regression setelah perubahan besar.
15. Memastikan app dapat di-install dari akun baru.

---

# 136. DEFINITION OF DONE — V1

V1 dianggap selesai hanya jika:

- setup dari akun Google baru berhasil;
- database otomatis dibuat;
- Office Profile dapat dikonfigurasi;
- logo dapat digunakan;
- user dapat dikelola;
- authentication bekerja;
- permission bekerja;
- matter dapat dibuat;
- matter dapat diedit;
- matter dapat dibatalkan tanpa kehilangan history;
- matter dapat di-restore;
- workflow bekerja;
- task bekerja;
- pending bekerja;
- deadline bekerja;
- follow-up bekerja;
- checklist bekerja;
- My Work bekerja;
- Owner Dashboard bekerja;
- Attention Required bekerja;
- Gmail notification bekerja;
- Daily Brief bekerja;
- Drive folder bekerja;
- Calendar bekerja;
- Reports bekerja;
- Activity Logs bekerja;
- Backup bekerja;
- responsive UI bekerja;
- tidak ada critical console/backend error;
- automated test critical flow lulus.

---

# 137. DEFINITION OF DONE — V1.5

V1.5 selesai jika:

- Approval bekerja;
- Revision bekerja;
- Document Version bekerja;
- Signing bekerja;
- Signing Readiness bekerja;
- PDF Generator bekerja;
- Task PDF bekerja;
- Checklist PDF bekerja;
- Matter Summary bekerja;
- Invoice bekerja;
- Payment bekerja;
- Receipt bekerja;
- Communication Log bekerja;
- Handover bekerja.

---

# 138. PRODUCTION SUCCESS METRICS

NOTARYGO™ dianggap memberikan value jika kantor dapat mencapai:

### Visibility

≥95% active matters memiliki:

- PIC;
- status;
- workflow;
- next action.

### Accountability

≥95% active tasks mempunyai assigned staff.

### Control

100% overdue matter muncul pada Attention Required.

### Pending

100% pending matter mempunyai reason dan pendingSince.

### Auditability

100% critical data changes mempunyai Activity Log.

### Staff Usage

Staff dapat mengetahui tugas hariannya dari My Work tanpa meminta daftar manual.

### Owner Usage

Owner dapat melihat masalah utama tanpa memeriksa seluruh perkara.

---

# 139. PRODUCT NORTH STAR

North Star NOTARYGO™ bukan:

**jumlah task dibuat.**

Bukan:

**jumlah user.**

Bukan:

**jumlah login.**

North Star:

> **Persentase perkara aktif yang memiliki ownership, status, next action, deadline, dan visibility yang lengkap serta tidak kehilangan kontrol operasional.**

---

# 140. FINAL PRODUCT LOGIC

NOTARYGO™ harus bekerja berdasarkan model:

```text
DATA
↓
VISIBILITY
↓
DETECT
↓
PRIORITIZE
↓
ASSIGN
↓
ACTION
↓
MONITOR
↓
ESCALATE
↓
COMPLETE
↓
ARCHIVE
↓
LEARN
```

---

# 141. FINAL PRODUCT POSITIONING

NOTARYGO™ tidak diposisikan sebagai:

> Aplikasi pencatatan perkara Notaris.

Tetapi sebagai:

> **Notary Office Operational Control System — sistem kerja terintegrasi yang membantu kantor Notaris & PPAT mengendalikan perkara, workflow, staff, deadline, dokumen, follow-up, signing, dan pembayaran tanpa membuat Owner menjadi pusat dari setiap pekerjaan.**

Core promise:

> **Kantor harus tetap terkontrol tanpa Owner harus mengawasi setiap detail.**

---

# 142. FINAL PRODUCT BOUNDARY

Jika fitur baru tidak membantu salah satu dari:

- Visibility;
- Accountability;
- Workflow;
- Deadline;
- Document Control;
- Client Service;
- Financial Control;
- Risk Detection;
- Escalation;
- Auditability;
- Operational Scalability;

maka fitur tersebut **tidak masuk core NOTARYGO™** tanpa validasi tambahan.

Tujuannya menjaga NOTARYGO™ tetap menjadi:

# OPERATING SYSTEM UNTUK KANTOR NOTARIS & PPAT

bukan kumpulan fitur yang tidak saling berhubungan.