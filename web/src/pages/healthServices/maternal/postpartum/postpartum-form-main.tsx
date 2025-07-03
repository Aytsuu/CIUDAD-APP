"use client"

import type { z } from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"
import PostpartumFormFirstPg from "./postpartum-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"

export default function PostpartumForm() {
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
        province: "",
      },
    },
    postpartumInfo: {
      dateOfDelivery: "",
      timeOfDelivery: "",
      placeOfDelivery: "",
      outcome: "",
      attendedBy: "",
      ttStatus: "",
      ironSupplement: "",
      vitASupplement: "",
      noOfPadPerDay: "",
      mebendazole: "",
      dateBfInitiated: "",
      timeBfInitiated: "",
      nextVisitDate: "",
      lochialDischarges: "",
    },
    postpartumTable: {
      date: new Date().toLocaleDateString("en-CA"),
      bp: {
        systolic: "",
        diastolic: "",
      },
      feeding: "",
      findings: "",
      nursesNotes: "",
    },
  }

  const [currentPage, setCurrentPage] = useState(1)

  const form = useForm<z.infer<typeof PostPartumSchema>>({
    resolver: zodResolver(PostPartumSchema),
    defaultValues,
  })

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1)
  }

  return (
    <div>
      <FormProvider {...form}>
        {currentPage === 1 && <PostpartumFormFirstPg form={form} onSubmit={() => nextPage()} />}
      </FormProvider>
    </div>
  )
}