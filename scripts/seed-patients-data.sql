-- Seed comprehensive patient data for hospital management system

-- Clear existing patient data
DELETE FROM patients;

-- Insert comprehensive patient records
INSERT INTO patients (
  id,
  name, 
  email, 
  phone, 
  date_of_birth, 
  gender, 
  address, 
  emergency_contact_name, 
  emergency_contact_phone, 
  insurance_provider, 
  insurance_policy_number, 
  medical_history, 
  allergies, 
  current_medications, 
  blood_type, 
  height, 
  weight, 
  created_at,
  updated_at
) VALUES 
-- High Priority Patients
(
  'pat_001', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567',
  '1975-03-15', 'Female', '123 Oak Street, Springfield, IL 62701',
  'Michael Johnson', '(555) 123-4568',
  'BlueCross BlueShield', 'BC123456789',
  'Hypertension, Type 2 Diabetes, History of stroke (2019)',
  'Penicillin, Shellfish, Latex',
  'Metformin 500mg twice daily, Lisinopril 10mg daily, Aspirin 81mg daily',
  'A+', '5''6"', '165 lbs', NOW(), NOW()
),
(
  'pat_002', 'Michael Chen', 'michael.chen@email.com', '(555) 234-5678',
  '1968-07-22', 'Male', '456 Maple Avenue, Springfield, IL 62702',
  'Lisa Chen', '(555) 234-5679',
  'Aetna', 'AET987654321',
  'Coronary Artery Disease, Sleep Apnea, High Cholesterol',
  'Morphine, Iodine',
  'Atorvastatin 40mg daily, Metoprolol 50mg twice daily, CPAP therapy',
  'O-', '5''10"', '185 lbs', NOW(), NOW()
),
(
  'pat_003', 'Emily Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789',
  '1990-11-08', 'Female', '789 Pine Street, Springfield, IL 62703',
  'Carlos Rodriguez', '(555) 345-6790',
  'UnitedHealthcare', 'UHC456789123',
  'Asthma, Seasonal Allergies',
  'Peanuts, Tree nuts',
  'Albuterol inhaler as needed, Flonase daily during allergy season',
  'B+', '5''4"', '135 lbs', NOW(), NOW()
),
(
  'pat_004', 'Robert Martinez', 'robert.martinez@email.com', '(555) 456-7890',
  '1955-12-03', 'Male', '321 Elm Drive, Springfield, IL 62704',
  'Maria Martinez', '(555) 456-7891',
  'Medicare', 'MED789123456',
  'Chronic Kidney Disease Stage 3, Gout, Osteoarthritis',
  'Sulfa drugs, Contrast dye',
  'Allopurinol 300mg daily, Furosemide 40mg daily, Calcium carbonate',
  'AB+', '5''8"', '175 lbs', NOW(), NOW()
),
(
  'pat_005', 'Amanda Davis', 'amanda.davis@email.com', '(555) 567-8901',
  '1995-04-18', 'Female', '654 Cedar Lane, Springfield, IL 62705',
  'Jennifer Davis', '(555) 567-8902',
  'Cigna', 'CIG123789456',
  'No significant medical history',
  'None known',
  'Multivitamin daily',
  'O+', '5''7"', '140 lbs', NOW(), NOW()
),

-- Medium Priority Patients
(
  'pat_006', 'David Kim', 'david.kim@email.com', '(555) 678-9012',
  '1982-09-14', 'Male', '987 Birch Road, Springfield, IL 62706',
  'Susan Kim', '(555) 678-9013',
  'Humana', 'HUM456123789',
  'Migraine, Anxiety Disorder',
  'Aspirin',
  'Sumatriptan as needed, Sertraline 50mg daily',
  'A-', '6''0"', '170 lbs', NOW(), NOW()
),
(
  'pat_007', 'Jennifer Wilson', 'jennifer.wilson@email.com', '(555) 789-0123',
  '1978-01-25', 'Female', '147 Willow Street, Springfield, IL 62707',
  'Mark Wilson', '(555) 789-0124',
  'Kaiser Permanente', 'KP789456123',
  'Hypothyroidism, Osteoporosis',
  'None known',
  'Levothyroxine 75mcg daily, Calcium with Vitamin D',
  'B-', '5''5"', '150 lbs', NOW(), NOW()
),
(
  'pat_008', 'Christopher Brown', 'chris.brown@email.com', '(555) 890-1234',
  '1988-06-30', 'Male', '258 Spruce Avenue, Springfield, IL 62708',
  'Ashley Brown', '(555) 890-1235',
  'Medicaid', 'MCD123456789',
  'Seasonal Allergies',
  'None known',
  'Claritin as needed',
  'O+', '5''11"', '180 lbs', NOW(), NOW()
),
(
  'pat_009', 'Lisa Anderson', 'lisa.anderson@email.com', '(555) 901-2345',
  '1992-08-12', 'Female', '369 Poplar Drive, Springfield, IL 62709',
  'Robert Anderson', '(555) 901-2346',
  'Anthem', 'ANT987654321',
  'Iron Deficiency Anemia',
  'None known',
  'Iron supplement 325mg daily',
  'A+', '5''3"', '125 lbs', NOW(), NOW()
),
(
  'pat_010', 'James Thompson', 'james.thompson@email.com', '(555) 012-3456',
  '1965-02-28', 'Male', '741 Hickory Lane, Springfield, IL 62710',
  'Patricia Thompson', '(555) 012-3457',
  'TRICARE', 'TRI456789123',
  'COPD, Former Smoker (quit 2018)',
  'Penicillin',
  'Tiotropium inhaler daily, Prednisone as needed',
  'B+', '5''9"', '160 lbs', NOW(), NOW()
),

