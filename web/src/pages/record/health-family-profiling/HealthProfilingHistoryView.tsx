import React from "react"
import { useLocation, useNavigate } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { ArrowLeft, ArrowRight, Calendar, Activity, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Field label mappings for different entity types
const ncdFieldLabels: Record<string, string> = {
  ncd_riskclass_age: "Risk Class Age Group",
  ncd_comorbidities: "Comorbidities",
  ncd_lifestyle_risk: "Lifestyle Risk",
  ncd_maintenance_status: "In Maintenance",
}

const tbFieldLabels: Record<string, string> = {
  tb_meds_source: "Medication Source",
  tb_days_taking_meds: "Days Taking Medication",
  tb_status: "Status",
}

const surveyFieldLabels: Record<string, string> = {
  si_filled_by: "Filled By",
  si_informant: "Informant",
  si_checked_by: "Checked By",
  si_date: "Survey Date",
}

const waterSupplyFieldLabels: Record<string, string> = {
  water_sup_type: "Water Supply Type",
  water_conn_type: "Connection Type",
  water_sup_desc: "Description",
}

const sanitaryFacilityFieldLabels: Record<string, string> = {
  sf_type: "Facility Type",
  sf_desc: "Description",
  sf_toilet_type: "Toilet Type",
}

const solidWasteFieldLabels: Record<string, string> = {
  swn_desposal_type: "Disposal Type",
  swm_desc: "Description",
}

interface HistoryViewParams {
  newData: any
  oldData: any
  entityType: "ncd" | "tb" | "survey" | "water" | "sanitary" | "waste"
  entityTitle: string
}

const getFieldLabels = (entityType: string): Record<string, string> => {
  switch (entityType) {
    case "ncd":
      return ncdFieldLabels
    case "tb":
      return tbFieldLabels
    case "survey":
      return surveyFieldLabels
    case "water":
      return waterSupplyFieldLabels
    case "sanitary":
      return sanitaryFacilityFieldLabels
    case "waste":
      return solidWasteFieldLabels
    default:
      return {}
  }
}

const getChanges = (oldObj: any, newObj: any, labels: Record<string, string>) => {
  if (!oldObj || !newObj) return []
  return Object.keys(labels)
    .filter((field) => oldObj[field] !== newObj[field])
    .map((field) => ({
      field,
      label: labels[field],
      previous: oldObj[field] || "Not set",
      current: newObj[field] || "Not set",
    }))
}

const ChangeItem = ({ change }: { change: any }) => (
  <div className="flex items-center gap-2 py-1">
    <span className="text-xs font-medium text-gray-600 min-w-[140px]">{change.label}:</span>
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 truncate">
        {change.previous}
      </span>
      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 truncate">
        {change.current}
      </span>
    </div>
  </div>
)

const DataSection = ({ title, data, labels, changes, icon: Icon }: any) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3 w-3 text-gray-600" />}
      <span className="text-sm font-medium">{title}</span>
    </div>
    <div className="text-xs space-y-1">
      {Object.entries(labels).map(([field, label]) => {
        const isChanged = changes.some((c: any) => c.field === field)
        const value = data?.[field]
        return (
          <div key={field} className="flex justify-between">
            <span className="text-gray-600">{label as any}:</span>
            <span className={isChanged ? "font-medium" : ""}>{value || "Not set"}</span>
          </div>
        )
      })}
    </div>
  </div>
)

export default function HealthProfilingHistoryView() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = React.useMemo(() => location.state?.params as HistoryViewParams, [location.state])

  if (!params) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <p className="text-gray-500">No history data available</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const { oldData, newData, entityType, entityTitle } = params
  const fieldLabels = getFieldLabels(entityType)
  const changes = getChanges(oldData, newData, fieldLabels)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h1 className="text-lg font-bold">Update Comparison - {entityTitle}</h1>
          </div>
          <Badge variant={changes.length > 0 ? "default" : "secondary"}>
            {changes.length} change{changes.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{newData?.history_user_name || "System"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{newData?.history_date ? new Date(newData.history_date).toLocaleString() : "N/A"}</span>
          </div>
        </div>

        <Separator />

        {/* Changes Summary */}
        {changes.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Changes Detected</h2>

            <Card className="p-3 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3 w-3 text-blue-600" />
                <span className="text-sm font-medium">{entityTitle}</span>
                <Badge variant="outline" className="text-xs h-4">
                  {changes.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {changes.map((change) => (
                  <ChangeItem key={change.field} change={change} />
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-6">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">No Changes Detected</h3>
            <p className="text-xs text-gray-500">Records are identical</p>
          </div>
        )}

        <Separator />

        {/* Complete Comparison */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Complete Record Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Version */}
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-sm font-semibold text-red-700">Previous</h3>
                </div>

                <DataSection
                  title={entityTitle}
                  data={oldData}
                  labels={fieldLabels}
                  changes={changes}
                  icon={Activity}
                />
              </CardContent>
            </Card>

            {/* Current Version */}
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="text-sm font-semibold text-green-700">Updated</h3>
                </div>

                <DataSection
                  title={entityTitle}
                  data={newData}
                  labels={fieldLabels}
                  changes={changes}
                  icon={Activity}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
