"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, CheckCircle2, Clock, AlertCircle, Calendar, ImageIcon } from "lucide-react"

// Types
export interface LabImage {
  file: File
  preview: string
  name: string
  type: string
  size: number
  url: string
}

export interface LabResultData {
  checked: boolean
  date: string
  toBeFollowed: boolean
  remarks?: string
  images: LabImage[]
  // Backward compatibility fields
  imageFile?: File | null
  imagePreview?: string
}

export interface LabResults {
  urinalysis: LabResultData
  cbc: LabResultData
  sgotSgpt: LabResultData
  creatinineSerum: LabResultData
  buaBun: LabResultData
  syphilis: LabResultData
  hivTest: LabResultData
  hepaB: LabResultData
  bloodTyping: LabResultData
  ogct50: LabResultData
  ogct100: LabResultData
  [key: string]: LabResultData
}

interface LaboratoryResultsProps {
  labResults: LabResults
  onLabResultsChange: (labResults: LabResults) => void
  errors?: Record<string, string>
}

// Lab display names with descriptions
const LAB_DISPLAY_NAMES = {
  urinalysis: {
    name: "Urinalysis",
    description: "Urine test to check for infections, kidney function, and other conditions",
  },
  cbc: {
    name: "Complete Blood Count (CBC)",
    description: "Blood test to evaluate overall health and detect various disorders",
  },
  sgotSgpt: {
    name: "SGOT/SGPT (Liver Function Test)",
    description: "Blood test to assess liver health and function",
  },
  creatinineSerum: {
    name: "Creatinine Serum",
    description: "Blood test to measure kidney function",
  },
  buaBun: {
    name: "BUA/BUN (Blood Urea Acid/Blood Urea Nitrogen)",
    description: "Blood test to assess kidney function and metabolism",
  },
  syphilis: {
    name: "Syphilis Test",
    description: "Blood test to screen for syphilis infection",
  },
  hivTest: {
    name: "HIV Test",
    description: "Blood test to screen for HIV infection",
  },
  hepaB: {
    name: "Hepatitis B",
    description: "Blood test to screen for Hepatitis B infection",
  },
  bloodTyping: {
    name: "Blood Typing",
    description: "Blood test to determine ABO and Rh blood type",
  },
  ogct50: {
    name: "OGCT 50g (Oral Glucose Challenge Test)",
    description: "Initial glucose screening test for gestational diabetes",
  },
  ogct100: {
    name: "OGCT 100g (Oral Glucose Tolerance Test)",
    description: "Comprehensive glucose tolerance test for gestational diabetes",
  },
} as const

