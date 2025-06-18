"use client"

<<<<<<< HEAD
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form/form"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

import type { EnvironmentalFormData } from "@/form-schema/health-data-types"
import { environmentalFormSchema } from "@/form-schema/family-profiling-schema"

interface EnvironmentalFormProps {
  onSubmit: (data: EnvironmentalFormData) => void
  initialData?: Partial<EnvironmentalFormData>
}

export default function EnvironmentalForm({ onSubmit, initialData }: EnvironmentalFormProps) {
  const form = useForm<EnvironmentalFormData>({
    resolver: zodResolver(environmentalFormSchema),
    defaultValues: {
      waterSupply: initialData?.waterSupply || "",
      sanitaryFacilities: initialData?.sanitaryFacilities || [],
      toiletSharing: initialData?.toiletSharing || "",
      wasteManagement: initialData?.wasteManagement || [],
      otherWasteMethod: initialData?.otherWasteMethod || "",
    },
  })

  const handleSubmit = (data: EnvironmentalFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form id="form-step-3" onSubmit={form.handleSubmit(handleSubmit)} className="w-full mx-auto px-8 py-6">
        <h1 className="text-xl font-semibold text-left mb-4 text-black">III. Environmental Health and Sanitation</h1>
        <Separator className="mb-6" />

        <div className="space-y-10">
          {/* Water Supply Section */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">A. Type of Water Supply</h2>
            <FormField
              control={form.control}
              name="waterSupply"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {[
                        {
                          value: "level1",
                          title: "LEVEL I",
                          subtitle: "POINT SOURCE",
                          description:
                            "Developed/protected/improved spring or dug well without distribution/piping system supplying within 250 meter radius (e.g. below, puso, or spring)",
                        },
                        {
                          value: "level2",
                          title: "LEVEL II",
                          subtitle: "COMMUNAL (COMMON) FAUCET OR STAND POST",
                          description:
                            "HH using point source with distribution system to a communal (common) faucet or standpoint supplying within 25 meters radius",
                        },
                        {
                          value: "level3",
                          title: "LEVEL III",
                          subtitle: "INDIVIDUAL CONNECTION",
                          description:
                            "HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner's Assoc./ Subdivision)",
                        },
                      ].map((level) => (
                        <div
                          key={level.value}
                          className={cn(
                            "p-4 border rounded-md transition-all duration-200 cursor-pointer hover:shadow-md",
                            field.value === level.value && "border-primary bg-primary/5",
                          )}
                          onClick={() => form.setValue("waterSupply", level.value)}
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                            <div className="space-y-1.5">
                              <Label htmlFor={level.value} className="font-semibold">
                                {level.title}
                                <br />
                                {level.subtitle}
                              </Label>
                              <p className="text-sm text-muted-foreground leading-relaxed">{level.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Separator />

          {/* Sanitary Facility Section */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">B. Type of Sanitary Facility</h2>
            <FormField
              control={form.control}
              name="sanitaryFacilities"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border rounded-md p-4">
                      <Label className="text-lg font-semibold">SANITARY</Label>
                      <div className="space-y-4 pl-2">
                        {[
                          "Pour/flush type with septic tank",
                          "Pour/flush toilet connected to septic tank AND to sewerage",
                          "Ventilated Pit (VIP) Latrine",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                id={`sanitary${index}`}
                                checked={field.value?.includes(`sanitary${index}`) || false}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), `sanitary${index}`]
                                    : (field.value || []).filter((i) => i !== `sanitary${index}`)
                                  form.setValue("sanitaryFacilities", updatedValue)
                                }}
                              />
                            </FormControl>
                            <Label htmlFor={`sanitary${index}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4">
                      <Label className="text-lg font-semibold">UNSANITARY</Label>
                      <div className="space-y-4 pl-2">
                        {[
                          "Water-sealed toilet without septic tank",
                          "Overhung latrine",
                          "Open Pit Latrine",
                          "Without toilet",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                id={`unsanitary${index}`}
                                checked={field.value?.includes(`unsanitary${index}`) || false}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), `unsanitary${index}`]
                                    : (field.value || []).filter((i) => i !== `unsanitary${index}`)
                                  form.setValue("sanitaryFacilities", updatedValue)
                                }}
                              />
                            </FormControl>
                            <Label htmlFor={`unsanitary${index}`} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toiletSharing"
              render={({ field }) => (
                <FormItem>
                  <div className="p-4 bg-muted/30 rounded-md">
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="font-medium">Is Toilet</span>
                      <div className="flex items-center space-x-3 hover:bg-background p-2 rounded-lg transition-colors">
                        <FormControl>
                          <Checkbox
                            id="not-shared"
                            checked={field.value === "not-shared"}
                            onCheckedChange={(checked) => {
                              if (checked) form.setValue("toiletSharing", "not-shared")
                            }}
                          />
                        </FormControl>
                        <Label htmlFor="not-shared">NOT SHARED with Other Household or</Label>
                      </div>
                      <div className="flex items-center space-x-3 hover:bg-background p-2 rounded-lg transition-colors">
                        <FormControl>
                          <Checkbox
                            id="shared"
                            checked={field.value === "shared"}
                            onCheckedChange={(checked) => {
                              if (checked) form.setValue("toiletSharing", "shared")
                            }}
                          />
                        </FormControl>
                        <Label htmlFor="shared">SHARED with Other Household</Label>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Separator />

          {/* Solid Waste Management Section */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">C. Solid Waste Management</h2>
            <FormField
              control={form.control}
              name="wasteManagement"
              render={({ field }) => (
                <FormItem>
                  <div className="border rounded-md p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        "Waste Segregation",
                        "Recycling/Reuse",
                        "Burning/Burying",
                        "Backyard Composting",
                        "Collected by City Collection and Disposal System",
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        >
                          <FormControl>
                            <Checkbox
                              id={`waste${index}`}
                              checked={field.value?.includes(`waste${index}`) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                const updatedValue = checked
                                  ? [...currentValue, `waste${index}`]
                                  : currentValue.filter((i) => i !== `waste${index}`)
                                form.setValue("wasteManagement", updatedValue)
                              }}
                            />
                          </FormControl>
                          <Label htmlFor={`waste${index}`} className="text-sm">
                            {item}
                          </Label>
                        </div>
                      ))}
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              id="others"
                              checked={field.value?.includes("others") || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                const updatedValue = checked
                                  ? [...currentValue, "others"]
                                  : currentValue.filter((i) => i !== "others")
                                form.setValue("wasteManagement", updatedValue)
                              }}
                            />
                          </FormControl>
                          <Label htmlFor="others">Others (pls. specify):</Label>
                        </div>
                        <FormField
                          control={form.control}
                          name="otherWasteMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Specify other waste management method"
                                  {...field}
                                  className="max-w-md"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        </div>
      </form>
    </Form>
  )
}

=======
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
import { dependentsFormSchema } from "@/form-schema/family-profiling-schema"

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
>>>>>>> frontend/feature/maternal-services
