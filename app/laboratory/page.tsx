"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Box from "@mui/material/Box";
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConical,
  TestTube,
  Activity,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  User,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { LabStats } from "@/components/lab-stats"
import { labService } from "@/app/api/services/labService";
import { TestCard } from "@/components/TestCard";
import { NewTestDialog } from "@/components/NewTestDialog";
import { EditTestDialog } from "@/components/EditTestDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/ui/use-toast";


export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Laboratory Management
            </h1>
            <p className="text-slate-400 mt-2">Manage lab tests, results, and equipment</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <LabStats />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tests" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <TestTube className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Settings className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <LaboratoryOverview />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <TestManager />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <LabResults />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentMonitor />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <LabReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LaboratoryOverview() {
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent tests
        const testsResponse = await labService.getTests();
        const {data} = await testsResponse.json();
        setRecentTests(data.slice(0, 4));
        
        // Fetch equipment
        const equipmentResponse = await labService.getEquipment();
        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <TestTube className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in_progress":
        return "text-blue-400"
      case "pending":
        return "text-yellow-400"
      default:
        return "text-slate-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "text-red-400"
      case "urgent":
        return "text-orange-400"
      case "routine":
        return "text-green-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Error message */}
      {error && (
        <div className="col-span-2 bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="col-span-2 flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Recent Tests */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Recent Lab Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTests.map((test) => (
                <div key={test._id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                  <div className={`${getStatusColor(test.status)}`}>{getStatusIcon(test.status)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">{test.patientName}</p>
                        <p className="text-slate-400 text-xs">{test.testType}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${getPriorityColor(test.priority)}`}>
                          {test.priority.toUpperCase()}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {new Date(test.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Equipment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {equipment.slice(0, 3).map((item) => (
                  <div key={item._id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-slate-400 text-sm">
                          {item.status === 'online' 
                            ? `Last calibrated: ${item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'N/A'}`
                            : item.status === 'maintenance' 
                              ? `Maintenance due: ${item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'N/A'}`
                              : item.status === 'in_use' ? 'Currently in use' : 'Offline'
                          }
                        </p>
                      </div>
                      {item.status === 'online' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : item.status === 'maintenance' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      ) : item.status === 'in_use' ? (
                        <Clock className="w-5 h-5 text-blue-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// components/TestManager.tsx
// "use client"

// import { useState, useEffect } from "react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Search, Filter, Plus, Trash2, Pencil, TestTube } from "lucide-react";


export function TestManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchTests = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const query = `?page=${page}&limit=${pagination.limit}&sort=-createdAt`;
      const response = await labService.getTests(query);
      const testData = await response.json();
        console.log("testData Data:", testData);
      console.log('testmanger', response)
      setTests(testData.data);
      setPagination({
        page: testData.pagination?.page || 1,
        limit: testData.pagination?.limit || 10,
        total: testData.pagination?.total || 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tests');
      toast({
        title: "Error",
        description: err.message || "Failed to fetch tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCreateTest = async (testData: any) => {
    try {
      const response = await labService.createTest(testData);
      setTests([response.data, ...tests]);
      toast({
        title: "Success",
        description: "Test created successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create test",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateTest = async (id: string, data: any) => {
    try {
      const response = await labService.updateTest(id, data);
      console.log('edit', response)
      setTests(tests.map(test => 
        test._id === id ? response.data : test
      ));
      setSelectedTest(null);
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update test",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      await labService.deleteTest(id);
      setTests(tests.filter(test => test._id !== id));
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete test",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleStatusChange = async (testId: string, newStatus: string) => {
    try {
      await labService.updateTest(testId, { status: newStatus });
      setTests(tests.map(test => 
        test._id === testId ? { ...test, status: newStatus } : test
      ));
      toast({
        title: "Success",
        description: `Test status updated to ${newStatus.replace('_', ' ')}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update test status",
        variant: "destructive",
      });
    }
  };
console.log('tests', tests)
  const filteredTests = tests.filter(test =>
    test?.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test?.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(filteredTests)

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tests by patient name or test type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <NewTestDialog onCreate={handleCreateTest} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      )}

      {/* Tests List */}
      {!loading && (
        <>
          <div className="grid gap-4">
            {filteredTests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <TestTube className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-medium">No tests found</h3>
                <p className="mt-1 text-sm">Create a new test to get started</p>
                <div className="mt-6">
                  <NewTestDialog onCreate={handleCreateTest}>
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      New Test
                    </Button>
                  </NewTestDialog>
                </div>
              </div>
            ) : (<Box
  sx={{
    maxHeight: "70vh",
    overflowY: "auto",
    pr: 1,
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#ccc',
      borderRadius: '3px',
    },
  }}
>
              {filteredTests.map((test) => (
                <TestCard 
                  key={test._id} 
                  test={test} 
                  onStatusChange={handleStatusChange}
                  onEdit={() => setSelectedTest(test)}
                  onDelete={() => {
                    setSelectedTest(test);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))}
              </Box>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => fetchTests(pagination.page - 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Previous
              </Button>
              <span className="text-slate-400">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => fetchTests(pagination.page + 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {selectedTest && (
        <EditTestDialog
          test={selectedTest}
          onTestUpdated={(data) => handleUpdateTest(selectedTest._id, data)}
          onOpenChange={(open) => !open && setSelectedTest(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (selectedTest) {
            await handleDeleteTest(selectedTest._id);
            setIsDeleteDialogOpen(false);
          }
        }}
        title="Delete Test"
        description={`Are you sure you want to delete the test for ${selectedTest?.patientName}?`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

function LabResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await labService.getResults();
      console.log("Fetched results:", response.data);
      setResults(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      )}

      {!loading && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Lab Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <div key={result._id} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{result.patientName}</h4>
                    <p className="text-slate-400 text-sm">
                      {result.testType} • {result.technician}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {result.criticalValues && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>
                    )}
                    <Badge
                      className={
                        result.status === "Final"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">
                    Result Date: {new Date(result.resultDate).toLocaleString()}
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                    View Results
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EquipmentMonitor() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await labService.getEquipment();
      setEquipment(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await labService.updateEquipmentStatus(id, newStatus);
      setEquipment(equipment.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update equipment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "In Use":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Maintenance Required":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Offline":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      )}

      {!loading && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Equipment Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.map((item) => (
              <div key={item._id} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{item.name}</h4>
                    <p className="text-slate-400 text-sm">Model: {item.model}</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)} bg-slate-800 border border-slate-600`}
                  >
                    <option value="online">Online</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Tests Today</p>
                    <p className="text-white font-semibold">{item.testsToday || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Last Maintenance</p>
                    <p className="text-white">
                      {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Next Maintenance</p>
                    <p className="text-white">
                      {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LabReports() {
  const reports = [
    {
      title: "Daily Test Volume Report",
      description: "Summary of all tests performed today",
      type: "Volume",
      date: "2024-01-15",
      status: "Ready",
    },
    {
      title: "Quality Control Report",
      description: "Quality metrics and control results",
      type: "Quality",
      date: "2024-01-15",
      status: "Generating",
    },
    {
      title: "Equipment Utilization Report",
      description: "Equipment usage and efficiency metrics",
      type: "Equipment",
      date: "2024-01-15",
      status: "Ready",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Laboratory Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{report.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Type: {report.type}</span>
                    <span>Date: {report.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      report.status === "Ready"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {report.status}
                  </Badge>
                  {report.status === "Ready" && (
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
