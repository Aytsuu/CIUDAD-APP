import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Users, Trash2, Edit2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { AddAgeGroupForm } from "./AddAgeGroupForm";
import { EditAgeGroupForm } from "./EditAgeGroupForm";
import { useAgeGroups, deleteAgeroup } from "./restful-api/agepostAPI";
import { Link } from "react-router";

export type AgeGroupRecord= {
  id: string;
  agegroup_name: string;
  min_age: number;
  max_age: number;
  time_unit: string;
  created_at: string;
  updated_at?: string | null;
}

export default function AgeGroup() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [editingAgeGroup, setEditingAgeGroup] =
    React.useState<AgeGroupRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    ageGroup: AgeGroupRecord | null;
  }>({ isOpen: false, ageGroup: null });
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: ageGroups, isLoading, error } = useAgeGroups();


  const formatAgeGroupData = React.useCallback((): AgeGroupRecord[] => {
    if (!ageGroups) return [];
    return ageGroups.map((record: any) => ({
      id: record?.agegrp_id,
      agegroup_name: record.agegroup_name,
      min_age: record?.min_age,
      max_age: record?.max_age,
      time_unit: record?.time_unit,
      created_at: record?.created_at,
      updated_at: record?.updated_at || null,
    }));
  }, [ageGroups]);

  const filteredData = React.useMemo(() => {
    const ageGroups = formatAgeGroupData();
    return ageGroups.filter(
      (group) =>
        group.agegroup_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.time_unit.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatAgeGroupData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgeroup(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["ageGroups"] });
      const previousAgeGroups = queryClient.getQueryData<AgeGroupRecord[]>([
        "ageGroups",
      ]);
      if (previousAgeGroups) {
        queryClient.setQueryData<AgeGroupRecord[]>(
          ["ageGroups"],
          previousAgeGroups.filter((group) => group.id !== id)
        );
      }
      return { previousAgeGroups };
    },
    onError: (error, id, context) => {
      console.error("Error deleting age group:", error);
      toast.error("Error deleting age group. Please try again.");
      if (context?.previousAgeGroups) {
        queryClient.setQueryData(["ageGroups"], context.previousAgeGroups);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ageGroups"] });
      toast.success("Age group deleted successfully!");
    },
  });

  const handleFormSubmit = (data: {
    id: string;
    agegroup_name: string;
    min_age: number;
    max_age: number;
    time_unit: string;
  }) => {
    setShowForm(false);
    setEditingAgeGroup(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.ageGroup?.id) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmation.ageGroup.id);
    } finally {
      setDeleteConfirmation({ isOpen: false, ageGroup: null });
    }
  };

  const startEdit = (ageGroup: AgeGroupRecord) => {
    setEditingAgeGroup(ageGroup);
    setShowForm(true);
  };

  const startDelete = (ageGroup: AgeGroupRecord) => {
    setDeleteConfirmation({ isOpen: true, ageGroup });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAgeGroup(null);
  };

  const isFormActive = showForm || editingAgeGroup !== null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Loading age groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">
          Error fetching age groups: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Age Group Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage age groups with custom time ranges
          </p>
        </div>

        <Link to="/addAgeGroupFrom">
          <Button
            disabled={isFormActive}
            className="flex items-center"
            aria-label="Add new age group"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Age Group
          </Button>
        </Link>
      </div>

      {editingAgeGroup && (
        <EditAgeGroupForm
          ageGroup={editingAgeGroup}
          onSubmitSuccess={handleFormSubmit}
          onCancel={cancelForm}
        />
      )}

      {!editingAgeGroup && (
        <>
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search age groups..."
              className="w-full p-2 pl-10 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Age Groups ({filteredData.length})
              </h2>
            </div>

            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  No age groups found. Add your first age group to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredData.map((ageGroup) => (
                  <div
                    key={ageGroup.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">
                          {ageGroup.agegroup_name}
                        </h3>
                        <p className="text-gray-600 mt-1 text-sm">
                          Age Range:{" "}
                          <span className="font-medium">
                            {ageGroup.min_age} - {ageGroup.max_age}{" "}
                            {ageGroup.time_unit}
                          </span>
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Created:{" "}
                          {new Date(ageGroup.created_at).toLocaleDateString()}
                          {ageGroup.updated_at && (
                            <span>
                              {" "}
                              • Updated:{" "}
                              {new Date(
                                ageGroup.updated_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(ageGroup)}
                          disabled={isFormActive}
                          className="p-2"
                          aria-label={`Edit ${ageGroup.agegroup_name} age group`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startDelete(ageGroup)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${ageGroup.agegroup_name} age group`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
        title="Delete Age Group"
        description={`Are you sure you want to delete "${deleteConfirmation.ageGroup?.agegroup_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
