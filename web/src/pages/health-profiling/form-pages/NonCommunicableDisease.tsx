"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { Separator } from "@/components/ui/separator"
import { nonCommunicableDiseaseFormSchema } from "@/form-schema/family-profiling-schema"
import type { NonCommunicableDiseaseFormData, NCDRecord, TBRecord } from "@/form-schema/health-data-types"

interface NonCommunicableDiseaseFormProps {
  onSubmit: (data: NonCommunicableDiseaseFormData) => void
  initialData?: Partial<NonCommunicableDiseaseFormData>
}

export default function NonCommunicableDiseaseForm({ onSubmit, initialData }: NonCommunicableDiseaseFormProps) {
  const [ncdRecords, setNcdRecords] = useState<NCDRecord[]>(initialData?.records || [])
  const [tbRecords, setTbRecords] = useState<TBRecord[]>(initialData?.tbRecords || [])

  const form = useForm<NonCommunicableDiseaseFormData>({
    resolver: zodResolver(nonCommunicableDiseaseFormSchema),
    defaultValues: initialData || {
      records: [],
      tbRecords: [],
    },
  })

  const ncdForm = useForm<NCDRecord>({
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      age: "",
      gender: "",
      riskClass: "",
      comorbidities: "",
      lifestyleRisk: "",
      maintenance: "",
    },
  })

  const tbForm = useForm<TBRecord>({
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      age: "",
      gender: "",
      tbSource: "",
      tbDays: "",
      tbStatus: "",
    },
  })

  const handleNcdSubmit = (data: NCDRecord) => {
    setNcdRecords((prev) => [...prev, data])
    form.setValue("records", [...ncdRecords, data])
    ncdForm.reset()
  }

  const handleTbSubmit = (data: TBRecord) => {
    setTbRecords((prev) => [...prev, data])
    form.setValue("tbRecords", [...tbRecords, data])
    tbForm.reset()
  }

  const handleFormSubmit = (data: NonCommunicableDiseaseFormData) => {
    onSubmit({
      ...data,
      records: ncdRecords,
      tbRecords: tbRecords,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full mx-auto px-8 py-6">
        <h1 className="text-xl font-semibold text-left mb-4 text-black">IV. Non-Communicable Disease</h1>
        <Separator className="mb-6" />

        <div className="space-y-8">
          {/* Legends with improved visual design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-md p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-medium mb-3">Co-morbidities/ Sakit/ Balation</h3>
              <div className="space-y-2">
                {[
                  { code: "HPN", desc: "Hypertension (Highblood)" },
                  { code: "DM", desc: "Diabetes (Dyabetis)" },
                  { code: "BA", desc: "Bronchial Asthma (Hubak)" },
                  { code: "DL", desc: "Dyslipidemia (Problema sa kolesterol)" },
                ].map((item) => (
                  <div key={item.code} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-12 shrink-0">
                      {item.code}
                    </Badge>
                    <span className="text-sm">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-medium mb-3">Additional Conditions</h3>
              <div className="space-y-2">
                {[
                  { code: "CKD", desc: "Chronic Kidney Disease (Naka Dialysis)" },
                  { code: "CA", desc: "Cancer" },
                  { code: "MH", desc: "Mental Health Illness" },
                ].map((item) => (
                  <div key={item.code} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-12 shrink-0">
                      {item.code}
                    </Badge>
                    <span className="text-sm">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-medium mb-3">Lifestyle Health Risk</h3>
              <div className="space-y-1.5">
                {["Smoker", "Alcoholic beverage drinking", "Others"].map((risk) => (
                  <div key={risk} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NCD Form */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Patient Information</h2>

            <div className="border rounded-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={ncdForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={ncdForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (M/F)</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="riskClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Class by Age/Group</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N">N - Newborn (0-28 days)</SelectItem>
                            <SelectItem value="I">I - Infant (29 days - 11 months)</SelectItem>
                            <SelectItem value="U">U - Under five (1-4 y/o)</SelectItem>
                            <SelectItem value="S">S - School-aged (5-9 y/o)</SelectItem>
                            <SelectItem value="A">A - Adolescent (10-19 y/o)</SelectItem>
                            <SelectItem value="AB">AB - Adult (20 to 59 y/o)</SelectItem>
                            <SelectItem value="SC">SC - Senior Citizen (60+ y/o)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={ncdForm.control}
                  name="comorbidities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comorbidities/ Sakit Balation</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HPN">HPN - Hypertension</SelectItem>
                            <SelectItem value="DM">DM - Diabetes</SelectItem>
                            <SelectItem value="BA">BA - Bronchial Asthma</SelectItem>
                            <SelectItem value="DL">DL - Dyslipidemia</SelectItem>
                            <SelectItem value="CKD">CKD - Chronic Kidney Disease</SelectItem>
                            <SelectItem value="CA">CA - Cancer</SelectItem>
                            <SelectItem value="MH">MH - Mental Health Illness</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="lifestyleRisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lifestyle Risk</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smoker">Smoker</SelectItem>
                            <SelectItem value="alcohol">Alcoholic beverage drinking</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ncdForm.control}
                  name="maintenance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naka Maintenance?</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="button" onClick={ncdForm.handleSubmit(handleNcdSubmit)}>
                  Add NCD Record
                </Button>
              </div>
            </div>
          </div>

          {/* NCD Records Table with improved styling */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">NCD Records</h2>
            <div className="border rounded-md overflow-hidden">
              {ncdRecords.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <DataTable
                    columns={[
                      { accessorKey: "lastName", header: "Last Name (Apelyido)" },
                      { accessorKey: "firstName", header: "First Name (Pangalan)" },
                      { accessorKey: "middleName", header: "Middle Name (Gitnang Pangalan)" },
                      { accessorKey: "age", header: "Age (Edad)" },
                      { accessorKey: "gender", header: "Gender (Kasarian)" },
                      { accessorKey: "riskClass", header: "Risk Class by Age/Group" },
                      { accessorKey: "comorbidities", header: "Comorbidities/ Sakit Balation" },
                      { accessorKey: "lifestyleRisk", header: "Lifestyle Risk" },
                      { accessorKey: "maintenance", header: "Naka Maintenance?" },
                    ]}
                    data={ncdRecords}
                  />
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted/50 p-3 mb-3">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No records yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">Add a patient record to see it here.</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Health Risk Classification with improved design */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Health Risk Classification by Age/Group</h2>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  [
                    { code: "N", desc: "Newborn (0-28 days)" },
                    { code: "U", desc: "Under five (1-4 y/o)" },
                    { code: "AB", desc: "Adult (20 to 59 y/o)" },
                  ],
                  [
                    { code: "I", desc: "Infant (29 days - 11 months)" },
                    { code: "S", desc: "School-aged (5-9 y/o)" },
                    { code: "SC", desc: "Senior Citizen (60+ y/o)" },
                  ],
                  [
                    { code: "A", desc: "Adolescent (10-19 y/o)" },
                    { code: "WRA", desc: "15 to 49 y/o" },
                    { code: "PWD", desc: "Person with Disability" },
                  ],
                  [
                    { code: "AP", desc: "Adolescent-Pregnant" },
                    { code: "P", desc: "Pregnant" },
                    { code: "PP", desc: "Post Partum" },
                  ],
                ].map((group, index) => (
                  <div key={index} className="space-y-2">
                    {group.map((item) => (
                      <div key={item.code} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-12 shrink-0">
                          {item.code}
                        </Badge>
                        <span className="text-sm">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* TB Surveillance Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Tuberculosis Surveillance</h2>

            <div className="border rounded-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={tbForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tbForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tbForm.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={tbForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tbForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (M/F)</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tbForm.control}
                  name="tbSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source of Anti-TB Meds</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gov">Government</SelectItem>
                            <SelectItem value="ngo">NGO</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={tbForm.control}
                  name="tbDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel># of Days Taking Meds</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tbForm.control}
                  name="tbStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TB Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cured">Cured</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="ltfu">Lost to follow-up</SelectItem>
                            <SelectItem value="death">Death</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="button" onClick={tbForm.handleSubmit(handleTbSubmit)}>
                  Add TB Record
                </Button>
              </div>
            </div>

            {/* TB Records Table */}
            <div className="space-y-4 mt-6">
              <h3 className="text-md font-medium">TB Records</h3>
              <div className="border rounded-md overflow-hidden">
                {tbRecords.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <DataTable
                      columns={[
                        { accessorKey: "lastName", header: "Last Name" },
                        { accessorKey: "firstName", header: "First Name" },
                        { accessorKey: "middleName", header: "Middle Name" },
                        { accessorKey: "age", header: "Age" },
                        { accessorKey: "gender", header: "Gender" },
                        { accessorKey: "tbSource", header: "Source of Anti-TB Meds" },
                        { accessorKey: "tbDays", header: "# of Days Taking Meds" },
                        { accessorKey: "tbStatus", header: "TB Status" },
                      ]}
                      data={tbRecords}
                    />
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-muted/50 p-3 mb-3">
                      <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">No TB records yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add a TB record to see it here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
