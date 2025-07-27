import React from "react"
import { Form } from "@/components/ui/form/form"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card } from "@/components/ui/card/card"
import { DataTable } from "@/components/ui/table/data-table"
import { capitalizeAllFields } from "@/helpers/capitalize"
import { useLoading } from "@/context/LoadingContext"
import { Loader2, Building2, ChevronLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useLocation, useNavigate } from "react-router"
import { formatSitio } from "../profilingFormats"
import { useResidentForm } from "../resident/form/useResidentForm"
import { useAddAddress, useAddPerAddress } from "../queries/profilingAddQueries"
import { useUpdateProfile } from "../queries/profilingUpdateQueries"
import { Type } from "../profilingEnums"
import { useOwnedBusinesses, useRespondentInfo, useSitioList } from "../queries/profilingFetchQueries"
import { businessDetailsColumns } from "../resident/ResidentColumns"
import PersonalInfoForm from "../resident/form/PersonalInfoForm"
import { Button } from "@/components/ui/button/button"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"

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
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate();
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([])
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([])
  const { mutateAsync: addAddress } = useAddAddress()
  const { mutateAsync: addPersonalAddress } = useAddPerAddress()
  const { data: respondentInfo, isLoading: isLoadingRespondentInfo } = useRespondentInfo(params.data.respondentId)
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } = useOwnedBusinesses({
    br: params.data.respondentId,
  })
  const { data: sitioList } = useSitioList()

  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } = useResidentForm(respondentInfo)
  const businesses = ownedBusinesses || []
  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList])

  const validator = React.useMemo(
    () =>
      addresses?.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "San Roque" ? address.sitio !== "" : address.add_external_sitio !== ""),
      ),
    [addresses],
  )
  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingRespondentInfo || isLoadingBusinesses) showLoading()
    else hideLoading()
  }, [isLoadingRespondentInfo, isLoadingBusinesses])

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true)
      setAddresses(respondentInfo?.per_addresses)
    }
    formType === Type.Editing && setIsReadOnly(false)
  }, [formType, respondentInfo])

  React.useEffect(() => {
    setAddresses(respondentInfo?.per_addresses)
  }, [respondentInfo])

  // ============== ====== HANDLERS ====================
  const validateAddresses = React.useCallback(() => {
    setValidAddresses(validator)
    const isValidAll = validator.every((valid: any) => valid === true)
    return isValidAll
  }, [addresses])

  const submit = async () => {
    setIsSubmitting(true)
    if (!(await form.trigger())) {
      setIsSubmitting(false)
      handleSubmitError("Please fill out all required fields")
      return
    }
    if (!validateAddresses()) {
      setIsSubmitting(false)
      handleSubmitError("Please fill out all required fields")
      return
    }
    try {
      const isAddressAdded = respondentInfo?.per_addresses?.length < addresses.length
      const values = form.getValues()
      const {per_age, ...personalInfoRest } = respondentInfo 
      if (
        checkDefaultValues(
          { ...values, per_addresses: addresses },
          personalInfoRest,
        )
      ) {
        setIsSubmitting(false)
        setFormType(Type.Viewing)
        handleSubmitError("No changes made")
        return
      }
      
      const initialiAddresses = addresses.slice(0, respondentInfo?.per_addresses?.length);
      const addedAddress = addresses.slice(respondentInfo?.per_addresses?.length, addresses.length);

      // Add new address to the database
      if (isAddressAdded) {
        await addAddress(addedAddress, {
          onSuccess: (new_addresses) => {
            // Format the addresses to match the expected format
            const per_addresses = new_addresses.map((address: any) => {
              return {
                add: address.add_id,
                per: respondentInfo?.per_id,
              }
            })

            const initial_per_addresses = initialiAddresses.map((address: any) => ({
              add: address.add_id,
              per: respondentInfo?.per_id,
              initial: true
            }));

            // Link personal address
            addPersonalAddress({
              data: [...per_addresses, ...initial_per_addresses], 
              staff_id: user?.staff?.staff_id
            })
          },
        })

        if (
          checkDefaultValues(
            { ...values, per_addresses: initialiAddresses },
            personalInfoRest,
          )
        ) {
          setIsSubmitting(false)
          setFormType(Type.Viewing)
          handleSubmitSuccess("Profile updated successfully");
          return
        }
      }
      // Update the profile and address if any changes were made
      updateProfile(
        {
          personalId: respondentInfo?.per_id,
          values: {
            ...capitalizeAllFields(values),
            per_addresses: isAddressAdded ? initialiAddresses : addresses,
            staff_id: user?.staff?.staff_id,
          },
        },
        {
          onSuccess: () => {
            handleSubmitSuccess("Profile updated successfully")
            setIsSubmitting(false)
            setFormType(Type.Viewing)
          },
        },
      )
    } catch (err) {
      setIsSubmitting(false);
      throw err
    }
  }

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
            data={businesses}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    )
  }

  // ==================== RENDER ====================
  return (
    <div className="grid gap-8">
      <Card className="w-full p-10">
        <div className="pb-4 flex gap-4">
          <div>
            <Button onClick={() => safeNavigate.back()} variant={"outline"} size={'sm'}>
              <ChevronLeft />
            </Button>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Personal Information</h2>
            {formType === Type.Editing ? (
              <p className="text-xs text-black/50">Fill out all necessary fields</p>
            ) : (
              <p className="text-xs text-black/50">Viewing the complete information of Respondent No. {params?.data?.respondentId}</p>
            )}
          </div>
        </div>
        {isLoadingRespondentInfo ? (
          <ActivityIndicator message="Loading personal information..." />
        ) : (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="flex flex-col gap-4"
            >
              <PersonalInfoForm
                formattedSitio={formattedSitio}
                addresses={addresses}
                validAddresses={validAddresses}
                setValidAddresses={setValidAddresses}
                setAddresses={setAddresses}
                form={form}
                formType={formType}
                isSubmitting={isSubmitting}
                submit={submit}
                isReadOnly={isReadOnly}
                setFormType={setFormType}
              />
            </form>
          </Form>
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
