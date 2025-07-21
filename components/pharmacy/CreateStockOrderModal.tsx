"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
// import { offlineManager } from "@/lib/offline-manager"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

export default function CreateStockOrderModal({ open, onClose }) {
  const [form, setForm] = useState({
    medicationName: "",
    quantity: "",
    supplier: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const medicationName = form.medicationName.trim()
    const quantity = Number(form.quantity)
    const supplier = form.supplier.trim()

    if (!medicationName || !quantity || quantity <= 0) {
      toast.error("Medication name and positive quantity are required")
      setLoading(false)
      return
    }

    const payload = { medicationName, quantity, supplier, status: "pending" }

    try {
      // if (!navigator.onLine) {
      //   await offlineManager.create("stock_orders", payload)
      //   toast.success("Queued for sync (offline mode)")
      //   onClose()
      //   setLoading(false)
      //   return
      // }

      const res = await fetch(`${API_URL}/v1/stock-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()
console.log("stock ordered")
      toast.success("Stock order saved online")
      onClose()
    } catch {
      toast.error("Failed to create stock order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Stock Order</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            name="medicationName"
            placeholder="Medication Name"
            value={form.medicationName}
            onChange={handleChange}
            disabled={loading}
          />
          <Input
            name="quantity"
            placeholder="Quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            disabled={loading}
            min={1}
          />
          <Input
            name="supplier"
            placeholder="Supplier"
            value={form.supplier}
            onChange={handleChange}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
