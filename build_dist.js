const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const baseDir = __dirname;
const distDir = path.join(baseDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Ordered list of .gs files for dist/Code.gs bundling
const gsOrder = [
  'Config.gs',
  'Utils.gs',
  'Validation.gs',
  'Database.gs',
  'Repository.gs',
  'Security.gs',
  'Auth.gs',
  'Permissions.gs',
  'AuditService.gs',
  'Sequence.gs',
  'DriveService.gs',
  'MailService.gs',
  'CalendarService.gs',
  'PdfService.gs',
  'NotificationService.gs',
  'ChecklistService.gs',
  'PendingService.gs',
  'FollowUpService.gs',
  'TaskService.gs',
  'ApprovalService.gs',
  'SigningService.gs',
  'BillingService.gs',
  'ClientService.gs',
  'OrganizationService.gs',
  'WorkflowService.gs',
  'MatterService.gs',
  'UserService.gs',
  'OfficeService.gs',
  'ReportService.gs',
  'AlertService.gs',
  'BackupService.gs',
  'Migration.gs',
  'HealthService.gs',
  'Bootstrap.gs',
  'Code.gs',
  'Tests.gs'
];

let unifiedCodeGs = '// ==========================================================================\n' +
  '// NOTARYGO™ — Unified Production Backend Bundle (Google Apps Script)\n' +
  '// Auto-generated at: ' + new Date().toISOString() + '\n' +
  '// ==========================================================================\n\n';

for (const f of gsOrder) {
  const filePath = path.join(baseDir, f);
  if (fs.existsSync(filePath)) {
    unifiedCodeGs += `\n// --- BEGIN ${f} ---\n`;
    unifiedCodeGs += fs.readFileSync(filePath, 'utf8');
    unifiedCodeGs += `\n// --- END ${f} ---\n`;
  } else {
    console.error(`Missing file: ${f}`);
  }
}

fs.writeFileSync(path.join(distDir, 'Code.gs'), unifiedCodeGs, 'utf8');
console.log('✅ Generated dist/Code.gs (' + unifiedCodeGs.length + ' bytes)');

// 2. Inline HTML includes for dist/Index.html
let indexHtml = fs.readFileSync(path.join(baseDir, 'Index.html'), 'utf8');
const htmlIncludes = ['Styles', 'Components', 'App', 'Scripts'];

for (const inc of htmlIncludes) {
  const incPath = path.join(baseDir, `${inc}.html`);
  if (fs.existsSync(incPath)) {
    const content = fs.readFileSync(incPath, 'utf8');
    const regex = new RegExp(`<\\?!=?\\s*include\\(['"]${inc}['"]\\);?\\s*\\?>`, 'g');
    indexHtml = indexHtml.replace(regex, content);
  }
}

fs.writeFileSync(path.join(distDir, 'Index.html'), indexHtml, 'utf8');
console.log('✅ Generated dist/Index.html (' + indexHtml.length + ' bytes)');

// Copy appsscript.json
fs.copyFileSync(path.join(baseDir, 'appsscript.json'), path.join(distDir, 'appsscript.json'));
console.log('✅ Copied dist/appsscript.json');

// 3. Automated Test Verification via Node.js VM
console.log('\n======================================================');
console.log('RUNNING NOTARYGO™ AUTOMATED TEST SUITE IN NODE.JS VM');
console.log('======================================================');

// Setup mock Google Apps Script environment for Node.js
const mockProperties = {};
const mockEnvironment = {
  console: console,
  require: require,
  Buffer: Buffer,
  crypto: crypto,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Session: {
    getActiveUser: () => ({ getEmail: () => 'notaris.utama@kantornotaris.com' }),
    getEffectiveUser: () => ({ getEmail: () => 'notaris.utama@kantornotaris.com' })
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => mockProperties[k] || null,
      setProperty: (k, v) => { mockProperties[k] = String(v); },
      getProperties: () => ({ ...mockProperties }),
      setProperties: (props) => { Object.assign(mockProperties, props); },
      deleteProperty: (k) => { delete mockProperties[k]; }
    })
  },
  Utilities: {
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' },
    computeDigest: (alg, val) => {
      return Array.from(crypto.createHash('sha256').update(val).digest());
    },
    formatDate: (date, tz, fmt) => {
      return date.toISOString().substring(0, 10);
    }
  },
  DriveApp: {
    getRootFolder: () => ({
      createFolder: (name) => ({
        getId: () => 'MOCK_FOLDER_' + name,
        getName: () => name,
        createFolder: (n) => ({ getId: () => 'MOCK_SUB_' + n, getName: () => n }),
        createFile: (n, c) => ({ getId: () => 'MOCK_FILE_' + n, getUrl: () => 'https://drive.google.com/mock' })
      })
    }),
    getFolderById: (id) => ({
      getId: () => id,
      getName: () => 'MockFolder',
      createFolder: (n) => ({ getId: () => 'MOCK_SUB_' + n }),
      createFile: (n, c) => ({ getId: () => 'MOCK_FILE_' + n, getUrl: () => 'https://drive.google.com/mock' })
    }),
    getFileById: (id) => ({
      getId: () => id,
      getName: () => 'MockFile',
      getUrl: () => 'https://drive.google.com/mock'
    })
  },
  SpreadsheetApp: {},
  MailApp: {
    sendEmail: (opts) => {}
  },
  CalendarApp: {
    getDefaultCalendar: () => ({
      createEvent: (title, start, end, opts) => ({ getId: () => 'MOCK_CAL_EVENT' })
    })
  },
  ScriptApp: {
    newTrigger: () => ({
      timeBased: () => ({
        everyMinutes: () => ({ create: () => {} }),
        atHour: () => ({ everyDays: () => ({ create: () => {} }) }),
        onWeekDay: () => ({ atHour: () => ({ create: () => {} }) })
      })
    }),
    getProjectTriggers: () => []
  },
  HtmlService: {
    createTemplateFromFile: () => ({
      evaluate: () => ({
        getContent: () => '<html>Mock Template</html>'
      })
    })
  }
};

const context = vm.createContext(mockEnvironment);

try {
  vm.runInContext(unifiedCodeGs, context);
  const testResults = context.Tests.runAllTests();
  console.log('\nTest Results:');
  console.log('Passed:', testResults.passed);
  console.log('Failed:', testResults.failed);
  console.log('Duration:', testResults.executionTimeMs + 'ms');

  for (const r of (testResults.details || [])) {
    console.log(`[${r.status === 'PASSED' ? 'PASS' : 'FAIL'}] ${r.name}`);
    if (r.status !== 'PASSED') {
      console.error(`  Error: ${r.error}`);
    }
  }

  if (testResults.failed > 0) {
    console.error(`\n❌ ${testResults.failed} tests failed!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${testResults.passed} TESTS PASSED SUCCESSFULLY!`);
  }
} catch (err) {
  console.error('Fatal error executing tests in VM:', err);
  process.exit(1);
}
