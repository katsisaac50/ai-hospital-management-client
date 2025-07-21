import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const patients = await db.getPatients()

    // Convert to FHIR format
    const fhirBundle = {
      resourceType: "Bundle",
      type: "searchset",
      total: patients.length,
      entry: patients.map((patient) => ({
        resource: {
          resourceType: "Patient",
          id: patient.id,
          name: [
            {
              text: patient.name,
              family: patient.name.split(" ").pop(),
              given: patient.name.split(" ").slice(0, -1),
            },
          ],
          telecom: [
            {
              system: "phone",
              value: patient.phone,
            },
            {
              system: "email",
              value: patient.email,
            },
          ],
          gender: patient.gender.toLowerCase(),
          birthDate: patient.date_of_birth,
          address: [
            {
              text: patient.address,
            },
          ],
        },
      })),
    }

    return NextResponse.json(fhirBundle)
  } catch (error) {
    console.error("FHIR Patient API Error:", error)
    return NextResponse.json({ error: "Failed to fetch FHIR patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const fhirPatient = await request.json()

    // Convert FHIR to internal format
    const patient = {
      name: fhirPatient.name?.[0]?.text || "",
      email: fhirPatient.telecom?.find((t: any) => t.system === "email")?.value || "",
      phone: fhirPatient.telecom?.find((t: any) => t.system === "phone")?.value || "",
      date_of_birth: fhirPatient.birthDate || "",
      gender: fhirPatient.gender || "",
      address: fhirPatient.address?.[0]?.text || "",
      insurance_provider: "",
      emergency_contact: "",
      medical_history: [],
      allergies: [],
    }

    const createdPatient = await db.createPatient(patient)

    return NextResponse.json({
      resourceType: "Patient",
      id: createdPatient.id,
      ...fhirPatient,
    })
  } catch (error) {
    console.error("FHIR Patient Create Error:", error)
    return NextResponse.json({ error: "Failed to create FHIR patient" }, { status: 500 })
  }
}
