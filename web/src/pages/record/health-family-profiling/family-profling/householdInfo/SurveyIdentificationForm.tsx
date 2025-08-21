import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react"
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
import { useAuth } from "@/context/AuthContext"

interface SurveyIdentificationFormProps {
  initialData?: Partial<SurveyFormData>
  respondentInfo?: {
    rp_id: string
    personal_info: {
      per_fname: string
      per_lname: string
      per_mname?: string
    }
  }
  familyMembers?: any[] // Add family members for manual selection
}

export interface SurveyIdentificationFormHandle {
  getFormData: () => SurveyFormData
  isFormValid: () => boolean
}

const SurveyIdentificationForm = forwardRef<SurveyIdentificationFormHandle, SurveyIdentificationFormProps>(
  ({ initialData, respondentInfo, familyMembers }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const { user } = useAuth()

  // Debug logging
  useEffect(() => {
    console.log('SurveyIdentificationForm - User:', user);
    console.log('SurveyIdentificationForm - Staff:', user?.staff);
    console.log('SurveyIdentificationForm - Respondent Info:', respondentInfo);
    console.log('SurveyIdentificationForm - Family Members:', familyMembers);
  }, [user, respondentInfo, familyMembers])

  // Format staff display name
  const getStaffDisplayName = () => {
    if (!user?.staff) return ""
    
    // Try multiple possible data structures for staff
    const staff = user.staff
    
    // Pattern 1: staff.staff_fname and staff.staff_lname (direct)
    if (staff.staff_fname && staff.staff_lname) {
      return `${staff.staff_id} - ${staff.staff_fname} ${staff.staff_lname}`
    }
    
    // Pattern 2: staff.profile.personal.fname and staff.profile.personal.lname
    if (staff.profile?.personal?.fname && staff.profile?.personal?.lname) {
      return `${staff.staff_id || staff.id || ''} - ${staff.profile.personal.fname} ${staff.profile.personal.lname}`
    }
    
    // Pattern 3: staff.per_fname and staff.per_lname
    if (staff.per_fname && staff.per_lname) {
      return `${staff.staff_id || staff.id || ''} - ${staff.per_fname} ${staff.per_lname}`
    }
    
    // Pattern 4: staff.fname and staff.lname
    if (staff.fname && staff.lname) {
      return `${staff.staff_id || staff.id || ''} - ${staff.fname} ${staff.lname}`
    }
    
    // Fallback - return just the ID if available
    return staff.staff_id || staff.id || "Unknown Staff"
  }

  // Format respondent display name
  const getRespondentDisplayName = () => {
    if (!respondentInfo) return ""
    const { rp_id, personal_info } = respondentInfo
    const fullName = `${personal_info.per_fname} ${personal_info.per_lname}`
    return `${rp_id} - ${fullName}`
  }

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

  // Expose form data and validation to parent component
  useImperativeHandle(ref, () => ({
    getFormData: () => form.getValues(),
    isFormValid: () => form.formState.isValid
  }), [form])

  // Auto-populate staff and respondent information when component mounts or data changes
  useEffect(() => {
    // Auto-populate filled by with current staff
    const staffDisplayName = getStaffDisplayName()
    if (staffDisplayName && !form.getValues("filledBy")) {
      form.setValue("filledBy", staffDisplayName)
    }

    // Auto-populate informant with respondent info
    const respondentDisplayName = getRespondentDisplayName()
    if (respondentDisplayName && !form.getValues("informant")) {
      form.setValue("informant", respondentDisplayName)
    }
  }, [user, respondentInfo, form])

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

  // Get mouse/touch position relative to canvas
  const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.type.includes('touch')) {
      const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      const mouse = e as MouseEvent
      return {
        x: (mouse.clientX - rect.left) * scaleX,
        y: (mouse.clientY - rect.top) * scaleY,
      }
    }
  }

  // Start drawing
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const pos = getPos(e)
    setLastPos(pos)

    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  // Draw on canvas
  const draw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getPos(e)

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000000"

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setLastPos(pos)
  }

  // Stop drawing and save signature
  const endDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return

    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to base64 and save to form
    const dataURL = canvas.toDataURL("image/png")
    form.setValue("signature", dataURL, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  // Add event listeners to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e)
    const handleMouseMove = (e: MouseEvent) => draw(e)
    const handleMouseUp = (e: MouseEvent) => endDrawing(e)
    const handleMouseLeave = (e: MouseEvent) => endDrawing(e)

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e)
    const handleTouchMove = (e: TouchEvent) => draw(e)
    const handleTouchEnd = (e: TouchEvent) => endDrawing(e)

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchmove", handleTouchMove)
    canvas.addEventListener("touchend", handleTouchEnd)

    // Cleanup function
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)

      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDrawing, lastPos])

  // Signature pad functions (startDrawing, draw, endDrawing) remain the same

  return (
    <div className="w-full mx-auto px-8 py-6">
      <h1 className="text-xl font-semibold text-left mb-4 text-black">V. Survey Identification</h1>
      <Separator className="mb-6" />

      <Form {...form}>
        <form className="space-y-6">
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
})

SurveyIdentificationForm.displayName = "SurveyIdentificationForm"

export default SurveyIdentificationForm

