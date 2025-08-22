"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, User, Calendar, Pencil, Trash2 } from "lucide-react";

export function TestCard({ test, onStatusChange, onEdit, onDelete }: {
  test: any;
  onStatusChange: (id: string, status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "urgent": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "routine": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white">
              <TestTube className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{test.patientName}</h3>
              <p className="text-slate-400">
                {test.testType} • Ordered by {test.orderedBy}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-slate-400" />
              Patient ID: {test.patientId.medicalRecordNumber}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              Ordered: {new Date(test.orderDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <TestTube className="w-4 h-4 text-slate-400" />
              Sample: {test.sampleType}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Badge className={getStatusColor(test.status)}>
              {test.status.replace("_", " ")}
            </Badge>
            <Badge className={getPriorityColor(test.priority)}>
              {test.priority}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {test.status !== 'completed' && (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                onClick={() => {
                  const newStatus = test.status === 'pending' ? 'in_progress' : 'completed';
                  onStatusChange(test._id, newStatus);
                }}
              >
                {test.status === 'pending' ? 'Start Processing' : 'Complete'}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}