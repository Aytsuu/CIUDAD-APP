import React from "react"
import { Form } from "@/components/ui/form/form"
import PersonalInfoForm from "./PersonalInfoForm"
import { useResidentForm } from "./useResidentForm"
import { Type } from "../../ProfilingEnums"
import { useUpdateProfile } from "../../queries/profilingUpdateQueries"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card } from "@/components/ui/card"
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
import { useLoading } from "@/context/LoadingContext"
import { Users, History, Clock, UsersRound, UserRound, Building, MoveRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { SheetLayout } from "@/components/ui/sheet/sheet-layout"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router"
import { RenderHistory } from "../../ProfilingHistory"
import { ActivityIndicator } from "@/components/ui/activity-indicator"
import { EmptyState } from "@/components/ui/empty-state"
import { CardSidebar } from "@/components/ui/card-sidebar"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { showErrorToast, showPlainToast, showSuccessToast } from "@/components/ui/toast"

export default function ResidentViewForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION =============== 
  const currentPath = location.pathname.split("/").pop() as string
  const navigate = useNavigate();
  const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([])
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([])
  const [selectedItem, setSelectedItem] = React.useState<string>(currentPath);
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
  const businesses = ownedBusinesses?.results || []
  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList])

  // ---- Registered By ----
  const registered_by = personalInfo?.registered_by?.split("-") || [];
  const staffId = registered_by.length > 0 && registered_by[0];
  const staffName = registered_by.length > 0 && registered_by[1];
  const staffType = registered_by.length > 0 && registered_by[2];
  const staffFam = registered_by.length > 0 && registered_by[3];

  const validator = React.useMemo(
    () =>
      addresses?.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "SAN ROQUE (CIUDAD)" ? address.sitio !== "" : address.add_external_sitio !== "") &&
          address.add_street !== ""
      ),
    [addresses],
  )

  const MenuItems = [
    {
      id: "personal",
      label: "Personal",
      description: "Personal Information",
      icon: UserRound,
      route: "personal",
      state: {
        params: {
          type: 'viewing',
          data: {
            residentId: params?.data.residentId,
            familyId: params?.data.familyId
          }
        }
      }
    },
    {
      id: "family",
      label: "Family",
      description: "Family Information",
      icon: UsersRound,
      route: "family",
      state: {
        params: {
          type: 'viewing',
          data: {
            residentId: params?.data.residentId,
            familyId: params?.data.familyId
          }
        }
      }
    },
    ...(businesses?.length > 0 ? [{
      id: "business",
      label: "Business",
      description: "Business Information",
      icon: Building,
      route: "business",
      state: {
        params: {
          type: 'viewing',
          data: {
            residentId: params?.data.residentId,
            familyId: params?.data.familyId
          }
        }
      }
    }] : []) as any
  ]
  
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
    if (!(await form.trigger())) {
      handleSubmitError("Please fill out all required fields")
      return
    }
    if (!validateAddresses()) {
      handleSubmitError("Please fill out all required fields")
      return
    }
    try {
      setIsSubmitting(true)
      const isAddressAdded = personalInfo?.per_addresses?.length < addresses.length
      const values = form.getValues()
      const {per_age, per_id, registered_by, rp_date_registered, ...personalInfoRest } = personalInfo 
      const {per_id: id, ...val} = values

      if (
        checkDefaultValues(
          { ...val, per_addresses: addresses },
          personalInfoRest,
        )
      ) {
        setIsSubmitting(false)
        setFormType(Type.Viewing)
        showPlainToast("No changes made")
        return
      }
      
      const initialAddresses = addresses.slice(0, personalInfo?.per_addresses?.length);
      const addedAddress = addresses.slice(personalInfo?.per_addresses?.length, addresses.length);
      let new_addresses = []
      // Add new address to the database
      if (isAddressAdded) {
        new_addresses = await addAddress(addedAddress)

        // Format the addresses to match the expected format
        const per_addresses = new_addresses.map((address: any) => {
          return {
            add: address.add_id,
            per: personalInfo?.per_id,
          }
        })

        const initial_per_addresses = initialAddresses.map((address: any) => ({
          add: address.add_id,
          per: personalInfo?.per_id,
          initial: true
        }));

        // Link personal address
        await addPersonalAddress({
          data: [...per_addresses, ...initial_per_addresses], 
          staff_id: user?.staff?.staff_id
        })

        if (
          checkDefaultValues(
            { ...values, per_addresses: initialAddresses },
            personalInfoRest,
          )
        ) {
          setIsSubmitting(false)
          setFormType(Type.Viewing)
          showSuccessToast("Profile updated successfully");
          return
        }
      }

      // Update the profile and address if any changes were made
      await updateProfile(
        {
          personalId: personalInfo?.per_id,
          values: {
            ...values,
            per_addresses: [...new_addresses,...initialAddresses],
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
      showErrorToast("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleHistoryItemClick = (index: number) => {
    navigate('/profiling/resident/history/view', {
      state: {
        params: {
          newData: personalHistory[index],
          oldData: personalHistory[index + 1],
        }
      }
    })
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
        <div className="w-full mt-5 border">
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
      <div className="flex gap-4">
        <div className="w-1/6">
          <CardSidebar 
            sidebarItems={MenuItems}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            header={
              <div className="flex flex-col px-5 py-3 bg-blue-100 font-semibold">
                <span className="text-sm text-black/80 font-normal">Select a record to view</span>
              </div>
            }
            
          />
        </div>
        <div className="grid w-full gap-8 max-h-[800px] overflow-y-auto">
          {currentPath == "personal" && <Card className="w-full p-10">
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
                content={
                  <RenderHistory 
                    history={personalHistory}
                    isLoadingHistory={isLoadingPersonalHistory}
                    itemTitle="Personal Information Update"
                    handleHistoryItemClick={handleHistoryItemClick}
                  />
                }
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
            <>
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
              {registered_by.length > 0 && <div className="flex">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs font-medium text-black/50 uppercase tracking-wide">Registered By</Label>
                    <Badge className="bg-green-500 hover:bg-green-500">{staffType}</Badge>
                  </div>
                  <div className="flex flex-col text-md font-semibold">
                    <button
                      onClick={() => {
                        navigate("/profiling/resident/view/personal", {
                          state: {
                            params: {
                              type: "viewing",
                              data: {
                                residentId: staffId,
                                familyId: staffFam,
                              },
                            },
                          },
                        })
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {staffName || "N/A"}
                    </button>
                    <span className="text-[13px] text-gray-500">ID: {staffId}</span>
                  </div>
                </div>
              </div>}
            </>
          )}
        </Card>}
          
          {currentPath == "family" && <Card className="w-full p-10">
          <div className="flex justify-between">
            <div className="pb-4">
              <h2 className="text-lg font-semibold">Family</h2>
              <p className="text-xs text-black/50">Shows family members of this resident</p>
            </div>
            {family.length > 0 && (
              <Button variant={'ghost'}
                onClick={() => {
                  navigate("/profiling/family/view", {
                    state: {
                      params: {
                        fam_id: params.data.familyId
                      }
                    }
                  })
                }}
              >
                View full details <MoveRight/>
              </Button>
            )}
          </div>
            {renderFamilyContent()}
          </Card>}
          
          {currentPath == "business" && (!isLoadingBusinesses && (!businesses || businesses.length > 0)) &&
            <Card className="w-full p-10">
              <div className="pb-4">
                <h2 className="text-lg font-semibold">Business</h2>
                <p className="text-xs text-black/50">Shows owned business of this resident</p>
              </div>
              {renderBusinessContent()}
            </Card>
          }
          
        </div>
      </div>
    </LayoutWithBack>
  )
}