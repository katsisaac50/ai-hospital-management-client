import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const interactionData = await request.json()

    const result = await aiServices.checkDrugInteractions(interactionData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Drug Interaction API Error:", error)
    return NextResponse.json({ error: "Failed to check drug interactions" }, { status: 500 })
  }
}
