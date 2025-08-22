"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { authFetch } from '@/lib/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

// Example option lists
const testTypes = ["Blood Test", "Urine Test", "X-Ray", "MRI"];
const sampleTypes = ["Blood", "Urine", "Saliva", "Tissue"];
const category = ["hematology", "biochemistry", "microbiology", "pathology", "radiology"];

const testFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  testType: z.string().min(1, "Test type is required"),
  priority: z.enum(["routine", "urgent", "stat"]),
  sampleType: z.string().min(1, "Sample type is required"),
  notes: z.string().optional(),
  category: z.string().optional(),
  orderedBy: z.string().optional(),
  price: z.coerce.number().optional(),
  turnaroundTime: z.coerce.number().optional(),
  description: z.string().optional(),
  preparationInstructions: z.string().optional(),
});

export function EditTestDialog({ test, onOpenChange, onTestUpdated }) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  
useEffect(() => {
  const fetchPatients = async () => {
    // console.log("apit", API_URL)
    const res = await authFetch(`${API_URL}/v1/patients`);
    // console.log('res', res)
    const json = await res.json();
    const data = json?.data || [];

    
    setPatients(data)
  }

  fetchPatients()
}, [])
  
console.log(patients)

  const form = useForm({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      testType: "",
      priority: "routine",
      sampleType: "",
      notes: "",
      category: "",
      orderedBy: "",
      price: undefined,
      turnaroundTime: undefined,
      description: "",
      preparationInstructions: "",
    },
  });

  useEffect(() => {
    console.log(onTestUpdated, onOpenChange, test)
    if (test) {
      form.reset({
        patientId: test.patientId?.id || "",
        patientName: test.patientId?.name || "",
        testType: test.testType || "",
        priority: test.priority || "routine",
        sampleType: test.sampleType || "",
        notes: test.notes || "",
        category: test.category || "",
        orderedBy: test.orderedBy || "",
        price: test.price ?? undefined,
        turnaroundTime: test.turnaroundTime ?? undefined,
        description: test.description || "",
        preparationInstructions: test.preparationInstructions || "",
      });
    }
  }, [test, form]);

  const onSubmit = async (values) => {
    console.log('values', values)
    try {
      setLoading(true);
      // await axios.put(`/api/lab-tests/${test._id}`, values);
      onTestUpdated(values, test._id);
      toast({ title: "Success", description: "Test updated successfully." });
      
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update test.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!test} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 z-10 bg-background px-4 py-2 shadow-sm">
          <DialogTitle>Edit Laboratory Test {`PatientId: ${test.patientId.medicalRecordNumber}`} — {`Patient Name: ${test.patientId.name}`}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {console.log('p', p)}
                          {p.medicalRecordNumber} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {category.map((categ) => (
                        <SelectItem key={categ} value={categ}>
                          {categ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="testType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sampleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sample type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sampleTypes.map((sample) => (
                        <SelectItem key={sample} value={sample}>
                          {sample}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orderedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordered By</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ordering doctor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="turnaroundTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turnaround Time (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter turnaround time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preparationInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter preparation instructions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Sticky Footer */}
<div className="sticky bottom-0 z-10 bg-background px-4 py-2 flex flex-col sm:flex-row justify-end gap-2 border-t shadow-inner">
  
  <Button 
   disabled={loading}
    type="submit"  
    className="w-full sm:w-auto"
  >
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
  </Button>
</div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
