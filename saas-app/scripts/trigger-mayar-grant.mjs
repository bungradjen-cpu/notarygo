async function triggerActivation() {
  const payload = {
    event: "payment.received",
    data: {
      id: `manual-grant-${Date.now()}`,
      customer: {
        name: "Dr. Santo Anggles, S.H., M.Kn.",
        email: "kantornotarissantoanggles@gmail.com",
      },
      customerEmail: "kantornotarissantoanggles@gmail.com",
      customer_email: "kantornotarissantoanggles@gmail.com",
      amount: 129000,
      payment_method: "manual_grant",
      status: "PAID",
    },
  };

  console.log("Triggering Webhook on Production: https://notarygo-iota.vercel.app/api/webhooks/mayar");
  const res = await fetch("https://notarygo-iota.vercel.app/api/webhooks/mayar", {
    method: "POST",
    headers: {
      "Content-yype": "application/json",
      "x-mayar-event": "payment.received",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}

triggerActivation().catch(console.error);
