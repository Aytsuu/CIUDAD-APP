"use client"

import { useEffect, useState } from "react"
import { useFormContext, type UseFormReturn } from "react-hook-form"
import type { ColumnDef } from "@tanstack/react-table"

import { type z } from "zod"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { PatientSearch, type Patient } from "@/components/ui/patientSearch"
import { Form } from "@/components/ui/form/form" 

// icons import
import { Trash } from "lucide-react"
import { MdOutlineSick } from "react-icons/md"
import { FaRegHospital } from "react-icons/fa"

// schema import
import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

// queries
import { usePrenatalPatientMedHistory, 
        usePrenatalPatientObsHistory, 
        usePrenatalPatientPrevHospitalization,
} from "../../queries/maternalFetchQueries"
import { usePrenatalPatientBodyMeasurement } from "../../queries/maternalFetchQueries"


// age calculation for dob
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export default function PrenatalFormFirstPg({
  form,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
}) {
  const { control, trigger, setValue, getValues, watch } = useFormContext<z.infer<typeof PrenatalFormSchema>>() // useFormContext to access the form methods

  // This function will only be called by form.handleSubmit if validation passes
  const handleNext = async () => {
    window.scrollTo(0, 0) 
    
    const isValid = await trigger([
      "pat_id", // Ensure patient ID is validated
      "motherPersonalInfo.familyNo",
      "motherPersonalInfo.motherLName",
      "motherPersonalInfo.motherFName",
      "motherPersonalInfo.motherDOB",
      "motherPersonalInfo.motherAge",
      "motherPersonalInfo.address.street",
      "motherPersonalInfo.address.sitio",
      "motherPersonalInfo.address.barangay",
      "motherPersonalInfo.address.city",
      "motherPersonalInfo.address.province",
      "motherPersonalInfo.motherWt",
      "motherPersonalInfo.motherHt",
      "motherPersonalInfo.motherBMI",
      "motherPersonalInfo.motherBMICategory",
      "obstetricHistory.noOfChBornAlive",
      "obstetricHistory.noOfLivingCh",
      "obstetricHistory.noOfAbortion",
      "obstetricHistory.noOfStillBirths",
      "obstetricHistory.historyOfLBabies",
      "obstetricHistory.historyOfDiabetes",
    ])
    console.log("Page 1 validation result:", isValid)

    if (isValid) {
      console.log("Form is valid, proceeding to next page")
      onSubmit()
    } else {
      console.log("Form validation failed. Errors:", form.formState.errors)
      // Scroll to the first error if validation fails
      const firstErrorElement = document.querySelector('[data-error="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }
  
  type previousIllness = {
    prevIllness: string
    prevIllnessYr?: number
  }

  type previousHospitalization = {
    prevHospitalization: string
    prevHospitalizationYr?: number
  }

  const [prevIllnessData, setPrevIllnessData] = useState<previousIllness[]>([])
  const [prevHospitalizationData, setPrevHospitalizationData] = useState<previousHospitalization[]>([])
  const [openRowId, setOpenRowId] = useState<string | null>(null) // open row id
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPatIdDisplay, setSelectedPatIdDisplay] = useState<string>("")

   // patient data fetching
  const { data: medHistoryData, isLoading, error } = usePrenatalPatientMedHistory(selectedPatientId)
  const { data: prevHospData, isLoading: prevHospLoading, error: prevHospError } = usePrenatalPatientPrevHospitalization(selectedPatientId)
  const { data: obsHistoryData, isLoading: obsLoading } = usePrenatalPatientObsHistory(selectedPatientId)
  const { data: bodyMeasurementData, isLoading: bmLoading } = usePrenatalPatientBodyMeasurement(selectedPatientId)
  // const { data: prevPregnancyData, isLoading: prevPregnancyLoading } = usePrenatalPatientPrevPregnancy(selectedPatientId)




  const handlePatientSelection = (patient: Patient | null, patientId: string) => {
    setSelectedPatIdDisplay(patientId)
    setSelectedPatient(patient)
    console.log(selectedPatient)

    if (!patient) {
      setSelectedPatientId("")
      setSelectedPatient(null)

      setValue("pat_id", "")
      setValue("motherPersonalInfo.familyNo", "N/A")

      form.reset({
        pat_id: "",
        motherPersonalInfo:{
          familyNo: "",
          motherLName: "",
          motherFName: "",
          motherMName: "",
          motherAge: undefined,
          motherDOB: "",
          husbandLName: "",
          husbandFName: "",
          husbandMName: "",
          husbandDob: "",
          occupation: "",
          address: {
            street: "",
            sitio: "",
            barangay: "",
            city: "",
            province: "",
          },
          motherWt: undefined,
          motherHt: undefined,
          motherBMI: undefined,
          motherBMICategory: undefined,
        },
        obstetricHistory: {
          noOfChBornAlive: 0,
          noOfLivingCh: 0,
          noOfAbortion: 0,
          noOfStillBirths: 0,
          historyOfLBabies: 0,
          historyOfDiabetes: "",
        },
        medicalHistory: {
          prevIllness: "",
          prevIllnessYr: undefined,
          prevIllnessData: [],
          prevHospitalization: "",
          prevHospitalizationYr: undefined,
          prevHospitalizationData: [],
        },
        previousPregnancy: {
          dateOfDelivery: "",
          outcome: "",
          typeOfDelivery: "",
          babysWt: undefined,
          gender: "",
          ballardScore: undefined,
          apgarScore: undefined,
        },
        prenatalVaccineInfo: {
          vaccineType: "",
          ttStatus: "",
          ttDateGiven: "",
          isTDAPAdministered: "",
        }, 
        presentPregnancy: {
          gravida: undefined,
          para: undefined,
          fullterm: undefined,
          preterm: undefined,
          pf_lmp: "",
          pf_edc: "",
        },
        labResults:{
          lab_type: undefined,
          resultDate: "",
          toBeFollowed: false,
          documentPath: "",
          labRemarks: "",
          labResultsData: []
        },
        followUpSchedule: {
          followUpDate: "",
          aogWeeks: undefined,
          aogDays: undefined,
        },
        ancVisits: {
          firstTri: "",
          secondTri: "",
          thirdTriOne: "",
          thirdTriTwo: ""
        },
        assessmentChecklist: {
          increasedBP: undefined,
          epigastricPain: undefined,
          nausea: undefined,
          blurringOfVision: undefined,
          edema: undefined,
          severeHeadache: undefined,
          abnormalVaginalDischarges: undefined,
          vaginalBleeding: undefined,
          chillsFever: undefined,
          diffInBreathing: undefined,
          varicosities: undefined,
          abdominalPain: undefined,
        },
        pregnancyPlan: {
          planPlaceOfDel: undefined,
          planNewbornScreening: undefined,
        },
        riskCodes: {
          hasOneOrMoreOfTheFF:{
            prevCaesarian: undefined,
            miscarriages: undefined,
            postpartumHemorrhage: undefined,
          },
          hasOneOrMoreOneConditions: {
            tuberculosis: undefined,
            heartDisease: undefined,
            diabetes: undefined,
            bronchialAsthma: undefined,
            goiter: undefined
          }
        },
        assessedBy: { assessedby: "" },
        prenatalCare: [],
      })

      return
    }


    if (patient && patient.personal_info) {
      setSelectedPatientId(patient.pat_id.toString())

      const patientRole = patient.family?.fc_role
      const personalInfo = patient?.personal_info
      const address = patient.address
      const father = patient.family_head_info?.family_heads?.father?.personal_info
      const spouse = patient.spouse_info?.spouse_info

      setValue("pat_id", patient.pat_id.toString())
      setValue("motherPersonalInfo.familyNo", patient.family?.fam_id || "")
      setValue("motherPersonalInfo.motherLName", personalInfo?.per_lname || "")
      setValue("motherPersonalInfo.motherFName", personalInfo?.per_fname || "")
      setValue("motherPersonalInfo.motherMName", personalInfo?.per_mname || "")
      setValue("motherPersonalInfo.motherAge", calculateAge(personalInfo?.per_dob || ""))
      setValue("motherPersonalInfo.motherDOB", personalInfo?.per_dob || "")

      if (address) {
        setValue("motherPersonalInfo.address.street", address.add_street || "")
        setValue("motherPersonalInfo.address.sitio", address.add_sitio || "")
        setValue("motherPersonalInfo.address.barangay", address.add_barangay || "")
        setValue("motherPersonalInfo.address.city", address.add_city || "")
        setValue("motherPersonalInfo.address.province", address.add_province || "")
      } else {
        setValue("motherPersonalInfo.address.street", "")
        setValue("motherPersonalInfo.address.sitio", "")
        setValue("motherPersonalInfo.address.barangay", "")
        setValue("motherPersonalInfo.address.city", "")
        setValue("motherPersonalInfo.address.province", "")
      }

      if (patientRole === "Mother") {
        if (father) {
          setValue("motherPersonalInfo.husbandLName", father.per_lname || "")
          setValue("motherPersonalInfo.husbandFName", father.per_fname || "")
          setValue("motherPersonalInfo.husbandMName", father.per_mname || "")
          setValue("motherPersonalInfo.husbandDob", father.per_dob || "")
        } else if (spouse) {
          setValue("motherPersonalInfo.husbandLName", spouse.spouse_lname || "")
          setValue("motherPersonalInfo.husbandFName", spouse.spouse_fname || "")
          setValue("motherPersonalInfo.husbandMName", spouse.spouse_mname || "")
          setValue("motherPersonalInfo.husbandDob", spouse.spouse_dob || "")
          setValue("motherPersonalInfo.occupation", spouse.spouse_occupation || "")
        } else {
          setValue("motherPersonalInfo.husbandLName", "")
          setValue("motherPersonalInfo.husbandFName", "")
          setValue("motherPersonalInfo.husbandMName", "")
          setValue("motherPersonalInfo.husbandDob", "")
        }
      } else {
        if (spouse) {
          setValue("motherPersonalInfo.husbandLName", spouse.spouse_lname || "")
          setValue("motherPersonalInfo.husbandFName", spouse.spouse_fname || "")
          setValue("motherPersonalInfo.husbandMName", spouse.spouse_mname || "")
          setValue("motherPersonalInfo.husbandDob", spouse.spouse_dob || "")
          setValue("motherPersonalInfo.occupation", spouse.spouse_occupation || "")
        } else {
          setValue("motherPersonalInfo.husbandLName", "")
          setValue("motherPersonalInfo.husbandFName", "")
          setValue("motherPersonalInfo.husbandMName", "")
          setValue("motherPersonalInfo.husbandDob", "")
          setValue("motherPersonalInfo.occupation", "")
        }
      }
    }
  }


  useEffect(() => {
    const restoreSelection = () => {
      const formPatId = form.getValues("pat_id")

      if (formPatId && !selectedPatientId) {
        console.log("Restoring patient selection from form:", formPatId)
        setSelectedPatientId(formPatId)
        
        const motherFName = form.getValues("motherPersonalInfo.motherFName")
        const motherLName = form.getValues("motherPersonalInfo.motherLName")
        const motherMName = form.getValues("motherPersonalInfo.motherMName")
        
        if (motherFName && motherLName) {
          const displayFormat = `${formPatId}, ${motherLName}, ${motherFName} ${motherMName || ''}`.trim()
          setSelectedPatIdDisplay(displayFormat)
          console.log(selectedPatIdDisplay)
        } else {
          setSelectedPatIdDisplay(formPatId)
        }
      }
    }

    const existingMedHistory = form.getValues("medicalHistory.prevIllnessData") || []
    if (existingMedHistory.length > 0 && prevIllnessData.length === 0) {
      setPrevIllnessData(existingMedHistory)
    }

    const existingHospData = form.getValues("medicalHistory.prevHospitalizationData") || []
    if (existingHospData.length > 0 && prevHospitalizationData.length === 0) {
      setPrevHospitalizationData(existingHospData)
    }

    restoreSelection()
  }, [form, selectedPatientId, prevIllnessData.length, prevHospitalizationData.length])


  // body measurement fetching
  useEffect(() => {
    const currBodyMeasurement = bodyMeasurementData?.body_measurement

    if(currBodyMeasurement && !bmLoading) {
      setValue("motherPersonalInfo.motherWt", currBodyMeasurement.weight || undefined)
      setValue("motherPersonalInfo.motherHt", currBodyMeasurement.height || undefined)
    }
  }, [bodyMeasurementData, bmLoading, setValue])


  // obstetric history fetching
  useEffect(() => {
    const currObs = obsHistoryData?.obstetrical_history

    if (obsHistoryData && !obsLoading) {
      setValue("obstetricHistory.noOfChBornAlive", currObs?.obs_ch_born_alive || 0)
      setValue("obstetricHistory.noOfLivingCh", currObs?.obs_living_ch || 0)
      setValue("obstetricHistory.noOfAbortion", currObs?.obs_abortion || 0)
      setValue("obstetricHistory.noOfStillBirths", currObs?.obs_still_birth || 0)
      setValue("obstetricHistory.historyOfLBabies", currObs?.obs_lbabies || 0)
      setValue("presentPregnancy.gravida", currObs?.obs_gravida || 0)
      setValue("presentPregnancy.para", currObs?.obs_para || 0)
      setValue("presentPregnancy.fullterm", currObs?.obs_fullterm || 0)
      setValue("presentPregnancy.preterm", currObs?.obs_preterm || 0)

    } else {
      setValue("obstetricHistory.noOfChBornAlive", undefined)
      setValue("obstetricHistory.noOfLivingCh", undefined)
      setValue("obstetricHistory.noOfAbortion", undefined)
      setValue("obstetricHistory.noOfStillBirths", undefined)
      setValue("obstetricHistory.historyOfLBabies", undefined)
      setValue("presentPregnancy.gravida", undefined)
      setValue("presentPregnancy.para", undefined)
      setValue("presentPregnancy.fullterm", undefined)
      setValue("presentPregnancy.preterm", undefined)
    }
  }, [obsHistoryData, obsLoading, setValue])


  // medical history fetching
  useEffect(() => {
    const existingFormData = form.getValues("medicalHistory.prevIllnessData") || []
    if(existingFormData.length > 0 && prevIllnessData.length === 0){
      setPrevIllnessData(existingFormData)
      return
    }
    

    if (medHistoryData && !isLoading && !error) {

      const historyList = medHistoryData?.medical_history || medHistoryData || []

      if (historyList?.length > 0) {
        const mappedData = historyList.map((history: any) => ({
          prevIllness: history.illness_name || history.ill?.illname || "N/A",
          prevIllnessYr: history.year ? history.year : undefined,
        }))

        // update only if the data has changed
        if(JSON.stringify(mappedData) !== JSON.stringify(prevIllnessData) &&
          JSON.stringify(mappedData) !== JSON.stringify(existingFormData)) {

          setPrevIllnessData(mappedData)
          setValue("medicalHistory.prevIllnessData", mappedData)
        }
      } else {
        setPrevIllnessData([])
      }
    }
  }, [medHistoryData, isLoading, error, setValue, form, prevIllnessData])

  const getMedicalHistoryTableData = () => {
    if (isLoading) {
      return []
    }

    if (error) {
      console.error("Error fetching medical history:", error)
      return []
    }

    const historyList = medHistoryData?.medical_history || medHistoryData || []

    if (!historyList?.length) {
      return []
    }

    const mappedData = historyList.map((history: any) => {
      return {
        prevIllness: history.illness_name || history.ill?.illname || "N/A",
        prevIllnessYr: history.year ? history.year : "Not known",
      }
    })
    return mappedData
  }


  // previous hospitalization data fetching
  useEffect(() => {
    const existingFormData = form.getValues("medicalHistory.prevHospitalizationData") || []
    if(existingFormData.length > 0 && prevHospitalizationData.length === 0){
      setPrevHospitalizationData(existingFormData)
      return
    }

    if(prevHospData && !prevHospLoading && !prevHospError){
      const prevHospList = prevHospData?.previous_hospitalization || prevHospData || []

      if(prevHospList?.length > 0) {
        const mappedData = prevHospList.map((phHistory: any) => ({
          prevHospitalization: phHistory.prev_hospitalization || "None",
          prevHospitalizationYr: phHistory.prev_hospitalization_year ? phHistory.prev_hospitalization_year : undefined,
        }))

        setPrevHospitalizationData(mappedData)
        setValue("medicalHistory.prevHospitalizationData", mappedData)
      } else {
        setPrevHospitalizationData([])
      }
    }
  }, [prevHospData, prevHospLoading, prevHospError, setValue, form, prevHospitalizationData])

  const getPrevHospitalization = () => {
    if (prevHospLoading) {
      console.log("Loading previous hospitalization data...")
      return []
    }

    if(prevHospError) {
      console.error("Error fetching previous hospitalization data:", prevHospError)
      return []
    }


    const prevHospList = prevHospData?.previous_hospitalization || prevHospData || []
    if(!prevHospList?.length) {
      return[]
    }

    const mappedData = prevHospList.map((phHosp: any) => {
      return {
        prevHospitalization: phHosp.prev_hospitalization || "None",
        prevHospitalizationYr: phHosp.prev_hospitalization_year ? phHosp.prev_hospitalization_year : "Not known",
      }
    })
    return mappedData
  }

  
  // useEffect(() => {
  //   const currPrevPregnancy = prevPregnancyData?.previous_pregnancy
  //   console.log("Current Previous Pregnancy Data:", currPrevPregnancy)

  //   if(prevPregnancyData && !prevPregnancyLoading){
  //     form.setValue("previousPregnancy.dateOfDelivery", currPrevPregnancy.date_of_delivery || "")
  //     form.setValue("previousPregnancy.outcome", currPrevPregnancy.outcome || "")
  //     form.setValue("previousPregnancy.typeOfDelivery", currPrevPregnancy.type_of_delivery || "")
  //     form.setValue("previousPregnancy.babysWt", currPrevPregnancy.babys_wt || undefined)
  //     form.setValue("previousPregnancy.gender", currPrevPregnancy.gender || "")
  //     form.setValue("previousPregnancy.ballardScore", 
  //       currPrevPregnancy.ballard_score !== null && currPrevPregnancy.ballard_score !== undefined 
  //         ? Number(currPrevPregnancy.ballard_score) 
  //         : undefined
  //     )
  //     form.setValue("previousPregnancy.apgarScore", 
  //       currPrevPregnancy?.apgar_score !== null && currPrevPregnancy.apgar_score !== undefined
  //         ? Number(currPrevPregnancy.apgar_score)
  //         : undefined
  //       )
  //   } else {
  //     form.setValue("previousPregnancy.dateOfDelivery", "")
  //     form.setValue("previousPregnancy.outcome", "")
  //     form.setValue("previousPregnancy.typeOfDelivery", "")
  //     form.setValue("previousPregnancy.babysWt", 0)
  //     form.setValue("previousPregnancy.gender", "")
  //     form.setValue("previousPregnancy.ballardScore", undefined)
  //     form.setValue("previousPregnancy.apgarScore", undefined)
  //   }
  // }, [prevPregnancyData, setValue])
  

  const illnessColumn: ColumnDef<previousIllness>[] = [
    {
      accessorKey: "prevIllness",
      header: "Previous Illness",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.prevIllness}</div>
        </div>
      ),
    },
    {
      accessorKey: "prevIllnessYr",
      header: "Year",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.prevIllnessYr}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const isDialogOpen = openRowId === row.original.prevIllness // Check if this row's dialog is open

        return (
          <div className="flex justify-center">
            <DialogLayout
              isOpen={isDialogOpen}
              onOpenChange={(open) => setOpenRowId(open ? row.original.prevIllness : null)}
              trigger={
                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                  <Trash className="w-4 h-4" />
                </div>
              }
              className=""
              title="Delete Record"
              description={`Are you sure you want to delete "${row.original.prevIllness}" record?`}
              mainContent={
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setOpenRowId(null)} 
                    variant={"outline"}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      const newData = prevIllnessData.filter(
                        (item) =>
                          item.prevIllness !== row.original.prevIllness ||
                          item.prevIllnessYr !== row.original.prevIllnessYr,
                      )
                      setPrevIllnessData(newData) // Update data
                      setValue("medicalHistory.prevIllnessData", newData)
                      setValue("medicalHistory.prevIllness", "")
                      setOpenRowId(null) // Close dialog
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              }
            />
          </div>
        )
      },
    },
  ]

  const hospitalizationColumn: ColumnDef<previousHospitalization>[] = [
    {
      accessorKey: "prevHospitalization",
      header: "Previous Hospitalization",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.prevHospitalization}</div>
        </div>
      ),
    },
    {
      accessorKey: "prevHospitalizationYr",
      header: "Year",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.prevHospitalizationYr}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const isDialogOpen = openRowId === row.original.prevHospitalization

        return (
          <div className="flex justify-center gap-2">
            <DialogLayout
              isOpen={isDialogOpen}
              onOpenChange={(open) => setOpenRowId(open ? row.original.prevHospitalization : null)}
              trigger={
                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                  {" "}
                  <Trash size={16} />
                </div>
              }
              className=""
              title="Delete Record"
              description={`Are you sure you want to delete "${row.original.prevHospitalization}" record?`}
              mainContent={
                <div className="flex gap-2 justify-end">
                  <Button variant={"outline"}>Cancel</Button>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      const newData = prevHospitalizationData.filter(
                        (item) =>
                          item.prevHospitalization !== row.original.prevHospitalization ||
                          item.prevHospitalizationYr !== row.original.prevHospitalizationYr,
                      )
                      setPrevHospitalizationData(newData)
                      setValue("medicalHistory.prevHospitalizationData", newData)
                      setOpenRowId(null)
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              }
            />
          </div>
        )
      },
    },
  ]

  // functionality to handle adding of previous illness
  const addPrevIllness = () => {
    const illness = getValues("medicalHistory.prevIllness")
    const illnessYr = getValues("medicalHistory.prevIllnessYr")

    console.log("Previous Illness: ", illness, "Year: ", illnessYr)

    if (illness) {
      const newData = [...prevIllnessData, { prevIllness: illness, prevIllnessYr: illnessYr }]
      setPrevIllnessData(newData)
      setValue("medicalHistory.prevIllnessData", newData)
      setValue("medicalHistory.prevIllness", "")
      setValue("medicalHistory.prevIllnessYr", undefined)
    }
  }

  // functionality to handle adding of previous hopsitalization to table
  const addPrevHospitalization = () => {
    const hospitalization = getValues("medicalHistory.prevHospitalization")
    const hospitalizationYr = getValues("medicalHistory.prevHospitalizationYr")

    if (hospitalization) {
      const newData = [
        ...prevHospitalizationData,
        { prevHospitalization: hospitalization, prevHospitalizationYr: hospitalizationYr },
      ]
      setPrevHospitalizationData(newData)
      setValue("medicalHistory.prevHospitalizationData", newData)
      setValue("medicalHistory.prevHospitalization", "")
      setValue("medicalHistory.prevHospitalizationYr", undefined)
    }
  }


  // BMI calculation
  const weight = watch("motherPersonalInfo.motherWt")
  const height = watch("motherPersonalInfo.motherHt")

  useEffect(() => {
    if (weight && height && height > 0) {
      const bmi = (weight / (height / 100) ** 2).toFixed(2)
      setValue("motherPersonalInfo.motherBMI", Number.parseFloat(bmi))
    } else {
      setValue("motherPersonalInfo.motherBMI", 0)
    }
  }, [weight, height, setValue])

  // calculate BMI category based on the BMI value
  const bmi = watch("motherPersonalInfo.motherBMI")
  useEffect(() => {
    let bmiCategory = ""

    if (typeof bmi === "number" && !isNaN(bmi)) {
      if (bmi < 18.5) {
        bmiCategory = "Underweight"
      } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiCategory = "Normal weight"
      } else if (bmi >= 25 && bmi < 29.9) {
        bmiCategory = "Overweight"
      } else if (bmi >= 30) {
        bmiCategory = "Obesity"
      }
    }

    setValue("motherPersonalInfo.motherBMICategory", bmiCategory)
  }, [bmi, setValue])



  return (
    <>
      <LayoutWithBack
        title="Prenatal Record"
        description="Fill out the prenatal record with the mother's personal information."
      >
        <div>
          <PatientSearch value={selectedPatIdDisplay} onChange={setSelectedPatientId} onPatientSelect={handlePatientSelection} />
        </div>

        <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto mt-2">
          <Label className="text-black text-opacity-50 italic mb-10">Page 1 of 4</Label>
          <div className="pb-4">
            <h2 className="text-3xl font-bold text-center">MATERNAL HEALTH RECORD</h2>
          </div>
          <Form {...form}>
            <form>
              <div className="flex">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.familyNo"
                  label="Family No."
                  placeholder="Enter Family No."
                />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherLName"
                  label="Last Name"
                  placeholder="Enter Last Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherFName"
                  label="First Name"
                  placeholder="Enter First Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherMName"
                  label="Middle Name"
                  placeholder="Enter Middle Name"
                />
                <FormDateTimeInput
                  control={control}
                  name="motherPersonalInfo.motherDOB"
                  label="Date of Birth"
                  type="date"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherAge"
                  label="Age"
                  placeholder="Enter Age"
                  type="number"
                />
              </div>

              {/* dob, husband's name, occupation */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandLName"
                  label="Husband's Last Name"
                  placeholder="Enter Last Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandFName"
                  label="Husband's First Name"
                  placeholder="Enter First Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandMName"
                  label="Husband's Middle Name"
                  placeholder="Enter Middle Name"
                />
                <FormDateTimeInput
                  control={control}
                  name="motherPersonalInfo.husbandDob"
                  label="Husband's Date of Birth"
                  type="date"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.occupation"
                  label="Occupation"
                  placeholder="Enter Occupation"
                />
              </div>

              {/* address */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.street"
                  label="Street"
                  placeholder="Enter Street"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.sitio"
                  label="Sitio"
                  placeholder="Enter Sitio"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.barangay"
                  label="Barangay"
                  placeholder="Enter Barangay"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.city"
                  label="City"
                  placeholder="Enter City"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.province"
                  label="Province"
                  placeholder="Enter Province"
                />
              </div>

              {/* body measurement */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherWt"
                  label="Weight"
                  placeholder="Wt in kg"
                  type="number"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherHt"
                  label="Height"
                  placeholder="Ht in cm"
                  type="number"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherBMI"
                  label="BMI"
                  placeholder="BMI"
                  type="number"
                  readOnly
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherBMICategory"
                  label="BMI Category"
                  placeholder="BMI Category"
                  readOnly
                />
              </div>

              {/* obstetric history */}
              <div className="border rounded-lg p-4 shadow-md mt-10">
                <h3 className="text-md font-semibold mt-2">OBSTETRIC HISTORY</h3>
                <div className="flex flex-col mt-2 px-4">
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfChBornAlive"
                      label="No. of Children Born Alive"
                      placeholder="Enter number of children born alive"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfLivingCh"
                      label="No. of Living Children"
                      placeholder="Enter number of living children"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfAbortion"
                      label="No. of Abortion"
                      placeholder="Enter number of abortion/s"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfStillBirths"
                      label="No. of Still Births"
                      placeholder="Enter number of still births"
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={control}
                      name="obstetricHistory.historyOfLBabies"
                      label="History of Large Babies"
                      placeholder="Enter history of large babies"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.historyOfDiabetes"
                      label="History of Diabetes"
                      placeholder="Enter history of diabetes"
                    />
                  </div>
                </div>
              </div>

              {/* medical history */}
              <div className="border rounded-lg p-4 shadow-md mt-10">
                <h3 className="text-md font-semibold mt-2">MEDICAL HISTORY</h3>
                <div className="p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border rounded-md p-4 items-center">
                      <div className="flex flex-row items-center gap-2">
                        <MdOutlineSick size={25} />
                        <Label>Previous Illness</Label>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <FormInput
                            control={control}
                            name="medicalHistory.prevIllness"
                            label=""
                            placeholder="Enter Previous Illness"
                          />
                        </div>
                        <div className="flex-1">
                          <FormInput
                            control={control}
                            name="medicalHistory.prevIllnessYr"
                            label=""
                            placeholder="Enter year"
                            type="number"
                          />
                        </div>
                        <Button onClick={addPrevIllness} type="button" variant="default">
                          Add
                        </Button>
                      </div>
                      <div className="flex bg-white w-full overflow-x-auto mt-4 h-[20rem] border rounded-lg overflow-y-auto">
                        <DataTable columns={illnessColumn} data={getMedicalHistoryTableData()} />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4 items">
                      <div className="flex flex-row items-center gap-2">
                        <FaRegHospital size={25} />
                        <Label>Previous Hospitalization</Label>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <FormInput
                            control={control}
                            name="medicalHistory.prevHospitalization"
                            label=""
                            placeholder="Enter previous hospitalization"
                          />
                        </div>
                        <div className="flex-1">
                          <FormInput
                            control={control}
                            name="medicalHistory.prevHospitalizationYr"
                            label=""
                            placeholder="Enter year"
                            type="number"
                          />
                        </div>
                        <Button onClick={addPrevHospitalization} type="button" variant="default">
                          Add
                        </Button>
                      </div>
                      <div className="flex bg-white w-full overflow-x-auto mt-4 h-[20rem] border rounded-lg overflow-y-auto">
                        <DataTable columns={hospitalizationColumn} data={getPrevHospitalization()} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 flex justify-end">
                <Button className="mt-4 mr-4 w-[120px]" type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </LayoutWithBack>
    </>
  )
}
