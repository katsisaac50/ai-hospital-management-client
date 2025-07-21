export function exportPrescriptionsToCSV(prescriptions) {
  const header = ['Patient Name', 'Doctor Name', 'Medications', 'Notes', 'Created At']
  const rows = prescriptions.map(rx => [
    rx.patientName,
    rx.doctorName,
    rx.medications,
    rx.notes,
    new Date(rx.createdAt).toLocaleString(),
  ])
  const csvContent = [header, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'prescriptions.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}