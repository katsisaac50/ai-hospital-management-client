"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authFetch } from '@/lib/api'

const API_URI = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface Claim {
  id: string;
  patientName: string;
  provider: string;
  amount: number;
  status: string;
  submittedDate: string;
  processedDate: string | null;
  billing?: {
    invoiceNumber: string;
    total: number;
    currency: string;
    status: string;
    paymentStatus: string;
    insuranceClaim: {
      claimStatus: string;
      claimAmount: number;
      claimReference: string;
    };
  };
  patient?: {
    name: string;
    email: string;
    phone: string;
    insuranceProvider: string;
    insuranceId: string;
  };
}

interface ApiResponse {
  success: boolean;
  count: number;
  pagination: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  data: Claim[];
}

interface Stats {
  total: number;
  approved: number;
  underReview: number;
  denied: number;
  pending: number;
  totalAmount: number;
  approvedAmount: number;
}

const statusOptions = ["All", "Approved", "Under Review", "Denied", "Pending"];
const providerOptions = ["All", "BlueCross", "Aetna", "UnitedHealth", "Other"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Under Review":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Denied":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Pending":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export function InsuranceClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    underReview: 0,
    denied: 0,
    pending: 0,
    totalAmount: 0,
    approvedAmount: 0,
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (providerFilter !== "All") params.append("provider", providerFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      const response = await authFetch(`${API_URI}/v1/claims?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      setClaims(data.data);
      setPagination(prev => ({ ...prev, total: data.count }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch(`${API_URI}/v1/claims/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string) => {
    try {
      const response = await authFetch(`${API_URI}/v1/claims/${claimId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the claims list after update
      fetchClaims();
    } catch (err) {
      console.error("Error updating claim status:", err);
      alert("Failed to update claim status. Please try again.");
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, [statusFilter, providerFilter, searchTerm, pagination.page, pagination.limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleProviderFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProviderFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusUpdate = (claimId: string, newStatus: string) => {
    if (confirm("Are you sure you want to update the claim status?")) {
      updateClaimStatus(claimId, newStatus);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              <p>Error: {error}</p>
              <p className="mt-2">Make sure the backend server is running</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Total Claims</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Under Review</p>
                <p className="text-2xl font-bold text-white">{stats.underReview}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Insurance Claims</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by patient, claim ID, or invoice..."
                className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-400 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-slate-400 mb-1">
                Provider
              </label>
              <select
                id="provider"
                className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                value={providerFilter}
                onChange={handleProviderFilterChange}
              >
                {providerOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-slate-400 mb-1">
                Items per page
              </label>
              <select
                id="limit"
                className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="mt-2">Loading claims...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">No claims found.</p>
              {searchTerm || statusFilter !== "All" || providerFilter !== "All" ? (
                <p className="text-sm">Try adjusting your search or filters</p>
              ) : null}
            </div>
          ) : (
            <>
              {claims.map((claim) => (
                <div key={claim.id} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{claim.patientName}</h4>
                      <p className="text-slate-400 text-sm">
                        Claim ID: {claim.id} • {claim.provider}
                        {claim.billing?.invoiceNumber && ` • Invoice: ${claim.billing.invoiceNumber}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      {claim.status === "Under Review" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(claim.id, "Approved")}
                            className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30 transition-colors"
                            title="Approve claim"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(claim.id, "Denied")}
                            className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-colors"
                            title="Deny claim"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Amount</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(claim.amount, claim.billing?.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Submitted</p>
                      <p className="text-white">{claim.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Processed</p>
                      <p className="text-white">{claim.processedDate || "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Billing Status</p>
                      <p className="text-white">{claim.billing?.paymentStatus || "N/A"}</p>
                    </div>
                  </div>
                  {claim.billing?.insuranceClaim && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-sm">Insurance Claim: {claim.billing.insuranceClaim.claimStatus}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <p className="text-slate-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-md text-white">
                    {pagination.page}
                  </span>
                  <button
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
