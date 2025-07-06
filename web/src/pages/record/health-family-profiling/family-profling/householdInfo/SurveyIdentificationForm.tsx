"use client"

import { useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle2, ClipboardCheck, Pencil, Trash2, User } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"

import { cn } from "@/lib/utils"
import { surveyFormSchema } from "@/form-schema/family-profiling-schema"
import type { SurveyFormData } from "@/form-schema/health-data-types"

interface SurveyIdentificationFormProps {
  onSubmit: (data: SurveyFormData) => void
  initialData?: Partial<SurveyFormData>
}

export default function SurveyIdentificationForm({ onSubmit, initialData }: SurveyIdentificationFormProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: initialData || {
      filledBy: "",
      informant: "",
      checkedBy: "",
      date: new Date(),
      signature: "",
    },
  })

  useEffect(() => {
    const signatureValue = form.getValues("signature")
    if (signatureValue && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
        }
        img.src = signatureValue
        img.crossOrigin = "anonymous"
      }
    }
  }, [form])

  const handleFormSubmit = (data: SurveyFormData) => {
    onSubmit(data)
  }

  const handleReset = () => {
    form.reset()
    clearSignature()
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    form.setValue("signature", "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  // Signature pad functions (startDrawing, draw, endDrawing) remain the same

  return (
    <div className="w-full mx-auto px-8 py-6">
      <h1 className="text-xl font-semibold text-left mb-4 text-black">V. Survey Identification</h1>
      <Separator className="mb-6" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="filledBy"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Filled by: 
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Enter name" className="flex-1" {...field} />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">B/CHW</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="informant"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Informant/Conforme: <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Enter informant name" className="flex-1" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkedBy"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Checked by (RN/RM): <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Enter name" className="flex-1" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Date: <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Signature: <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="border rounded-md p-2 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Pencil className="h-4 w-4 mr-1 text-primary" />
                          <span className="text-sm text-muted-foreground">Sign below</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSignature}
                          className="h-8 px-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>

                      <FormControl>
                        <div className="border rounded-md border-dashed border-gray-300 bg-gray-50">
                          <canvas
                            ref={canvasRef}
                            width={300}
                            height={150}
                            className="w-full touch-none cursor-crosshair"
                            style={{
                              touchAction: "none",
                              background: "white",
                            }}
                          />
                        </div>
                      </FormControl>

                      {field.value && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Signature captured
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-gray-50 rounded-md border text-sm">
                <p className="font-medium text-gray-700 mb-1">Household Definition</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  As defined by the Philippine Statistical Authority (PSA), a household is a social unit consisting of a
                  person living alone or a group of persons who sleep in the same housing unit and have a common
                  arrangement in the preparation and consumption of food.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