-- Pediatric Patients
(
  'pat_011', 'Emma Johnson', 'parent.emma@email.com', '(555) 123-7890',
  '2019-05-10', 'Female', '852 Chestnut Street, Springfield, IL 62711',
  'Sarah Johnson', '(555) 123-7891',
  'BlueCross BlueShield', 'BC789123456',
  'Pediatric Asthma, Food Allergies',
  'Milk, Eggs, Peanuts',
  'Albuterol inhaler as needed, EpiPen',
  'A+', '3''2"', '35 lbs', NOW(), NOW()
),
(
  'pat_012', 'Lucas Chen', 'parent.lucas@email.com', '(555) 234-8901',
  '2016-09-22', 'Male', '963 Walnut Avenue, Springfield, IL 62712',
  'Michael Chen', '(555) 234-8902',
  'Aetna', 'AET123789456',
  'ADHD, Developmental Delay',
  'None known',
  'Methylphenidate 10mg daily',
  'O-', '4''1"', '55 lbs', NOW(), NOW()
),

-- Elderly Patients
(
  'pat_013', 'Margaret Foster', 'margaret.foster@email.com', '(555) 345-9012',
  '1946-11-15', 'Female', '159 Sycamore Road, Springfield, IL 62713',
  'John Foster Jr.', '(555) 345-9013',
  'Medicare + Supplement', 'MED456123789',
  'Alzheimer''s Disease, Atrial Fibrillation, Osteoporosis',
  'Warfarin (bleeding risk)',
  'Donepezil 10mg daily, Apixaban 5mg twice daily, Alendronate weekly',
  'AB-', '5''2"', '120 lbs', NOW(), NOW()
),
(
  'pat_014', 'William Turner', 'william.turner@email.com', '(555) 456-0123',
  '1939-04-07', 'Male', '357 Magnolia Drive, Springfield, IL 62714',
  'Dorothy Turner', '(555) 456-0124',
  'Medicare', 'MED789456123',
  'Prostate Cancer (in remission), Macular Degeneration, Hearing Loss',
  'Codeine',
  'Tamsulosin 0.4mg daily, AREDS2 vitamins, Hearing aids',
  'O+', '5''7"', '155 lbs', NOW(), NOW()
),

-- Recent Admissions
(
  'pat_015', 'Daniel Rodriguez', 'daniel.rodriguez@email.com', '(555) 567-1234',
  '1985-12-20', 'Male', '468 Dogwood Lane, Springfield, IL 62715',
  'Maria Rodriguez', '(555) 567-1235',
  'UnitedHealthcare', 'UHC789123456',
  'Recent Appendectomy (3 days ago), Post-operative care',
  'None known',
  'Acetaminophen as needed, Docusate sodium',
  'A-', '5''10"', '175 lbs', NOW(), NOW()
),
(
  'pat_016', 'Nicole Parker', 'nicole.parker@email.com', '(555) 678-2345',
  '1993-07-03', 'Female', '579 Redwood Street, Springfield, IL 62716',
  'Kevin Parker', '(555) 678-2346',
  'Cigna', 'CIG456789123',
  'Motor Vehicle Accident (1 week ago), Concussion, Whiplash',
  'Morphine',
  'Ibuprofen 600mg as needed, Muscle relaxant',
  'B+', '5''6"', '145 lbs', NOW(), NOW()
),

-- Complex Cases
(
  'pat_017', 'Thomas Mitchell', 'thomas.mitchell@email.com', '(555) 789-3456',
  '1952-10-11', 'Male', '680 Sequoia Avenue, Springfield, IL 62717',
  'Helen Mitchell', '(555) 789-3457',
  'Medicare + Medicaid', 'MED123789456',
  'End-stage Renal Disease, Diabetes Type 1, Diabetic Retinopathy',
  'Penicillin, Shellfish',
  'Insulin pump, Dialysis 3x/week, Erythropoietin injections',
  'AB+', '5''8"', '140 lbs', NOW(), NOW()
),
(
  'pat_018', 'Patricia Lewis', 'patricia.lewis@email.com', '(555) 890-4567',
  '1960-01-30', 'Female', '791 Cypress Drive, Springfield, IL 62718',
  'Charles Lewis', '(555) 890-4568',
  'Humana', 'HUM789123456',
  'Congestive Heart Failure, COPD, Pulmonary Hypertension',
  'ACE inhibitors (cough)',
  'Furosemide 80mg daily, Carvedilol 25mg twice daily, Oxygen therapy',
  'O-', '5''4"', '130 lbs', NOW(), NOW()
),

-- Additional Diverse Cases
(
  'pat_019', 'Kevin Washington', 'kevin.washington@email.com', '(555) 901-5678',
  '1987-03-25', 'Male', '802 Juniper Lane, Springfield, IL 62719',
  'Denise Washington', '(555) 901-5679',
  'Kaiser Permanente', 'KP123456789',
  'Sickle Cell Disease, Chronic Pain',
  'Morphine, Codeine',
  'Hydroxyurea 500mg daily, Folic acid, Pain management protocol',
  'S', '6''1"', '165 lbs', NOW(), NOW()
),
(
  'pat_020', 'Rachel Green', 'rachel.green@email.com', '(555) 012-6789',
  '1991-09-17', 'Female', '913 Cedar Ridge Road, Springfield, IL 62720',
  'Michael Green', '(555) 012-6790',
  'Anthem', 'ANT123456789',
  'Pregnancy (32 weeks), Gestational Diabetes',
  'None known',
  'Prenatal vitamins, Insulin as needed, Regular monitoring',
  'A+', '5''5"', '165 lbs', NOW(), NOW()
);

-- Update sequence for patient IDs
SELECT setval('patients_id_seq', 20, true);
