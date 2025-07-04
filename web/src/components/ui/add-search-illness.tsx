"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { api2 } from "@/api/api";

interface Illness {
  ill_id: number;
  illname: string;
  created_at: string;
}

interface IllnessComponentProps {
  selectedIllnesses?: number[];
  onIllnessSelectionChange?: (selectedIllnesses: number[]) => void;
  onAssessmentUpdate?: (assessment: string) => void;
  isRequired?: boolean;
}

const getIllness = async () => {
  try {
    const response = await api2.get(`patientrecords/illness/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching illnesses:", error);
    throw error;
  }
};

const createIllness = async (name: string) => {
  try {
    const response = await api2.post(`patientrecords/illness/`, { illname: name });
    return response.data;
  } catch (error) {
    console.error("Error creating illness:", error);
    throw error;
  }
};

export const IllnessComponent = ({
  selectedIllnesses = [],
  onIllnessSelectionChange = () => {},
  onAssessmentUpdate = () => {},
  isRequired = false,
}: IllnessComponentProps) => {
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchIllnesses = async () => {
      try {
        setIsLoading(true);
        const illnessesData = await getIllness();
        setIllnesses(illnessesData);
      } catch (err) {
        console.error("Error fetching illnesses:", err);
        toast.error("Failed to load illnesses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIllnesses();
  }, []);

  const illnessExists = (name: string) => {
    return illnesses.some(
      (illness) => illness.illname.toLowerCase() === name.toLowerCase()
    );
  };

  const handleAddIllness = async (name: string) => {
    if (!name.trim()) return;

    try {
      setIsAdding(true);
      
      if (illnessExists(name)) {
        toast.error("This illness already exists");
        return;
      }

      const createdIllness = await createIllness(name);
      // Add new illness to the beginning of the array
      setIllnesses([createdIllness, ...illnesses]);

      // Automatically check the newly added illness
      const updatedSelected = [...selectedIllnesses, createdIllness.ill_id];
      onIllnessSelectionChange(updatedSelected);

      // Update assessment with all selected illnesses including the new one
      const selectedIllnessNames = [...illnesses, createdIllness]
        .filter((illness) => updatedSelected.includes(illness.ill_id))
        .map((illness) => illness.illname)
        .join(", ");
      
      onAssessmentUpdate(selectedIllnessNames);
      toast.success("Illness added and selected successfully");
    } catch (err) {
      console.error("Error adding illness:", err);
      toast.error("Failed to add illness");
    } finally {
      setIsAdding(false);
      setSearchTerm("");
    }
  };

  const handleIllnessCheckboxChange = (illnessId: number, checked: boolean) => {
    console.log("Checkbox clicked:", { illnessId, checked, currentSelected: selectedIllnesses });
    
    const updatedSelected = checked
      ? [...selectedIllnesses, illnessId]
      : selectedIllnesses.filter((id) => id !== illnessId);

    console.log("Updated selection:", updatedSelected);
    onIllnessSelectionChange(updatedSelected);

    const selectedIllnessNames = illnesses
      .filter((illness) => updatedSelected.includes(illness.ill_id))
      .map((illness) => illness.illname)
      .join(", ");
    
    console.log("Updated assessment:", selectedIllnessNames);
    onAssessmentUpdate(selectedIllnessNames);
  };

  const filteredIllnesses = illnesses.filter((illness) =>
    illness.illname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showAddButton = searchTerm && 
                       !illnessExists(searchTerm) && 
                       !filteredIllnesses.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search illnesses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border rounded-md"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>

      {showAddButton && (
        <Button
          onClick={() => handleAddIllness(searchTerm)}
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

      {isRequired && selectedIllnesses.length === 0 && (
        <p className="text-sm text-red-500">Please select at least one illness</p>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-muted-foreground">Loading illnesses...</p>
          </div>
        ) : filteredIllnesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="h-5 w-5 mb-2" />
            <p className="text-center">
              {searchTerm 
                ? `No illnesses found matching "${searchTerm}"`
                : "No illnesses available"}
            </p>
            {searchTerm && !showAddButton && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleAddIllness(searchTerm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add new illness
              </Button>
            )}
          </div>
        ) : (
          filteredIllnesses.map((illness) => (
            <div
              key={illness.ill_id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* REPLACED CUSTOM CHECKBOX WITH NATIVE HTML CHECKBOX */}
              <input
                type="checkbox"
                id={`illness-${illness.ill_id}`}
                checked={selectedIllnesses.includes(illness.ill_id)}
                onChange={(e) => {
                  console.log(`Checkbox ${illness.ill_id} changed to:`, e.target.checked);
                  handleIllnessCheckboxChange(illness.ill_id, e.target.checked);
                }}
                className="w-5 h-5 text-blue-600 border-2 border-zinc-400 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor={`illness-${illness.ill_id}`}
                className="font-medium cursor-pointer flex-1"
              >
                {illness.illname}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};