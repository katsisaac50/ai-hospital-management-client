"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ReorderModal({ isOpen, onClose, onConfirm, medication }) {
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && medication) {
      setQuantity(1)
      setError("")
    }
  }, [isOpen, medication])

  const handleSubmit = () => {
    const maxAllowed = medication?.maxStock - medication?.quantity

    if (!quantity || quantity < 1) {
      setError("Please enter a valid quantity.")
      return
    }

    if (maxAllowed > 0 && quantity > maxAllowed) {
      setError(`Cannot exceed max stock limit. You can add up to ${maxAllowed}.`)
      return
    }

    onConfirm(quantity)
    onClose()
    setQuantity(1)
    setError("")
  }

  if (!isOpen || !medication) return null

  const maxAllowed = medication.maxStock - medication.quantity

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <Dialog.Panel className="bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-600 text-white z-50">
        <Dialog.Title className="text-lg font-semibold mb-4">
          Reorder: {medication.name}
        </Dialog.Title>

        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Current stock: <span className="text-white font-semibold">{medication.quantity}</span><br />
            Max stock: <span className="text-white font-semibold">{medication.maxStock}</span>
          </p>

          <label className="block text-sm text-slate-400">Quantity to reorder:</label>
          <Input
            type="number"
            min="1"
            value={quantity || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              setQuantity(isNaN(val) ? "" : val)
              setError("")
            }}
            className="bg-slate-700 border-slate-600 text-white"
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-slate-500 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
            Confirm
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
