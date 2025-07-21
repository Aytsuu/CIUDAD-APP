"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload"

// Types
export interface LabResultData {
  checked: boolean
  date: string
  mediaFiles: MediaUploadType
  toBeFollowed: boolean
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
}

// Lab display names mapping
const LAB_DISPLAY_NAMES = {
  urinalysis: "Urinalysis",
  cbc: "Complete Blood Count (CBC)",
  sgotSgpt: "SGOT/SGPT (Liver Function Test)",
  creatinineSerum: "Creatinine Serum",
  buaBun: "BUA/BUN (Blood Urea Acid/Blood Urea Nitrogen)",
  syphilis: "Syphilis Test",
  hivTest: "HIV Test",
  hepaB: "Hepatitis B",
  bloodTyping: "Blood Typing",
  ogct50: "OGCT 50g (Oral Glucose Challenge Test)",
  ogct100: "OGCT 100g (Oral Glucose Tolerance Test)",
} as const

// Individual Lab Result Item Component
const LabResultItem = ({
  labName,
  displayName,
  labData,
  onLabCheckbox,
  onLabDate,
  onLabMediaFiles,
  onToBeFollowed,
  activeVideoId,
  setActiveVideoId,
}: {
  labName: string
  displayName: string
  labData: LabResultData
  onLabCheckbox: (labName: string, checked: boolean) => void
  onLabDate: (labName: string, date: string) => void
  onLabMediaFiles: (labName: string, mediaFiles: MediaUploadType) => void
  onToBeFollowed: (labName: string, toBeFollowed: boolean) => void
  activeVideoId: string
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>
}) => {
  // Create a stable callback for media file updates
  const handleMediaFilesChange = useCallback(
    (mediaFiles: MediaUploadType | ((prev: MediaUploadType) => MediaUploadType)) => {
      if (typeof mediaFiles === "function") {
        // If it's a function, call it with current media files
        const updatedFiles = mediaFiles(labData.mediaFiles)
        onLabMediaFiles(labName, updatedFiles)
      } else {
        // If it's direct value, use it
        onLabMediaFiles(labName, mediaFiles)
      }
    },
    [labName, labData.mediaFiles, onLabMediaFiles],
  )

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex items-center space-x-2">
        <Checkbox checked={labData.checked} onCheckedChange={(checked) => onLabCheckbox(labName, checked as boolean)} />
        <Label className="font-medium">{displayName}</Label>
      </div>

      {labData.checked && (
        <div className="ml-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={labData.toBeFollowed}
              onCheckedChange={(checked) => onToBeFollowed(labName, checked as boolean)}
            />
            <Label className="text-sm text-orange-600">To be followed</Label>
          </div>

          {!labData.toBeFollowed && (
            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <Label className="text-sm font-medium">Date Taken</Label>
                <input
                  type="date"
                  value={labData.date}
                  onChange={(e) => onLabDate(labName, e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Media Upload */}
              <div>
                <MediaUpload
                  title="Upload Lab Results"
                  description="Upload images, documents, or videos of the lab results"
                  mediaFiles={labData.mediaFiles}
                  activeVideoId={activeVideoId}
                  setMediaFiles={handleMediaFilesChange}
                  setActiveVideoId={setActiveVideoId}
                />
              </div>
            </div>
          )}

          {labData.toBeFollowed && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-medium">To be followed</span>
              </div>
              <p className="mt-1 text-orange-700">This laboratory result will be followed up later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main Laboratory Results Component
export default function LaboratoryResults({ labResults, onLabResultsChange }: LaboratoryResultsProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>("")

  // Use useCallback to prevent unnecessary re-renders
  const handleLabCheckbox = useCallback(
    (labName: string, checked: boolean) => {
      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          checked,
          // Reset other fields when unchecked but preserve mediaFiles structure
          ...(checked
            ? {}
            : {
                date: "",
                mediaFiles: [],
                toBeFollowed: false,
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

  const handleLabMediaFiles = useCallback(
    (labName: string, mediaFiles: MediaUploadType) => {
      console.log(`Updating media files for ${labName}:`, mediaFiles) // Debug log
      const updatedResults = {
        ...labResults,
        [labName]: {
          ...labResults[labName],
          mediaFiles: [...mediaFiles], // Create a new array to ensure state update
        },
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
          // Clear date and media files if "to be followed" is checked
          ...(toBeFollowed ? { date: "", mediaFiles: [] } : {}),
        },
      }
      onLabResultsChange(updatedResults)
    },
    [labResults, onLabResultsChange],
  )

  const selectedLabs = Object.entries(labResults).filter(([_, lab]) => lab.checked)

  return (
    <>
      <Separator className="mt-8 mb-6" />
      <h3 className="text-md font-bold">LABORATORY RESULTS</h3>
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(LAB_DISPLAY_NAMES).map(([labName, displayName]) => (
            <LabResultItem
              key={labName}
              labName={labName}
              displayName={displayName}
              labData={labResults[labName]}
              onLabCheckbox={handleLabCheckbox}
              onLabDate={handleLabDate}
              onLabMediaFiles={handleLabMediaFiles}
              onToBeFollowed={handleToBeFollowed}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
            />
          ))}
        </div>

        {/* Summary of selected labs */}
        {selectedLabs.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border">
            <Label className="font-medium text-sm">Selected Laboratory Tests Summary:</Label>
            <div className="mt-3 space-y-2">
              {selectedLabs.map(([labName, lab]) => (
                <div
                  key={labName}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1">
                    <span className="font-medium text-sm">
                      {LAB_DISPLAY_NAMES[labName as keyof typeof LAB_DISPLAY_NAMES]}
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    {lab.toBeFollowed ? (
                      <span className="text-orange-600 text-sm font-medium">To be followed</span>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {lab.date && <div>Date: {lab.date}</div>}
                        {lab.mediaFiles.length > 0 && (
                          <div className="flex items-center space-x-1 justify-end">
                            <span>Files: {lab.mediaFiles.length}</span>
                            <div className="flex space-x-1">
                              {lab.mediaFiles.slice(0, 3).map((media, index) => (
                                <div key={`${labName}-${index}`} className="w-2 h-2 bg-green-500 rounded-full"></div>
                              ))}
                              {lab.mediaFiles.length > 3 && (
                                <span className="text-xs">+{lab.mediaFiles.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {!lab.date && lab.mediaFiles.length === 0 && <span className="text-gray-400">No data</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Utility function to create initial lab results state
export const createInitialLabResults = (): LabResults => ({
  urinalysis: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  cbc: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  sgotSgpt: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  creatinineSerum: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  buaBun: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  syphilis: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  hivTest: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  hepaB: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  bloodTyping: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  ogct50: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
  ogct100: { checked: false, date: "", mediaFiles: [], toBeFollowed: false },
})

// Utility function to get lab results summary
export const getLabResultsSummary = (labResults: LabResults) => {
  return Object.entries(labResults)
    .filter(([_, lab]) => lab.checked)
    .reduce((acc, [labName, lab]) => {
      acc[labName] = {
        completed: !lab.toBeFollowed,
        date: lab.date,
        mediaFiles: lab.mediaFiles,
        hasFiles: lab.mediaFiles.length > 0,
        uploadedFiles: lab.mediaFiles.filter((file) => file.status === "uploaded").length,
        toBeFollowed: lab.toBeFollowed,
        displayName: LAB_DISPLAY_NAMES[labName as keyof typeof LAB_DISPLAY_NAMES],
      }
      return acc
    }, {} as any)
}

// Utility function to get all uploaded files with lab context
export const getAllUploadedFiles = (labResults: LabResults) => {
  const allFiles: Array<{
    labName: string
    labDisplayName: string
    file: MediaUploadType[0]
  }> = []

  Object.entries(labResults).forEach(([labName, lab]) => {
    if (lab.checked && !lab.toBeFollowed) {
      lab.mediaFiles.forEach((file) => {
        if (file.status === "uploaded") {
          allFiles.push({
            labName,
            labDisplayName: LAB_DISPLAY_NAMES[labName as keyof typeof LAB_DISPLAY_NAMES],
            file,
          })
        }
      })
    }
  })

  return allFiles
}
