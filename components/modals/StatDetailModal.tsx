import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface StatDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat: any;
}

export function StatDetailModal({ open, onOpenChange, stat }: StatDetailModalProps) {
  if (!stat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center justify-between">
            {stat.title} Details
            {/* <X 
              className="h-5 w-5 cursor-pointer text-slate-400 hover:text-white" 
              onClick={() => onOpenChange(false)}
            /> */}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <span className="text-slate-300">Current Value:</span>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <span className="text-slate-300">Monthly Change:</span>
            <span className={`text-lg font-semibold ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
              {stat.change}
            </span>
          </div>
          
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-slate-300 mb-2">Breakdown:</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="text-white">{stat.value}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Month</span>
                <span className="text-slate-400">
                  {stat.trend === "up" ? `~${calculatePreviousMonth(stat.value, stat.change)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate previous month value
function calculatePreviousMonth(currentValue: string, change: string): string {
  const numericValue = parseFloat(currentValue.replace(/[^\d.]/g, ''));
  const percentChange = parseFloat(change.replace('%', ''));
  
  if (change.includes('+')) {
    return `$${Math.round(numericValue / (1 + percentChange / 100)).toLocaleString()}`;
  } else {
    return `$${Math.round(numericValue / (1 - percentChange / 100)).toLocaleString()}`;
  }
}