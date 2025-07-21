// components/delete-confirmation-modal.tsx
"use client"

import { Dialog } from "@headlessui/react"
import { Button } from "@/components/ui/button"

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, medication }) {
  if (!isOpen || !medication) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" />
      <Dialog.Panel className="bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-600 text-white z-50">
        <Dialog.Title className="text-lg font-semibold mb-4">
          Delete Medication
        </Dialog.Title>
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete <span className="font-bold">{medication.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-slate-500 text-slate-300">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(medication._id)
              onClose()
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
