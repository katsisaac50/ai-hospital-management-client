"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { authFetch } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Patient {
  id: string
  name: string
  patientId: string
  insurance: string
}

interface Service {
  id: string
  _id: string
  name: string
  price: number
  code: string
}

interface SelectedService extends Service {
  quantity: number
}

export function NewInvoiceModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [formData, setFormData] = useState({
    patientId: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    insurance: "",
    notes: "",
    tax: 0,
    discount: 0,
  })

  useEffect(() => {
    if (open) fetchData()
  }, [open])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsRes, servicesRes] = await Promise.all([
        authFetch(`${API_URL}/v1/patients`),
        authFetch(`${API_URL}/v1/services`)
      ])
      const patientsData = await patientsRes.json()
      const servicesData = await servicesRes.json()
      setPatients(patientsData.data || [])
      setServices(servicesData.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setFormData({ ...formData, patientId, insurance: patient?.insurance || "" })
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId)
    if (!service) return
    const exists = selectedServices.find(s => s._id === service._id)
    if (exists) {
      setSelectedServices(selectedServices.map(s =>
        s._id === service._id ? { ...s, quantity: s.quantity + 1 } : s
      ))
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }])
    }
  }

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s._id !== serviceId))
  }

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return removeService(serviceId)
    setSelectedServices(selectedServices.map(s =>
      s._id === serviceId ? { ...s, quantity } : s
    ))
  }

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + Number(formData.tax || 0) - Number(formData.discount || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (!formData.patientId) throw new Error("Please select a patient")
      if (selectedServices.length === 0) throw new Error("Please add at least one service")

      const invoiceData = {
        patient: formData.patientId,
        date: formData.date,
        dueDate: formData.dueDate,
        tax: Number(formData.tax),
        discount: Number(formData.discount),
        status: "draft",
        notes: formData.notes,
        insurance: formData.insurance,  
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        items: selectedServices.map(s => ({
          serviceId: s._id,
          description: s.name,
          quantity: s.quantity,
          unitPrice: s.price,
          amount: s.price * s.quantity,
        })),
      }

      const response = await authFetch(`${API_URL}/v1/financial/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) throw new Error("Failed to create invoice")

      toast({ title: "Success", description: "Invoice created successfully" })
      setFormData({ patientId: "", date: new Date().toISOString().split('T')[0], dueDate: "", insurance: "", notes: "", tax: 0, discount: 0 })
      setSelectedServices([])
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Submission failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient & Insurance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select value={formData.patientId} onValueChange={handlePatientChange} required disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.patientId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance *</Label>
              <Input id="insurance" value={formData.insurance} onChange={e => setFormData({ ...formData, insurance: e.target.value })} required disabled={loading} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date *</Label>
              <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required disabled={loading} min={formData.date} />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Services *</Label>
            <Select onValueChange={handleServiceChange} disabled={loading || services.length === 0}>
              <SelectTrigger><SelectValue placeholder={services.length === 0 ? "No services available" : "Add service"} /></SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s._id} value={s._id}>{s.name} (${s.price})</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedServices.length > 0 && (
              <div className="border rounded-md p-4 space-y-3">
                {selectedServices.map(s => (
                  <div key={s._id} className="flex flex-col gap-2 p-2 border rounded">
                    <div className="flex justify-between items-center">
                      <div><span className="font-medium">{s.name}</span> <span className="text-sm text-muted-foreground ml-2">({s.code})</span></div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeService(s._id)} disabled={loading}><X className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">${s.price} each</div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => updateServiceQuantity(s._id, s.quantity - 1)} disabled={loading || s.quantity <= 1}>-</Button>
                        <Input type="number" min="1" value={s.quantity} onChange={(e) => updateServiceQuantity(s._id, parseInt(e.target.value) || 1)} className="w-16 text-center" disabled={loading} />
                        <Button type="button" variant="outline" size="sm" onClick={() => updateServiceQuantity(s._id, s.quantity + 1)} disabled={loading}>+</Button>
                      </div>
                      <div className="font-medium">${(s.price * s.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                <div className="font-semibold pt-2 border-t text-right">Subtotal: ${calculateSubtotal().toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} disabled={loading} placeholder="Additional notes about this invoice..." />
          </div>

          {/* Tax & Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })} placeholder="0" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} placeholder="0" disabled={loading} />
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t text-right text-sm space-y-1">
            <div>Subtotal: ${calculateSubtotal().toFixed(2)}</div>
            <div>Tax: ${formData.tax.toFixed(2)}</div>
            <div>Discount: -${formData.discount.toFixed(2)}</div>
            <div className="font-semibold text-lg">Total: ${calculateTotal().toFixed(2)}</div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-purple-500" disabled={loading || !formData.patientId || selectedServices.length === 0}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
