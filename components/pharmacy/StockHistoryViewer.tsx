// "use client"

// import { useEffect, useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select'
// import { authFetch } from '@/lib/api'
// import { Badge } from '@/components/ui/badge'
// import { ArrowDown, ArrowUp, Pill } from 'lucide-react'
// import { format } from 'date-fns'

// const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

// export default function StockHistoryViewer() {
//   const [medications, setMedications] = useState([])
//   const [selectedMedId, setSelectedMedId] = useState('')
//   const [history, setHistory] = useState([])

//   useEffect(() => {
//     const fetchMeds = async () => {
//       const res = await authFetch(`${API_URL}/v1/pharmacy/medications`)
//       const data = await res.json()
//       setMedications(data.data || [])
//     }

//     fetchMeds()
//   }, [])

//   useEffect(() => {
//     const fetchHistory = async () => {
//       if (!selectedMedId) return
//       const res = await authFetch(`${API_URL}/v1/pharmacy/stock-history?medication=${selectedMedId}`)
//       const data = await res.json()
//       setHistory(data.data || [])
//     }

//     fetchHistory()
//   }, [selectedMedId])

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-white">📦 Stock History</h2>

//       <Select value={selectedMedId} onValueChange={setSelectedMedId}>
//         <SelectTrigger className="w-full max-w-md bg-slate-700 border-slate-600 text-white">
//           <SelectValue placeholder="Select Medication" />
//         </SelectTrigger>
//         <SelectContent>
//           {medications.map((med) => (
//             <SelectItem key={med.id} value={med.id}>
//               {med.name} ({med.strength})
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <div className="grid gap-3">
//         {history.map((log) => (
//           <Card key={log._id} className="bg-slate-800 border-slate-700">
//             <CardContent className="p-4 space-y-2">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2 text-white">
//                   {log.type === 'dispense' ? (
//                     <ArrowDown className="text-red-500" />
//                   ) : (
//                     <ArrowUp className="text-green-500" />
//                   )}
//                   <span className="capitalize font-medium">{log.type}</span>
//                 </div>
//                 <Badge className="bg-slate-600 text-white">
//                   Qty: {log.quantityChanged > 0 ? '+' : ''}
//                   {log.quantityChanged}
//                 </Badge>
//               </div>

//               <div className="text-sm text-slate-300">
//                 <Pill className="inline w-4 h-4 mr-1" />
//                 {log.medication?.name} ({log.medication?.strength}) • New Qty: {log.newQuantity}
//               </div>

//               {log.relatedPrescription && (
//                 <div className="text-sm text-cyan-400">
//                   Prescription ID: {log.relatedPrescription._id}
//                 </div>
//               )}

//               <div className="text-xs text-slate-500">
//                 {format(new Date(log.createdAt), 'PPpp')}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//         {history.length === 0 && selectedMedId && (
//           <p className="text-slate-400 italic">No stock history found for this medication.</p>
//         )}
//       </div>
//     </div>
//   )
// }
