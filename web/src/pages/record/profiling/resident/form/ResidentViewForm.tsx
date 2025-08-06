import React from "react"
import { Form } from "@/components/ui/form/form"
import PersonalInfoForm from "./PersonalInfoForm"
import { useResidentForm } from "./useResidentForm"
import { Type } from "../../ProfilingEnums"
import { useUpdateProfile } from "../../queries/profilingUpdateQueries"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card } from "@/components/ui/card/card"
import { DataTable } from "@/components/ui/table/data-table"
import { businessDetailsColumns, familyDetailsColumns } from "../ResidentColumns"
import {
  useFamilyMembers,
  useOwnedBusinesses,
  usePersonalHistory,
  usePersonalInfo,
  useSitioList,
} from "../../queries/profilingFetchQueries"
import { formatSitio } from "../../ProfilingFormats"
import { useAddAddress, useAddPerAddress } from "../../queries/profilingAddQueries"
import { capitalizeAllFields } from "@/helpers/capitalize"
import { useLoading } from "@/context/LoadingContext"
import { Loader2, Users, Building2, History, Clock, User, Calendar } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { SheetLayout } from "@/components/ui/sheet/sheet-layout"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router"

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
  const navigate = useNavigate();
  const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([])
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([])
  const { mutateAsync: addAddress } = useAddAddress()
  const { mutateAsync: addPersonalAddress } = useAddPerAddress()
  const { data: personalInfo, isLoading: isLoadingPersonalInfo } = usePersonalInfo(params.data.residentId)
  const { data: familyMembers, isLoading: isLoadingFam } = useFamilyMembers(params.data.familyId)
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } = useOwnedBusinesses({
    rp: params.data.residentId,
  })
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList()
  const { data: personalHistory, isLoading: isLoadingPersonalHistory } = usePersonalHistory(personalInfo?.per_id)

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

  console.log(personalHistory)
  
  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingFam || isLoadingPersonalInfo || isLoadingBusinesses || isLoadingPersonalHistory) showLoading()
    else hideLoading()
  }, [isLoadingFam, isLoadingPersonalInfo, isLoadingBusinesses, isLoadingPersonalHistory])

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true)
      setAddresses(personalInfo?.per_addresses)
    }
    formType === Type.Editing && setIsReadOnly(false)
  }, [formType, personalInfo])

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
      const isAddressAdded = personalInfo?.per_addresses?.length < addresses.length
      const values = form.getValues()
      const {per_age, ...personalInfoRest } = personalInfo 
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
      
      const initialiAddresses = addresses.slice(0, personalInfo?.per_addresses?.length);
      const addedAddress = addresses.slice(personalInfo?.per_addresses?.length, addresses.length);

      // Add new address to the database
      if (isAddressAdded) {
        await addAddress(addedAddress, {
          onSuccess: (new_addresses) => {
            // Format the addresses to match the expected format
            const per_addresses = new_addresses.map((address: any) => {
              return {
                add: address.add_id,
                per: personalInfo?.per_id,
              }
            })

            const initial_per_addresses = initialiAddresses.map((address: any) => ({
              add: address.add_id,
              per: personalInfo?.per_id,
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
          personalId: personalInfo?.per_id,
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

  const handleHistoryItemClick = (index: number) => {
    navigate('/profiling/resident/update/view', {
      state: {
        params: {
          newData: personalHistory[index],
          oldData: personalHistory[index + 1],
        }
      }
    })
  }

  // Render Personal History Content
  const renderPersonalHistory = () => {
    if (isLoadingPersonalHistory) {
      return (
        <div className="p-4">
          <ActivityIndicator message="Loading history..." />
        </div>
      )
    }

    if (!personalHistory || personalHistory.length === 0) {
      return (
        <div className="p-4">
          <EmptyState icon={Clock} title="No history found" description="No recorded updates." />
        </div>
      )
    }

    return (
      <div className="py-5 max-h-[80vh] overflow-y-auto">
        <div className="space-y-2">

          {personalHistory.map((historyItem: any, index: number) => (
            <div
              key={historyItem.history_id}
              className={`border rounded-md p-3 hover:bg-gray-50 transition-all duration-300`}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`,
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-green-700">Personal Information Update</h4>
                  {(index + 1) < personalHistory.length ? (<Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHistoryItemClick(index)
                    }}
                  >
                    View
                  </Button>) : (
                    <Label className="text-xs mb-1 text-gray-500">Created</Label>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{historyItem.history_user_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span className="whitespace-nowrap">{historyItem.history_date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    )
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
    <LayoutWithBack
      title="Resident Details"
      description="Information is displayed in a clear, organized, and secure manner."
    >
      <div className="grid gap-8">
        <Card className="w-full p-10">
          <div className="pb-4 flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <p className="text-xs text-black/50">Fill out all necessary fields</p>
            </div>
            <div>
              <SheetLayout
                trigger={
                  <History size={20} className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors" />
                }
                content={renderPersonalHistory()}
                title={
                  <Label className="flex items-center gap-2 text-lg text-darkBlue1">
                    <Clock size={20}/>
                    Update History
                  </Label>
                }
                description="View all changes made to this resident's information"
              />
            </div>
          </div>
          {isLoadingPersonalInfo ? (
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
            <h2 className="text-lg font-semibold">Family</h2>
            <p className="text-xs text-black/50">Shows family details of this resident</p>
          </div>
          {renderFamilyContent()}
        </Card>
        
        {(!isLoadingBusinesses && (!businesses || businesses.length === 0)) &&
          <Card className="w-full p-10">
            <div className="pb-4">
              <h2 className="text-lg font-semibold">Business</h2>
              <p className="text-xs text-black/50">Shows owned business of this resident</p>
            </div>
            {renderBusinessContent()}
          </Card>
        }
        
      </div>
    </LayoutWithBack>
  )
}
