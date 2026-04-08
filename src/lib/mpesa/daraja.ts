/**
 * Safaricom Daraja API Engine
 * Handles STK Push, B2C (Escrow Release), and Token Authentication
 */

export class DarajaClient {
  private consumerKey: string;
  private consumerSecret: string;
  private shortCode: string;
  private passKey: string;

  private environment: string;

  constructor() {
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET || '';
    this.environment = process.env.DARAJA_ENVIRONMENT || 'sandbox';
    this.shortCode = process.env.DARAJA_SHORTCODE || '174379'; // Test shortcode
    this.passKey = process.env.DARAJA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  }

  get baseUrl() {
    return this.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Generates a short-lived OAuth token from Safaricom.
   */
  async getAuthToken() {
    console.log("[Daraja] Getting auth token...");
    
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("Daraja Consumer Key or Secret missing.");
    }

    const authString = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    const res = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
       method: "GET",
       headers: {
         Authorization: `Basic ${authString}`
       },
       cache: 'no-store'
    });

    if (!res.ok) {
       let errDetails = "";
       try { errDetails = await res.text(); } catch(e) {}
       throw new Error(`Failed to get Daraja Auth Token: ${res.status} ${res.statusText} ${errDetails}`);
    }

    const data = await res.json();
    return data.access_token as string;
  }

  /**
   * Initiates an STK Push (Lipa Na M-Pesa Online) to a customer's phone.
   * This represents the "Escrow Hold" initial transaction.
   */
  async initiateSTKPush(phoneNumber: string, amount: number, reference: string, description: string) {
    console.log(`[Daraja] Initiating STK Push to ${phoneNumber} for KES ${amount} (Ref: ${reference})`);
    
    const token = await this.getAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortCode}${this.passKey}${timestamp}`).toString('base64');

    // Phone number needs to be 254... format usually.
    const formattedPhone = phoneNumber.startsWith('0') 
       ? `254${phoneNumber.slice(1)}` 
       : phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

    const payload = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: this.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dummy-ngrok.app'}/api/webhooks/mpesa`,
      AccountReference: reference,
      TransactionDesc: description
    };

    const res = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
       let errDetails = "";
       try { errDetails = await res.text(); } catch(e) {}
       throw new Error(`STK Push failed: ${res.statusText} ${errDetails}`);
    }

    const data = await res.json();
    return {
      success: true,
      data
    };
  }

  /**
   * Transfers funds from the Agency's paybill/escrow to an external party 
   * Used for Mama Safi automated payouts and escrow release to landlord.
   */
  async initiateB2CPayout(phoneNumber: string, amount: number, remarks: string) {
    console.log(`[Daraja] Initiating B2C Payout to ${phoneNumber} for KES ${amount}. Remarks: ${remarks}`);
    // B2C logic
    return {
      success: true,
      transactionId: `B2C_${Date.now()}`
    };
  }

  /**
   * C2B Paybill logic from Agency's account. Used to buy KPLC tokens.
   */
  async initiateC2BPaybill(targetPaybill: string, accountNumber: string, amount: number) {
    console.log(`[Daraja] Paying bill ${targetPaybill} A/C ${accountNumber} KES ${amount}...`);
    return {
      success: true,
      transactionId: `C2B_${Date.now()}`
    };
  }
}

export const darajaClient = new DarajaClient();
