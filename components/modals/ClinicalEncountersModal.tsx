"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import Autocomplete from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Select, MenuItem } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authFetch } from "@/lib/api";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ClinicalEncountersModalProps {
  patientId: string;
  userRole: "doctor" | "nurse" | "admin";
  encounters: any[];
  setEncounters: (encounters: any[]) => void;
  encounter?: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ClinicalEncountersModal({
  patientId,
  userRole,
  encounters,
  setEncounters,
  encounter,
  isOpen,
  setIsOpen,
}: ClinicalEncountersModalProps) {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [prescriptionData, setPrescriptionData] = useState({
    medications: [] as {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
    }[],
    notes: "",
    insuranceProvider: "",
    policyNumber: "",
    copay: "",
  });

  const [encounterData, setEncounterData] = useState({
    chiefComplaints: "",
    vitals: {
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      weight: "",
      height: "",
      spo2: "",
    },
    differentialDiagnosis: "",
    diagnosis: "",
    treatment: "",
    followUpDate: "",
    followUpInstructions: "",
  });

  const [allMedications, setAllMedications] = useState<any[]>([]);

  // Fetch available medications
  useEffect(() => {
    async function fetchMedications() {
      try {
        const res = await authFetch(`${API_URL}/v1/pharmacy/medications`, { method: "GET" });
        const json = await res.json();
        setAllMedications(json.data || []);
      } catch (error) {
        console.error("Failed to fetch medications:", error);
      }
    }
    fetchMedications();
  }, []);

  // Pre-fill when editing
  useEffect(() => {
    if (encounter) {
      setEncounterData({
        chiefComplaints: encounter.chiefComplaints?.join(", ") || "",
        vitals: {
          temperature: encounter.vitals?.temperature || "",
          bloodPressure: encounter.vitals?.bloodPressure || "",
          heartRate: encounter.vitals?.heartRate || "",
          respiratoryRate: encounter.vitals?.respiratoryRate || "",
          weight: encounter.vitals?.weight || "",
          height: encounter.vitals?.height || "",
          spo2: encounter.vitals?.spo2 || "",
        },
        differentialDiagnosis:
          encounter.differentialDiagnosis?.map((d: any) => d.condition).join(", ") || "",
        diagnosis: encounter.diagnosis?.map((d: any) => d.condition).join(", ") || "",
        treatment: encounter.treatment?.map((t: any) => t.description).join(", ") || "",
        followUpDate: encounter.followUp?.date
          ? new Date(encounter.followUp.date).toISOString().slice(0, 10)
          : "",
        followUpInstructions: encounter.followUp?.instructions || "",
      });

      if (encounter.prescription) {
        setPrescriptionData({
          medications: encounter.prescription.medications.map((m: any) => ({
            medication: m.medication?._id || "",
            dosage: m.dosage || "",
            frequency: m.frequency || "",
            duration: m.duration || "",
            quantity: m.quantity || 0,
          })),
          notes: encounter.prescription.notes || "",
          insuranceProvider: encounter.prescription.insurance?.provider || "",
          policyNumber: encounter.prescription.insurance?.policyNumber || "",
          copay: encounter.prescription.insurance?.copay?.toString() || "",
        });
      }
    }
  }, [encounter]);

  // Change handler for encounterData
  const handleChange = (field: string, value: string) => {
    if (field in encounterData.vitals) {
      setEncounterData((prev) => ({
        ...prev,
        vitals: { ...prev.vitals, [field]: value },
      }));
    } else {
      setEncounterData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...encounterData,
        chiefComplaints: encounterData.chiefComplaints
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        vitals: Object.fromEntries(
          Object.entries(encounterData.vitals).map(([k, v]) => [k, v ? Number(v) : null])
        ),
        differentialDiagnosis: encounterData.differentialDiagnosis
          ? encounterData.differentialDiagnosis.split(",").map((d) => ({ condition: d.trim() }))
          : [],
        diagnosis: encounterData.diagnosis
          ? encounterData.diagnosis.split(",").map((d) => ({ condition: d.trim() }))
          : [],
        treatment: encounterData.treatment
          ? encounterData.treatment.split(",").map((t) => ({ description: t.trim() }))
          : [],
        followUp:
          encounterData.followUpDate || encounterData.followUpInstructions
            ? {
                date: encounterData.followUpDate || null,
                instructions: encounterData.followUpInstructions || "",
              }
            : undefined,
      };

      const combinedPayload = {
        ...payload,
        prescription: prescriptionData.medications.length
          ? {
              medications: prescriptionData.medications.map((m) => ({
                medication: m.medication,
                dosage: m.dosage,
                frequency: m.frequency,
                duration: m.duration,
                quantity: Number(m.quantity) || 0,
              })),
              notes: prescriptionData.notes,
              insurance: {
                provider: prescriptionData.insuranceProvider || "",
                policyNumber: prescriptionData.policyNumber || "",
                copay: Number(prescriptionData.copay) || 0,
              },
            }
          : null,
      };

      let updatedEncounters;

      if (encounter) {
        const res = await authFetch(
          `${API_URL}/v1/encounters/patient/${patientId}/${encounter._id}`,
          { method: "PUT", body: JSON.stringify(combinedPayload) }
        );
        const json = await res.json();
        updatedEncounters = encounters.map((e) => (e._id === encounter._id ? json.data : e));
      } else {
        const res = await authFetch(`${API_URL}/v1/encounters/patient/${patientId}`, {
          method: "POST",
          body: JSON.stringify(combinedPayload),
        });
        const json = await res.json();
        updatedEncounters = [...encounters, json.data];
      }

      setEncounters(updatedEncounters);
      setIsOpen(false);

      toast({
        title: encounter ? "Encounter Updated" : "Encounter Created",
        description: encounter
          ? "The clinical encounter was updated successfully."
          : "New clinical encounter has been created successfully.",
      });
    } catch (err) {
      console.error("Error saving encounter:", err);
      toast({
        title: "Error",
        description: "Failed to save encounter. Please try again.",
        variant: "destructive",
      });
    }
  };

  console.log('prescriptionData', prescriptionData)

  const handleDelete = async () => {
    try {
      const res = await authFetch(
        `${API_URL}/v1/encounters/patient/${patientId}/${encounter._id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      const updatedEncounters = encounters.map((e) =>
        e._id === encounter._id ? json.data : e
      );
      setEncounters(updatedEncounters);
      setIsOpen(false);
      toast({ title: "Encounter Deleted", description: "The encounter has been deleted." });
    } catch (err) {
      console.error("Error deleting encounter:", err);
      toast({
        title: "Error",
        description: "Failed to delete encounter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    try {
      const res = await authFetch(
        `${API_URL}/v1/encounters/patient/${patientId}/${encounter._id}/restore`,
        { method: "PATCH" }
      );
      const json = await res.json();
      const updatedEncounters = encounters.map((e) =>
        e._id === encounter._id ? json.data : e
      );
      setEncounters(updatedEncounters);
      setIsOpen(false);
      toast({ title: "Encounter Restored", description: "The encounter has been restored." });
    } catch (err) {
      console.error("Error restoring encounter:", err);
      toast({
        title: "Error",
        description: "Failed to restore encounter. Please try again.",
        variant: "destructive",
      });
    }
  };

  // --- 🎨 Theme Classes (StatCard-like) ---
  const cardClasses = cn(
    "rounded-lg p-6 shadow-sm transition-all duration-300",
    {
      "bg-white border border-gray-200 text-gray-900": theme === "light",
      "bg-slate-800 border border-slate-600 text-white": theme === "dark",
      "glass-card text-white border border-white/20": theme === "morpho" || theme === "glass",
    }
  );

  const inputClasses = cn(
    "rounded-md shadow-sm transition-colors duration-300 w-full",
    {
      "glass-input": theme === "morpho" || theme === "glass",
      "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-300": theme === "dark",
      "bg-gray-50 border border-gray-300 placeholder-gray-400": theme === "light",
    }
  );

  const textClasses = cn("font-medium tracking-wide", {
    "text-white": theme === "dark" || theme === "morpho" || theme === "glass",
    "text-gray-900": theme === "light",
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn("max-w-3xl max-h-[90vh] overflow-y-auto space-y-8", cardClasses)}
      >
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className={cn("text-2xl font-bold", textClasses)}>
            {encounter ? "Edit Clinical Encounter" : "Add Clinical Encounter"}
          </DialogTitle>
        </DialogHeader>

        {/* Chief Complaints */}
        <div className="space-y-2">
          <Label className={textClasses}>Chief Complaints</Label>
          <Textarea
            placeholder="Enter chief complaints separated by commas"
            value={encounterData.chiefComplaints}
            onChange={(e) => handleChange("chiefComplaints", e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Vitals */}
        <div className="space-y-4">
          <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>Vitals</h4>
          <div className="grid grid-cols-2 gap-6">
            {Object.keys(encounterData.vitals).map((key) => (
              <div key={key} className="space-y-2">
                <Label className={textClasses}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  type="text"
                  value={(encounterData.vitals as any)[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={inputClasses}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Doctor/Admin Fields */}
        {(userRole === "doctor" || userRole === "admin") && (
          <>
            {/* Differential Diagnosis */}
            <div className="space-y-4">
              <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>
                Differential Diagnosis
              </h4>
              <Input
                placeholder="Enter differential diagnoses separated by commas"
                value={encounterData.differentialDiagnosis}
                onChange={(e) => handleChange("differentialDiagnosis", e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Diagnosis */}
            <div className="space-y-4">
              <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>Diagnosis</h4>
              <Input
                placeholder="Enter diagnoses separated by commas"
                value={encounterData.diagnosis}
                onChange={(e) => handleChange("diagnosis", e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Treatment */}
            <div className="space-y-4">
              <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>Treatment</h4>
              <Input
                placeholder="Enter treatments separated by commas"
                value={encounterData.treatment}
                onChange={(e) => handleChange("treatment", e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-4">
              <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>Follow-up</h4>
              <Input
                type="date"
                value={encounterData.followUpDate}
                onChange={(e) => handleChange("followUpDate", e.target.value)}
                className={inputClasses}
              />
              <Textarea
                placeholder="Enter follow-up instructions"
                value={encounterData.followUpInstructions}
                onChange={(e) => handleChange("followUpInstructions", e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Prescription */}
            <div className="space-y-4">
              <h4 className={cn("text-lg font-semibold border-b pb-2", textClasses)}>Prescription</h4>

              {prescriptionData.medications.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select
                    value={med.medication}
                    onValueChange={(value) => {
                      const meds = [...prescriptionData.medications];
                      meds[index].medication = value;
                      setPrescriptionData({ ...prescriptionData, medications: meds });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {allMedications.map((drug) => (
                        <SelectItem key={drug._id} value={drug._id}>
                          {`${drug.name} ${drug.strength}${drug.unit} (Batch ${drug.batchNumber})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => {
                      const meds = [...prescriptionData.medications];
                      meds[index].dosage = e.target.value;
                      setPrescriptionData({ ...prescriptionData, medications: meds });
                    }}
                    className={inputClasses}
                  />
                  <Input
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => {
                      const meds = [...prescriptionData.medications];
                      meds[index].frequency = e.target.value;
                      setPrescriptionData({ ...prescriptionData, medications: meds });
                    }}
                    className={inputClasses}
                  />
                  <Input
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => {
                      const meds = [...prescriptionData.medications];
                      meds[index].duration = e.target.value;
                      setPrescriptionData({ ...prescriptionData, medications: meds });
                    }}
                    className={inputClasses}
                  />
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={med.quantity}
                    onChange={(e) => {
                      const meds = [...prescriptionData.medications];
                      meds[index].quantity = parseInt(e.target.value, 10);
                      setPrescriptionData({ ...prescriptionData, medications: meds });
                    }}
                    className={inputClasses}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                className="mt-2"
                onClick={() =>
                  setPrescriptionData({
                    ...prescriptionData,
                    medications: [
                      ...prescriptionData.medications,
                      { medication: "", dosage: "", frequency: "", duration: "", quantity: 0 },
                    ],
                  })
                }
              >
                + Add Medication
              </Button>

              <Label className={textClasses}>Notes</Label>
              <Textarea
                value={prescriptionData.notes}
                onChange={(e) =>
                  setPrescriptionData({ ...prescriptionData, notes: e.target.value })
                }
                className={inputClasses}
              />
            </div>
          </>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className={cn(
              "rounded-md shadow-sm px-6",
              {
                "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho" || theme === "glass",
                "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
              }
            )}
          >
            Cancel
          </Button>

          <div className="flex gap-3">
            {userRole === "admin" && encounter && (
              <>
                {!encounter.deleted && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
                {encounter.deleted && (
                  <Button variant="secondary" onClick={handleRestore}>
                    Restore
                  </Button>
                )}
              </>
            )}
            <Button className="px-8" onClick={handleSubmit}>
              {encounter ? "Update Encounter" : "Save Encounter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
