"use client"
import { useState, useEffect } from "react"
import type { FormData } from "@/form-schema/chr-schema/chr-schema" // Assuming this path is correct
import { Button } from "@/components/ui/button/button" // Corrected import path for shadcn/ui button
import { ChevronLeft } from "lucide-react"
import ChildHRPage1 from "./AddChildHRPage1" // Assuming these components exist
import ChildHRPage2 from "./AddChildHRPage2" // Assuming these components exist
import { api2 } from "@/api/api" // Assuming this path is correct
import { useAuth } from "@/context/AuthContext" // Assuming this path is correct
import { createPatientRecord, createMedicineRecord } from "../../../medicineservices/restful-api/postAPI" // Assuming this path is correct
import { getMedicineInventory } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicineGetAPI" // Assuming this path is correct
import {
  updateMedicineStocks,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePutAPI" // Assuming this path is correct
import { addMedicineTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePostAPI" // Assuming this path is correct
import LastPage from "./AddChildHRPagelast" // Assuming this component exists
import { useNavigate } from "react-router" // Assuming this is from react-router-dom

// Define initial form data
const initialFormData: FormData = {
  familyNo: "",
  pat_id: "",
  rp_id: "",
  trans_id: "",
  ufcNo: "",
  childFname: "",
  childLname: "",
  childMname: "",
  childSex: "",
  childDob: "",
  birth_order: 0, // Default to 0 if no value is provided
  placeOfDeliveryType: "Home", // Default to a valid value
  placeOfDeliveryLocation: "",
  childAge: "",
  residenceType: "Resident",
  motherFname: "",
  motherLname: "",
  motherMname: "",
  motherAge: "",
  motherdob: "",
  motherOccupation: "",
  fatherFname: "",
  fatherLname: "",
  fatherMname: "",
  fatherAge: "",
  fatherdob: "",
  fatherOccupation: "",
  address: "",
  landmarks: "",
  dateNewbornScreening: "",
  disabilityTypes: [],
  edemaSeverity: "",
  BFdates: [],
  vitalSigns: [],
  medicines: [], // Add medicines with an empty array as the default value
  is_anemic: false, // Add is_anemic with a default value of false
  anemic: {
    seen: "",
    given_iron: "",
  },
  birthwt: {
    seen: "",
    given_iron: "",
  },
  status: "recorded", // Default status
  type_of_feeding: "", // Add type_of_feeding with a default value
  tt_status: "", // Add tt_status with a default value
  nutritionalStatus: {
    wfa: "", // Weight for Age: Normal / UW / SUW / ""
    lhfa: "", // Length/Height for Age: Normal / ST / SST / T / OB / ""
    wfh: "", // Weight for Height: Normal / W / SW / OW / ""
    muac: undefined, // Mid-Upper Arm Circumference
    muac_status: "", // Normal / MAM / SAM / ""
  },
}

// Helper function to load from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : defaultValue
}

export default function ChildHealthForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const staffId = user?.staff?.staff_id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load state from localStorage or use defaults
  const [currentPage, setCurrentPage] = useState(() => loadFromLocalStorage("childHealthFormCurrentPage", 1))
  const [formData, setFormData] = useState<FormData>(() => loadFromLocalStorage("childHealthFormData", initialFormData))

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("childHealthFormCurrentPage", currentPage.toString())
  }, [currentPage])

  useEffect(() => {
    localStorage.setItem("childHealthFormData", JSON.stringify(formData))
  }, [formData])

  // Navigation handlers
  const handleNext = () => {
    setCurrentPage((prev) => prev + 1)
    setError(null) // Clear errors when moving to next page
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1)
    setError(null) // Clear errors when moving back
  }

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (n: number): string => {
    if (n > 3 && n < 21) return "th" // Handles 11th, 12th, 13th
    switch (n % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  // Helper function to format birth order
  const formatBirthOrder = (order: number): string => {
    if (order <= 0) return "" // Handle non-positive numbers
    return `${order}${getOrdinalSuffix(order)} Born`
  }

  const handleSubmit = async (submittedData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Validate required fields
      if (!submittedData.pat_id) {
        throw new Error("Patient ID is required")
      }
      if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
        throw new Error("Transient ID is required for transient residents")
      }

      // Transient update handling
      if (submittedData.residenceType === "Transient") {
        try {
          const transRes = await api2.patch(`patientrecords/update-transient/${submittedData.trans_id}/`, {
            mother_fname: submittedData.motherFname || null,
            mother_lname: submittedData.motherLname || null,
            mother_mname: submittedData.motherMname || null,
            mother_age: submittedData.motherAge || null,
            mother_dob: submittedData.motherdob || null,
            father_fname: submittedData.fatherFname || null,
            father_lname: submittedData.fatherLname || null,
            father_mname: submittedData.fatherMname || null,
            father_age: submittedData.fatherAge || null,
            father_dob: submittedData.fatherdob || null,
          })
          if (transRes.status !== 200) {
            throw new Error("Failed to update transient information")
          }
          console.log("Transient updated successfully:", transRes.data)
        } catch (transientError) {
          console.error("Transient update error:", transientError)
          if (transientError instanceof Error) {
            throw new Error(`Failed to update transient: ${transientError.message}`)
          } else {
            throw new Error("Failed to update transient: Unknown error")
          }
        }
      }

      // Create patient record
      let patrec_id
      try {
        const patrec = await api2.post("patientrecords/patient-record/", {
          patrec_type: "Child Health Record",
          pat_id: submittedData.pat_id,
          created_at: new Date().toISOString(),
        })
        if (!patrec.data.patrec_id) {
          throw new Error("Failed to create patient record: No ID returned")
        }
        patrec_id = patrec.data.patrec_id
        console.log("Patient record created:", patrec.data)
      } catch (patrecError) {
        console.error("Patient record creation error:", patrecError)
        if (patrecError instanceof Error) {
          throw new Error(`Failed to create patient record: ${patrecError.message}`)
        } else {
          throw new Error("Failed to create patient record: Unknown error")
        }
      }
      console.log("Staff",staffId)

      // Create child health record
      let chrec_id
      try {
        const chrecord = await api2.post("child-health/records/", {
          chr_date: submittedData.childDob,
          ufc_no: submittedData.ufcNo,
          family_no: submittedData.familyNo,
          place_of_delivery_type: submittedData.placeOfDeliveryType,
          pod_location: submittedData.placeOfDeliveryLocation,
          mother_occupation: submittedData.motherOccupation,
          type_of_feeding: submittedData.type_of_feeding,
          father_occupation: submittedData.fatherOccupation,
          birth_order: formatBirthOrder(submittedData.birth_order),
          newborn_screening: submittedData.dateNewbornScreening || "",

          staff: staffId || null,
          patrec: patrec_id,
        })
        if (!chrecord.data.chrec_id) {
          throw new Error("Failed to create child health record: No ID returned")
        }
        chrec_id = chrecord.data.chrec_id
        console.log("Child health record created:", chrecord.data)
      } catch (chrecordError) {
        console.error("Child health record creation error:", chrecordError)
        if (chrecordError instanceof Error) {
          throw new Error(`Failed to create child health record: ${chrecordError.message}`)
        } else {
          throw new Error("Failed to create child health record: Unknown error")
        }
      }

      // Create child health history
      let chhist_id
      try {
        const chhistory = await api2.post("child-health/history/", {
          created_at: new Date().toISOString(),
          chrec: chrec_id,
          status: submittedData.status || "recorded",
          tt_status: submittedData.tt_status,
        })
        if (!chhistory.data.chhist_id) {
          throw new Error("Failed to create child health history: No ID returned")
        }
        console.log("Child health history created:", chhistory.data)
        chhist_id = chhistory.data.chhist_id
      } catch (chhistoryError) {
        console.error("Child health history creation error:", chhistoryError)
        if (chhistoryError instanceof Error) {
          throw new Error(`Failed to create child health history: ${chhistoryError.message}`)
        } else {
          throw new Error("Failed to create child health history: Unknown error")
        }
      }

      // Handle follow-up visit if needed
      let followv_id = null
      if (submittedData.vitalSigns?.[0]?.followUpVisit) {
        try {
          const followUpRes = await api2.post("patientrecords/follow-up-visit/", {
            followv_date: submittedData.vitalSigns[0].followUpVisit,
            created_at: new Date().toISOString(),
            followv_description: submittedData.vitalSigns[0].follov_description || "Follow Up for Child Health",
            patrec: patrec_id,
            followv_status: "pending",
            updated_at: new Date().toISOString(),
          })
          if (!followUpRes.data.followv_id) {
            throw new Error("Failed to create follow-up record: No ID returned")
          }
          followv_id = followUpRes.data.followv_id
          console.log("Follow-up visit created:", followUpRes.data)
        } catch (followUpError) {
          console.error("Follow-up visit creation error:", followUpError)
          if (followUpError instanceof Error) {
            throw new Error(`Failed to create follow-up visit: ${followUpError.message}`)
          } else {
            throw new Error("Failed to create follow-up visit: Unknown error")
          }
        }
      }

      let chnotes_id
      // Create child health notes
      try {
        const chnotes_res = await api2.post("child-health/notes/", {
          chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // chhist: chhist_id,
          followv: followv_id,
          staff: staffId || null,
        })
        chnotes_id = chnotes_res.data.chnotes_id // Update chhist_id to the notes ID
        if (!chnotes_id) {
          throw new Error("Failed to create child health notes: No ID returned")
        }
        console.log("Child health notes created:", chnotes_res.data)
      } catch (chnotesError) {
        console.error("Child health notes creation error:", chnotesError)
        if (chnotesError instanceof Error) {
          throw new Error(`Failed to create child health notes: ${chnotesError.message}`)
        } else {
          throw new Error("Failed to create child health notes: Unknown error")
        }
      }

      // Create BMI record
      let bmi_id
      try {
        const bmi_res = await api2.post("patientrecords/body-measurements/", {
          age: submittedData.childAge,
          height: submittedData.vitalSigns?.[0]?.ht || "",
          weight: submittedData.vitalSigns?.[0]?.wt || "",
          created_at: new Date().toISOString(),
          patrec: patrec_id,
          staff: staffId || null,
        })
        if (!bmi_res.data.bm_id) {
          throw new Error("Failed to create BMI record: No ID returned")
        }
        bmi_id = bmi_res.data.bm_id
        console.log("BMI record created:", bmi_res.data)
      } catch (bmiError) {
        console.error("BMI record creation error:", bmiError)
        if (bmiError instanceof Error) {
          throw new Error(`Failed to create BMI record: ${bmiError.message}`)
        } else {
          throw new Error("Failed to create BMI record: Unknown error")
        }
      }

      let chvital_id
      // Create vital signs record
      try {
        const chvitalres = await api2.post("child-health/child-vitalsigns/", {
          temp: submittedData.vitalSigns?.[0]?.temp || "",
          bm: bmi_id,
          chhist: chhist_id,
          created_at: new Date().toISOString(),
          chnotes: chnotes_id,
          // edemaSeverity:submittedData.edemaSeverity
        })

        if (!chvitalres.data.chvital_id) {
          throw new Error("Failed to create vital signs record: No ID returned")
        }
        console.log("Vital signs record created:", chvitalres.data)
        chvital_id = chvitalres.data.chvital_id
      } catch (vitalSignsError) {
        console.error("Vital signs creation error:", vitalSignsError)
        if (vitalSignsError instanceof Error) {
          throw new Error(`Failed to create vital signs record: ${vitalSignsError.message}`)
        } else {
          throw new Error("Failed to create vital signs record: Unknown error")
        }
      }

      // Create nutritional status record
      try {
        const nutritionalRes = await api2.post("child-health/nutritional-status/", {
          wfa: submittedData.nutritionalStatus?.wfa || "",
          lhfa: submittedData.nutritionalStatus?.lhfa || "",
          wfl: submittedData.nutritionalStatus?.wfh || "", // Map JS `wfh` → Python `wfl`
          muac: submittedData.nutritionalStatus?.muac?.toString() || "",
          created_at: new Date().toISOString(),
          chvital: chvital_id,
          edemaSeverity: submittedData.edemaSeverity || "none",
        })
        if (!nutritionalRes.data.nutstat_id) {
          throw new Error("Failed to create nutritional status record: No ID returned")
        }
        console.log("Nutritional status record created:", nutritionalRes.data)
      } catch (nutritionalError) {
        console.error("Nutritional status creation error:", nutritionalError)
        if (nutritionalError instanceof Error) {
          throw new Error(`Failed to create nutritional status: ${nutritionalError.message}`)
        } else {
          throw new Error("Failed to create nutritional status: Unknown error")
        }
      }

      // Create Exclusive BF Check if BFdates are provided
      try {
        if (submittedData.BFdates && submittedData.BFdates.length > 0) {
          const ebfRes = await api2.post("child-health/exclusive-bf-check/", {
            chhist: chhist_id,
            BFdates: submittedData.BFdates,
          })
          console.log("Exclusive BF checks created:", ebfRes.data)
        }
      } catch (ebfError) {
        console.error("Exclusive BF check creation error:", ebfError)
      }

      if (submittedData.disabilityTypes && submittedData.disabilityTypes.length > 0) {
        try {
          const res = await api2.post("patientrecords/patient-disability/", {
            patrec: patrec_id,
            disabilities: submittedData.disabilityTypes,
          })
          console.log("Disabilities linked:", res.data)
        } catch (disabilityError) {
          console.error("Failed to link disabilities:", disabilityError)
        }
      }


      let medrecordpatrec_id
      try {
        const medrecresponse = await createPatientRecord(submittedData.pat_id,"Medicine Record")
        medrecordpatrec_id = medrecresponse.patrec_id
      } catch (error) {
        console.error("Error creating patient record for medicines:", error)
        if (error instanceof Error) {
          throw error
        } else {
          throw new Error("An unknown error occurred while creating patient record")
        }
      }

      // Loop through medicines array and create records for each
      try {
        if (submittedData.medicines && submittedData.medicines.length > 0) {
          const medicineRecords = []
          const inventoryList = await getMedicineInventory() // Fetch inventory once
          for (const med of submittedData.medicines) {
            // 1. Create MedicineRecord
            const submissionData = {
              pat_id: submittedData.pat_id,
              patrec_id: medrecordpatrec_id,
              minv_id: med.minv_id,
              medrec_qty: med.medrec_qty,
              reason: med.reason || null,
              requested_at: new Date().toISOString(),
              fulfilled_at: new Date().toISOString(),
              medreq_id: null,
            }
            const response = await createMedicineRecord(submissionData) // This response should contain medrec_id
            medicineRecords.push(response)
            const medrecId = response.medrec_id // Get the ID of the newly created medicine record

            // 2. Verify medicine exists
            const existingMedicine = inventoryList.find(
              (medicine: any) => Number.parseInt(medicine.minv_id, 10) === Number.parseInt(med.minv_id, 10),
            )
            if (!existingMedicine) {
              throw new Error(`Medicine ID ${med.minv_id} not found in inventory`)
            }

            // 3. Check stock availability
            if (existingMedicine.minv_qty_avail < med.medrec_qty) {
              throw new Error(`Insufficient stock for medicine ID ${med.minv_id}`)
            }

            // 4. Update stock
            const inv_id = existingMedicine.inv_detail?.inv_id
            const newQty = existingMedicine.minv_qty_avail - med.medrec_qty
            let unit = existingMedicine.minv_qty_unit
            if (unit === "boxes") {
              unit = "pc/s"
            }
            await updateMedicineStocks(Number.parseInt(med.minv_id, 10), {
              minv_qty_avail: newQty,
            })

            // Update inventory timestamp if exists
            if (inv_id) {
              await updateInventoryTimestamp(inv_id)
            }

            const transactionPayload = {
              mdt_qty: `${med.medrec_qty} ${unit}`,
              mdt_action: "Deducted (Medicine Child)",
              mdt_staff: staffId || null, // Use staffId from auth context
              minv_id: Number.parseInt(med.minv_id, 10),
            }
            
            await addMedicineTransaction(transactionPayload)

            // 5. Create ChildHealthSupplements record for THIS medicine record
            let chsupplementId = null
            try {
              const chsupplementRes = await api2.post("child-health/supplements/", {
                chhist: chhist_id,
                medrec: medrecId, // Link to the newly created medicine record
              })
              if (!chsupplementRes.data.chsupplement_id) {
                throw new Error("Failed to create supplement record for medicine: No ID returned")
              }
              chsupplementId = chsupplementRes.data.chsupplement_id
              console.log(`Supplement record created for medicine ${med.minv_id}:`, chsupplementRes.data)

              // 6. Create supplement statuses (anemic, birthwt) linked to THIS chsupplementId
              // This assumes anemic/birthwt statuses are relevant to EACH medicine record.
              // If they are general child health statuses, this might lead to redundancy.
              if (submittedData.anemic?.seen || submittedData.anemic?.given_iron) {
                const statusRes = await api2.post("child-health/supplement-status/", {
                  chsupplement: chsupplementId,
                  status_type: "anemic",
                  date_seen: submittedData.anemic.seen || null,
                  date_given_iron: submittedData.anemic.given_iron || null,
                })
                console.log("Anemic supplement status created:", statusRes.data)
              }
              if (submittedData.birthwt?.seen || submittedData.birthwt?.given_iron) {
                const statusRes = await api2.post("child-health/supplement-status/", {
                  // chsupplement: chsupplementId,
                  status_type: "birthwt",
                  date_seen: submittedData.birthwt.seen || null,
                  date_given_iron: submittedData.birthwt.given_iron || null,
                })
                console.log("Birth weight supplement status created:", statusRes.data)
              }
            } catch (supplementCreationError) {
              console.error(
                `Error creating supplement record or status for medicine ${med.minv_id}:`,
                supplementCreationError,
              )
              if (supplementCreationError instanceof Error) {
                throw new Error(
                  `Failed to create supplement for medicine ${med.minv_id}: ${supplementCreationError.message}`,
                )
              } else {
                throw new Error(`Failed to create supplement for medicine ${med.minv_id}: Unknown error`)
              }
            }
          }
          console.log("All medicine records and associated supplements created:", medicineRecords)
        }
      } catch (error) {
        console.error("Error creating medicine records or updating inventory:", error)
        if (error instanceof Error) {
          throw new Error(`Failed to create medicine records or update inventory: ${error.message}`)
        } else {
          throw new Error("Failed to create medicine records or update inventory: Unknown error")
        }
      }

      // Success - clear form and navigate
      setFormData(initialFormData)
      localStorage.removeItem("selectedPatient")
      localStorage.removeItem("childHealthFormData")
      setCurrentPage(1)
      navigate(-1)
    } catch (error: any) {
      // Explicitly type error as any for now to access .message
      console.error("Submission error:", error)
      setError(error.message || "Failed to create child health record") // Set error state
      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to create child health record",
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => {
            localStorage.removeItem("selectedPatient")
            localStorage.removeItem("childHealthFormData")
            setFormData(initialFormData)
            setCurrentPage(1)
            navigate(-1)
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Child Health Record</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view patient's information</p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {currentPage === 1 && <ChildHRPage1 onNext={handleNext} updateFormData={updateFormData} formData={formData} />}
      {currentPage === 2 && (
        <ChildHRPage2
          onPrevious={handlePrevious}
          onNext={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 3 && (
        <LastPage
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
    </>
  )
}
