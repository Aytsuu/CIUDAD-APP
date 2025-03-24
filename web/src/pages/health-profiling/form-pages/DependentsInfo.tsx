"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form"
import { Separator } from "@/components/ui/separator"
import type { ColumnDef } from "@tanstack/react-table"

import type { DependentData, DependentsFormData } from "@/form-schema/health-data-types"
import { dependentsFormSchema } from "@/form-schema/health-schema"

interface DependentsFormProps {
  onSubmit: (data: DependentsFormData) => void
  initialData?: Partial<DependentsFormData>
}

export default function DependentsForm({ onSubmit, initialData }: DependentsFormProps) {
  const [underFiveData, setUnderFiveData] = useState<DependentData[]>(initialData?.underFiveData || [])
  const [overFiveData, setOverFiveData] = useState<DependentData[]>(initialData?.overFiveData || [])

  const form = useForm<DependentsFormData>({
    resolver: zodResolver(dependentsFormSchema),
    defaultValues: {
      underFiveData: initialData?.underFiveData || [],
      overFiveData: initialData?.overFiveData || [],
    },
  })

  // Define columns for under five data table
  const underFiveColumns: ColumnDef<DependentData>[] = [
    {
      accessorFn: (row: DependentData) => `${row.lastName}, ${row.firstName} ${row.middleName}`,
      id: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name (Pangalan)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gender (Kasarian)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "age",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Age (Edad)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "birthday",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date of Birth
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "relationshipToHead",
      header: "Relationship to Family Head",
    },
    {
      accessorKey: "fic",
      header: "FIC",
    },
    {
      accessorKey: "nutritionalStatus",
      header: "Nutritional Status",
    },
    {
      accessorKey: "exclusiveBf",
      header: "Exclusive BF",
    },
  ]

  // Define columns for over five data table
  const overFiveColumns: ColumnDef<DependentData>[] = [
    {
      accessorFn: (row: DependentData) => `${row.lastName}, ${row.firstName} ${row.middleName}`,
      id: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name (Pangalan)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gender (Kasarian)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "age",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Age (Edad)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "birthday",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date of Birth
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "relationshipToHead",
      header: "Relationship to Family Head",
    },
    {
      accessorKey: "bloodType",
      header: "Blood Type",
    },
    {
      accessorKey: "covidStatus",
      header: "COVID-19 Vax Status",
    },
    {
      accessorKey: "philhealthId",
      header: "Philhealth I.D No.",
    },
  ]

  const underFiveForm = useForm<DependentData>({
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      gender: "",
      age: "",
      birthday: "",
      relationshipToHead: "",
      fic: "",
      nutritionalStatus: "",
      exclusiveBf: "",
    },
  })

  const overFiveForm = useForm<DependentData>({
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      gender: "",
      age: "",
      birthday: "",
      relationshipToHead: "",
      bloodType: "",
      covidStatus: "",
      philhealthId: "",
    },
  })

  const handleUnderFiveSubmit = (data: DependentData) => {
    const newData = { ...data, nutritionalStatus: data.nutritionalStatus || "" }
    setUnderFiveData((prev) => [...prev, newData])
    form.setValue("underFiveData", [...underFiveData, newData])
    underFiveForm.reset()
  }

  const handleOverFiveSubmit = (data: DependentData) => {
    const newData = { ...data, nutritionalStatus: data.nutritionalStatus || "" }
    setOverFiveData((prev) => [...prev, newData])
    form.setValue("overFiveData", [...overFiveData, newData])
    overFiveForm.reset()
  }

  const handleMainFormSubmit = () => {
    const formData: DependentsFormData = {
      underFiveData,
      overFiveData,
    }
    onSubmit(formData)
  }

  return (
    <div className="w-full mx-auto px-8 py-6">
      <h1 className="text-xl font-semibold text-left mb-4 text-black">II. Dependents Information</h1>
      <Separator className="mb-6" />
      <Form {...form}>
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-m font-semibold">MGA BATA'NG 0-59 KA BULAN (Under Five Years Old)</h2>
            <FormProvider {...underFiveForm}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={underFiveForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input id="lastName" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input id="firstName" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input id="middleName" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input id="age" type="number" max="5" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthday</FormLabel>
                        <FormControl>
                          <Input id="birthday" type="date" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="relationshipToHead"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Household Head</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Grandchild">Grandchild</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="fic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FIC</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="nutritionalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nutritional Status</FormLabel>
                        <FormControl>
                          <Input id="nutritionalStatus" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={underFiveForm.control}
                    name="exclusiveBf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exclusive Breastfeeding</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={underFiveForm.handleSubmit(handleUnderFiveSubmit)}>
                    Add Record
                  </Button>
                </div>
              </div>
            </FormProvider>
            <div className="mt-6">
              <DataTable columns={underFiveColumns} data={underFiveData} />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-m font-semibold">MGA BATA/ANAK NGA 5 KA TUIG PATAAS (Five Years Old and Above)</h2>
            <FormProvider {...overFiveForm}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={overFiveForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input id="lastName" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input id="firstName" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input id="middleName" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input id="age" type="number" min="6" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthday</FormLabel>
                        <FormControl>
                          <Input id="birthday" type="date" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="relationshipToHead"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Household Head</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Grandchild">Grandchild</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <FormControl>
                          <Input id="bloodType" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="covidStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>COVID-19 Vax Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1st Dose">1st Dose</SelectItem>
                            <SelectItem value="2nd Dose">2nd Dose</SelectItem>
                            <SelectItem value="Booster">Booster Shot</SelectItem>
                            <SelectItem value="Fully Vaccinated">Fully Vaccinated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={overFiveForm.control}
                    name="philhealthId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Philhealth I.D No.</FormLabel>
                        <FormControl>
                          <Input id="philhealthId" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={overFiveForm.handleSubmit(handleOverFiveSubmit)}>
                    Add Record
                  </Button>
                </div>
              </div>
            </FormProvider>

            <div className="mt-6">
              <DataTable columns={overFiveColumns} data={overFiveData} />
            </div>
          </div>
        </div>
      </Form>
    </div>
  )
}

