import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// import { toast } from 'sonner'
import { toast } from "react-toastify";
import { authFetch } from "@/lib/api";
import TagInput from "@/components/ui/taginput";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProcessPrescriptionModal({ open, onClose, heading }) {
  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    medications: [],
    notes: "",
    status: 'Pending',
    priority: 'Medium',
    insurance: '',
    copay: 0,
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicationList, setMedicationList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [patientRes, doctorRes, medRes] = await Promise.all([
        authFetch(`${API_URL}/v1/patients`),
        authFetch(`${API_URL}/v1/doctors`),
        authFetch(`${API_URL}/v1/pharmacy/medications`),
      ]);

      const patientsJson = await patientRes.json();
      const doctorsJson = await doctorRes.json();
      const medsJson = await medRes.json();

      setPatients(patientsJson?.data || []);
      setDoctors(doctorsJson?.data || []);
      setMedicationList(medsJson?.data || []);
    };

    if (open) fetchData();
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectPatient = (value) => {
    setForm({ ...form, patient: value });
  };

  const handleSelectDoctor = (value) => {
    setForm({ ...form, doctor: value });
  };

  const handleMedChange = (index, value) => {
    const meds = [...form.medications];
    meds[index] = value;
    setForm({ ...form, medications: meds });
  };

  const addMedicationField = () => {
    setForm({ ...form, medications: [...form.medications, ""] });
  };

  const removeMedicationField = (index) => {
    const meds = [...form.medications];
    meds.splice(index, 1);
    setForm({ ...form, medications: meds });
  };

  const handleSubmit = async () => {
    console.log(form);
    if (!form.patient || !form.doctor || form.medications.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...form,
        medications: form.medications.filter(Boolean), // remove empty strings
      };

      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Prescription saved:", data);

      // if (!res.ok) throw new Error('Failed to save')

      if (!data.success) throw new Error(data.message || "Failed to save");

      toast.success("Prescription processed");
      onClose();
    } catch (err) {
      console.log(err);
      toast.error(`Failed to process prescription: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading ? "New Prescription" : "Process Prescription"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Patient Select */}
          <Select value={form.patient} onValueChange={handleSelectPatient}>
            <SelectTrigger>
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Doctor Select */}
          <Select value={form.doctor} onValueChange={handleSelectDoctor}>
            <SelectTrigger>
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Medications */}
          <label className="text-sm font-semibold">Medications:</label>
          {form.medications.map((med, index) => (
            <div
              key={index}
              className="space-y-2 border border-slate-600 p-3 rounded-lg mb-2"
            >
              <Select
                value={med.medication}
                onValueChange={(value) => {
                  const meds = [...form.medications];
                  meds[index].medication = value;
                  setForm({ ...form, medications: meds });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Medication" />
                </SelectTrigger>
                <SelectContent>
                  {medicationList.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      {m.name} - {m.strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Dosage (e.g. 500mg)"
                value={med.dosage}
                onChange={(e) => {
                  const meds = [...form.medications];
                  meds[index].dosage = e.target.value;
                  setForm({ ...form, medications: meds });
                }}
              />

              <Input
                placeholder="Frequency (e.g. x2/day)"
                value={med.frequency}
                onChange={(e) => {
                  const meds = [...form.medications];
                  meds[index].frequency = e.target.value;
                  setForm({ ...form, medications: meds });
                }}
              />

              <Input
                placeholder="Duration (e.g. 5 days)"
                value={med.duration}
                onChange={(e) => {
                  const meds = [...form.medications];
                  meds[index].duration = e.target.value;
                  setForm({ ...form, medications: meds });
                }}
              />

              <Button
                variant="destructive"
                onClick={() => removeMedicationField(index)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                medications: [
                  ...form.medications,
                  { medication: "", dosage: "", frequency: "", duration: "" },
                ],
              })
            }
          >
            + Add Medication
          </Button>

          {/* <TagInput tags={form.medications} setTags={(tags) => setForm({ ...form, medications: tags })} /> */}
          {/* {form.medications.map((med, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={med}
                placeholder="e.g. Paracetamol 500mg x2/day"
                onChange={(e) => handleMedChange(index, e.target.value)}
              />
              {form.medications.length > 1 && (
                <Button variant="destructive" onClick={() => removeMedicationField(index)}>
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addMedicationField}>
            + Add Medication
          </Button> */}

          {/* Notes */}
          <Textarea
            name="notes"
            placeholder="Additional Notes"
            value={form.notes}
            onChange={handleChange}
          />
          <Select
            value={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Dispensed">Dispensed</SelectItem>
              <SelectItem value="Verification Required">
                Verification Required
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.priority}
            onValueChange={(value) => setForm({ ...form, priority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Insurance Provider"
            value={form.insurance}
            onChange={(e) => setForm({ ...form, insurance: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Copay Amount"
            value={form.copay}
            onChange={(e) =>
              setForm({ ...form, copay: parseFloat(e.target.value) || 0 })
            }
          />

          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
