"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { api2 } from "@/api/api";

interface Disability {
  disability_id: number;
  disability_name: string;
  created_at: string;
}

interface DisabilityComponentProps {
  selectedDisabilities?: number[];
  onDisabilitySelectionChange?: (selectedDisabilities: number[]) => void;
  onAssessmentUpdate?: (assessment: string) => void;
  isRequired?: boolean;
}

const getDisabilities = async () => {
  try {
    const response = await api2.get(`/patientrecords/disability/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching disabilities:", error);
    throw error;
  }
};

const createDisability = async (name: string) => {
  try {
    const response = await api2.post(`/patientrecords/disability/`, { disability_name: name });
    return response.data;
  } catch (error) {
    console.error("Error creating disability:", error);
    throw error;
  }
};

export const DisabilityComponent = ({
  selectedDisabilities = [],
  onDisabilitySelectionChange = () => {},
  onAssessmentUpdate = () => {},
  isRequired = false,
}: DisabilityComponentProps) => {
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        setIsLoading(true);
        const disabilitiesData = await getDisabilities();
        setDisabilities(disabilitiesData);
      } catch (err) {
        console.error("Error fetching disabilities:", err);
        toast.error("Failed to load disabilities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisabilities();
  }, []);

  const disabilityExists = (name: string) => {
    return disabilities.some(
      (disability) => disability.disability_name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleAddDisability = async (name: string) => {
    if (!name.trim()) return;

    try {
      setIsAdding(true);
      
      if (disabilityExists(name)) {
        toast.error("This disability already exists");
        return;
      }

      const createdDisability = await createDisability(name);
      // Add new disability to the beginning of the array
      setDisabilities([createdDisability, ...disabilities]);

      // Automatically check the newly added disability
      const updatedSelected = [...selectedDisabilities, createdDisability.disability_id];
      onDisabilitySelectionChange(updatedSelected);

      // Update assessment with all selected disabilities including the new one
      const selectedDisabilityNames = [...disabilities, createdDisability]
        .filter((disability) => updatedSelected.includes(disability.disability_id))
        .map((disability) => disability.disability_name)
        .join(", ");
      
      onAssessmentUpdate(selectedDisabilityNames);
      toast.success("Disability added and selected successfully");
    } catch (err) {
      console.error("Error adding disability:", err);
      toast.error("Failed to add disability");
    } finally {
      setIsAdding(false);
      setSearchTerm("");
    }
  };

  const handleDisabilityCheckboxChange = (disabilityId: number, checked: boolean) => {
    console.log("Checkbox clicked:", { disabilityId, checked, currentSelected: selectedDisabilities });
    
    const updatedSelected = checked
      ? [...selectedDisabilities, disabilityId]
      : selectedDisabilities.filter((id) => id !== disabilityId);

    console.log("Updated selection:", updatedSelected);
    onDisabilitySelectionChange(updatedSelected);

    const selectedDisabilityNames = disabilities
      .filter((disability) => updatedSelected.includes(disability.disability_id))
      .map((disability) => disability.disability_name)
      .join(", ");
    
    console.log("Updated assessment:", selectedDisabilityNames);
    onAssessmentUpdate(selectedDisabilityNames);
  };

  const filteredDisabilities = disabilities.filter((disability) =>
    disability.disability_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showAddButton = searchTerm && 
                       !disabilityExists(searchTerm) && 
                       !filteredDisabilities.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search disabilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border rounded-md"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>

      {showAddButton && (
        <Button
          onClick={() => handleAddDisability(searchTerm)}
          disabled={isAdding}
          className="w-full"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add "{searchTerm}"
        </Button>
      )}

      {isRequired && selectedDisabilities.length === 0 && (
        <p className="text-sm text-red-500">Please select at least one disability</p>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-muted-foreground">Loading disabilities...</p>
          </div>
        ) : filteredDisabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="h-5 w-5 mb-2" />
            <p className="text-center">
              {searchTerm 
                ? `No disabilities found matching "${searchTerm}"`
                : "No disabilities available"}
            </p>
            {searchTerm && !showAddButton && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleAddDisability(searchTerm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add new disability
              </Button>
            )}
          </div>
        ) : (
          filteredDisabilities.map((disability) => (
            <div
              key={disability.disability_id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                id={`disability-${disability.disability_id}`}
                checked={selectedDisabilities.includes(disability.disability_id)}
                onChange={(e) => {
                  console.log(`Checkbox ${disability.disability_id} changed to:`, e.target.checked);
                  handleDisabilityCheckboxChange(disability.disability_id, e.target.checked);
                }}
                className="w-5 h-5 text-blue-600 border-2 border-zinc-400 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor={`disability-${disability.disability_id}`}
                className="font-medium cursor-pointer flex-1"
              >
                {disability.disability_name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};