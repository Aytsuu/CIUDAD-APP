"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Loader2, List } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";

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

const fetchIllnesses = async () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch illnesses with caching
  const {
    data: illnesses = [],
    isLoading,
    isError,
  } = useQuery<Illness[]>({
    queryKey: ['illnesses'],
    queryFn: fetchIllnesses,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  // Mutation for adding new illness - SIMPLIFIED like PhysicalExam component
  const { mutate: addIllness } = useMutation({
    mutationFn: createIllness,
    onMutate: () => {
      setIsAdding(true);
      // Just show loading state, don't create optimistic data with fake IDs
    },
    onSuccess: (createdIllness) => {
      // Refetch to get the updated list with the real illness
      queryClient.invalidateQueries({ queryKey: ['illnesses'] });
      
      // Wait a moment for the cache to update, then select the new illness with its REAL ID
      setTimeout(() => {
        const updatedSelected = [...selectedIllnesses, createdIllness.ill_id];
        onIllnessSelectionChange(updatedSelected);
        
        // Update assessment with the newly selected illness
        const currentIllnesses = queryClient.getQueryData<Illness[]>(['illnesses']) || [];
        const selectedIllnessNames = currentIllnesses
          .filter((illness) => updatedSelected.includes(illness.ill_id))
          .map((illness) => illness.illname)
          .join(", ");
        
        onAssessmentUpdate(selectedIllnessNames);
        toast.success("Illness added and selected successfully");
      }, 100);
    },
    onError: (error) => {
      toast.error("Failed to add illness");
      console.error("Error creating illness:", error);
    },
    onSettled: () => {-0
      setSearchTerm("");
    },
  });

  const illnessExists = (name: string) => {
    return illnesses.some(
      (illness) => illness.illname.toLowerCase() === name.toLowerCase()
    );
  };

  const handleAddIllness = (name: string) => {
    if (!name.trim()) return;
    if (illnessExists(name)) {
      toast.error("This illness already exists");
      return;
    }
    addIllness(name);
  };

  const handleIllnessCheckboxChange = (illnessId: number, checked: boolean) => {
    const updatedSelected = checked
      ? [...selectedIllnesses, illnessId]
      : selectedIllnesses.filter((id) => id !== illnessId);
    
    onIllnessSelectionChange(updatedSelected);

    const selectedIllnessNames = illnesses
      .filter((illness) => updatedSelected.includes(illness.ill_id))
      .map((illness) => illness.illname)
      .join(", ");
    
    onAssessmentUpdate(selectedIllnessNames);
  };

  const filteredIllnesses = illnesses.filter((illness) =>
    illness.illname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort illnesses - selected ones first, then alphabetically
  const sortedFilteredIllnesses = [...filteredIllnesses].sort((a, b) => {
    const aSelected = selectedIllnesses.includes(a.ill_id);
    const bSelected = selectedIllnesses.includes(b.ill_id);
    
    // If selection status is different, selected comes first
    if (aSelected !== bSelected) {
      return aSelected ? -1 : 1;
    }
    
    // If both selected or both unselected, sort alphabetically
    return a.illname.localeCompare(b.illname);
  });

  // Only show first 4 items in the main view
  const displayedIllnesses = sortedFilteredIllnesses.slice(0, 4);
  const hasMoreIllnesses = sortedFilteredIllnesses.length > 4;

  // Sort modal illnesses the same way
  const modalFilteredIllnesses = illnesses
    .filter((illness) =>
      illness.illname.toLowerCase().includes(modalSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = selectedIllnesses.includes(a.ill_id);
      const bSelected = selectedIllnesses.includes(b.ill_id);
      
      if (aSelected !== bSelected) {
        return aSelected ? -1 : 1;
      }
      
      return a.illname.localeCompare(b.illname);
    });

  const showAddButton = searchTerm && 
                       !illnessExists(searchTerm) && 
                       !sortedFilteredIllnesses.length;

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 p-4 border rounded-lg bg-red-50">
          Failed to load illnesses. Please try again later.
        </div>
      </div>
    );
  }

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
          displayedIllnesses.map((illness) => (
            <div
              key={illness.ill_id}
              className="flex items-center text-sm space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                id={`illness-${illness.ill_id}`}
                checked={selectedIllnesses.includes(illness.ill_id)}
                onChange={(e) => handleIllnessCheckboxChange(illness.ill_id, e.target.checked)}
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

      {/* Show More Button - only display if there are more than 4 illnesses */}
      {(hasMoreIllnesses || illnesses.length > 4) && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <List className="h-4 w-4 mr-2" />
              Show More ({illnesses.length} total)
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>All Illnesses</DialogTitle>
            <DialogDescription>
              Browse and select from all available illnesses
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search in all illnesses..."
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>

          {/* Add button for modal search */}
          {modalSearchTerm && !illnessExists(modalSearchTerm) && modalFilteredIllnesses.length === 0 && (
            <Button
              onClick={() => handleAddIllness(modalSearchTerm)}
              disabled={isAdding}
              className="w-full mb-4"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add "{modalSearchTerm}"
            </Button>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-muted-foreground">Loading illnesses...</p>
              </div>
            ) : modalFilteredIllnesses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-5 w-5 mb-2" />
                <p className="text-center">
                  {modalSearchTerm 
                    ? `No illnesses found matching "${modalSearchTerm}"`
                    : "No illnesses available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {modalFilteredIllnesses.map((illness) => (
                  <div
                    key={illness.ill_id}
                    className="flex items-center text-sm space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`modal-illness-${illness.ill_id}`}
                      checked={selectedIllnesses.includes(illness.ill_id)}
                      onChange={(e) => handleIllnessCheckboxChange(illness.ill_id, e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-zinc-400 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer flex-shrink-0"
                    />
                    <label
                      htmlFor={`modal-illness-${illness.ill_id}`}
                      className="font-medium cursor-pointer flex-1 leading-tight"
                    >
                      {illness.illname}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
};