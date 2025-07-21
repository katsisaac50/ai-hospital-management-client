import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface MedicalQuery {
  symptoms: string[]
  patientAge: number
  patientGender: string
  medicalHistory: string[]
  currentMedications: string[]
}

export interface DrugInteractionCheck {
  medications: string[]
  patientAge: number
  patientWeight?: number
  allergies: string[]
}

export interface DiagnosisAssistance {
  symptoms: string
  vitalSigns?: {
    temperature: number
    bloodPressure: string
    heartRate: number
    respiratoryRate: number
  }
  labResults?: any[]
}

export const aiServices = {
  async getDifferentialDiagnosis(query: DiagnosisAssistance) {
    const prompt = `
    As a medical AI assistant, provide a differential diagnosis based on the following information:
    
    Symptoms: ${query.symptoms}
    ${query.vitalSigns ? `Vital Signs: Temperature: ${query.vitalSigns.temperature}°F, BP: ${query.vitalSigns.bloodPressure}, HR: ${query.vitalSigns.heartRate}, RR: ${query.vitalSigns.respiratoryRate}` : ""}
    ${query.labResults ? `Lab Results: ${JSON.stringify(query.labResults)}` : ""}
    
    Please provide:
    1. Top 3 most likely diagnoses with probability percentages
    2. Recommended additional tests or examinations
    3. Immediate treatment considerations
    4. Red flags to watch for
    
    Format as JSON with the following structure:
    {
      "diagnoses": [
        {"condition": "string", "probability": number, "reasoning": "string"}
      ],
      "recommendedTests": ["string"],
      "treatmentConsiderations": ["string"],
      "redFlags": ["string"]
    }
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("AI Diagnosis Error:", error)
      throw new Error("Failed to generate diagnosis assistance")
    }
  },

  async checkDrugInteractions(check: DrugInteractionCheck) {
    const prompt = `
    Analyze potential drug interactions for the following medications:
    
    Medications: ${check.medications.join(", ")}
    Patient Age: ${check.patientAge}
    ${check.patientWeight ? `Patient Weight: ${check.patientWeight}kg` : ""}
    Known Allergies: ${check.allergies.join(", ")}
    
    Please provide:
    1. Major drug interactions with severity levels
    2. Dosage adjustments needed based on age/weight
    3. Monitoring recommendations
    4. Alternative medication suggestions if needed
    
    Format as JSON:
    {
      "interactions": [
        {
          "drugs": ["string"],
          "severity": "major|moderate|minor",
          "description": "string",
          "mechanism": "string",
          "management": "string"
        }
      ],
      "dosageAdjustments": [
        {
          "medication": "string",
          "recommendation": "string",
          "reasoning": "string"
        }
      ],
      "monitoring": ["string"],
      "alternatives": [
        {
          "original": "string",
          "alternative": "string",
          "reason": "string"
        }
      ]
    }
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Drug Interaction Check Error:", error)
      throw new Error("Failed to check drug interactions")
    }
  },

  async optimizeMedicationDosage(medication: string, patientData: any) {
    const prompt = `
    Optimize dosage for ${medication} based on patient data:
    
    Patient Data: ${JSON.stringify(patientData)}
    
    Consider:
    - Age-related pharmacokinetic changes
    - Renal/hepatic function
    - Drug interactions
    - Comorbidities
    
    Provide optimized dosage recommendation with rationale.
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
      })

      return text
    } catch (error) {
      console.error("Dosage Optimization Error:", error)
      throw new Error("Failed to optimize medication dosage")
    }
  },

  async generateClinicalSummary(patientId: string, visitData: any) {
    const prompt = `
    Generate a clinical summary for patient visit:
    
    Visit Data: ${JSON.stringify(visitData)}
    
    Include:
    - Chief complaint and history
    - Physical examination findings
    - Assessment and plan
    - Follow-up recommendations
    
    Format as a professional medical note.
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
      })

      return text
    } catch (error) {
      console.error("Clinical Summary Error:", error)
      throw new Error("Failed to generate clinical summary")
    }
  },

  async predictPatientRisk(patientData: any, riskType: "readmission" | "complications" | "mortality") {
    const prompt = `
    Predict ${riskType} risk for patient:
    
    Patient Data: ${JSON.stringify(patientData)}
    
    Analyze risk factors and provide:
    1. Risk score (0-100)
    2. Key risk factors identified
    3. Mitigation strategies
    4. Monitoring recommendations
    
    Format as JSON:
    {
      "riskScore": number,
      "riskLevel": "low|moderate|high",
      "keyFactors": ["string"],
      "mitigationStrategies": ["string"],
      "monitoringRecommendations": ["string"]
    }
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Risk Prediction Error:", error)
      throw new Error("Failed to predict patient risk")
    }
  },
}
