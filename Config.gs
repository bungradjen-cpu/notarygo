/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Configuration & Canonical Schema Registry
 * Version: 2.0.0
 * Timezone: Asia/Jakarta
 */

var CONFIG = {
  APP_NAME: 'NOTARYGO™',
  TAGLINE: 'Notary Office Operational Control System',
  INTERNAL_TAGLINE: 'Kantor tetap terkontrol tanpa Owner harus mengawasi setiap detail.',
  VERSION: '2.0.0',
  SCHEMA_VERSION: '2.0.0',
  TIMEZONE: 'Asia/Jakarta',
  DEFAULT_LOCALE: 'id-ID',
  DEFAULT_CURRENCY: 'IDR',
  
  // Environments
  ENV_DEV: 'DEV',
  ENV_TEST: 'TEST',
  ENV_PROD: 'PRODUCTION',
  
  // Property Keys
  KEYS: {
    SPREADSHEET_ID: 'NOTARYGO_SPREADSHEET_ID',
    DRIVE_ROOT_ID: 'NOTARYGO_DRIVE_ROOT_ID',
    SCHEMA_VERSION: 'NOTARYGO_SCHEMA_VERSION',
    SYSTEM_INITIALIZED: 'NOTARYGO_SYSTEM_INITIALIZED',
    ENVIRONMENT: 'NOTARYGO_ENV',
    OWNER_EMAIL: 'NOTARYGO_OWNER_EMAIL',
    LAST_BACKUP_TIME: 'NOTARYGO_LAST_BACKUP_TIME',
    LAST_DAILY_BRIEF: 'NOTARYGO_LAST_DAILY_BRIEF'
  },
  
  // Operational Thresholds (Days)
  THRESHOLDS: {
    NO_ACTIVITY_WARNING_DAYS: 5,
    PENDING_WATCH_DAYS: 3,
    PENDING_WARNING_DAYS: 7,
    PENDING_CRITICAL_DAYS: 14,
    DEADLINE_WATCH_DAYS: 7,
    DEADLINE_WARNING_DAYS: 3,
    DEADLINE_CRITICAL_DAYS: 1,
    APPROVAL_WARNING_DAYS: 2,
    DAILY_BRIEF_HOUR: 7, // 07:30 WIB
    DAILY_BRIEF_MINUTE: 30
  },
  
  // Roles
  ROLES: {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    SUPERVISOR: 'SUPERVISOR',
    STAFF: 'STAFF',
    FINANCE: 'FINANCE'
  },
  
  // Statuses
  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED'
  },
  
  CLIENT_INTAKE_STATUS: {
    NEW: 'NEW',
    CONSULTATION: 'CONSULTATION',
    WAITING_DOCUMENT: 'WAITING_DOCUMENT',
    QUOTATION_SENT: 'QUOTATION_SENT',
    ACCEPTED: 'ACCEPTED',
    CONVERTED: 'CONVERTED',
    NOT_PROCEEDING: 'NOT_PROCEEDING'
  },
  
  MATTER_STATUS: {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    PENDING: 'PENDING',
    WAITING_APPROVAL: 'WAITING_APPROVAL',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    ARCHIVED: 'ARCHIVED'
  },
  
  CANCEL_REASONS: [
    'CLIENT_CANCELLED',
    'NOT_PROCEEDING',
    'DUPLICATE',
    'WRONG_INPUT',
    'MOVED_TO_OTHER_PROCESS',
    'OTHER'
  ],
  
  TASK_STATUS: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED'
  },
  
  TASK_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  },
  
  PENDING_REASON_CODES: [
    'CLIENT',
    'BANK',
    'DEVELOPER',
    'BPN',
    'TAX',
    'APPROVAL',
    'DOCUMENT',
    'SIGNATURE',
    'INTERNAL',
    'OTHER'
  ],
  
  FOLLOW_UP_METHOD: {
    WHATSAPP: 'WHATSAPP',
    PHONE: 'PHONE',
    EMAIL: 'EMAIL',
    MEETING: 'MEETING',
    OTHER: 'OTHER'
  },
  
  FOLLOW_UP_STATUS: {
    SCHEDULED: 'SCHEDULED',
    DONE: 'DONE',
    RESCHEDULED: 'RESCHEDULED',
    CANCELLED: 'CANCELLED'
  },
  
  CHECKLIST_STATUS: {
    MISSING: 'MISSING',
    RECEIVED: 'RECEIVED',
    NEED_REVISION: 'NEED_REVISION',
    VERIFIED: 'VERIFIED',
    NOT_APPLICABLE: 'NOT_APPLICABLE'
  },
  
  DOCUMENT_STATUS: {
    DRAFT: 'DRAFT',
    REVIEW: 'REVIEW',
    REVISION: 'REVISION',
    APPROVED: 'APPROVED',
    FINAL: 'FINAL',
    SIGNED: 'SIGNED',
    ARCHIVED: 'ARCHIVED'
  },
  
  APPROVAL_STATUS: {
    WAITING: 'WAITING',
    APPROVED: 'APPROVED',
    REVISION_REQUESTED: 'REVISION_REQUESTED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
  },
  
  SIGNING_STATUS: {
    DRAFT: 'DRAFT',
    SCHEDULED: 'SCHEDULED',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    RESCHEDULED: 'RESCHEDULED',
    CANCELLED: 'CANCELLED'
  },
  
  INVOICE_STATUS: {
    DRAFT: 'DRAFT',
    ISSUED: 'ISSUED',
    PARTIAL: 'PARTIAL',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED'
  },
  
  NOTIFICATION_STATUS: {
    QUEUED: 'QUEUED',
    PROCESSING: 'PROCESSING',
    SENT: 'SENT',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
  },
  
  ALERT_SEVERITY: {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
    WATCH: 'WATCH'
  },
  
  ALERT_STATUS: {
    ACTIVE: 'ACTIVE',
    RESOLVED: 'RESOLVED',
    DISMISSED: 'DISMISSED'
  },
  
  // ID Prefixes
  PREFIX: {
    USER: 'USR_',
    CLIENT: 'CLI_',
    INTAKE: 'INT_',
    ORG: 'ORG_',
    MATTER: 'MAT_',
    WORKFLOW: 'WF_',
    STEP: 'STP_',
    HISTORY: 'WFH_',
    TASK: 'TSK_',
    PENDING: 'PND_',
    FOLLOW_UP: 'FU_',
    CHECKLIST_TPL: 'CKT_',
    CHECKLIST_ITEM: 'CKI_',
    DOCUMENT: 'DOC_',
    APPROVAL: 'APR_',
    SIGNING: 'SIG_',
    COMMUNICATION: 'COM_',
    INVOICE: 'INV_',
    PAYMENT: 'PAY_',
    NOTIFICATION: 'NTF_',
    ALERT: 'ALT_',
    LOG: 'LOG_',
    BACKUP: 'BKP_'
  }
};

