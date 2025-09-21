import React from "react"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table/data-table"
import { useLoading } from "@/context/LoadingContext"
import { Loader2, Building2 } from "lucide-react"
import { useLocation } from "react-router"
import { Type } from "../ProfilingEnums"
import { useOwnedBusinesses, useRespondentInfo } from "../queries/profilingFetchQueries"
import { businessDetailsColumns } from "../resident/ResidentColumns"

// Loading Component
const ActivityIndicator = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
)

// Empty State Component
const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="rounded-full bg-gray-100 p-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
)

export default function RespondentDetails() {
  // ============= STATE INITIALIZATION ===============
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  // const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  // const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, _setFormType] = React.useState<Type>(params?.type)
  const [_isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const { data: respondentInfo, isLoading: isLoadingRespondentInfo } = useRespondentInfo(params?.data.respondentId)
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } = useOwnedBusinesses({
    br: params?.data.respondentId,
  })

  const businesses = ownedBusinesses?.results || []

  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingRespondentInfo || isLoadingBusinesses) showLoading()
    else hideLoading()
  }, [isLoadingRespondentInfo, isLoadingBusinesses])

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true)
    }
    formType === Type.Editing && setIsReadOnly(false)
  }, [formType, respondentInfo])


  // ============== ====== HANDLERS ====================
  // const submit = async () => {
  //   if (!(await form.trigger())) {
  //     handleSubmitError("Please fill out all required fields")
  //     return
  //   }

  //   try {
  //     const values = form.getValues()
  //     const {per_age, ...personalInfoRest } = respondentInfo 
  //     if (
  //       checkDefaultValues(
  //         values,
  //         personalInfoRest,
  //       )
  //     ) {
  //       setIsSubmitting(false)
  //       setFormType(Type.Viewing)
  //       handleSubmitError("No changes made")
  //       return
  //     }

  //     handleSubmitSuccess("Profile updated successfully")
  //     setFormType(Type.Viewing)
  //   } catch (err) {
  //     showErrorToast("Failed to update profile. Please try again.")
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // Render Business Card Content
  const renderBusinessContent = () => {
    if (isLoadingBusinesses) {
      return <ActivityIndicator message="Loading business information..." />
    }
    if (!businesses || businesses.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="No businesses found"
          description="This respondent has no registered business ownership."
        />
      )
    }
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-5xl mt-5 border">
          <DataTable
            columns={businessDetailsColumns()}
            data={businesses.filter((b: any) => b.bus_status !== 'Pending')}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    )
  }

  // ==================== RENDER ====================
  return (
    <div className="grid gap-4">
      <Card className="w-full p-10">
        {isLoadingRespondentInfo ? (
          <ActivityIndicator message="Loading personal information..." />
        ) : (
          <div>

          </div>
        )}
      </Card>

      <Card className="w-full p-10">
        <div className="pb-4">
          <h2 className="text-lg font-semibold">Business</h2>
          <p className="text-xs text-black/50">Shows owned business of this respondent</p>
        </div>
        {renderBusinessContent()}
      </Card>
    </div>
  )
}
