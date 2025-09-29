import ExportEncountersPanel from "@/components/exportEncountersPanel

export default function PatientEncounters({ params }: { params: { patientId: string } }) {
const { patientId } = params;
// GET /api/v1/patients/:patientId

  return (
    <div>
      <h2>Encounters for Patient {patientId}</h2>
      <ExportEncountersPanel patientId={params.patientId} />
      {/* ...your encounters table/list here... */}
    </div>
  );
}

/* <DatePicker
  label="Start Date"
  value={startDate}
  onChange={(newValue) => setStartDate(newValue?.toISOString().split("T")[0])}
/> */
