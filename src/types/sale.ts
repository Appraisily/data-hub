export interface Sale {
  sessionId: string;
  chargeId: string;
  stripeCustomerId: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  date: string;
}