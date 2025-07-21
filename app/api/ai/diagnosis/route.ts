import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const diagnosisData = await request.json()

    const result = await aiServices.getDifferentialDiagnosis(diagnosisData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI Diagnosis API Error:", error)
    return NextResponse.json({ error: "Failed to generate diagnosis" }, { status: 500 })
  }
}
