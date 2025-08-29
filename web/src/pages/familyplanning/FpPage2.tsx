import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { FormData,page2Schema } from "@/form-schema/FamilyPlanningSchema"
import { api2 } from "@/api/api"

// NEW: Interface for illness data
interface Illness {
  ill_id: number
  illname: string
  ill_description: string
  ill_code: string
}

// NEW: Function to fetch illnesses from database
const fetchIllnesses = async (illCodePrefix?: string): Promise<Illness[]> => {
  try {
    const params = illCodePrefix ? { params: { ill_code_prefix: illCodePrefix } } : {};
    const response = await api2.get("/familyplanning/illnesses/", params);
    return response.data
  } catch (error) {
    console.error("Error fetching illnesses:", error)
    throw error
  }
}

type Page2Props = {
  onPrevious1: () => void
  onNext3: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningForm2({
  onPrevious1,
  onNext3,
  updateFormData,
  formData,
  mode = "create",
}: Page2Props) {
  const isReadOnly = mode === "view"

  // NEW: State for selected illnesses
  const [selectedIllnesses, setSelectedIllnesses] = useState<number[]>([])

  // NEW: Fetch illnesses from database
  const { data: illnesses = [], isLoading: isLoadingIllnesses } = useQuery<Illness[]>({
    queryKey: ["illnesses"],
    queryFn: () => fetchIllnesses("FP")
  })

  const form = useForm<FormData>({
    resolver: zodResolver(page2Schema),
    defaultValues: formData,
    values: formData,
    mode: "onChange",
  })

  useEffect(() => {
    form.reset(formData)
  }, [form, formData])

  useEffect(() => {
  if (formData.pat_id) {
    // Fetch last pregnancy data when patient ID is available
    api2.get(`/familyplanning/last-previous-pregnancy/${formData.pat_id}`)
      .then(response => {
        const { last_delivery_date, last_delivery_type } = response.data;
        
        // Set the values in your form
        if (last_delivery_date) {
          form.setValue("obstetricalHistory.lastDeliveryDate", last_delivery_date);
        }
        if (last_delivery_type) {
          form.setValue("obstetricalHistory.typeOfLastDelivery", last_delivery_type);
        }
      })
      .catch(error => {
        console.error("Error fetching last pregnancy data:", error);
      });
  }
}, [formData.pat_id, form]);

  // NEW: Convert the old boolean medical history to selected illness IDs
  useEffect(() => {
    if (illnesses.length > 0 && formData.medicalHistory) {
      const selected: number[] = []

      // Map the old boolean fields to illness IDs
      const medicalHistoryMapping: Record<string, string> = {
        severeHeadaches: "Severe headaches / migraine",
        strokeHeartAttackHypertension: "History of stroke / heart attack / hypertension",
        hematomaBruisingBleeding: "Non-traumatic hematoma / frequent bruising or gum bleeding",
        breastCancerHistory: "Current or history of breast cancer / breast mass",
        severeChestPain: "Severe chest pain",
        cough: "Cough for more than 14 days",
        jaundice: "Jaundice",
        unexplainedVaginalBleeding: "Unexplained vaginal bleeding",
        abnormalVaginalDischarge: "Abnormal vaginal discharge",
        phenobarbitalOrRifampicin: "Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)",
        smoker: "Is this client a SMOKER?",
        disability: "Others",
      }

      Object.entries(formData.medicalHistory).forEach(([key, value]) => {
        if (value === true && medicalHistoryMapping[key]) {
          const illness = illnesses.find((ill) => ill.illname === medicalHistoryMapping[key])
          if (illness) {
            selected.push(illness.ill_id)
          }
        }
      })

      setSelectedIllnesses(selected)
    }
  }, [illnesses, formData.medicalHistory])

  // NEW: Handle illness selection toggle
  const handleIllnessToggle = (illnessId: number, checked: boolean) => {
    setSelectedIllnesses((prev) => {
      if (checked) {
        return [...prev, illnessId]
      } else {
        return prev.filter((id) => id !== illnessId)
      }
    })
  }

  // ORIGINAL: Keep the original medical history options as fallback
  const medicalHistoryOptions = [
    { name: "severeHeadaches", label: "Severe headaches / migraine" },
    { name: "strokeHeartAttackHypertension", label: "History of stroke / heart attack / hypertension" },
    { name: "hematomaBruisingBleeding", label: "Non-traumatic hematoma / frequent bruising or gum bleeding" },
    { name: "breastCancerHistory", label: "Current or history of breast cancer / breast mass" },
    { name: "severeChestPain", label: "Severe chest pain" },
    { name: "cough", label: "Cough for more than 14 days" },
    { name: "jaundice", label: "Jaundice" },
    { name: "unexplainedVaginalBleeding", label: "Unexplained vaginal bleeding" },
    { name: "abnormalVaginalDischarge", label: "Abnormal vaginal discharge" },
    { name: "phenobarbitalOrRifampicin", label: "Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)" },
    { name: "smoker", label: "Is this client a SMOKER?" },
    { name: "disability", label: "Others" },
  ]

  const onSubmit = async (data: FormData) => {

  let customDisabilityIllnessId: number | null = null;
  if (data.medicalHistory?.disability && data.medicalHistory.disabilityDetails) {
    // Instead of directly creating here, we'll pass the string to the backend.
    // The backend will handle checking if it exists or creating it.
    // We'll add a new field to the formData for this.
    // For now, ensure the 'disability' checkbox is treated as selected if details are provided.
    const disabilityIllness = illnesses.find((ill) => ill.illname === "Others");
    if (disabilityIllness && !selectedIllnesses.includes(disabilityIllness.ill_id)) {
        selectedIllnesses.push(disabilityIllness.ill_id);
    }
  } else {
    // If disability is unchecked or details are empty, ensure the "Others" illness is not selected
    const disabilityIllness = illnesses.find((ill) => ill.illname === "Others");
    if (disabilityIllness) {
        setSelectedIllnesses(prev => prev.filter(id => id !== disabilityIllness.ill_id));
    }
  }
    const medicalHistory = {
      severeHeadaches: false,
      strokeHeartAttackHypertension: false,
      hematomaBruisingBleeding: false,
      breastCancerHistory: false,
      severeChestPain: false,
      cough: false,
      jaundice: false,
      unexplainedVaginalBleeding: false,
      abnormalVaginalDischarge: false,
      phenobarbitalOrRifampicin: false,
      smoker: false,
      disability: false,
      disabilityDetails: data.medicalHistory?.disabilityDetails || "",
    }

    // NEW: Map selected illnesses back to boolean fields
    selectedIllnesses.forEach((illnessId) => {
      const illness = illnesses.find((ill) => ill.ill_id === illnessId)
      if (illness) {
        switch (illness.illname) {
          case "Severe headaches / migraine":
            medicalHistory.severeHeadaches = true
            break
          case "History of stroke / heart attack / hypertension":
            medicalHistory.strokeHeartAttackHypertension = true
            break
          case "Non-traumatic hematoma / frequent bruising or gum bleeding":
            medicalHistory.hematomaBruisingBleeding = true
            break
          case "Current or history of breast cancer / breast mass":
            medicalHistory.breastCancerHistory = true
            break
          case "Severe chest pain":
            medicalHistory.severeChestPain = true
            break
          case "Cough for more than 14 days":
            medicalHistory.cough = true
            break
          case "Jaundice":
            medicalHistory.jaundice = true
            break
          case "Unexplained vaginal bleeding":
            medicalHistory.unexplainedVaginalBleeding = true
            break
          case "Abnormal vaginal discharge":
            medicalHistory.abnormalVaginalDischarge = true
            break
          case "Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)":
            medicalHistory.phenobarbitalOrRifampicin = true
            break
          case "Is this client a SMOKER?":
            medicalHistory.smoker = true
            break
          case "Others":
            medicalHistory.disability = true
            break
        }
      }
    })

    // NEW: Store selected illness IDs for later use in medical history creation
    const updatedData = {
      ...data,
      medicalHistory,
      selectedIllnessIds: selectedIllnesses, 
      customDisabilityDetails: data.medicalHistory?.disabilityDetails || null,
    }

    console.log("PAGE 2 Data:", updatedData)
    updateFormData(updatedData)
    onNext3()
  }

  const saveFormData = () => {
    const currentValues = form.getValues()

    // NEW: Include selected illness IDs when saving
    const dataToSave = {
      ...currentValues,
      selectedIllnessIds: selectedIllnesses,
    }

    console.log("Saving current form data:", dataToSave)
    updateFormData(dataToSave)
  }

  // NEW: Show loading state while fetching illnesses
  if (isLoadingIllnesses) {
    return <div className="text-center py-8">Loading medical conditions...</div>
  }

  return (
    <div className="bg-white h-full flex w-full overflow-auto">
      <div className="rounded-lg w-full p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* <h5 className="text-lg text-right font-semibold mb-2 ">Page 2</h5> */}
            <div className="grid grid-cols-2 gap-6">
              {/* Medical History Section */}
              <div className="p-1">
                <Label className="text-lg font-bold mb-3">I. MEDICAL HISTORY</Label>
                <p className="text-sm mb-3">Does the client have any of the following?</p>

                {/* NEW: Use database illnesses if available, otherwise use hardcoded options */}
                {illnesses.length > 0
                  ? // NEW: Render illnesses from database
                  illnesses.map((illness) => (
                    <div key={illness.ill_id} className="flex justify-between items-center mb-4">
                      <Label className="flex-1">■ {illness.illname}</Label>
                      <div className="flex space-x-7">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedIllnesses.includes(illness.ill_id)}
                            onCheckedChange={(checked) => handleIllnessToggle(illness.ill_id, checked as boolean)}
                            disabled={isReadOnly}
                          />
                          <Label>Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={!selectedIllnesses.includes(illness.ill_id)}
                            onCheckedChange={() => handleIllnessToggle(illness.ill_id, false)}
                            disabled={isReadOnly}
                          />
                          <Label>No</Label>
                        </div>
                      </div>
                    </div>
                  ))
                  :
                  medicalHistoryOptions.map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`medicalHistory.${item.name}`}
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                          <Label className="mt-6">■ {item.label}</Label>
                          <div className="flex space-x-7">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={!!field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <Label>Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={!field.value}
                                  onCheckedChange={() => field.onChange(false)}
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <Label>No</Label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}

                <div className="flex justify-between items-center mb-4">
                  <Label className="flex-1">■ Others</Label>
                  <div className="flex space-x-7">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={form.watch("medicalHistory.disability")}
                        onCheckedChange={(checked) => form.setValue("medicalHistory.disability", checked as boolean)}
                        disabled={isReadOnly}
                      />
                      <Label>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={!form.watch("medicalHistory.disability")}
                        onCheckedChange={() => form.setValue("medicalHistory.disability", false)}
                        disabled={isReadOnly}
                      />
                      <Label>No</Label>
                    </div>
                  </div>
                </div>

                {form.watch("medicalHistory.disability") && (
                  <FormField
                    control={form.control}
                    name="medicalHistory.disabilityDetails"
                    render={({ field }) => (
                      <FormItem className="mt-5">
                        <Label>If YES, please specify:</Label>
                        <FormControl>
                          <Input {...field} className="border border-black w-full mt-2" readOnly={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Obstetrical History Section - ORIGINAL CODE PRESERVED */}
              <div className="border-l-4 pl-5">
                <Label className="text-lg font-bold mb-3">II. OBSTETRICAL HISTORY</Label>

                {/* Number of Pregnancies */}
                <div className="grid grid-cols-6 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.g_pregnancies"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="flex w-[150px] mb-4">Number of pregnancies</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="G"
                            className="w-[90px]"
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.p_pregnancies"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="P"
                            className=" w-20 mt-8"
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.fullTerm"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Full term</Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className=" w-[80px]"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.premature"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Premature</Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className=" w-[80px]"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.abortion"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Abortion</Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="w-[80px]"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.numOfLivingChildren"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Living Children</Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="w-[80px]"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date of Last Delivery */}
                <div className="flex grid-cols-2 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.lastDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Date of last delivery</Label>
                        <FormControl>
                          <Input {...field} type="date" className="w-[150px]" readOnly={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type of Last Delivery */}
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.typeOfLastDelivery"
                    render={({ field }) => (
                      <FormItem className="ml-7">
                        <Label>Type of last delivery:</Label>
                        <div className="flex space-x-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === "Vaginal"}
                              onCheckedChange={() => field.onChange("Vaginal")}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <Label>Vaginal</Label>
                          <FormControl>
                            <Checkbox
                              checked={field.value === "Cesarean Section"} // Keep this as "Cesarean Section"
                              onCheckedChange={() => field.onChange("Cesarean Section")} // Change this to "Cesarean Section"
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <Label>Cesarean Section</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Last and Previous Menstrual Period */}
                <div className="flex grid-cols-2 gap-4 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.lastMenstrualPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Last menstrual period</Label>
                        <FormControl>
                          <Input {...field} type="date" className=" w-[150px]" readOnly={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.previousMenstrualPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Previous menstrual period</Label>
                        <FormControl>
                          <Input {...field} type="date" className=" w-[150px]" readOnly={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Menstrual Flow - Fixed for Radio Buttons */}
                <div className="mt-5">
                  <Label>Menstrual Flow</Label>
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.menstrualFlow"
                    render={({ field }) => (
                      <FormItem>
                        <div className="ml-10">
                          {["Scanty", "Moderate", "Heavy"].map((flow) => (
                            <div key={flow} className="flex items-center space-x-2 mb-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  id={`flow-${flow.toLowerCase()}`}
                                  checked={field.value === flow}
                                  onChange={() => field.onChange(flow)}
                                  className="w-4 h-4"
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <Label htmlFor={`flow-${flow.toLowerCase()}`}>
                                {flow} {flow === "Scanty" && "(1-2 pads per day)"}
                                {flow === "Moderate" && "(3-5 pads per day)"}
                                {flow === "Heavy" && "(more than 5 pads per day)"}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Obstetrical History Fields */}
                <FormField
                  control={form.control}
                  name="obstetricalHistory.dysmenorrhea"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                      </FormControl>
                      <Label className="ml-2">Dysmenorrhea</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="obstetricalHistory.hydatidiformMole"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                      </FormControl>
                      <Label className="ml-2">Hydatidiform mole (within the last 12 months)</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="obstetricalHistory.ectopicPregnancyHistory"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                      </FormControl>
                      <Label className="ml-2">History of ectopic pregnancy</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  saveFormData()
                  onPrevious1()
                }}
                disabled={isReadOnly}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const currentValues = form.getValues()
                  // NEW: Include selected illness IDs when moving to next page
                  const dataToUpdate = {
                    ...currentValues,
                    selectedIllnessIds: selectedIllnesses,
                    customDisabilityDetails: currentValues.medicalHistory?.disabilityDetails || null,
                  }
                  updateFormData(dataToUpdate)
                  onNext3()
                }}
              // disabled={isReadOnly}
              >
                Next{" "}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}