/**
 * Canonical Database Schema Registry
 * 27 Sheets with exact ordered headers
 */
var SCHEMA = {
  Config: [
    'key', 'value', 'description', 'updatedAt', 'updatedBy'
  ],
  Office: [
    'officeId', 'officeName', 'notaryName', 'notaryTitle', 'address', 'city', 'province',
    'postalCode', 'phone', 'whatsapp', 'email', 'website', 'logoFileId', 'footerText',
    'bankName', 'bankAccount', 'bankAccountName', 'invoicePrefix', 'matterPrefix', 'timezone',
    'updatedAt', 'updatedBy'
  ],
  Users: [
    'userId', 'email', 'name', 'role', 'phone', 'status', 'passwordHash', 'passwordSalt',
    'lastLoginAt', 'notificationPreferences', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'
  ],
  Clients: [
    'clientId', 'clientType', 'name', 'identifier', 'phone', 'email', 'address',
    'company', 'notes', 'status', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'
  ],
  ClientIntakes: [
    'intakeId', 'clientName', 'phone', 'email', 'serviceTypeId', 'organizationId',
    'description', 'status', 'quotationAmount', 'notes', 'convertedMatterId',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy'
  ],
  Organizations: [
    'organizationId', 'name', 'type', 'contactPerson', 'phone', 'email',
    'address', 'notes', 'status', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'
  ],
  ServiceTypes: [
    'serviceTypeId', 'code', 'name', 'category', 'description', 'defaultWorkflowId',
    'defaultChecklistTemplateId', 'defaultSlaDays', 'standardFee', 'active',
    'createdAt', 'updatedAt'
  ],
  WorkflowTemplates: [
    'workflowId', 'name', 'serviceTypeId', 'version', 'description', 'active',
    'createdAt', 'createdBy', 'updatedAt'
  ],
  WorkflowSteps: [
    'stepId', 'workflowId', 'stepOrder', 'stepCode', 'stepName', 'defaultPICRole',
    'defaultDeadlineDays', 'approvalRequired', 'sopReference', 'nextStepCode', 'status'
  ],
  Matters: [
    'matterId', 'matterNumber', 'clientId', 'clientNameSnapshot', 'serviceTypeId',
    'serviceTypeNameSnapshot', 'organizationId', 'title', 'description', 'priority',
    'assignedPIC', 'supervisor', 'currentWorkflowStep', 'matterStatus', 'deadline',
    'lastOperationalUpdate', 'pendingStatus', 'pendingReason', 'nextAction', 'driveFolderId',
    'financialStatus', 'isArchived', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt',
    'completedAt', 'cancelledAt', 'cancelledBy', 'cancellationReason', 'archivedAt',
    'archivedBy', 'archiveReason'
  ],
  WorkflowHistory: [
    'workflowHistoryId', 'matterId', 'fromStep', 'toStep', 'changedBy', 'changedAt',
    'note', 'durationPreviousStepHours', 'isOverride', 'requestId'
  ],
  Tasks: [
    'taskId', 'matterId', 'taskNumber', 'title', 'description', 'assignedTo',
    'assignedBy', 'priority', 'startDate', 'deadline', 'status', 'progress',
    'notes', 'createdAt', 'updatedAt', 'completedAt', 'completedBy'
  ],
  Pending: [
    'pendingId', 'matterId', 'reasonCode', 'reasonDetail', 'pendingSince',
    'expectedResumeDate', 'responsibleParty', 'PIC', 'nextFollowUp', 'status',
    'createdAt', 'resolvedAt', 'resolvedBy'
  ],
  FollowUps: [
    'followUpId', 'matterId', 'targetType', 'targetName', 'contact', 'method',
    'followUpDate', 'result', 'nextFollowUpDate', 'PIC', 'status', 'createdBy',
    'createdAt', 'updatedAt'
  ],
  ChecklistTemplates: [
    'templateId', 'serviceTypeId', 'name', 'itemsJson', 'createdAt', 'updatedAt'
  ],
  ChecklistItems: [
    'checklistItemId', 'matterId', 'documentType', 'required', 'status',
    'receivedDate', 'verifiedBy', 'verifiedAt', 'note', 'driveFileId', 'driveFileUrl'
  ],
  Documents: [
    'documentId', 'matterId', 'documentType', 'title', 'version', 'status',
    'driveFileId', 'driveUrl', 'generatedBy', 'generatedAt', 'visibility', 'notes'
  ],
  Approvals: [
    'approvalId', 'matterId', 'entityType', 'entityId', 'requestedBy',
    'reviewer', 'status', 'requestDate', 'reviewDate', 'comment'
  ],
  Signing: [
    'signingId', 'matterId', 'date', 'startTime', 'endTime', 'location',
    'participants', 'PIC', 'status', 'notes', 'googleCalendarEventId',
    'readinessStatus', 'createdAt', 'updatedAt'
  ],
  Communications: [
    'communicationId', 'matterId', 'party', 'channel', 'dateTime', 'summary',
    'nextAction', 'PIC', 'createdBy', 'createdAt'
  ],
  Invoices: [
    'invoiceId', 'invoiceNumber', 'matterId', 'clientId', 'invoiceDate', 'dueDate',
    'itemsJson', 'subtotal', 'discount', 'tax', 'total', 'paidAmount',
    'outstanding', 'status', 'notes', 'pdfFileId', 'createdBy', 'createdAt', 'updatedAt'
  ],
  Payments: [
    'paymentId', 'invoiceId', 'matterId', 'paymentDate', 'amount', 'method',
    'reference', 'receivedBy', 'receiptNumber', 'notes', 'createdAt', 'createdBy'
  ],
  Notifications: [
    'notificationId', 'recipientUserId', 'recipientEmail', 'type', 'entityType',
    'entityId', 'subject', 'payloadJson', 'scheduledAt', 'status', 'attemptCount',
    'sentAt', 'lastError', 'deduplicationKey', 'createdAt'
  ],
  Alerts: [
    'alertId', 'entityType', 'entityId', 'matterId', 'reason', 'severity',
    'status', 'generatedAt', 'assignedTo', 'resolvedAt', 'resolvedBy'
  ],
  ActivityLogs: [
    'logId', 'actorUserId', 'actorEmail', 'action', 'entityType', 'entityId',
    'beforeSnapshot', 'afterSnapshot', 'description', 'timestamp', 'requestId'
  ],
  Sequences: [
    'sequenceKey', 'prefix', 'currentNumber', 'paddingLength', 'year', 'updatedAt'
  ],
  Backups: [
    'backupId', 'fileId', 'fileName', 'status', 'fileSize', 'notes', 'createdAt', 'createdBy'
  ]
};
