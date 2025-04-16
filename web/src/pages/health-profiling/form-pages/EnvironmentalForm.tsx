"use client"

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

