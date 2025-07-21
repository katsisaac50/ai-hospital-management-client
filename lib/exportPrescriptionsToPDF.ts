import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'

export function exportPrescriptionsToPDF(prescriptions, medicationMap) {
 
  const doc = new jsPDF();

  doc.text('Prescriptions Report', 14, 16);

  const tableData = prescriptions.map((rx) => [
    rx.patient?.name || 'N/A',
    rx.doctor?.fullName || `${rx.doctor?.firstName} ${rx.doctor?.lastName}`,
    rx.medications
      .map((med) => {
        const medInfo = medicationMap[med.medication]; // Lookup medication by ID
        return medInfo 
          ? `${medInfo.name || 'Unknown'} ${med.dosage || ''} ${med.frequency || ''} (${med.duration || ''})`
          : `Unknown Medication (ID: ${med.medication})`;
      })
      .join(', '),
    rx.notes || '',
    new Date(rx.createdAt).toLocaleString(),
  ]);

  autoTable(doc, ({
    startY: 20,
    head: [['Patient', 'Doctor', 'Medications', 'Notes', 'Created At']],
    body: tableData,
    styles: { fontSize: 8 },
  }));

  doc.save('prescriptions.pdf');
}