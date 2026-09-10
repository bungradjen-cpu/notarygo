# MAYAR ENVIRONMENT SETUP GUIDE
**Target System:** NOTARYGO™ SaaS Platform  

---

## 1. Environment Variables Overview

Add the following variables to `.env.local` (for local development) and in your deployment dashboard (e.g. Vercel Project Environment Variables):

```bash
# ==========================================
# Mayar Payment Gateway Configuration
# ==========================================
MAYAR_API_KEY="pk_live_xxxx" # atau "sb-xxxx" untuk Sandbox
MAYAR_WEBHOOK_SECRET="d45be30ea39099e9396606338a6837949c19968f5d3ae11f82dde9250242e83e"
MAYAR_ENVIRONMENT="production" # "sandbox" | "production"
MAYAR_API_BASE_URL="https://api.mayar.id" # Opsional, otomatis terdeteksi jika kosong

# Public Direct Plan URLs (Fallback Links)
NEXT_PUBLIC_MAYAR_MAIN_URL="https://notarygo.myr.id/m/notarygotm"
NEXT_PUBLIC_MAYAR_PLAN_MONTHLY_URL="https://notarygo.myr.id/pl/notarygo-akses-1-bulan"
NEXT_PUBLIC_MAYAR_PLAN_QUARTERLY_URL="https://notarygo.myr.id/pl/notarygo-akses-3-bulan"
NEXT_PUBLIC_MAYAR_PLAN_ANNUAL_URL="https://notarygo.myr.id/pl/notarygo-akses-1-tahun"
```

---

## 2. Sandbox vs Production Configuration

| Environment | MAYAR_ENVIRONMENT | API Base URL | Dashboard Portal |
| :--- | :--- | :--- | :--- |
| **Sandbox (Uji Coba)** | `sandbox` | `https://api.mayar.club` | [https://mayar.club](https://mayar.club) |
| **Production (Live)** | `production` | `https://api.mayar.id` | [https://mayar.id](https://mayar.id) |

---

## 3. Obtaining Credentials from Mayar Dashboard
1. Login to your Mayar Dashboard ([mayar.id](https://mayar.id) or [mayar.club](https://mayar.club)).
2. Navigate to **Integrasi / API Keys**.
3. Copy the **API Key** (e.g., `pk_live_...` or `sb-...`) and paste into `MAYAR_API_KEY`.
4. Copy or generate the **Webhook Secret Key** and paste into `MAYAR_WEBHOOK_SECRET`.
5. Ensure `NEXT_PUBLIC_APP_URL` points to your public URL (e.g., `https://notarygo-iota.vercel.app`).
