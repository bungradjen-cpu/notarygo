import '@testing-library/jest-dom';

// Provide default test environment variables so env.ts validation passes cleanly during test runs
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmpbdixkiaztgzzfmlfp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test_anon_key_valid_mock_string';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_service_key_valid_mock_string';
process.env.MAYAR_API_KEY = process.env.MAYAR_API_KEY || 'sandbox_test_key_123';
process.env.MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET || 'test_webhook_secret_12345';
