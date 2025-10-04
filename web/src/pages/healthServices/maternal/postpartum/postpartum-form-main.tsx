"use client";

import type { z } from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation } from "react-router"

// import type { Patient } from "@/components/ui/patientSearch"

import { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"
import PostpartumFormFirstPg from "./postpartum-form"


export default function PostpartumForm() {
  const [isFromIndividualRecord, setIsFromIndividualRecord] = useState(false)
  const [preselectedPatient, setPreselectedPatient] = useState<any | null>(null)
  const [pregnancyId, setPregnancyId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const location = useLocation()

  const defaultValues: z.infer<typeof PostPartumSchema> = {
    mothersPersonalInfo: {
      familyNo: "",
      motherLName: "",
      motherFName: "",
      motherMName: "",
      motherAge: "",
      husbandLName: "",
      husbandFName: "",
      husbandMName: "",
      husbandDob: "",
      address: {
        street: "",
        sitio: "",
        barangay: "",
        city: "",
        province: ""
      }
    },
    postpartumInfo: {
      dateOfDelivery: "",
      timeOfDelivery: "",
      placeOfDelivery: "",
      outcome: "",
      attendedBy: "",
      ttStatus: "",
      // ironSupplement: "",
      // vitASupplement: "",
      noOfPadPerDay: 0,
      // mebendazole: "",
      dateBfInitiated: "",
      timeBfInitiated: "",
      nextVisitDate: "",
      lochialDischarges: ""
    },
    postpartumTable: {
      date: new Date().toLocaleDateString("en-CA"),
      bp: {
        systolic: "",
        diastolic: ""
      },
      feeding: "",
      findings: "",
      nursesNotes: "",
    },
  }

  const form = useForm<z.infer<typeof PostPartumSchema>>({
    resolver: zodResolver(PostPartumSchema),
    defaultValues
  });

  const submitPage = () => {
    setCurrentPage((prev) => prev + 1)
  } 

  useEffect(() => {
    if(location.state?.params) {
      const { pregnancyData, pregnancyId } = location.state.params

      if (pregnancyData) {
        setIsFromIndividualRecord(true)
        setPreselectedPatient(pregnancyData)
        setPregnancyId(pregnancyId)
      } else {
        setIsFromIndividualRecord(false)
        setPreselectedPatient(null)
        setPregnancyId(null)
      }
    }
  }, [location.state])

  return (
    <div>
      <FormProvider {...form}>
        {currentPage === 1 && 
          <PostpartumFormFirstPg 
            form={form} 
            onSubmit={() => submitPage()} 
            isFromIndividualRecord={isFromIndividualRecord}
            preselectedPatient={preselectedPatient}
            pregnancyId={pregnancyId}
          />}
      </FormProvider>
    </div>
  );
}
