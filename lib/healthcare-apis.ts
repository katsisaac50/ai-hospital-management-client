// Integration with healthcare APIs and services

export interface FHIRResource {
  resourceType: string
  id: string
  meta?: any
  [key: string]: any
}

export interface HL7Message {
  messageType: string
  sendingApplication: string
  receivingApplication: string
  timestamp: string
  data: any
}

export const healthcareAPIs = {
  // FHIR Integration
  async getFHIRResource(resourceType: string, id: string) {
    try {
      const response = await fetch(`/api/fhir/${resourceType}/${id}`, {
        headers: {
          Accept: "application/fhir+json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch FHIR ${resourceType}`)
      }

      return (await response.json()) as FHIRResource
    } catch (error) {
      console.error("FHIR API Error:", error)
      throw error
    }
  },

  async createFHIRResource(resource: FHIRResource) {
    try {
      const response = await fetch(`/api/fhir/${resource.resourceType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
        },
        body: JSON.stringify(resource),
      })

      if (!response.ok) {
        throw new Error(`Failed to create FHIR ${resource.resourceType}`)
      }

      return (await response.json()) as FHIRResource
    } catch (error) {
      console.error("FHIR Create Error:", error)
      throw error
    }
  },

  // HL7 Message Processing
  async sendHL7Message(message: HL7Message) {
    try {
      const response = await fetch("/api/hl7/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        throw new Error("Failed to send HL7 message")
      }

      return await response.json()
    } catch (error) {
      console.error("HL7 Message Error:", error)
      throw error
    }
  },

  // Drug Database Integration
  async searchDrugs(query: string) {
    try {
      const response = await fetch(`/api/drugs/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error("Failed to search drugs")
      }

      return await response.json()
    } catch (error) {
      console.error("Drug Search Error:", error)
      throw error
    }
  },

  async getDrugInfo(ndc: string) {
    try {
      const response = await fetch(`/api/drugs/info/${ndc}`)

      if (!response.ok) {
        throw new Error("Failed to get drug information")
      }

      return await response.json()
    } catch (error) {
      console.error("Drug Info Error:", error)
      throw error
    }
  },

  // Lab Integration
  async sendLabOrder(order: any) {
    try {
      const response = await fetch("/api/lab/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error("Failed to send lab order")
      }

      return await response.json()
    } catch (error) {
      console.error("Lab Order Error:", error)
      throw error
    }
  },

  async getLabResults(orderId: string) {
    try {
      const response = await fetch(`/api/lab/results/${orderId}`)

      if (!response.ok) {
        throw new Error("Failed to get lab results")
      }

      return await response.json()
    } catch (error) {
      console.error("Lab Results Error:", error)
      throw error
    }
  },

  // Imaging Integration
  async scheduleImaging(order: any) {
    try {
      const response = await fetch("/api/imaging/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule imaging")
      }

      return await response.json()
    } catch (error) {
      console.error("Imaging Schedule Error:", error)
      throw error
    }
  },

  // Pharmacy Integration
  async sendPrescription(prescription: any) {
    try {
      const response = await fetch("/api/pharmacy/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescription),
      })

      if (!response.ok) {
        throw new Error("Failed to send prescription")
      }

      return await response.json()
    } catch (error) {
      console.error("Prescription Send Error:", error)
      throw error
    }
  },
}
