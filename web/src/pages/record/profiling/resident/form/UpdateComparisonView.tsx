import React from "react"
import { useLocation } from "react-router"
import { Card } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { ArrowLeft, ArrowRight, User, MapPin, Calendar, Edit3 } from "lucide-react"
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

const addressLabels: Record<string, string> = {
  street: "Street",
  sitio: "Sitio",
  barangay: "Barangay",
  city: "City",
  province: "Province",
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

export default function UpdateComparisonView() {
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const oldData = React.useMemo(() => params?.oldData, [params])
  const newData = React.useMemo(() => params?.newData, [params])

  const formatAddress = (address: any) => {
    if (!address) return "No address provided"
    const parts = [address.street, address.sitio, address.barangay, address.city, address.province].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "No address provided"
  }

  const addressComparison = React.useMemo(() => {
    const oldAddresses = oldData?.current_addresses || []
    const newAddresses = newData?.current_addresses || []

    const changes: Array<{
      field: string
      label: string
      previous: string | null
      current: string | null
    }> = []

    // Check for address count changes
    if (oldAddresses.length !== newAddresses.length) {
      changes.push({
        field: "address_count",
        label: "Number of Addresses",
        previous: `${oldAddresses.length} address${oldAddresses.length !== 1 ? "es" : ""}`,
        current: `${newAddresses.length} address${newAddresses.length !== 1 ? "es" : ""}`,
      })
    }

    // Compare existing addresses field by field
    const maxLength = Math.max(oldAddresses.length, newAddresses.length)
    for (let i = 0; i < maxLength; i++) {
      const oldAddr = oldAddresses[i] || {}
      const newAddr = newAddresses[i] || {}

      // If address was added
      if (!oldAddresses[i] && newAddresses[i]) {
        changes.push({
          field: `address_${i}_added`,
          label: `Address ${i + 1} (New)`,
          previous: "Not set",
          current: formatAddress(newAddresses[i]),
        })
      }
      // If address was removed
      else if (oldAddresses[i] && !newAddresses[i]) {
        changes.push({
          field: `address_${i}_removed`,
          label: `Address ${i + 1} (Removed)`,
          previous: formatAddress(oldAddresses[i]),
          current: "Removed",
        })
      }
      // If address exists in both, compare fields
      else if (oldAddresses[i] && newAddresses[i]) {
        Object.keys(addressLabels).forEach((field) => {
          if (oldAddr[field] !== newAddr[field]) {
            changes.push({
              field: `address_${i}_${field}`,
              label: `Address ${i + 1} - ${addressLabels[field]}`,
              previous: oldAddr[field] || "Not set",
              current: newAddr[field] || "Not set",
            })
          }
        })
      }
    }

    return {
      changes,
      oldAddresses,
      newAddresses,
    }
  }, [oldData, newData])

  const personalChanges = getChanges(oldData, newData, fieldLabels)
  const addressChanges = addressComparison.changes
  const totalChanges = personalChanges.length + addressChanges.length

  const ChangeItem = ({ change }: { change: any }) => (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-medium text-gray-600 min-w-[80px]">{change.label}:</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 truncate">
          {change.previous}
        </span>
        <ArrowRight className="h-3 w-3 text-gray-400" />
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 truncate">
          {change.current}
        </span>
      </div>
    </div>
  )

  const DataSection = ({ title, icon: Icon, data, labels, changes, isAddress = false }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-gray-600" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-xs space-y-1">
        {Object.entries(labels).map(([field, label]) => {
          const isChanged = changes.some((c: any) => c.field === field)
          const value = isAddress ? data?.[field] : data?.[field]
          return (
            <div key={field} className="flex justify-between">
              <span className="text-gray-600">{label as any}:</span>
              <span className={isChanged ? "font-medium" : ""}>{value || "Not set"}</span>
            </div>
          )
        })}
        {isAddress && (
          <div className="pt-1 mt-2 border-t">
            <span className="text-gray-600">Full:</span>
            <div className="text-xs mt-1">{formatAddress(data)}</div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <h1 className="text-lg font-bold">Update Comparison</h1>
          </div>
          <Badge variant={totalChanges > 0 ? "default" : "secondary"}>
            {totalChanges} change{totalChanges !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{newData?.history_user_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{newData?.history_date}</span>
          </div>
        </div>

        <Separator />

        {/* Changes Summary */}
        {totalChanges > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Changes Detected</h2>

            {personalChanges.length > 0 && (
              <Card className="p-3 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="text-sm font-medium">Personal Information</span>
                  <Badge variant="outline" className="text-xs h-4">
                    {personalChanges.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {personalChanges.map((change) => (
                    <ChangeItem key={change.field} change={change} />
                  ))}
                </div>
              </Card>
            )}

            {addressChanges.length > 0 && (
              <Card className="p-3 border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium">Address Information</span>
                  <Badge variant="outline" className="text-xs h-4">
                    {addressChanges.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {addressChanges.map((change) => (
                    <ChangeItem key={change.field} change={change} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Edit3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-sm font-semibold text-red-700">Previous</h3>
                </div>

                <DataSection
                  title="Personal"
                  icon={User}
                  data={oldData}
                  labels={fieldLabels}
                  changes={personalChanges}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-600" />
                    <span className="text-sm font-medium">Addresses ({addressComparison.oldAddresses.length})</span>
                  </div>
                  <div className="text-xs space-y-2">
                    {addressComparison.oldAddresses.length > 0 ? (
                      addressComparison.oldAddresses.map((addr: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border">
                          <div className="font-medium mb-1">Address {index + 1}</div>
                          <div className="text-xs">{formatAddress(addr)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No addresses</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Version */}
            <Card className="border-green-200 bg-green-50/30">
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="text-sm font-semibold text-green-700">Updated</h3>
                </div>

                <DataSection
                  title="Personal"
                  icon={User}
                  data={newData}
                  labels={fieldLabels}
                  changes={personalChanges}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-600" />
                    <span className="text-sm font-medium">Addresses ({addressComparison.newAddresses.length})</span>
                  </div>
                  <div className="text-xs space-y-2">
                    {addressComparison.newAddresses.length > 0 ? (
                      addressComparison.newAddresses.map((addr: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border">
                          <div className="font-medium mb-1">Address {index + 1}</div>
                          <div className="text-xs">{formatAddress(addr)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No addresses</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
        </div>
      </div>
    </Card>
  )
}