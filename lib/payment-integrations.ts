// Stripe Integration
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret: string
}

export interface PaymentMethod {
  id: string
  type: "card" | "bank_account" | "insurance"
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
}

export const paymentService = {
  async createPaymentIntent(amount: number, currency = "usd", metadata: any = {}) {
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      return (await response.json()) as PaymentIntent
    } catch (error) {
      console.error("Payment Intent Error:", error)
      throw error
    }
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    try {
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to confirm payment")
      }

      return await response.json()
    } catch (error) {
      console.error("Payment Confirmation Error:", error)
      throw error
    }
  },

  async processInsuranceClaim(claimData: any) {
    try {
      const response = await fetch("/api/insurance/submit-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit insurance claim")
      }

      return await response.json()
    } catch (error) {
      console.error("Insurance Claim Error:", error)
      throw error
    }
  },

  async getPaymentMethods(customerId: string) {
    try {
      const response = await fetch(`/api/payments/methods/${customerId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      return (await response.json()) as PaymentMethod[]
    } catch (error) {
      console.error("Payment Methods Error:", error)
      throw error
    }
  },
}
