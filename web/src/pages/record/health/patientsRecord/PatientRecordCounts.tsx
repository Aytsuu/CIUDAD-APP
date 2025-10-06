"use client"

import { useMedConCount, useChildHealthRecordCount } from "@/pages/record/health/patientsRecord/queries/count"
import { useMedicineCount } from "@/pages/healthServices/medicineservices/queries/MedCountQueries"
import { useVaccinationCount } from "@/pages/healthServices/vaccination/queries/VacCount"
import { useFirstAidCount } from "@/pages/healthServices/firstaidservices/queries/FirstAidCountQueries"
import { usePatientPostpartumCount, usePatientPrenatalCount } from "@/pages/healthServices/maternal/queries/maternalFetchQueries"
import { useEffect, useState } from "react"

interface PatientRecordCountProps {
  patientId: string
}

export default function PatientRecordCount({ patientId }: PatientRecordCountProps) {
  const [totalRecords, setTotalRecords] = useState<number | null>(null)

  // Fetch all individual counts for the given patientId
  const { data: medicineCountData, isLoading: medicineLoading } = useMedicineCount(patientId)
  const { data: vaccinationCountData, isLoading: vaccinationLoading } = useVaccinationCount(patientId)
  const { data: firstAidCountData, isLoading: firstAidLoading } = useFirstAidCount(patientId)
  const { data: childHealthCountData, isLoading: childHealthLoading } = useChildHealthRecordCount(patientId)
  const { data: medconCountData, isLoading: medconLoading } = useMedConCount(patientId)
  const { data: postpartumCountData, isLoading: postpartumLoading } = usePatientPostpartumCount(patientId)
  const { data: prenatalCountData, isLoading: prenatalLoading } = usePatientPrenatalCount(patientId)

  useEffect(() => {
    // Only calculate total when all individual counts are loaded
    if (
      !medicineLoading &&
      !vaccinationLoading &&
      !firstAidLoading &&
      !childHealthLoading &&
      !medconLoading &&
      !postpartumLoading &&
      !prenatalLoading
    ) {
      const medicineCount = medicineCountData?.medicinerecord_count || 0
      const vaccinationCount = vaccinationCountData?.vaccination_count || 0
      const firstAidCount = firstAidCountData?.firstaidrecord_count || 0
      const childHealthCount = childHealthCountData?.childhealthrecord_count || 0
      const medconCount = medconCountData?.medcon_count || 0
      const postpartumCount = postpartumCountData || 0
      const prenatalCount = prenatalCountData || 0

      const sum =
        medicineCount +
        vaccinationCount +
        firstAidCount +
        childHealthCount +
        medconCount +
        postpartumCount +
        prenatalCount

      setTotalRecords(sum)
    }
  }, [
    patientId,
    medicineCountData,
    vaccinationCountData,
    firstAidCountData,
    childHealthCountData,
    medconCountData,
    postpartumCountData,
    prenatalCountData,
    medicineLoading,
    vaccinationLoading,
    firstAidLoading,
    childHealthLoading,
    medconLoading,
    postpartumLoading,
    prenatalLoading,
  ])

  if (totalRecords === null) {
    return <div className="flex justify-center items-center">...</div> // Or a spinner
  }

  return <div>{totalRecords}</div>
}