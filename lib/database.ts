import { supabase } from "./supabase"

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  insurance_provider: string
  emergency_contact: string
  medical_history: string[]
  allergies: string[]
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  license_number: string
  department: string
  experience_years: number
  availability: any
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  duration: number
  type: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  name: string
  generic_name: string
  strength: string
  form: string
  manufacturer: string
  ndc_number: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit_price: number
  expiry_date: string
  location: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medication_id: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  refills: number
  status: string
  created_at: string
  updated_at: string
}

export interface LabTest {
  id: string
  patient_id: string
  doctor_id: string
  test_type: string
  test_code: string
  priority: string
  status: string
  sample_type: string
  collection_date: string
  result_date: string
  results: any
  normal_ranges: any
  technician_id: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  patient_id: string
  amount: number
  tax_amount: number
  total_amount: number
  status: string
  due_date: string
  payment_method: string
  insurance_claim_id: string
  line_items: any[]
  created_at: string
  updated_at: string
}

// Database operations
export const db = {
  // Patients
  async getPatients() {
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data as Patient[]
  },

  async getPatient(id: string) {
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) throw error
    return data as Patient
  },

  async createPatient(patient: Omit<Patient, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("patients").insert(patient).select().single()

    if (error) throw error
    return data as Patient
  },

  async updatePatient(id: string, updates: Partial<Patient>) {
    const { data, error } = await supabase
      .from("patients")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Patient
  },

  // Doctors
  async getDoctors() {
    const { data, error } = await supabase.from("doctors").select("*").order("name")

    if (error) throw error
    return data as Doctor[]
  },

  // Appointments
  async getAppointments(date?: string) {
    let query = supabase.from("appointments").select(`
        *,
        patient:patients(name, phone),
        doctor:doctors(name, specialty)
      `)

    if (date) {
      query = query.eq("appointment_date", date)
    }

    const { data, error } = await query.order("appointment_time")

    if (error) throw error
    return data
  },

  async createAppointment(appointment: Omit<Appointment, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("appointments").insert(appointment).select().single()

    if (error) throw error
    return data as Appointment
  },

  // Medications
  async getMedications() {
    const { data, error } = await supabase.from("medications").select("*").order("name")

    if (error) throw error
    return data as Medication[]
  },

  async updateMedicationStock(id: string, quantity: number) {
    const { data, error } = await supabase
      .from("medications")
      .update({
        current_stock: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Medication
  },

  // Lab Tests
  async getLabTests() {
    const { data, error } = await supabase
      .from("lab_tests")
      .select(`
        *,
        patient:patients(name),
        doctor:doctors(name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async createLabTest(test: Omit<LabTest, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("lab_tests").insert(test).select().single()

    if (error) throw error
    return data as LabTest
  },

  // Invoices
  async getInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        patient:patients(name, insurance_provider)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async createInvoice(invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("invoices").insert(invoice).select().single()

    if (error) throw error
    return data as Invoice
  },
}
