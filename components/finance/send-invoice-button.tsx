import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { authFetch } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [sending, setSending] = useState(false)

  const handleSendInvoice = async () => {
    console.log('sending', invoiceId)
    try {
      setSending(true)
      const res = await authFetch(`${API_URL}/v1/financial/bills/${invoiceId}/send`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error("Failed to send invoice")
      const data = await res.json()

      toast({
        title: "Success",
        description: data.message || "Invoice sent successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Sending failed",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleSendInvoice}
      disabled={sending}
      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
    >
      {sending ? "Sending..." : "Send Invoice"}
    </Button>
  )
}
