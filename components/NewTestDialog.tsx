"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { authFetch } from '@/lib/api'

const testFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  testType: z.string().min(1, "Test type is required"),
  category: z.enum(["hematology", "biochemistry", "microbiology", "pathology", "radiology"]),
  priority: z.enum(["routine", "urgent", "stat"]),
  price: z.string().min(1, "Price is required"),
  turnaroundTime: z.string().min(1, "Turnaround time is required"),
  sampleType: z.string().min(1, "Sample type is required"),
  description: z.string().optional(),
  preparationInstructions: z.string().optional(),
  notes: z.string().optional()
});

type TestFormValues = z.infer<typeof testFormSchema>;

type CategoryInfo = {
  [key: string]: {
    sampleTypes: string[],
    testTypes: string[]
  }
}

export function NewTestDialog({ onCreate }: { onCreate: (data: any) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>({});
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [sampleTypes, setSampleTypes] = useState<string[]>([]);
  const [patients, setPatients] = useState([]);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      testType: "",
      category: "hematology",
      priority: "routine",
      price: "",
      turnaroundTime: "",
      sampleType: "",
      description: "",
      preparationInstructions: "",
      notes: ""
    }
  });
  console.log('category', categoryInfo)

  // Fetch categories info from backend on open
  useEffect(() => {
  if (!open) return;

  Promise.all([
    authFetch("http://localhost:5000/api/v1/patients").then((res) => res.json()),
    authFetch("http://localhost:5000/api/v1/test-options").then((res) => res.json()),
  ])
    .then(([patientsData, optionsData]) => {
      console.log("patientsData", patientsData);
      console.log("optionsData", optionsData);

      // Set patients state
      setPatients(patientsData.data || []);

      // Transform categories
      const categoryObj: CategoryInfo = {};
      optionsData.data.forEach((cat: any) => {
        categoryObj[cat.category] = {
          sampleTypes: cat.sampleTypes,
          testTypes: cat.testTypes,
        };
      });
      setCategoryInfo(categoryObj);

      // Default values
      const defaultCategory = "hematology";
      const defaultTestType = categoryObj[defaultCategory]?.testTypes?.[0] || "";
      const defaultSampleType = categoryObj[defaultCategory]?.sampleTypes?.[0] || "";
      const defaultPatientId = patientsData.data?.[0]?.id || "";

      // Set dropdown lists
      setTestTypes(categoryObj[defaultCategory]?.testTypes || []);
      setSampleTypes(categoryObj[defaultCategory]?.sampleTypes || []);

      // Reset form with defaults including first patient
      form.reset({
        patientId: defaultPatientId,
        category: defaultCategory,
        testType: defaultTestType,
        sampleType: defaultSampleType,
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "Failed to load categories info",
        variant: "destructive",
      });
    });
}, [open]);


  // Update testTypes and sampleTypes on category change
  const handleCategoryChange = (category: any) => {
    form.setValue("category", category);
    const info = categoryInfo[category];
    if (info) {
      setTestTypes(info.testTypes || []);
      setSampleTypes(info.sampleTypes || []);
      // Reset testType and sampleType to first available
      form.setValue("testType", info.testTypes[0] || "");
      form.setValue("sampleType", info.sampleTypes[0] || "");
    }
  };

  const onSubmit = async (data: TestFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        turnaroundTime: Number(data.turnaroundTime)
      };
      const success = await onCreate(payload);
      if (success) {
        toast({
          title: "Success",
          description: "Test created successfully"
        });
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create New Lab Test</DialogTitle>
          <DialogDescription>Fill in the test details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
  control={form.control}
  name="patientId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Patient</FormLabel>
      <Select
        value={field.value}
        onValueChange={(val) => {
        console.log(val)
          const selectedPatient = patients.find(p => p.id === val);
          field.onChange(val);
          form.setValue("patientName", selectedPatient?.name || "");
        }}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {patients.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.medicalRecordNumber} — {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

            {/* Category Dropdown */}
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select
        value={form.watch("category")}
        onValueChange={(val) => handleCategoryChange(val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(categoryInfo).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>

{/* Test Type Dropdown */}
<FormField
  control={form.control}
  name="testType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Test Type</FormLabel>
      <Select
        value={form.watch("testType")}
        onValueChange={(val) => form.setValue("testType", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select test type" />
        </SelectTrigger>
        <SelectContent>
          {testTypes.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>

{/* Sample Type Dropdown */}
<FormField
  control={form.control}
  name="sampleType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Sample Type</FormLabel>
      <Select
        value={form.watch("sampleType")}
        onValueChange={(val) => form.setValue("sampleType", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select sample type" />
        </SelectTrigger>
        <SelectContent>
          {sampleTypes.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
            <FormField name="priority" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">Stat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="price" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="Price" className="bg-slate-700 border-slate-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="turnaroundTime" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Turnaround Time (hours)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="Turnaround Time" className="bg-slate-700 border-slate-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-slate-700 border-slate-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="preparationInstructions" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Instructions</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-slate-700 border-slate-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="notes" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-slate-700 border-slate-600" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
              {loading ? "Saving..." : "Save Test"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
