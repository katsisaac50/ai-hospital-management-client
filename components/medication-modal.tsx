// components/medication-modal.tsx



"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

const defaultForm = {name: "",
    strength: "",
    unit: "mg",
    form: "tablet",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    price: "",
    minStock: "",
    maxStock: "",
    category: "antibiotic",
    location: "",
  }

export default function MedicationModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({ ...defaultForm, ...initialData })
    } else {
      setForm(defaultForm)
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = "Name is required"
    if (!form.strength) newErrors.strength = "Strength is required"
    if (!form.expiryDate) newErrors.expiryDate = "Expiry date is required"
    if (form.quantity < 0) newErrors.quantity = "Quantity cannot be negative"
    if (form.price < 0) newErrors.price = "Price cannot be negative"
    if (form.minStock < 0) newErrors.minStock = "Minimum stock cannot be negative"
    if (form.maxStock < 0) newErrors.maxStock = "Maximum stock cannot be negative"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return toast.error("Please fix the form errors")
    try {
      await onSave(form)
      
      if(!isOpen){
        toast.success(`Medication ${initialData ? "updated" : "added"} successfully`)
        onClose()
      }   
    } catch (err) {
      toast.error("Failed to save medication")
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/40">
        <Dialog.Panel className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-600 w-full max-w-xl space-y-4">
          <Dialog.Title className="text-xl text-white font-bold">{initialData ? "Edit Medication" : "Add Medication"}</Dialog.Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
            <Input name="strength" value={form.strength} onChange={handleChange} placeholder="Strength (e.g. 500mg)" />
            {/* <Input name="unit" value={form.unit} onChange={handleChange} placeholder="Unit (mg/ml)" />
            <Input name="dosageForm" value={form.form} onChange={handleChange} placeholder="Form (tablet/capsule)" /> */}
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-500 rounded-md px-3 py-2"
            >
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="IU">IU</option>
              <option value="g">g</option>
              <option value="mcg">mcg</option>
            </select>

            <select
              name="form"
              value={form.form}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-500 rounded-md px-3 py-2"
            >
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="ointment">Ointment</option>
              <option value="drops">Drops</option>
            </select>
            <Input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
            <Input name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="Batch #" />
            <Input name="expiryDate" value={form.expiryDate} onChange={handleChange} type="date" />
            <Input name="quantity" value={form.quantity} onChange={handleChange} type="number" placeholder="Quantity" />
            <Input name="price" value={form.price} onChange={handleChange} type="number" placeholder="Price" />
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Storage Location" />
            {/* <Input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g. antibiotic)" /> */}
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-500 rounded-md px-3 py-2"
            >
              <option value="antibiotic">Antibiotic</option>
              <option value="analgesic">Analgesic</option>
              <option value="antipyretic">Antipyretic</option>
              <option value="antidiabetic">Antidiabetic</option>
              <option value="antihypertensive">Antihypertensive</option>
              <option value="PPI">PPI</option>
              <option value="ACE Inhibitor">ACE Inhibitor</option>
              <option value="antacid">Antacid</option>
              <option value="antihistamine">Antihistamine</option>
              <option value="other">Other</option>
            </select>
            <Input
  placeholder="Minimum Stock"
  type="number"
  name="minStock"
  value={form.minStock}
  onChange={handleChange}
/>

<Input
  placeholder="Maximum Stock"
  type="number"
  name="maxStock"
  value={form.maxStock}
  onChange={handleChange}
/>

          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-cyan-500" onClick={handleSubmit}>
              {initialData ? "Update" : "Add"}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}







// "use client"

// import { Dialog } from "@headlessui/react"
// import { useState } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export default function MedicationModal({ open, onClose, onSubmit, initialData = {}, isEdit = false }) {
//   const [form, setForm] = useState(initialData)

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async () => {
//     await onSubmit(form)
//     onClose()
//   }

//   return (
//     <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4">
//         <Dialog.Panel className="bg-slate-800 border border-slate-600 text-white p-6 rounded-xl w-full max-w-lg shadow-xl backdrop-blur-sm">
//           <Dialog.Title className="text-lg font-bold mb-4">
//             {isEdit ? "Edit Medication" : "Add Medication"}
//           </Dialog.Title>

//           <div className="space-y-4">
//             <Input
//               name="name"
//               placeholder="Medication name"
//               value={form?.name || ""}
//               onChange={handleChange}
//             />
//             <Input
//               name="strength"
//               placeholder="Strength (e.g. 500mg)"
//               value={form?.strength || ""}
//               onChange={handleChange}
//             />
//             <Input
//               name="quantity"
//               type="number"
//               placeholder="Quantity"
//               value={form?.quantity || ""}
//               onChange={handleChange}
//             />
//             <Input
//               name="price"
//               type="number"
//               placeholder="Price per unit"
//               value={form?.price || ""}
//               onChange={handleChange}
//             />
//             <Input
//               name="expiryDate"
//               type="date"
//               placeholder="Expiry date"
//               value={form?.expiryDate?.slice(0, 10) || ""}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="mt-6 flex justify-end gap-2">
//             <Button onClick={onClose} variant="outline" className="text-slate-300 border-slate-600">Cancel</Button>
//             <Button onClick={handleSubmit} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
//               {isEdit ? "Update" : "Add"}
//             </Button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   )
// }
