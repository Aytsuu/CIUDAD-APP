import React from "react"
import { Form } from "@/components/ui/form/form"
import PersonalInfoForm from "./PersonalInfoForm"
import { useResidentForm } from "./useResidentForm"
import { Type } from "../../profilingEnums"
import { useUpdateProfile } from "../../queries/profilingUpdateQueries"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card } from "@/components/ui/card/card"
import { DataTable } from "@/components/ui/table/data-table"
import { businessDetailsColumns, familyDetailsColumns } from "../ResidentColumns"
import {
  useFamilyMembers,
  useOwnedBusinesses,
  usePersonalInfo,
  useSitioList,
} from "../../queries/profilingFetchQueries"
import { formatSitio } from "../../profilingFormats"
import { useAddAddress, useAddPerAddress } from "../../queries/profilingAddQueries"
import { capitalizeAllFields } from "@/helpers/capitalize"
import { useLoading } from "@/context/LoadingContext"
import { Loader2, Users, Building2 } from "lucide-react"

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

export default function ResidentViewForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([])
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([])

  const { data: personalInfo, isLoading: isLoadingPersonalInfo } = usePersonalInfo(params.data.residentId)
  const { data: familyMembers, isLoading: isLoadingFam } = useFamilyMembers(params.data.familyId)
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } = useOwnedBusinesses({
    rp: params.data.residentId,
  })
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList()
  const { mutateAsync: addAddress } = useAddAddress()
  const { mutateAsync: addPersonalAddress } = useAddPerAddress()

  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } = useResidentForm(personalInfo)

  const family = familyMembers?.results || []
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
    if (isLoadingFam || isLoadingPersonalInfo || isLoadingBusinesses) showLoading()
    else hideLoading()
  }, [isLoadingFam, isLoadingPersonalInfo, isLoadingBusinesses])

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true)
      setAddresses(personalInfo?.per_addresses)
    }
    formType === Type.Editing && setIsReadOnly(false)
  }, [formType])

  React.useEffect(() => {
    setAddresses(personalInfo?.per_addresses)
  }, [personalInfo])

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
      const isAddressAdded = personalInfo?.per_addresses?.length !== addresses.length
      const values = form.getValues()
      if (
        checkDefaultValues(
          { ...values, per_addresses: addresses },
          { ...params.data.personalInfo, per_addresses: personalInfo?.per_addresses },
        )
      ) {
        setIsSubmitting(false)
        setFormType(Type.Viewing)
        handleSubmitError("No changes made")
        return
      }

      // Add new address to the database
      if (isAddressAdded) {
        addAddress(addresses.slice(personalInfo?.per_addresses?.length, addresses.length), {
          onSuccess: (new_addresses) => {
            // Format the addresses to match the expected format
            const per_addresses = new_addresses.map((address: any) => {
              return {
                add: address.add_id,
                per: params.data.personalInfo?.per_id,
              }
            })
            // Link personal address
            addPersonalAddress(per_addresses)
          },
        })
      }

      // Update the profile and address if any changes were made
      updateProfile(
        {
          personalId: params.data.personalInfo?.per_id,
          values: {
            ...capitalizeAllFields(values),
            per_addresses: isAddressAdded ? addresses.slice(0, personalInfo?.per_addresses?.length) : addresses,
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
      throw err
    }
  }

  // Render Family Card Content
  const renderFamilyContent = () => {
    if (isLoadingFam || isLoadingSitio) {
      return <ActivityIndicator message="Loading family members..." />
    }

    if (!family || family.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="No family members found"
          description="This resident has no registered family members."
        />
      )
    }

    return (
      <div className="flex justify-center">
        <div className="w-full max-w-5xl mt-5 border">
          <DataTable
            columns={familyDetailsColumns(params.data.residentId, params.data.familyId)}
            data={family}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    )
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
          description="This resident has no registered business ownership."
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

  return (
    // ==================== RENDER ====================
    <LayoutWithBack
      title="Resident Details"
      description="Information is displayed in a clear, organized, and secure manner."
    >
      <div className="grid gap-8">
        <Card className="w-full p-10">
          <div className="pb-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <p className="text-xs text-black/50">Fill out all necessary fields</p>
          </div>
          {isLoadingPersonalInfo ? (<ActivityIndicator message="Loading business information..." />) : (
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
            <h2 className="text-lg font-semibold">Family</h2>
            <p className="text-xs text-black/50">Shows family details of this resident</p>
          </div>
          {renderFamilyContent()}
        </Card>

        <Card className="w-full p-10">
          <div className="pb-4">
            <h2 className="text-lg font-semibold">Business</h2>
            <p className="text-xs text-black/50">Shows owned business of this resident</p>
          </div>
          {renderBusinessContent()}
        </Card>
      </div>
    </LayoutWithBack>
  )
}
