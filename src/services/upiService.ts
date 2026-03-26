/**
 * UPI Payment Service
 * Generates real UPI deep links for payment collection
 */

export interface UPIPaymentParams {
  payeeVPA: string;       // UPI ID (e.g., tutor@upi)
  payeeName: string;      // Name displayed on payment screen
  amount: number;         // Amount in INR
  transactionNote?: string;
  transactionRef?: string;
  currency?: string;
}

export function generateUPILink(params: UPIPaymentParams): string {
  const {
    payeeVPA,
    payeeName,
    amount,
    transactionNote = 'Fee Payment',
    transactionRef,
    currency = 'INR',
  } = params;

  const url = new URL('upi://pay');
  url.searchParams.set('pa', payeeVPA);
  url.searchParams.set('pn', payeeName);
  url.searchParams.set('am', amount.toFixed(2));
  url.searchParams.set('cu', currency);
  url.searchParams.set('tn', transactionNote);
  
  if (transactionRef) {
    url.searchParams.set('tr', transactionRef);
  }

  return url.toString();
}

export function generatePaymentMessage(
  studentName: string,
  amount: number,
  upiLink: string,
  tutorName: string
): string {
  return [
    `Hi! This is a fee reminder from *${tutorName}*.`,
    ``,
    `Student: *${studentName}*`,
    `Amount Due: *₹${amount.toLocaleString('en-IN')}*`,
    ``,
    `Pay securely via UPI:`,
    upiLink,
    ``,
    `Thank you! 🙏`,
  ].join('\n');
}

export function generateReceiptMessage(
  studentName: string,
  amount: number,
  month: string,
  tutorName: string
): string {
  return [
    `✅ *Payment Received*`,
    ``,
    `Student: *${studentName}*`,
    `Amount: *₹${amount.toLocaleString('en-IN')}*`,
    `Month: *${month}*`,
    `Received by: *${tutorName}*`,
    ``,
    `Thank you for the payment! 🎉`,
  ].join('\n');
}
