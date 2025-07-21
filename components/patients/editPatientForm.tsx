import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function EditPatientDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedPatient,
  setSelectedPatient,
  handleEditPatient,
  theme,
  textClasses,
}) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent
        className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", {
          "glass-card": theme === "morpho",
          "bg-slate-800 border-slate-700": theme === "dark",
          "bg-white border-gray-200": theme === "light",
        })}
      >
        {selectedPatient && (
          <>
            <DialogHeader>
              <DialogTitle className={textClasses}>Edit Patient Information</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name, Email, Phone */}
              <div className="space-y-2">
                <Label className={textClasses}>Full Name</Label>
                <Input
                  value={selectedPatient.name || ""}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                  className={getInputClass(theme)}
                />
              </div>
              <div className="space-y-2">
                <Label className={textClasses}>Email</Label>
                <Input
                  type="email"
                  value={selectedPatient.email || ""}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })}
                  className={getInputClass(theme)}
                />
              </div>
              <div className="space-y-2">
                <Label className={textClasses}>Phone</Label>
                <Input
                  value={selectedPatient.phone || ""}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, phone: e.target.value })}
                  className={getInputClass(theme)}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className={textClasses}>Status</Label>
                <Select
                  value={selectedPatient.status}
                  onValueChange={(value) => setSelectedPatient({ ...selectedPatient, status: value })}
                >
                  <SelectTrigger className={getInputClass(theme)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              {["street", "city", "state", "postalCode", "country"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label className={textClasses}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  <Input
                    value={selectedPatient.address?.[field] || ""}
                    onChange={(e) =>
                      setSelectedPatient({
                        ...selectedPatient,
                        address: {
                          ...selectedPatient.address,
                          [field]: e.target.value,
                        },
                      })
                    }
                    className={getInputClass(theme)}
                  />
                </div>
              ))}

              {/* Medical History */}
              {selectedPatient.medicalHistory?.map((entry, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <Input
                    placeholder="Condition"
                    value={entry.condition}
                    onChange={(e) => {
                        const updated = [...selectedPatient.medicalHistory];
                        updated[index].condition = e.target.value;
                        setSelectedPatient({ ...selectedPatient, medicalHistory: updated });
                    }}
                    />
                    <Input
                    type="date"
                    placeholder="Diagnosis Date"
                    value={entry.diagnosisDate?.split("T")[0] || ""}
                    onChange={(e) => {
                        const updated = [...selectedPatient.medicalHistory];
                        updated[index].diagnosisDate = e.target.value;
                        setSelectedPatient({ ...selectedPatient, medicalHistory: updated });
                    }}
                    />
                    <Input
                    placeholder="Treatment"
                    value={entry.treatment}
                    onChange={(e) => {
                        const updated = [...selectedPatient.medicalHistory];
                        updated[index].treatment = e.target.value;
                        setSelectedPatient({ ...selectedPatient, medicalHistory: updated });
                    }}
                    />
                </div>
                ))}
                <Button
                variant="outline"
                onClick={() =>
                    setSelectedPatient({
                    ...selectedPatient,
                    medicalHistory: [
                        ...selectedPatient.medicalHistory,
                        { condition: "", diagnosisDate: "", treatment: "" },
                    ],
                    })
                }
                >
                + Add History
                </Button>

                <div className="space-y-2 md:col-span-2">
  <Label className={textClasses}>Emergency Contact</Label>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
    <Input
      placeholder="Name"
      value={selectedPatient.emergencyContact?.name || ""}
      onChange={(e) =>
        setSelectedPatient({
          ...selectedPatient,
          emergencyContact: {
            ...selectedPatient.emergencyContact,
            name: e.target.value,
          },
        })
      }
    />
    <Input
      placeholder="Relationship"
      value={selectedPatient.emergencyContact?.relationship || ""}
      onChange={(e) =>
        setSelectedPatient({
          ...selectedPatient,
          emergencyContact: {
            ...selectedPatient.emergencyContact,
            relationship: e.target.value,
          },
        })
      }
    />
    <Input
      placeholder="Phone"
      value={selectedPatient.emergencyContact?.phone || ""}
      onChange={(e) =>
        setSelectedPatient({
          ...selectedPatient,
          emergencyContact: {
            ...selectedPatient.emergencyContact,
            phone: e.target.value,
          },
        })
      }
    />
  </div>
</div>



              {/* Allergies */}
              <div className="md:col-span-2">
                <Label className={textClasses}>Allergies</Label>
                <Textarea
                  value={selectedPatient.allergies || ""}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, allergies: e.target.value })}
                  className={getInputClass(theme)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPatient}>Save Changes</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getInputClass(theme) {
  return cn("transition-colors duration-300", {
    "glass-input": theme === "morpho",
    "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
    "bg-gray-50 border-gray-300": theme === "light",
  });
}
