import { test, expect, request } from '@playwright/test';
import crypto from 'crypto';

// NOTE: This test interacts with the local Webhook API to simulate Mayar Events.
// It verifies the backend idempotency and subscription state transitions.

test.describe('Production Subscription Billing (Mayar.id)', () => {

  const generateSignature = (payload: string) => {
    // Uses the default test secret for sandbox if not specified
    const secret = process.env.MAYAR_WEBHOOK_SECRET || 'test_secret';
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  };

  test('Simulate Mayar Payment Success Webhook', async ({ request }) => {
    // 1. Construct Mock Webhook Payload for Payment Success
    const eventId = `evt_test_${Date.now()}`;
    const payloadObj = {
      id: eventId,
      event: 'PAYMENT_SUCCESS',
      is_subscription: true,
      product_id: 'prod_mayar_demo_pro',
      subscription_id: `sub_mayar_${Date.now()}`,
      metadata: {
        org_id: '1' // Assuming test Org ID 1
      }
    };
    
    const payload = JSON.stringify(payloadObj);
    const signature = generateSignature(payload);

    // 2. Fire the Webhook to the local route
    const response = await request.post('/api/webhooks/mayar', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-Mayar-Signature': signature
      }
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.received).toBe(true);

    // 3. Test Idempotency (Fire exact same webhook again)
    const duplicateResponse = await request.post('/api/webhooks/mayar', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-Mayar-Signature': signature
      }
    });

    expect(duplicateResponse.ok()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult.cached).toBe(true); // Should return cached/true without processing

    // 4. Test Invalid Signature
    const invalidResponse = await request.post('/api/webhooks/mayar', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-Mayar-Signature': 'invalid_signature_hash'
      }
    });

    expect(invalidResponse.status()).toBe(401);
  });
  
  test('Simulate Mayar Subscription Cancelled Webhook', async ({ request }) => {
    const payloadObj = {
      id: `evt_test_cancel_${Date.now()}`,
      event: 'SUBSCRIPTION_CANCELLED',
      subscription_id: `sub_mayar_123`
    };
    
    const payload = JSON.stringify(payloadObj);
    const signature = generateSignature(payload);

    const response = await request.post('/api/webhooks/mayar', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'X-Mayar-Signature': signature
      }
    });

    expect(response.ok()).toBeTruthy();
  });
});
