"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/lib/api";
import { format } from "date-fns";
import {
  Pill,
  Repeat,
  Hourglass,
  Search,
  Plus,
  Filter,
  FileText,
  User,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { exportPrescriptionsToCSV } from "@/lib/exportPrescriptionsToCSV";
import { exportPrescriptionsToPDF } from "@/lib/exportPrescriptionsToPDF";
import { toast } from "react-toastify";

// Lazy-loaded modals
const EditPrescriptionModal = dynamic(() => import("./edit-prescription-modal"));
const ViewPrescriptionModal = dynamic(() =>
  import("@/components/pharmacy/view-prescription-modal").then((m) => m.ViewPrescriptionModal)
);
const ProcessPrescriptionModal = dynamic(() =>
  import("@/components/pharmacy/process-prescription-modal")
);

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export function PrescriptionManager({ userRole = "admin" }) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRx, setEditingRx] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicationMap, setMedicationMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewingRx, setViewingRx] = useState(null);
  const [openPrescriptionModal, setOpenPrescriptionModal] = useState(false);

  /** Fetch prescriptions + medications concurrently */
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadData = async () => {
      setLoading(true);
      try {
        const [presRes, medRes] = await Promise.all([
          authFetch(`${API_URL}/v1/pharmacy/prescriptions`, { signal }),
          authFetch(`${API_URL}/v1/pharmacy/medications`, { signal }),
        ]);

        const [{ data: presData }, { data: medsData }] = await Promise.all([
          presRes.json(),
          medRes.json(),
        ]);

        const medMap = Object.fromEntries(medsData.map((m) => [m._id, m]));
        setMedicationMap(medMap);
        setPrescriptions(presData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Failed to load prescriptions or medications.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return prescriptions.filter(
      (p) =>
        p.patient?.name.toLowerCase().includes(term) ||
        p._id.toLowerCase().includes(term) ||
        p.doctor?.fullName.toLowerCase().includes(term)
    );
  }, [searchTerm, prescriptions]);

  const handleView = (rx) => setViewingRx(rx);

  const handleProcess = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/process/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to process prescription");

      toast.success("Prescription processed successfully");
      setPrescriptions((prev) => prev.map((p) => (p._id === id ? { ...p, status: "Ready" } : p)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete prescription");

      toast.success("Prescription deleted");
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  /** Status + Priority Glow Color Helpers */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Ready":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Dispensed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Verification Required":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Dispensed":
        return <CheckCircle className="w-4 h-4" />;
      case "Verification Required":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getGlowButtonClass = (status: string) => {
    switch (status) {
      case "Ready":
        return "from-green-500 to-emerald-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]";
      case "Pending":
        return "from-yellow-400 to-amber-500 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]";
      case "Dispensed":
        return "from-blue-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]";
      case "Verification Required":
        return "from-red-500 to-pink-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]";
      default:
        return "from-cyan-500 to-purple-500 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search prescriptions by patient, doctor, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                onClick={() => setOpenPrescriptionModal(true)}
                variant="outline"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
              {userRole === "admin" && (
                <>
                  <Button onClick={() => exportPrescriptionsToCSV(prescriptions)} variant="outline">
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => exportPrescriptionsToPDF(prescriptions, medicationMap)}
                    variant="outline"
                  >
                    Export PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => {
          const glowColor =
            prescription.status === "Ready"
              ? "from-green-400/10"
              : prescription.status === "Pending"
              ? "from-yellow-400/10"
              : prescription.status === "Dispensed"
              ? "from-blue-400/10"
              : prescription.status === "Verification Required"
              ? "from-red-400/10"
              : "from-cyan-400/10";

          return (
            <Card
              key={prescription._id}
              className="relative overflow-hidden rounded-2xl border bg-slate-800/50 border-slate-700/50 backdrop-blur-xl group transition-all duration-500 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] hover:border-cyan-400/40"
            >
              {/* Dynamic gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/15 to-cyan-500/10 bg-[length:200%_100%] animate-[gradient-move_5s_infinite_linear] opacity-40 pointer-events-none" />
              <div
                className={`absolute inset-0 bg-gradient-radial ${glowColor} via-transparent to-transparent animate-[ambient-glow_8s_infinite_ease-in-out] group-hover:animate-[ambient-hover_2s_ease-in-out] pointer-events-none`}
              />

              <CardContent className="relative z-10 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {prescription._id.slice(-2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{prescription.patient?.name}</h3>
                        <p className="text-slate-400">
                          Prescribed by {prescription.doctor?.fullName} • {format(new Date(prescription?.createdAt), "PPpp")}
                        </p>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Medications:</h4>
                      <div className="space-y-2">
                        {prescription.medications.map((med, index) => {
                          const medInfo = medicationMap[med.medication];
                          return (
                            <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-white font-medium">
                                    🧪 {medInfo?.name || "Unknown Medication"} ({medInfo?.strength || "N/A"})
                                  </p>
                                  <p className="text-slate-400 text-sm">{prescription.notes}</p>
                                </div>
                                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300 space-x-2 flex items-center">
                                  <span className="flex items-center gap-1">
                                    <Pill className="w-4 h-4" />
                                    {med?.dosage ?? "N/A"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Repeat className="w-4 h-4" />
                                    {med?.frequency ?? "N/A"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Hourglass className="w-4 h-4" />
                                    {med?.duration ?? "N/A"}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-400 text-sm italic">
                                    💰 ${med?.cost?.toFixed(2) || "0.00"} | Qty: {med?.quantity || "N/A"}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-4 h-4 text-slate-400" />
                        Patient ID: {prescription.patient.medicalRecordNumber || prescription.patient._id}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        Insurance: {prescription.patient?.insurance?.provider || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Copay: ${prescription.copay}
                      </div>
                    </div>
                  </div>

                  {/* Buttons + Status */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(prescription.status)}>
                        {getStatusIcon(prescription.status)}
                        <span className="ml-1">{prescription.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(prescription.priority)}>{prescription.priority}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleView(prescription)}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        View Details
                      </Button>

                      {/* Dynamic glowing buttons */}
                      {["Ready", "Pending"].includes(prescription.status) && (
                        <Button
                          onClick={() => handleProcess(prescription._id)}
                          disabled={loading}
                          size="sm"
                          className={`bg-gradient-to-r ${getGlowButtonClass(prescription.status)} text-white glow-button transition-all duration-300 hover:scale-[1.03]`}
                        >
                          {loading ? "Processing..." : "Process"}
                        </Button>
                      )}

                      {userRole === "admin" && (
                        <>
                          {prescription.status === "Pending" && (
                            <Button
                              size="sm"
                              className={`bg-gradient-to-r ${getGlowButtonClass(prescription.status)} text-white glow-button transition-all duration-300 hover:scale-[1.03]`}
                              onClick={() => {
                                setEditingRx(prescription);
                                setShowEdit(true);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(prescription._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Modals */}
        {showEdit && (
          <EditPrescriptionModal
            open={showEdit}
            onClose={() => setShowEdit(false)}
            prescription={editingRx}
            onUpdated={() => {}}
          />
        )}
        {viewingRx && (
          <ViewPrescriptionModal
            prescription={viewingRx}
            onClose={() => setViewingRx(null)}
            onUpdated={() => {}}
            medicationMap={medicationMap}
          />
        )}
        {openPrescriptionModal && (
          <ProcessPrescriptionModal
            heading={true}
            open={openPrescriptionModal}
            onClose={() => setOpenPrescriptionModal(false)}
          />
        )}
      </div>

      {/* 🔥 Global Glow Animations */}
      <style jsx global>{`
        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes ambient-glow {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        @keyframes ambient-hover {
          0% {
            opacity: 0.15;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.15;
            transform: scale(0.95);
          }
        }
        @keyframes button-pulse {
          0% {
            box-shadow: 0 0 5px rgba(56, 189, 248, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
          }
          100% {
            box-shadow: 0 0 5px rgba(56, 189, 248, 0.2);
          }
        }
        .glow-button {
          animation: button-pulse 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}