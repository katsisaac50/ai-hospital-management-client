// app/api/services/labService.ts
import { authFetch } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LabTest {
  _id: string;
  patientId: string;
  patientName: string;
  testType: string;
  orderedBy: string;
  orderedById: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in_progress' | 'completed';
  orderDate: string;
  sampleType: string;
  results?: any;
  technicianNotes?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  _id: string;
  name: string;
  model: string;
  status: 'online' | 'in_use' | 'maintenance' | 'offline';
  lastMaintenance?: string;
  nextMaintenance?: string;
  location?: string;
  technicianInCharge?: string;
  testsToday?: number;
}

interface LabResult {
  _id: string;
  testId: string;
  patientName: string;
  testType: string;
  status: 'Preliminary' | 'Final';
  resultDate: string;
  criticalValues: boolean;
  technician: string;
  values: Record<string, any>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const labService = {
  // Tests
  getTests: async (queryParams = ''): Promise<ApiResponse<LabTest[]>> => {
    return await authFetch(`${API_URL}/v1/lab/tests${queryParams}`);
  },

  createTest: async (data: Partial<LabTest>): Promise<ApiResponse<LabTest>> => {
    return await authFetch(`${API_URL}/v1/lab/tests`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateTest: async (id: string, data: Partial<LabTest>): Promise<ApiResponse<LabTest>> => {
    return await authFetch(`${API_URL}/v1/lab/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteTest: async (id: string): Promise<ApiResponse<{}>> => {
    return await authFetch(`${API_URL}/v1/lab/tests/${id}`, {
      method: 'DELETE'
    });
  },

  // Results
  getResults: async (queryParams = ''): Promise<ApiResponse<LabResult[]>> => {
    return await authFetch(`${API_URL}/v1/lab/results${queryParams}`);
  },

  submitResults: async (testId: string, results: any): Promise<ApiResponse<LabResult>> => {
    return await authFetch(`${API_URL}/v1/lab/results/${testId}`, {
      method: 'POST',
      body: JSON.stringify(results)
    });
  },

  // Equipment
  getEquipment: async (queryParams = ''): Promise<ApiResponse<Equipment[]>> => {
    return await authFetch(`${API_URL}/v1/lab/equipment${queryParams}`);
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<ApiResponse<Equipment>> => {
    return await authFetch(`${API_URL}/v1/lab/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Reports
  generateReport: async (type: string): Promise<ApiResponse<{ reportId: string }>> => {
    return await authFetch(`${API_URL}/v1/lab/reports`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },

  getReports: async (): Promise<ApiResponse<any[]>> => {
    return await authFetch(`${API_URL}/v1/lab/reports`);
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await authFetch(`${API_URL}/v1/lab/reports/${reportId}/download`, {
      headers: {
        'Accept': 'application/pdf' // or whatever format your reports are in
      }
    }, false);
    return await response.blob();
  }
};