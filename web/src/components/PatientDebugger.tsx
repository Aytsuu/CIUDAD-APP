"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button/button"
import { api2 } from "@/api/api"


export function PatientDebugger() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPatientAPI = async () => {
    setLoading(true)
    try {
      const response = await api2.get("patientrecords/patient/")
      setApiResponse(response.data)
      console.log("🔍 Full API Response Structure:", response.data)

      // Log the first patient to see the structure
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("🔍 First Patient Structure:", response.data[0])
        console.log("🔍 Available Fields:", Object.keys(response.data[0]))
      }
    } catch (error) {
      console.error("API Error:", error)
      setApiResponse({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="font-semibold mb-2">Patient API Debugger</h3>
      <Button onClick={testPatientAPI} disabled={loading}>
        {loading ? "Testing..." : "Test Patient API"}
      </Button>

      {apiResponse && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">API Response:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
