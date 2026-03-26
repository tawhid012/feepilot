/**
 * WhatsApp Service Layer
 * Uses WhatsApp Web URL scheme for sending messages.
 * Ready for WhatsApp Business API integration.
 */

export interface WhatsAppMessage {
  phone: string;    // with country code, e.g. 919876543210
  message: string;
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned;
}

/**
 * Opens WhatsApp Web / App with pre-filled message.
 * This is the free tier approach — works without API keys.
 */
export function sendViaWhatsAppLink(params: WhatsAppMessage): string {
  const phone = normalizePhone(params.phone);
  const encoded = encodeURIComponent(params.message);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  return url;
}

/**
 * Send reminder via WhatsApp
 */
export function sendReminder(
  phone: string,
  message: string
): { url: string; sent: boolean } {
  const url = sendViaWhatsAppLink({ phone, message });
  // In production with WhatsApp Business API, this would make an API call
  // For now, we return the URL to open in a new tab
  return { url, sent: true };
}

/**
 * Send receipt via WhatsApp
 */
export function sendReceipt(
  phone: string,
  message: string
): { url: string; sent: boolean } {
  const url = sendViaWhatsAppLink({ phone, message });
  return { url, sent: true };
}

/**
 * Open WhatsApp with the message
 */
export function openWhatsApp(phone: string, message: string): void {
  const { url } = sendReminder(phone, message);
  window.open(url, '_blank');
}
