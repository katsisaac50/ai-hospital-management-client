"use client";

import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from "@/lib/api"
import toast from 'react-hot-toast';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const departments = ['emergency', 'cardiology', 'neurology', 'pediatrics'];
const availabilities = ['Available', 'Busy', 'On Leave'];


export default function DoctorModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    specializations: [''],
    department: '',
    licenseNumber: '',
    phone: '',
    email: '',
    rating: 0,
    experience: '',
    patientsCount: 0,
    availability: 'Available',
    nextSlot: '',
    schedule: [
      // Example initial slot
      { day: 'monday', startTime: '', endTime: '', isAvailable: true, capacity: 5 },
    ],
    isActive: true,
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle input changes (general)
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  // Special handling for specializations array inputs
  function handleSpecializationChange(index, value) {
    const newSpecs = [...form.specializations];
    newSpecs[index] = value;
    setForm(prev => ({ ...prev, specializations: newSpecs }));
  }
  function addSpecialization() {
    setForm(prev => ({ ...prev, specializations: [...prev.specializations, ''] }));
  }
  function removeSpecialization(index) {
    const newSpecs = form.specializations.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, specializations: newSpecs.length ? newSpecs : [''] }));
  }

  // Handling schedule slots
  function handleScheduleChange(index, field, value) {
    const newSchedule = [...form.schedule];
    newSchedule[index][field] = field === 'capacity' ? Number(value) : value;
    setForm(prev => ({ ...prev, schedule: newSchedule }));
  }
  function addScheduleSlot() {
    setForm(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'monday', startTime: '', endTime: '', isAvailable: true, capacity: 5 }],
    }));
  }
  function removeScheduleSlot(index) {
    const newSchedule = form.schedule.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, schedule: newSchedule.length ? newSchedule : [{ day: 'monday', startTime: '', endTime: '', isAvailable: true, capacity: 5 }] }));
  }

  // Validation helpers
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const nextSlotRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  const licenseRegex = /^DOC-\d{5}$/;
  const phoneRegex = /^\d{10}$/;

  function validateForm() {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.specializations.length || form.specializations.some(s => !s.trim())) return 'At least one specialization is required';
    if (!departments.includes(form.department)) return 'Valid department is required';
    if (!licenseRegex.test(form.licenseNumber)) return 'License number must be in format DOC-12345';
    if (!phoneRegex.test(form.phone)) return 'Phone must be 10 digits';
    if (!form.email.endsWith('@hospital.com')) return 'Email must be hospital.com domain';
    if (form.experience && !/^\d+\s+years?$/.test(form.experience)) return 'Experience must be like "8 years"';
    if (form.nextSlot && !nextSlotRegex.test(form.nextSlot)) return 'Next slot must be in format like "1:45 PM"';
    for (const slot of form.schedule) {
      if (!daysOfWeek.includes(slot.day)) return 'Invalid day in schedule';
      if (!timeRegex.test(slot.startTime)) return `Invalid startTime in schedule: ${slot.startTime}`;
      if (!timeRegex.test(slot.endTime)) return `Invalid endTime in schedule: ${slot.endTime}`;
      if (slot.startTime >= slot.endTime) return 'startTime must be less than endTime in schedule';
      if (slot.capacity < 1) return 'Capacity must be at least 1';
    }
    return null;
  }

  async function handleSubmit(e) {
  e.preventDefault();
  const error = validateForm();
  if (error) {
    alert(error);
    return;
  }

  setLoading(true);
  try {
    const response = await authFetch(`${API_URL}/v1/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const savedDoctor = await response.json();
    onSave(savedDoctor); // ⬅️ Callback to parent
    toast.success("Doctor saved!");
    onClose();
  } catch (err) {
    console.error("Failed to save doctor", err);
    toast.error("Doctor save failed.");
  } finally {
    setLoading(false);
  }
}


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Add / Edit Doctor</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div className="flex gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="flex-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="flex-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
            />
          </div>

          {/* Specializations array */}
          <div>
            <label className="block mb-1">Specializations</label>
            {form.specializations.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={spec}
                  onChange={e => handleSpecializationChange(i, e.target.value)}
                  className="flex-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
                  placeholder="Specialization"
                  required
                />
                <button type="button" onClick={() => removeSpecialization(i)} className="bg-red-600 px-2 rounded">X</button>
              </div>
            ))}
            <button type="button" onClick={addSpecialization} className="text-cyan-400 underline">Add Specialization</button>
          </div>

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          >
            <option value="" disabled>Select Department</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep.charAt(0).toUpperCase() + dep.slice(1)}</option>
            ))}
          </select>

          <input
            name="licenseNumber"
            placeholder="License Number (DOC-12345)"
            value={form.licenseNumber}
            onChange={handleChange}
            required
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <input
            name="phone"
            placeholder="Phone Number (10 digits)"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <input
            name="email"
            placeholder="Email (must end with @hospital.com)"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <input
            name="rating"
            placeholder="Rating (0-5)"
            type="number"
            min={0}
            max={5}
            value={form.rating}
            onChange={handleChange}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <input
            name="experience"
            placeholder='Experience (e.g. "8 years")'
            value={form.experience}
            onChange={handleChange}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <input
            name="patientsCount"
            placeholder="Patients Count"
            type="number"
            min={0}
            value={form.patientsCount}
            onChange={handleChange}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          >
            {availabilities.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <input
            name="nextSlot"
            placeholder='Next Slot (e.g. "1:45 PM")'
            value={form.nextSlot}
            onChange={handleChange}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
          />

          {/* Schedule slots */}
          <div>
            <label className="block mb-1 text-white font-semibold">Schedule</label>
            {form.schedule.map((slot, i) => (
              <div key={i} className="mb-4 border border-slate-600 p-3 rounded">
                <select
                  value={slot.day}
                  onChange={e => handleScheduleChange(i, 'day', e.target.value)}
                  className="w-full mb-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                  ))}
                </select>

                <input
                  type="time"
                  value={slot.startTime}
                  onChange={e => handleScheduleChange(i, 'startTime', e.target.value)}
                  className="w-full mb-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
                  required
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={e => handleScheduleChange(i, 'endTime', e.target.value)}
                  className="w-full mb-1 p-2 bg-slate-700/50 border border-slate-600 rounded"
                  required
                />
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={e => handleScheduleChange(i, 'isAvailable', e.target.checked)}
                  />
                  Available
                </label>
                <input
                  type="number"
                  min={1}
                  value={slot.capacity}
                  onChange={e => handleScheduleChange(i, 'capacity', e.target.value)}
                  className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded"
                  placeholder="Capacity"
                />
                <button
                  type="button"
                  onClick={() => removeScheduleSlot(i)}
                  className="mt-1 text-red-600 underline"
                >
                  Remove Slot
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addScheduleSlot}
              className="text-cyan-400 underline"
            >
              Add Schedule Slot
            </button>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          <button
            type="submit"
            // className={`w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded font-bold mt-4`}
            className={`w-full p-3 rounded font-bold mt-4 ${
    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'
  }`}
          >
            {loading ? 'Saving...' : 'Save Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
}
