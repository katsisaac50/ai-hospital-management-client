import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

export function DownloadInvoicePDF({ invoiceId }: { invoiceId: string }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/financial/bills/${invoiceId}/pdf`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to download PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF download failed:", error)
    }
  }

  return (
    <Button onClick={handleDownload} variant="outline">
      <Download className="w-4 h-4 mr-2" />
      Download PDF
    </Button>
  )
}
