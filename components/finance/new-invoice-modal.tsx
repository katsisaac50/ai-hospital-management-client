"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, FileText, Pill } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface Prescription {
  _id: string
  prescriptionId: string
  status: string
  medications: Array<{
    medication: string
    name: string
    dosage: string
    frequency: string
    duration: string
    cost: number
  }>
  totalCost: number
  createdAt: string
}

interface SelectedService extends Service {
  quantity: number
  type: 'service' | 'prescription'
  prescriptionId?: string
}

export function NewInvoiceModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [activeTab, setActiveTab] = useState("services")
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
  };

  const fetchPatientPrescriptions = async (patientId: string) => {
    try {
      setLoading(true)
      const response = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/patient/${patientId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.data || [])
      } else {
        setPrescriptions([])
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  };
  {console.log('prescription', prescriptions)}

  const handlePatientChange = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setFormData({ ...formData, patientId, insurance: patient?.insurance || "" })
    
    // Fetch prescriptions for this patient
    if (patientId) {
      await fetchPatientPrescriptions(patientId)
    } else {
      setPrescriptions([])
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId)
    if (!service) return
    
    const exists = selectedServices.find(s => s._id === service._id && s.type === 'service')
    if (exists) {
      setSelectedServices(selectedServices.map(s =>
        s._id === service._id ? { ...s, quantity: s.quantity + 1 } : s
      ))
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1, type: 'service' }])
    }
  }

  const handlePrescriptionAdd = (prescription: Prescription) => {
    // Check if this prescription is already added
    const exists = selectedServices.find(s => s.prescriptionId === prescription._id)
    if (exists) {
      toast({
        title: "Info",
        description: "This prescription is already added to the invoice",
      })
      return
    }

    console.log('prescript', prescription)
     // Get medication names for display
    const medicationNames = prescription.medications
      .map(med => med.medication?.name || 'Unknown Medication')
      .join(', ');

    // Get medication forms for code
    const medicationForms = prescription.medications
      .map(med => med.medication?.form || '')
      .filter(form => form)
      .join('-');

    // Create a service-like object from the prescription
    const prescriptionService = {
      _id: `prescription_${prescription._id}`,
      id: `prescription_${prescription._id}`,
      name: `Prescription #${/* prescription?.prescriptionId || */ 'N/A'} - ${medicationNames}`,
      price: prescription.totalCost,
      code: `RX-${medicationForms || prescription?.prescriptionId}`,
      quantity: 1,
      type: 'prescription' as const,
      prescriptionId: prescription._id
    }

    setSelectedServices([...selectedServices, prescriptionService])
    
    toast({
      title: "Added",
      description: "Prescription added to invoice",
    })
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
      if (selectedServices.length === 0) throw new Error("Please add at least one service or prescription")

        // Find if there's a prescription in the selected services
    const prescriptionService = selectedServices.find(s => s.type === 'prescription');
    const prescriptionId = prescriptionService?.prescriptionId || undefined;

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
        prescriptionId: prescriptionId,
        items: selectedServices.map(s => ({
          serviceId: s._id,
          description: s.name,
          quantity: s.quantity,
          unitPrice: s.price,
          amount: s.price * s.quantity,
          type: s.type,
          // Add service reference if it's a service (not prescription)
        ...(s.type === 'service' && { serviceId: s._id }),
        // Add prescription reference if it's a prescription
        ...(s.type === 'prescription' && { prescriptionItemId: s.prescriptionId })
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
      setPrescriptions([])
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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

          {/* Items Selection Tabs */}
          <div className="space-y-2">
            <Label>Add Items *</Label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="prescriptions" disabled={!formData.patientId}>
                  Prescriptions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="services">
                <Select onValueChange={handleServiceChange} disabled={loading || services.length === 0}>
                  <SelectTrigger><SelectValue placeholder={services.length === 0 ? "No services available" : "Add service"} /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s._id} value={s._id}>{s.name} (${s.price})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="prescriptions">
                {!formData.patientId ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Select a patient to view prescriptions
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No prescriptions found for this patient
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {prescriptions.map(prescription => (
                      <div key={prescription._id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-blue-500" />
                            {prescription.medications.map(med =>(
                              <span className="font-medium">RX #{med.medication.name}</span>
                            ))}
                            <Badge variant={prescription.status === 'Dispensed' ? 'default' : 'secondary'}>
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {prescription.medications.length} medication(s) • ${prescription.totalCost}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={() => handlePrescriptionAdd(prescription)}
                          disabled={prescription.status !== 'Ready'}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {selectedServices.length > 0 && (
              <div className="border rounded-md p-4 space-y-3 mt-4">
                <h4 className="font-medium">Invoice Items</h4>
                {selectedServices.map(s => (
                  <div key={s._id} className="flex flex-col gap-2 p-2 border rounded">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        {s.type === 'prescription' && (
                          <Badge variant="outline" className="text-xs">
                            Form
                          </Badge>
                        )}
                        {console.log('service', s)}
                        <span className="text-sm text-muted-foreground">({s.code})</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeService(s._id)} disabled={loading}>
                        <X className="w-4 h-4" />
                      </Button>
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