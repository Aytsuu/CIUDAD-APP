import React from "react"
import { Label } from "@/components/ui/label"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { DataTable } from "@/components/ui/table/data-table"
import { familyMembersCol } from "./FamilyColumns"
import { useLocation, useNavigate } from "react-router"
import { Card } from "@/components/ui/card"
import { Pen, UserRoundPlus, Calendar, User, Hash } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import AddMemberForm from "./AddMemberForm"
import EditGeneralDetails from "./EditGeneralDetails"
import { useFamilyData, useFamilyMembers, useHouseholdsList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { formatDate } from "@/helpers/dateHelper"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContext"
import HealthFamilyProfileView from "../../health-family-profiling/HealthFamilyProfileView"

export default function FamilyRecordView() {
  // =================== STATE INITIALIZATION ===================
  const navigate = useNavigate()
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState<boolean>(false)
  const [isOpenEditDialog, setIsOpenEditDialog] = React.useState<boolean>(false)
  const [accordionValue, setAccordionValue] = React.useState<string>("general-info")
  const { showLoading, hideLoading } = useLoading()
  const { user } = useAuth()
  const { data: householdsList, isLoading: isLoadingHHList } = useHouseholdsList()
  const { data: familyData, isLoading: isLoadingFamData } = useFamilyData(params?.fam_id)
  const { data: familyMembers, isLoading: isLoadingFamMembers } = useFamilyMembers(params?.fam_id)
  
  // Check if current user is health staff and should show health profiling data
  const showHealthProfiling = params?.showHealthProfiling || user?.staff?.staff_type === "HEALTH STAFF"

  const members = familyMembers?.results || []

  // =================== SIDE EFFECTS ===================
  React.useEffect(() => {
    const loadingStates = [isLoadingFamData, isLoadingHHList, isLoadingFamMembers]
    
    if (loadingStates.some(loading => loading)) showLoading()
    else hideLoading()
  }, [isLoadingFamData, isLoadingHHList, isLoadingFamMembers, showLoading, hideLoading])

  // =================== HANDLERS ====================
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
    const dataList = familyData?.registered_by?.split("-") || []
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

  // =================== RENDER ===================
  return (
    <LayoutWithBack
      title="Family Details"
      description="View family details, including family number, date registered and associated members."
    >
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <Card className="p-6 shadow-none rounded-lg">
          {isLoadingFamData || isLoadingHHList ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground">Loading family information...</p>
              </div>
            </div>
          ) : (
            <Accordion type="single" value={accordionValue} onValueChange={setAccordionValue} collapsible>
              <AccordionItem value="general-info" className="border-none">
                <div className="flex items-center justify-between mb-6">
                  <AccordionTrigger className="flex items-center gap-2 hover:bg-gray-50 p-2 -m-2 rounded-md transition-colors [&[data-state=open]>svg]:rotate-180">
                    <div>
                      <h2 className="text-xl font-semibold text-darkBlue1 mb-1 text-left">General Information</h2>
                      <p className="text-sm text-black/60 text-left">
                        Basic family details and registration information
                      </p>
                    </div>
                  </AccordionTrigger>
                  <DialogLayout
                    trigger={
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Pen className="h-4 w-4" />
                        Edit Details
                      </Button>
                    }
                    title="General Details"
                    description="Edit form for family general details."
                    mainContent={
                      <EditGeneralDetails
                        familyData={familyData}
                        households={householdsList}
                        setIsOpenDialog={setIsOpenEditDialog}
                      />
                    }
                    isOpen={isOpenEditDialog}
                    onOpenChange={setIsOpenEditDialog}
                  />
                </div>

                <AccordionContent className="space-y-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Identifiers */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-darkBlue1 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Identification
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border bg-gray-50/50">
                          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                            Family No.
                          </Label>
                          <p className="text-sm font-medium text-black/80 mt-1">{familyData?.fam_id}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                            Household No.
                          </Label>
                          <p className="text-sm font-medium text-black/80 mt-1">{familyData?.household_no}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-50/50">
                          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">Household Occupancy</Label>
                          <p className="text-sm font-medium text-black/80 mt-1">{familyData?.fam_building}</p>
                        </div>
                      </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-darkBlue1" />
                        <h3 className="font-medium text-darkBlue1">Classification</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border">
                          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                            Indigenous Status
                          </Label>
                          <p className="text-sm font-medium text-black/80 mt-1">{familyData?.fam_indigenous}</p>
                        </div>
                      </div>
                    </div>

                    {/* Registration Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-darkBlue1" />
                        <h3 className="font-medium text-darkBlue1">Registration</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border bg-gray-50/50">
                          <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">
                            Date Registered
                          </Label>
                          <p className="text-sm font-medium text-black/80 mt-1">
                            {formatDate(familyData?.fam_date_registered, "long" as any)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border">{formatRegisteredBy()}</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </Card>

        <Card className="p-6 shadow-none rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-darkBlue1 mb-1">Family Members</h2>
              <p className="text-sm text-black/60">
                A comprehensive list of all members in this family, including their roles and key details.
              </p>
            </div>
            <DialogLayout
              trigger={
                <Button className="gap-2">
                  <UserRoundPlus className="h-4 w-4" />
                  Add Member
                </Button>
              }
              title="New Member"
              description="Select a registered resident from the database and assign their role within the family."
              mainContent={<AddMemberForm familyId={familyData?.fam_id} setIsOpenDialog={setIsOpenAddDialog} />}
              isOpen={isOpenAddDialog}
              onOpenChange={setIsOpenAddDialog}
            />
          </div>

          {isLoadingFamMembers ? (
            <div className="flex items-center justify-center py-12 border rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground">Loading family members...</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <DataTable columns={familyMembersCol(familyData)} data={members} />
            </div>
          )}
        </Card>

        {/* Health Profiling Section - Only show for Health Staff */}
        <HealthFamilyProfileView 
          familyId={params?.fam_id} 
          showHealthProfiling={showHealthProfiling}
        />
      </div>
    </LayoutWithBack>
  )
}