// Image Upload Component
const ImageUploadSection = ({
  labName,
  labData,
  onImageUpload,
  onImageRemove,
}: {
  labName: string
  labData: LabResultData
  onImageUpload: (labName: string, files: File[]) => void
  onImageRemove: (labName: string, index: number) => void
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
        if (files.length > 0) {
          onImageUpload(labName, files)
        }
      }
    },
    [labName, onImageUpload],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))
        if (files.length > 0) {
          onImageUpload(labName, files)
        }
      }
      // Reset the input to allow selecting the same file again
      e.target.value = ""
    },
    [labName, onImageUpload],
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleRemoveImage = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      onImageRemove(labName, index)
    },
    [labName, onImageRemove],
  )

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center space-x-1">
        <Upload size={14} />
        <span>Upload Lab Result Images</span>
        {labData.images.length > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            ({labData.images.length} {labData.images.length === 1 ? "image" : "images"} uploaded)
          </span>
        )}
      </Label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload size={40} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Drag and drop your lab result images here, or click to browse</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id={`file-input-${labName}`}
              multiple
            />
            <label
              htmlFor={`file-input-${labName}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload size={16} className="mr-2" />
              Choose Images
            </label>
          </div>
          <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP (Max 10MB per image)</p>
        </div>
      </div>

      {/* Uploaded Images Grid - Made more compact */}
      {labData.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
          {labData.images.map((image, index) => (
            <div
              key={index}
              className="relative group border rounded-md overflow-hidden bg-gray-50 hover:shadow-sm transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden h-16">
                <img
                  src={image.preview || "/placeholder.svg"}
                  alt={`Lab result ${index + 1}`}
                  className="w-full h-full object-contain cursor-pointer p-1"
                  onClick={() => setShowPreview(image.preview)}
                />
              </div>
              <div className="p-1">
                <p className="text-[10px] font-medium truncate">{image.name}</p>
                <p className="text-[9px] text-gray-500">{formatFileSize(image.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemoveImage(e, index)}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X size={12} className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowPreview(null)
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <img
              src={showPreview || "/placeholder.svg"}
              alt="Lab result preview"
              className="w-full h-auto max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Lab Result Item Component
const LabResultItem = ({
  labName,
  displayInfo,
  labData,
  onLabCheckbox,
  onLabDate,
  onLabRemarks,
  onToBeFollowed,
  onImageUpload,
  onImageRemove,
  error,
}: {
  labName: string
  displayInfo: { name: string; description: string }
  labData: LabResultData
  onLabCheckbox: (labName: string, checked: boolean) => void
  onLabDate: (labName: string, date: string) => void
  onLabRemarks: (labName: string, remarks: string) => void
  onToBeFollowed: (labName: string, toBeFollowed: boolean) => void
  onImageUpload: (labName: string, files: File[]) => void
  onImageRemove: (labName: string, index: number) => void
  error?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(labData.checked)

  React.useEffect(() => {
    setIsExpanded(labData.checked)
  }, [labData.checked])

  const isComplete = labData.checked && !labData.toBeFollowed && labData.date
  const isPending = labData.checked && labData.toBeFollowed
  const isIncomplete = labData.checked && !labData.toBeFollowed && !labData.date

  return (
    <div
      className={`space-y-4 border rounded-lg p-4 transition-all duration-200 ${
        labData.checked ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"
      } ${error ? "border-red-300 bg-red-50/30" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex items-center space-x-2 flex-1">
          <Checkbox
            checked={labData.checked}
            onCheckedChange={(checked) => onLabCheckbox(labName, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label className="font-medium text-sm cursor-pointer">{displayInfo.name}</Label>
            <p className="text-xs text-gray-600 mt-1">{displayInfo.description}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          {labData.images.length > 0 && (
            <div className="flex items-center space-x-1 text-blue-600">
              <ImageIcon size={14} />
              <span className="text-xs">
                {labData.images.length} {labData.images.length === 1 ? "image" : "images"}
              </span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle2 size={16} />
              <span className="text-xs font-medium">Complete</span>
            </div>
          )}
          {isPending && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Clock size={16} />
              <span className="text-xs font-medium">Pending</span>
            </div>
          )}
          {isIncomplete && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle size={16} />
              <span className="text-xs font-medium">Incomplete</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {isExpanded && (
        <div className="ml-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={labData.toBeFollowed}
              onCheckedChange={(checked) => onToBeFollowed(labName, checked as boolean)}
            />
            <Label className="text-sm text-orange-600 font-medium">To be followed</Label>
          </div>

          {!labData.toBeFollowed && (
            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Date Taken</span>
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  type="date"
                  value={labData.date}
                  onChange={(e) => onLabDate(labName, e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    !labData.date ? "border-red-300 bg-red-50/30" : "border-gray-300"
                  }`}
                />
                {!labData.date && <p className="text-xs text-red-600 mt-1">Date is required when test is completed</p>}
              </div>

              {/* Image Upload Section */}
              <ImageUploadSection
                labName={labName}
                labData={labData}
                onImageUpload={onImageUpload}
                onImageRemove={onImageRemove}
              />

              {/* Remarks Input */}
              <div>
                <Label className="text-sm font-medium">Remarks (Optional)</Label>
                <textarea
                  value={labData.remarks || ""}
                  onChange={(e) => onLabRemarks(labName, e.target.value)}
                  placeholder="Add any additional notes, results, or remarks..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] transition-colors"
                />
              </div>
            </div>
          )}

          {labData.toBeFollowed && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-orange-500" />
                <span className="font-medium">To be followed</span>
              </div>
              <p className="mt-1 text-orange-700">
                This laboratory test result will be uploaded after the patient has completed the procedure.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main Laboratory Results Component
export default function LaboratoryResults({ labResults, onLabResultsChange, errors = {} }: LaboratoryResultsProps) {
  // Cleanup function to revoke object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      Object.values(labResults).forEach((labData) => {
        if (labData.images) {
          labData.images.forEach((image) => {
            if (image.preview) {
              URL.revokeObjectURL(image.preview)
            }
          })
        }
      })
    }
  }, [labResults])

  // Use useCallback to prevent unnecessary re-renders
  const handleLabCheckbox = useCallback(
    (labName: string, checked: boolean) => {
      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          checked,
          // Reset other fields when unchecked
          ...(checked
            ? {}
            : {
                date: "",
                remarks: "",
                toBeFollowed: false,
                images: [],
                imageFile: null,
                imagePreview: undefined,
              }),
        },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const handleLabDate = useCallback(
    (labName: string, date: string) => {
      const updatedResults = {
        ...labResults,
        [labName]: { ...labResults[labName], date },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const handleLabRemarks = useCallback(
    (labName: string, remarks: string) => {
      const updatedResults = {
        ...labResults,
        [labName]: { ...labResults[labName], remarks },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const handleToBeFollowed = useCallback(
    (labName: string, toBeFollowed: boolean) => {
      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          toBeFollowed,
          // Clear date, remarks, and image if "to be followed" is checked
          ...(toBeFollowed
            ? {
                date: "",
                remarks: "",
                imageFile: null,
                imagePreview: undefined,
              }
            : {}),
        },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const handleImageUpload = useCallback(
    (labName: string, files: File[]) => {
      const newImages = files.map((file) => ({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: URL.createObjectURL(file),
        url: "", 
      }))

      const existingImages = labResults[labName].images || []
      const allImages = [...existingImages, ...newImages]

      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          images: allImages,
          // Keep first image in legacy fields for backward compatibility
          imageFile: allImages.length > 0 ? allImages[0].file : null,
          imagePreview: allImages.length > 0 ? allImages[0].preview : undefined,
        },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const handleImageRemove = useCallback(
    (labName: string, index: number) => {
      const currentImages = [...(labResults[labName].images || [])]
      // Revoke the object URL to prevent memory leaks
      if (currentImages[index]?.preview) {
        URL.revokeObjectURL(currentImages[index].preview)
      }

      const updatedImages = currentImages.filter((_, i) => i !== index)

      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          images: updatedImages,
          // Update legacy fields with first image or null if no images left
          imageFile: updatedImages.length > 0 ? updatedImages[0].file : null,
          imagePreview: updatedImages.length > 0 ? updatedImages[0].preview : undefined,
        },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  // Memoized calculations
  const statistics = useMemo(() => {
    const selectedLabs = Object.entries(labResults).filter(([_, lab]) => lab.checked)
    const completedLabs = selectedLabs.filter(([_, lab]) => !lab.toBeFollowed && lab.date).length
    const pendingLabs = selectedLabs.filter(([_, lab]) => lab.toBeFollowed).length
    const incompleteLabs = selectedLabs.filter(([_, lab]) => !lab.toBeFollowed && !lab.date).length
    const labsWithImages = selectedLabs.filter(([_, lab]) => lab.images && lab.images.length > 0).length

    return {
      total: selectedLabs.length,
      completed: completedLabs,
      pending: pendingLabs,
      incomplete: incompleteLabs,
      withImages: labsWithImages,
    }
  }, [labResults])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold mt-2">LABORATORY RESULTS</h3>
        {statistics.total > 0 && (
          <div className="text-sm text-gray-600 mt-4">
            Showing {statistics.total} of {Object.keys(labResults).length} tests
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              const allChecked = Object.values(labResults).every((lab) => lab.checked)
              const updatedResults = { ...labResults }
              Object.keys(updatedResults).forEach((key) => {
                // Clean up existing preview URLs when unchecking
                if (allChecked && updatedResults[key].imagePreview) {
                  URL.revokeObjectURL(updatedResults[key].imagePreview!)
                }
                updatedResults[key] = {
                  ...updatedResults[key],
                  checked: !allChecked,
                  ...(!allChecked
                    ? {}
                    : {
                        date: "",
                        remarks: "",
                        toBeFollowed: false,
                        images: [], // Clear images array
                        imageFile: null,
                        imagePreview: undefined,
                      }),
                }
              })
              onLabResultsChange(updatedResults)
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            {Object.values(labResults).every((lab) => lab.checked) ? "Unselect All" : "Select All"}
          </button>
        </div>

        {/* Lab Results Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(LAB_DISPLAY_NAMES).map(([labName, displayInfo]) => (
            <LabResultItem
              key={labName}
              labName={labName}
              displayInfo={displayInfo}
              labData={labResults[labName]}
              onLabCheckbox={handleLabCheckbox}
              onLabDate={handleLabDate}
              onLabRemarks={handleLabRemarks}
              onToBeFollowed={handleToBeFollowed}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              error={errors[labName]}
            />
          ))}
        </div>

        {/* Summary Section */}
        {statistics.total > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-3">
              <Label className="font-medium text-sm">Laboratory Tests Summary</Label>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 size={12} className="text-green-600" />
                  <span className="text-green-600">{statistics.completed} Completed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock size={12} className="text-orange-600" />
                  <span className="text-orange-600">{statistics.pending} Pending</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ImageIcon size={12} className="text-blue-600" />
                  <span className="text-blue-600">{statistics.withImages} With Images</span>
                </span>
                {statistics.incomplete > 0 && (
                  <span className="flex items-center space-x-1">
                    <AlertCircle size={12} className="text-red-600" />
                    <span className="text-red-600">{statistics.incomplete} Incomplete</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(labResults)
                .filter(([_, lab]) => lab.checked)
                .map(([labName, lab]) => (
                  <div
                    key={labName}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        {LAB_DISPLAY_NAMES[labName as keyof typeof LAB_DISPLAY_NAMES].name}
                      </span>
                      {lab.images && lab.images.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <ImageIcon size={10} className="text-blue-600" />
                          <span className="text-xs text-blue-600">{lab.images.length} image(s) attached</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      {lab.toBeFollowed ? (
                        <span className="text-orange-600 text-sm font-medium">To be followed</span>
                      ) : (
                        <div className="text-sm text-gray-600">
                          {lab.date ? (
                            <div className="flex items-center justify-end space-x-1">
                              <Calendar size={12} />
                              <span>{lab.date}</span>
                            </div>
                          ) : (
                            <span className="text-red-600">Date required</span>
                          )}
                          {lab.remarks && (
                            <div className="text-xs text-gray-500 mt-1">
                              Remarks: {lab.remarks.slice(0, 50)}
                              {lab.remarks.length > 50 ? "..." : ""}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Validation Alerts */}
        {statistics.incomplete > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statistics.incomplete} test(s) are missing required dates. Please provide dates for all completed tests.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  )
}

// Utility functions
const createEmptyLabResult = (): LabResultData => ({
  checked: false,
  date: "",
  toBeFollowed: false,
  remarks: "",
  images: [],
  imageFile: null,
  imagePreview: undefined,
})

export const createInitialLabResults = (): LabResults => ({
  urinalysis: createEmptyLabResult(),
  cbc: createEmptyLabResult(),
  sgotSgpt: createEmptyLabResult(),
  creatinineSerum: createEmptyLabResult(),
  buaBun: createEmptyLabResult(),
  syphilis: createEmptyLabResult(),
  hivTest: createEmptyLabResult(),
  hepaB: createEmptyLabResult(),
  bloodTyping: createEmptyLabResult(),
  ogct50: createEmptyLabResult(),
  ogct100: createEmptyLabResult(),
})

export const getLabResultsSummary = (labResults: LabResults) => {
  return Object.entries(labResults)
    .filter(([_, lab]) => lab.checked)
    .reduce((acc, [labName, lab]) => {
      acc[labName] = {
        completed: !lab.toBeFollowed,
        date: lab.date,
        remarks: lab.remarks,
        toBeFollowed: lab.toBeFollowed,
        hasImage: !!lab.imageFile,
        imageFile: lab.imageFile,
        displayName: LAB_DISPLAY_NAMES[labName as keyof typeof LAB_DISPLAY_NAMES].name,
      }
      return acc
    }, {} as any)
}

export const convertLabResultsToSchema = (labResults: LabResults) => {
  const labTypeMapping = {
    urinalysis: "urinalysis",
    cbc: "cbc",
    sgotSgpt: "sgot_sgpt",
    creatinineSerum: "creatinine_serum",
    buaBun: "bua_bun",
    syphilis: "syphilis",
    hivTest: "hiv_test",
    hepaB: "hepa_b",
    bloodTyping: "blood_typing",
    ogct50: "ogct_50gms",
    ogct100: "ogct_100gms",
  } as const

  return Object.entries(labResults)
    .filter(([_, lab]) => lab.checked) // only checked labs
    .map(([labName, lab]) => ({
      lab_type: labTypeMapping[labName as keyof typeof labTypeMapping],
      resultDate: lab.date,
      toBeFollowed: lab.toBeFollowed, 
      documentPath: lab.imageFile ? `lab_images/${labName}_${Date.now()}.${lab.imageFile.name.split(".").pop()}` : "",
      remarks: lab.remarks || "",
      images: lab.images.map(img => ({
        image_url: img.url || img.preview || "",
        image_name: img.name || "",
        image_type: img.type || "",
        image_size: img.size || 0,
      })), // Ensure images array is passed
    }))
}

// Validation helper
export const validateLabResults = (labResults: LabResults) => {
  const errors: Record<string, string> = {}

  Object.entries(labResults).forEach(([labName, lab]) => {
    if (lab.checked && !lab.toBeFollowed && !lab.date) {
      errors[labName] = "Date is required for completed tests"
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Helper to clean up image URLs when component unmounts
export const cleanupLabResultImages = (labResults: LabResults) => {
  Object.values(labResults).forEach((lab) => {
    if (lab.imagePreview) {
      URL.revokeObjectURL(lab.imagePreview)
    }
  })
}
