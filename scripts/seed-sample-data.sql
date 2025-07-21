-- Seed sample data for hospital management system

-- Insert sample patients
INSERT INTO patients (name, email, phone, date_of_birth, gender, address, insurance_provider, emergency_contact, medical_history, allergies) VALUES
('Sarah Johnson', 'sarah.j@email.com', '+1-555-123-4567', '1989-03-15', 'Female', '123 Main St, City, State 12345', 'BlueCross BlueShield', 'John Johnson +1-555-123-4568', '["Hypertension", "Diabetes Type 2"]', '["Penicillin", "Shellfish"]'),
('Michael Chen', 'm.chen@email.com', '+1-555-987-6543', '1975-08-22', 'Male', '456 Oak Ave, City, State 12345', 'Aetna', 'Lisa Chen +1-555-987-6544', '["High Cholesterol"]', '["None known"]'),
('Emily Rodriguez', 'emily.r@email.com', '+1-555-456-7890', '1992-12-03', 'Female', '789 Pine St, City, State 12345', 'UnitedHealthcare', 'Carlos Rodriguez +1-555-456-7891', '["Asthma"]', '["Latex"]'),
('David Kim', 'david.k@email.com', '+1-555-321-0987', '1968-05-18', 'Male', '321 Elm Dr, City, State 12345', 'Medicare', 'Susan Kim +1-555-321-0988', '["Heart Disease", "Arthritis"]', '["Aspirin"]');

-- Insert sample doctors
INSERT INTO doctors (name, email, phone, specialty, license_number, department, experience_years, availability) VALUES
('Dr. Amanda Wilson', 'a.wilson@hospital.com', '+1-555-111-2222', 'Cardiology', 'MD123456', 'Cardiology', 15, '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-15:00"}'),
('Dr. James Rodriguez', 'j.rodriguez@hospital.com', '+1-555-333-4444', 'Neurology', 'MD234567', 'Neurology', 12, '{"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-12:00"}'),
('Dr. Lisa Chen', 'l.chen@hospital.com', '+1-555-555-6666', 'Pediatrics', 'MD345678', 'Pediatrics', 8, '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}'),
('Dr. Robert Taylor', 'r.taylor@hospital.com', '+1-555-777-8888', 'Emergency Medicine', 'MD456789', 'Emergency', 20, '{"monday": "0:00-23:59", "tuesday": "0:00-23:59", "wednesday": "0:00-23:59", "thursday": "0:00-23:59", "friday": "0:00-23:59", "saturday": "0:00-23:59", "sunday": "0:00-23:59"}');

-- Insert sample medications
INSERT INTO medications (name, generic_name, strength, form, manufacturer, ndc_number, current_stock, min_stock, max_stock, unit_price, expiry_date, location) VALUES
('Amoxicillin', 'Amoxicillin', '500mg', 'Capsule', 'PharmaCorp', '12345-678-90', 45, 50, 200, 2.50, '2025-06-15', 'A-12-3'),
('Metformin', 'Metformin HCl', '850mg', 'Tablet', 'MediLab', '23456-789-01', 180, 100, 300, 1.25, '2025-12-20', 'B-08-1'),
('Lisinopril', 'Lisinopril', '10mg', 'Tablet', 'CardioMed', '34567-890-12', 25, 30, 150, 3.75, '2025-09-30', 'C-15-2'),
('Omeprazole', 'Omeprazole', '20mg', 'Capsule', 'GastroPharm', '45678-901-23', 120, 60, 200, 4.20, '2025-08-10', 'D-05-4'),
('Albuterol', 'Albuterol Sulfate', '90mcg', 'Inhaler', 'RespiraCare', '56789-012-34', 35, 25, 100, 45.00, '2025-11-25', 'E-03-1');

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration, type, status, notes) VALUES
((SELECT id FROM patients WHERE email = 'sarah.j@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), '2024-01-16', '09:00', 30, 'Follow-up', 'scheduled', 'Routine cardiology follow-up'),
((SELECT id FROM patients WHERE email = 'm.chen@email.com'), (SELECT id FROM doctors WHERE email = 'j.rodriguez@hospital.com'), '2024-01-16', '10:30', 45, 'Consultation', 'scheduled', 'Neurological assessment'),
((SELECT id FROM patients WHERE email = 'emily.r@email.com'), (SELECT id FROM doctors WHERE email = 'l.chen@hospital.com'), '2024-01-16', '14:15', 30, 'Check-up', 'scheduled', 'Asthma management review'),
((SELECT id FROM patients WHERE email = 'david.k@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), '2024-01-16', '15:45', 60, 'Consultation', 'scheduled', 'Cardiac evaluation');

-- Insert sample prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, medication_id, dosage, frequency, duration, quantity, refills, status) VALUES
((SELECT id FROM patients WHERE email = 'sarah.j@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), (SELECT id FROM medications WHERE name = 'Lisinopril'), '10mg', 'Once daily', '30 days', 30, 2, 'active'),
((SELECT id FROM patients WHERE email = 'm.chen@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), (SELECT id FROM medications WHERE name = 'Metformin'), '850mg', 'Twice daily', '90 days', 180, 3, 'active'),
((SELECT id FROM patients WHERE email = 'emily.r@email.com'), (SELECT id FROM doctors WHERE email = 'l.chen@hospital.com'), (SELECT id FROM medications WHERE name = 'Albuterol'), '2 puffs', 'As needed', '30 days', 1, 1, 'active');

-- Insert sample lab tests
INSERT INTO lab_tests (patient_id, doctor_id, test_type, test_code, priority, status, sample_type, collection_date) VALUES
((SELECT id FROM patients WHERE email = 'sarah.j@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), 'Complete Blood Count', 'CBC', 'routine', 'completed', 'Blood', '2024-01-15 08:30:00'),
((SELECT id FROM patients WHERE email = 'm.chen@email.com'), (SELECT id FROM doctors WHERE email = 'a.wilson@hospital.com'), 'Lipid Panel', 'LIPID', 'routine', 'in_progress', 'Blood', '2024-01-15 09:00:00'),
((SELECT id FROM patients WHERE email = 'emily.r@email.com'), (SELECT id FROM doctors WHERE email = 'l.chen@hospital.com'), 'Thyroid Function', 'TSH', 'routine', 'pending', 'Blood', '2024-01-15 09:30:00');

-- Insert sample invoices
INSERT INTO invoices (patient_id, amount, tax_amount, total_amount, status, due_date, line_items) VALUES
((SELECT id FROM patients WHERE email = 'sarah.j@email.com'), 400.00, 50.75, 450.75, 'paid', '2024-02-14', '[{"description": "Cardiology Consultation", "amount": 250.00}, {"description": "Blood Test", "amount": 150.00}]'),
((SELECT id FROM patients WHERE email = 'm.chen@email.com'), 1100.00, 150.00, 1250.00, 'pending', '2024-02-13', '[{"description": "Neurology Consultation", "amount": 300.00}, {"description": "MRI Scan", "amount": 800.00}]'),
((SELECT id FROM patients WHERE email = 'emily.r@email.com'), 780.25, 110.00, 890.25, 'overdue', '2024-02-12', '[{"description": "Emergency Visit", "amount": 500.00}, {"description": "X-Ray", "amount": 280.25}]');
