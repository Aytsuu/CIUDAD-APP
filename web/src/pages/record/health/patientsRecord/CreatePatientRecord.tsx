"use client"

import React, { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Save } from 'lucide-react'
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card/card"
import { toast } from "@/hooks/use-toast"

function CreatePatientRecord() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    gender: "",
    contactNumber: "",
    address: "",
    dateOfBirth: null as Date | null,
  })

  // Form validation state
  const [errors, setErrors] = useState({
    lastName: "",
    firstName: "",
    gender: "",
    contactNumber: "",
    dateOfBirth: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ""
      })
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ""
      })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData({
      ...formData,
      dateOfBirth: date || null
    })
    
    // Clear error when user selects date
    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: ""
      })
    }
  }

  const validateForm = () => {
    const newErrors = {
      lastName: formData.lastName ? "" : "Last name is required",
      firstName: formData.firstName ? "" : "First name is required",
      gender: formData.gender ? "" : "Gender is required",
      contactNumber: formData.contactNumber ? 
        /^\d{10,11}$/.test(formData.contactNumber) ? "" : "Invalid contact number" 
        : "Contact number is required",
      dateOfBirth: formData.dateOfBirth ? "" : "Date of birth is required",
    }
    
    setErrors(newErrors)
    
    // Return true if no errors (all values are empty strings)
    return Object.values(newErrors).every(error => error === "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Here you would normally send the data to your API
      // For demonstration, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Patient record has been created successfully",
      })
      
      // Navigate back to the patients list
      navigate("/patientsRecord")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient record. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Header - Stacks vertically on mobile */}
          <Button 
            className="bg-white text-black p-2 self-start"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Patients Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Create Patient Record
            </p>
          </div>  
        </div>
      </div>
      <Separator className="bg-gray mb-6 sm:mb-8" />
      
      <Card className="w-full mx-auto border-none">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>
              
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}
              </div>
              
              {/* Middle Name */}
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm font-medium">
                  Middle Name
                </Label>
                <Input
                  id="middleName"
                  name="middleName"
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleSelectChange(value, "gender")}
                >
                  <SelectTrigger id="gender" className={cn(errors.gender && "border-red-500")}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-xs">{errors.gender}</p>
                )}
              </div>
              
              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-sm font-medium">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={cn(errors.contactNumber && "border-red-500")}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs">{errors.contactNumber}</p>
                )}
              </div>
              
              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input type='date'>
                </Input>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
            
            {/* Address - Full width */}
            <div className="space-y-2 ">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
            
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-buttonBlue hover:bg-buttonBlue/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Record
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreatePatientRecord
