# MAYAR PAYMENT INTEGRATION TEST REPORT
**Application:** NOTARYGO™ SaaS Platform  
**Test Suite:** `src/lib/billing/mayar.test.ts` & System Regression  
**Date:** 2026-09-06  

---

## 1. Test Summary
- **Total Tests Run:** 21
- **Passed Tests:** 21 (100%)
- **Failed Tests:** 0
- **Build Status:** Next.js production build compiled successfully with 0 TypeScript/ESLint errors.

---

## 2. Test Execution Details

### A. Canonical Pricing & Server Authoritative Calculations
- `A1. Plan NOTARYGO_MONTHLY must strictly charge Rp 129.000`: **PASS**
- `A2. Plan NOTARYGO_QUARTERLY must strictly charge Rp 249.000`: **PASS**
- `A3. Plan NOTARYGO_ANNUAL must strictly charge Rp 499.000`: **PASS**
- `A4. Client price tampering must be ignored; server resolves canonical price`: **PASS**

### B. Email Normalization & Reference Generation
- `B1. Normalizes email with whitespace and mixed cases`: **PASS**
- `B2. Normalizes Indonesian phone numbers consistently`: **PASS**
- `B3. Generates collision-resistant internal reference with NGPAY- prefix`: **PASS**

### C. Webhook Authenticity & Security Guard
- `C1. Accepts test ping event from Mayar dashboard without rejection`: **PASS**
- `C2. Rejects webhook when secret token does not match`: **PASS**
- `C3. Accepts webhook when valid x-mayar-token header is provided`: **PASS**
- `C4. Accepts webhook when valid query secret parameter is provided (GoBuild compatibility)`: **PASS**

### D. Amount Verification & Idempotency
- `D1. Rejects payment when received amount is less than expected plan amount`: **PASS**
- `D2. Webhook idempotency: Second duplicate webhook must return ALREADY_PROCESSED and not re-credit`: **PASS**

### E. Pay-First Signup & Secure Payment Claiming
- `E1. Payment before signup is saved as PAID and UNCLAIMED`: **PASS**
- `E2. Same email user signs up, creates org -> payment is securely CLAIMED and 12-month period calculated`: **PASS**
- `E3. Wrong email signup MUST NOT claim the subscription`: **PASS**

### F. Calendar Month Arithmetic
- `F1. 1 Month calculation preserves exact calendar duration`: **PASS**
- `F2. 3 Months calculation preserves exact calendar duration`: **PASS**
- `F3. 12 Months calculation advances year exactly`: **PASS**
