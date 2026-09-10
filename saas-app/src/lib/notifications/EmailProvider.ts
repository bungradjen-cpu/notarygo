export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export abstract class EmailProvider {
  abstract sendEmail(payload: EmailPayload): Promise<boolean>;
}

export class ResendAdapter extends EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;

    // Development fallback
    if (!apiKey || process.env.NODE_ENV !== 'production') {
      console.log(`[MOCK EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
      console.log(`[MOCK EMAIL HTML]:\n${payload.html}`);
      return true;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'NotaryGo <notifications@notarygo.com>',
          to: payload.to,
          subject: payload.subject,
          html: payload.html
        })
      });

      if (!response.ok) {
        console.error("Failed to send email via Resend:", await response.text());
        return false;
      }
      return true;
    } catch (e) {
      console.error("ResendAdapter exception:", e);
      return false;
    }
  }
}

// Global instance
export const emailProvider = new ResendAdapter();
