import React from "react"
import { useLocation } from "react-router"
import { Card } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { ArrowLeft, ArrowRight, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const fieldLabels: Record<string, string> = {
  per_fname: "First Name",
  per_mname: "Middle Name",
  per_lname: "Last Name",
  per_suffix: "Suffix",
  per_contact: "Contact Number",
  per_dob: "Date of Birth",
  per_edAttainment: "Education",
  per_religion: "Religion",
  per_sex: "Gender",
  per_status: "Marital Status",
}

export default function UpdateComparisonView() {
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const oldData = React.useMemo(() => params?.oldData, [params])
  const newData = React.useMemo(() => params?.newData, [params])

  // Get changed fields
  const changedFields = React.useMemo(() => {
    if (!oldData || !newData) return []
    const changes: Array<{
      field: string
      label: string
      previous: string | null
      current: string | null
    }> = []

    Object.keys(fieldLabels).forEach((field) => {
      const prevValue = oldData[field]
      const currValue = newData[field]
      if (prevValue !== currValue) {
        changes.push({
          field,
          label: fieldLabels[field],
          previous: prevValue || "Not set",
          current: currValue || "Not set",
        })
      }
    })

    return changes
  }, [oldData, newData])

  return (
    <div className="p-10 bg-white max-h-[90vh] border rounded-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-darkBlue1">Update Comparison</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Updated by {newData.history_user_name}</span>
            <span className="text-gray-400">•</span>
            <span>{newData.history_date}</span>
          </div>
        </div>

        <Separator />

        {/* Changes Summary - More Compact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Changes Made ({changedFields.length})</h3>
            <Badge variant="secondary" className="text-xs">
              {changedFields.length} field{changedFields.length !== 1 ? "s" : ""} updated
            </Badge>
          </div>

          {changedFields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No changes detected</p>
            </div>
          ) : (
            <Card className="p-3">
              <div className="space-y-2">
                {changedFields.map((change, index) => (
                  <div key={change.field} className={`${index > 0 ? "border-t pt-2" : ""}`}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-gray-900 min-w-0 flex-shrink-0">{change.label}</span>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
                          <span className="text-xs text-red-700 truncate bg-red-50 px-2 py-1 rounded border">
                            {change.previous}
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></div>
                          <span className="text-xs text-green-700 truncate bg-green-50 px-2 py-1 rounded border">
                            {change.current}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Full Data Comparison */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Complete Record</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Previous Data */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <h4 className="text-sm font-medium text-red-700">Old Version</h4>
                </div>
                <div className="space-y-2 text-xs">
                  {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className="flex justify-between">
                      <span className="text-gray-600 font-medium">{label}:</span>
                      <span
                        className={`font-medium ${
                          changedFields.some((c) => c.field === field)
                            ? "text-red-700 bg-red-100 px-1 rounded"
                            : "text-gray-900"
                        }`}
                      >
                        {oldData[field] || "Not set"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Current Data */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <h4 className="text-sm font-medium text-green-700">Updated Version</h4>
                </div>
                <div className="space-y-2 text-xs">
                  {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className="flex justify-between">
                      <span className="text-gray-600 font-medium">{label}:</span>
                      <span
                        className={`font-medium ${
                          changedFields.some((c) => c.field === field)
                            ? "text-green-700 bg-green-100 px-1 rounded"
                            : "text-gray-900"
                        }`}
                      >
                        {newData[field] || "Not set"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant={"secondary"} className="w-28" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
