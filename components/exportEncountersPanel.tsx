"use client";

import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface ExportEncountersPanelProps {
  patientId: string;
}

export default function ExportEncountersPanel({ patientId }: ExportEncountersPanelProps) {
  // ✅ Default dates: start = one month ago, end = today
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(1, "month"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (startDate) query.append("start", startDate.format("YYYY-MM-DD"));
      if (endDate) query.append("end", endDate.format("YYYY-MM-DD"));
      if (includeDeleted) query.append("includeDeleted", "true");

      const url = `/api/v1/encounters/export/${patientId}?${query.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "text/csv" },
      });

      if (!response.ok) throw new Error("Failed to export encounters");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const today = dayjs().format("YYYY-MM-DD");
      link.download = `encounters_${patientId}_${today}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export encounters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 360, p: 2 }}>
      <Typography variant="h6">Export Encounters CSV</Typography>

      <DatePicker
        label="Start Date"
        value={startDate}
        onChange={(newValue) => setStartDate(newValue)}
        slotProps={{ textField: { fullWidth: true } }}
      />

      <DatePicker
        label="End Date"
        value={endDate}
        onChange={(newValue) => setEndDate(newValue)}
        slotProps={{ textField: { fullWidth: true } }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
        }
        label="Include Deleted Encounters"
      />

      <Button
        sx={{ minWidth: 220 }}
        variant="contained"
        color="primary"
        onClick={handleExport}
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : undefined
        }
      >
        {loading ? "Exporting..." : "Export Encounters CSV"}
      </Button>
    </Stack>
  );
}
