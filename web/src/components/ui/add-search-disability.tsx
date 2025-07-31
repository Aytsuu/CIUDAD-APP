"use client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Search, Plus, Loader2, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { api2 } from "@/api/api"

interface Disability {
  disability_id: number
  disability_name: string
  created_at: string
}

interface DisabilityComponentProps {
  selectedDisabilities?: number[]
  onDisabilitySelectionChange?: (selectedDisabilities: number[]) => void
  onAssessmentUpdate?: (assessment: string) => void
  isRequired?: boolean
  historicalDisabilityIds?: number[] // New prop for historical IDs to exclude
}

// Explicitly type the return value to ensure it's Disability[]
const getDisabilities = async (): Promise<Disability[]> => {
  try {
    const response = await api2.get<Disability[]>(`/patientrecords/disability/`)
    return response.data
  } catch (error) {
    console.error("Error fetching disabilities:", error)
    throw error
  }
}

// Explicitly type the return value to ensure it's Disability
const createDisability = async (name: string): Promise<Disability> => {
  try {
    const response = await api2.post<Disability>(`/patientrecords/disability/`, { disability_name: name })
    return response.data
  } catch (error) {
    console.error("Error creating disability:", error)
    throw error
  }
}

export const DisabilityComponent = ({
  selectedDisabilities = [],
  onDisabilitySelectionChange = () => {},
  onAssessmentUpdate = () => {},
  isRequired = false,
  historicalDisabilityIds = [], // Default to empty array if not provided
}: DisabilityComponentProps) => {
  const [allDisabilities, setAllDisabilities] = useState<Disability[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        setIsLoading(true)
        const disabilitiesData = await getDisabilities()
        setAllDisabilities(disabilitiesData)
      } catch (err) {
        console.error("Error fetching disabilities:", err)
        toast.error("Failed to load disabilities")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDisabilities()
  }, [])

  const disabilityExists = (name: string) => {
    return allDisabilities.some((disability) => disability.disability_name.toLowerCase() === name.toLowerCase())
  }

  // Helper to update the assessment string based on current selected IDs
  const updateAssessmentString = (currentSelectedIds: number[]) => {
    const selectedDisabilityNames = allDisabilities
      .filter((disability) => currentSelectedIds.includes(disability.disability_id))
      .map((disability) => disability.disability_name)
      .join(", ")
    onAssessmentUpdate(selectedDisabilityNames)
  }

  const handleAddDisability = async (name: string) => {
    if (!name.trim()) return
    try {
      setIsAdding(true)
      if (disabilityExists(name)) {
        toast.error("This disability already exists")
        return
      }
      const createdDisability = await createDisability(name)
      // Add new disability to the beginning of the allDisabilities array
      setAllDisabilities((prev) => [createdDisability, ...prev])
      // Automatically select the newly added disability
      const updatedSelected = [...selectedDisabilities, createdDisability.disability_id]
      onDisabilitySelectionChange(updatedSelected)
      updateAssessmentString(updatedSelected)
      toast.success("Disability added and selected successfully")
    } catch (err) {
      console.error("Error adding disability:", err)
      toast.error("Failed to add disability")
    } finally {
      setIsAdding(false)
      setSearchTerm("")
    }
  }

  // Function to handle selecting a disability (adding to selected list)
  const handleSelectDisability = (disabilityId: number) => {
    if (!selectedDisabilities.includes(disabilityId)) {
      const updatedSelected = [...selectedDisabilities, disabilityId]
      onDisabilitySelectionChange(updatedSelected)
      updateAssessmentString(updatedSelected)
    }
  }

  // Function to handle removing a disability (from selected list)
  const handleRemoveDisability = (disabilityId: number) => {
    const updatedSelected = selectedDisabilities.filter((id) => id !== disabilityId)
    onDisabilitySelectionChange(updatedSelected)
    updateAssessmentString(updatedSelected)
  }

  // Filter disabilities that are not already selected AND are not historical
  const filteredAvailableDisabilities = allDisabilities.filter(
    (disability) =>
      disability.disability_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedDisabilities.includes(disability.disability_id) &&
      !historicalDisabilityIds.includes(disability.disability_id), // Exclude historical disabilities
  )

  // Get the full disability objects for the currently selected IDs
  const selectedDisabilityObjects = allDisabilities.filter((disability) =>
    selectedDisabilities.includes(disability.disability_id),
  )

  // Determine if the "Add" button should be shown for the search term
  const showAddButton = searchTerm && !disabilityExists(searchTerm) && !filteredAvailableDisabilities.length

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search or add disabilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border rounded-md"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>

      {showAddButton && (
        <Button onClick={() => handleAddDisability(searchTerm)} disabled={isAdding} className="w-full">
          {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Add "{searchTerm}"
        </Button>
      )}

      {isRequired && selectedDisabilities.length === 0 && (
        <p className="text-sm text-red-500">Please select at least one disability</p>
      )}

      {/* Display Selected Disabilities */}
      {selectedDisabilityObjects.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 px-1 pt-1">Selected Disabilities:</p>
          {selectedDisabilityObjects.map((disability) => (
            <div
              key={disability.disability_id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
            >
              <span className="font-medium text-gray-800">{disability.disability_name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveDisability(disability.disability_id)}
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove {disability.disability_name}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Display Available Disabilities (Search Results) */}
      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-muted-foreground">Loading disabilities...</p>
          </div>
        ) : filteredAvailableDisabilities.length === 0 && !showAddButton && searchTerm ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="h-5 w-5 mb-2" />
            <p className="text-center">No new disabilities found matching "{searchTerm}"</p>
            {searchTerm && !disabilityExists(searchTerm) && (
              <Button size="sm" className="mt-2" onClick={() => handleAddDisability(searchTerm)}>
                <Plus className="h-4 w-4 mr-1" />
                Add new disability
              </Button>
            )}
          </div>
        ) : filteredAvailableDisabilities.length === 0 &&
          !searchTerm &&
          selectedDisabilityObjects.length === allDisabilities.length &&
          historicalDisabilityIds.length === allDisabilities.length ? ( // Adjusted condition
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Check className="h-5 w-5 mb-2" />
            <p className="text-center">All available disabilities are selected or historically recorded.</p>
          </div>
        ) : filteredAvailableDisabilities.length === 0 &&
          !searchTerm &&
          selectedDisabilityObjects.length < allDisabilities.length &&
          historicalDisabilityIds.length < allDisabilities.length ? ( // Adjusted condition
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="h-5 w-5 mb-2" />
            <p className="text-center">No disabilities available to add.</p>
          </div>
        ) : (
          filteredAvailableDisabilities.map((disability) => (
            <div
              key={disability.disability_id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleSelectDisability(disability.disability_id)} // Make the div clickable to select
            >
              <span className="font-medium text-gray-800">{disability.disability_name}</span>
              <Plus className="h-4 w-4 text-green-500" /> {/* Indicate it can be added */}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
