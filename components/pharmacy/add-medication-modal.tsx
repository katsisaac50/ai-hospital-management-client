import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import toast from 'react-hot-toast';
import { authFetch } from "@/lib/api"
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function AddMedicationModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: '',
    strength: '',
    unit: 'mg',
    dosageForm: 'tablet',
    category: 'other',
    quantity: '',
    price: '',
    expiryDate: '',
  })
  const modalRef = useRef(null);

  // Close on outside click
    useEffect(() => {
      function handleClickOutside(event) {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to add medication')
        const json = await res.json();
      const data = json?.data || [];
        console.log(data)
    //     toast({
    //   title: "Medication added",
    //   description: `${data.name} has been added.`,
    // });
    toast.success(`${data.name} has been added.`);
      onClose()
    } catch (err) {
      console.log(err)
      toast.error("Medication save failed.");
    //   toast({
    //   title: "Error",
    //   description: "Failed to add patient",
    //   variant: "destructive",
    // });
  
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <Input name="strength" placeholder="Strength" value={form.strength} onChange={handleChange} />
          <Input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
          <Input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
          <Input name="expiryDate" type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={handleChange} />
          <Select value={form.unit} onValueChange={(val) => setForm({ ...form, unit: val })}>
            <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
            <SelectContent>
              {['mg', 'ml', 'IU', 'g', 'mcg'].map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.dosageForm} onValueChange={(val) => setForm({ ...form, dosageForm: val })}>
            <SelectTrigger><SelectValue placeholder="Dosage Form" /></SelectTrigger>
            <SelectContent>
              {['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops'].map(form => <SelectItem key={form} value={form}>{form}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {['antibiotic', 'analgesic', 'antihistamine', 'antacid', 'other'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
