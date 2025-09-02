import React from "react"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useLocation, useNavigate } from "react-router"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/table/data-table"
import { Card, CardHeader } from "@/components/ui/card"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Button } from "@/components/ui/button/button"
import { Pen, MapPin, Hash, Calendar } from "lucide-react"
import EditGeneralDetails from "./EditGeneralDetails"
import { useFamFilteredByHouse, useHouseholdData, useResidentsList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { householdFamColumns } from "./HouseholdColumns"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/helpers/dateHelper"
import { Spinner } from "@/components/ui/spinner"

export default function HouseholdRecordView() {
  // ================ STATE INITIALIZATION ================
  const location = useLocation()
  const navigate = useNavigate()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const { showLoading, hideLoading } = useLoading()
  const [isOpenEditDialog, setIsOpenEditDialog] = React.useState<boolean>(false)
  const { data: householdData, isLoading: isLoadingHHData } = useHouseholdData(params?.hh_id)
  const { data: famFilteredByHouse, isLoading: isLoadingFamFilteredByHouse } = useFamFilteredByHouse(params?.hh_id)
  const { data: residentsList, isLoading } = useResidentsList()

  // ================ SIDE EFFECTS ================
  React.useEffect(() => {
    if (isLoading || isLoadingFamFilteredByHouse || isLoadingHHData) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, isLoadingFamFilteredByHouse, isLoadingHHData])

  // ================ HANDLERS ================
  const handleViewInfo = async (resId: string, famId: string) => {
    navigate("/profiling/resident/view/personal", {
      state: {
        params: {
          type: "viewing",
          data: {
            residentId: resId,
            familyId: famId,
          },
        },
      },
    })
  }

  const formatRegisteredBy = () => {
    const dataList = householdData?.registered_by?.split("-") || []
    if (dataList?.length == 0) return

    const staffId = dataList[0]
    const staffName = dataList[1]
    const staffType = dataList[2]
    const fam_id = dataList[3]

    return (
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">Registered By</Label>
          <Badge className="bg-green-500 hover:bg-green-500">{staffType}</Badge>
        </div>
        <div className="flex flex-col text-md font-semibold">
          <button
            onClick={() => handleViewInfo(staffId, fam_id)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {staffName || "N/A"}
          </button>
          <span className="text-[13px] text-gray-500">ID: {staffId}</span>
        </div>
      </div>
    )
  }

  const formatHouseholdOwner = () => {
    const dataList = householdData?.head?.split("-") || []
    if (dataList?.length == 0) return

    const ownerId = dataList[0]
    const ownerName = dataList[1]
    const ownerFam = dataList[2]

    return (
      <>
        <Label className="text-xs text-slate-500 uppercase tracking-wide">Household Owner</Label>
        <button
          onClick={() => handleViewInfo(ownerId, ownerFam)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left mt-1"
        >
          {ownerName || "N/A"}
        </button>
      </>
    )
  }

  // ================ RENDER ================
  return (
    <LayoutWithBack title="Household Details" description="View and manage household information.">
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <Card className="p-6 shadow-none rounded-lg">
          <Accordion type="single" collapsible defaultValue="general-info">
            <AccordionItem value="general-info" className="border-none">
              <div className="flex items-center justify-between mb-6">
                <AccordionTrigger className="flex items-center gap-2 hover:bg-gray-50 p-2 -m-2 rounded-md transition-colors [&[data-state=open]>svg]:rotate-180">
                  <div>
                    <h2 className="text-xl font-semibold text-darkBlue1 mb-1 text-left">General Information</h2>
                    <p className="text-sm text-black/60 text-left">
                      Basic household details and registration information
                    </p>
                  </div>
                </AccordionTrigger>
                <DialogLayout
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Pen className="h-4 w-4" />
                      Edit
                    </Button>
                  }
                  title="General Details"
                  description="Edit form for household general details."
                  mainContent={
                    <EditGeneralDetails
                      residents={residentsList}
                      household={householdData}
                      setIsOpenDialog={setIsOpenEditDialog}
                    />
                  }
                  isOpen={isOpenEditDialog}
                  onOpenChange={setIsOpenEditDialog}
                />
              </div>

              <AccordionContent>
                {isLoadingHHData ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-gray-500">Loading household information...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {/* Identification Group */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-darkBlue1 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Identification
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">
                            <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                              Indigenous Status
                            </Label>
                            <p className="text-sm font-medium text-black/80 mt-1">{householdData?.hh_id || "N/A"}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">
                            <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                              NHTS Household
                            </Label>
                            <p className="text-sm font-medium text-black/80 mt-1">{householdData?.hh_nhts || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Group */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-darkBlue1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">
                            <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">Sitio</Label>
                            <p className="text-sm font-medium text-black/80 mt-1">{householdData?.sitio || "N/A"}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">
                            <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                              Street Address
                            </Label>
                            <p className="text-sm font-medium text-black/80 mt-1">{householdData?.street || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Management Group */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-darkBlue1" />
                        <h3 className="font-medium text-darkBlue1">Registration</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border flex flex-col">{formatHouseholdOwner()}</div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">
                            <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                              Date Registered
                            </Label>
                            <p className="text-sm font-medium text-black/80 mt-1">
                              {formatDate(householdData?.hh_date_registered, "long") || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg border">{formatRegisteredBy()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        <Card className="p-6 shadow-none rounded-lg">
          <CardHeader>
            <div>
              <h2 className="text-xl font-semibold text-darkBlue1 mb-1">List of Families</h2>
              <p className="text-sm text-black/60">
                A comprehensive overview of all families in this household, including key details and relationships.
              </p>
            </div>
          </CardHeader>
          {isLoadingFamFilteredByHouse ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 border rounded-lg">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500">Loading families list...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <DataTable columns={householdFamColumns} data={famFilteredByHouse} />
            </div>
          )}
        </Card>
      </div>
    </LayoutWithBack>
  )
}