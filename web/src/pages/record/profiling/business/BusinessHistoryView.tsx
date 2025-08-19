import React from "react"
import { useLocation, useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Building2, DollarSign, MapPin, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { BsChevronLeft } from "react-icons/bs"
import { formatDate, getDateTimeFormat } from "@/helpers/dateHelper"
import { formatCurrency } from "@/helpers/currencyFormat"

interface BusinessData {
  add: number
  address: {
    barangay: string
    city: string
    province: string
    sitio: string
    street: string
  }
  br: number
  bus_date_of_registration: string
  bus_date_verified: string
  bus_gross_sales: number
  bus_id: number
  bus_name: string
  bus_status: string
  history_change_reason: string | null
  history_date: string
  history_id: number
  history_type: string
  history_user: string | null
  history_user_name: string | null
  rp: string | null
  staff: string
}

export default function BusinessHistoryView() {
  const navigate = useNavigate();
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const old = React.useMemo(() => params?.oldData as BusinessData, [params])
  const updated = React.useMemo(() => params?.newData as BusinessData, [params])

  const getChangedFields = React.useMemo(() => {
    if (!old || !updated) return new Set()

    const changes = new Set<string>()

    // Compare primitive fields
    const fieldsToCompare = [
      "bus_gross_sales",
      "bus_name",
      "bus_status",
      "bus_date_of_registration",
      "bus_date_verified",
      "staff",
      "history_change_reason",
    ]

    fieldsToCompare.forEach((field) => {
      if (old[field as keyof BusinessData] !== updated[field as keyof BusinessData]) {
        changes.add(field)
      }
    })

    // Compare address fields
    if (old.address && updated.address) {
      Object.keys(old.address).forEach((key) => {
        if (old.address[key as keyof typeof old.address] !== updated.address[key as keyof typeof updated.address]) {
          changes.add(`address.${key}`)
        }
      })
    }

    return changes
  }, [old, updated])

  const ComparisonRow = ({
    label,
    oldValue,
    newValue,
    fieldKey,
    icon: Icon,
  }: {
    label: string
    oldValue: string | number
    newValue: string | number
    fieldKey: string
    icon: React.ElementType
  }) => {
    const isChanged = getChangedFields.has(fieldKey)

    return (
      <div
        className={`grid grid-cols-[1fr_2fr_2fr] gap-4 py-3 ${isChanged ? "bg-amber-50 border-l-4 border-l-amber-400 pl-4" : ""}`}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className={`text-sm ${isChanged ? "line-through text-red-600" : "text-muted-foreground"}`}>{oldValue}</div>
        <div className={`text-sm font-medium ${isChanged ? "text-green-700" : ""}`}>
          {newValue}
          {isChanged && (
            <Badge className="ml-2 text-xs bg-green-100 border-green-300 text-green-600 hover:bg-green-100">
              Changed
            </Badge>
          )}
        </div>
      </div>
    )
  }

  if (!old || !updated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No comparison data available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullAddress = (addr: BusinessData["address"]) =>
    `${addr.street}, ${addr.sitio}, ${addr.barangay}, ${addr.city}, ${addr.province}`

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="rounded-md shadow-none">
        <CardHeader className="flex-row gap-4">
          <Button
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => {
              navigate(-1)
            }}
          >
            <BsChevronLeft />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="flex text-lg items-center gap-2">
                Business History Comparison
              </CardTitle>
              <Badge>
                {getChangedFields.size} field{getChangedFields.size !== 1 ? "s" : ""} changed
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Comparing changes from {getDateTimeFormat(old.history_date)} to {getDateTimeFormat(updated.history_date)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_2fr_2fr] gap-4 mb-4">
            <div className="font-semibold text-sm">Field</div>
            <div className="font-semibold text-sm text-red-600">Previous Value</div>
            <div className="font-semibold text-sm text-green-700">Current Value</div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-1">
            <ComparisonRow
              label="Business Name"
              oldValue={old.bus_name}
              newValue={updated.bus_name}
              fieldKey="bus_name"
              icon={Building2}
            />

            <ComparisonRow
              label="Gross Sales"
              oldValue={formatCurrency(old.bus_gross_sales)}
              newValue={formatCurrency(updated.bus_gross_sales)}
              fieldKey="bus_gross_sales"
              icon={DollarSign}
            />

            <ComparisonRow
              label="Status"
              oldValue={old.bus_status}
              newValue={updated.bus_status}
              fieldKey="bus_status"
              icon={FileText}
            />

            <ComparisonRow
              label="Registration Date"
              oldValue={formatDate(old.bus_date_of_registration, 'long') as string}
              newValue={formatDate(updated.bus_date_of_registration, 'long') as string}
              fieldKey="bus_date_of_registration"
              icon={Calendar}
            />

            <ComparisonRow
              label="Verification Date"
              oldValue={formatDate(old.bus_date_verified, 'long') as string}
              newValue={formatDate(updated.bus_date_verified, 'long') as string}
              fieldKey="bus_date_verified"
              icon={Calendar}
            />

            <ComparisonRow
              label="Address"
              oldValue={fullAddress(old.address)}
              newValue={fullAddress(updated.address)}
              fieldKey="address"
              icon={MapPin}
            />
          </div>

          {getChangedFields.size === 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">No changes detected between the selected records.</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <strong>History ID:</strong> {old.history_id} → {updated.history_id}
              </div>
              <div>
                <strong>Business ID:</strong> {updated.bus_id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
