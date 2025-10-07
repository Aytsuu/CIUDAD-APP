import { useState, useEffect } from "react";
import {api2} from "@/api/api";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

interface Option {
  id: string;
  name: string;
}

export const useCategoriesFirstAid = () => {
  const [categories, setCategories] = useState<Option[]>([]);
  // State for delete confirmation dialog
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // State to store the onCategoryAdded callback
  const [onCategoryAddedCallback, setOnCategoryAddedCallback] = useState<((newId: string) => void) | null>(null);

  // ADD CATEGORY
  const addCategory = async (CategoryInfo: Record<string, string>) => {
    try {
      const res = await api2.post("inventory/category/", {
        cat_type: CategoryInfo.cat_type,
        cat_name: toTitleCase(CategoryInfo.cat_name.trim()),
      });
      console.log("Category added successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error adding category:", err);
      throw err;
    }
  };

  // GET CATEGORIES with react-query
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['firstAidCategories'],
    queryFn: async () => {
      try {
        const { data } = await api2.get("inventory/category/", {
          params: { cat_type: "FirstAid" },
        });

        if (Array.isArray(data)) {
          const transformedCategories = data
            .filter((cat) => cat.cat_type === "FirstAid")
            .map((cat) => ({
              id: String(cat.cat_id),
              name: cat.cat_name || "Unnamed Category",
            }));

          return transformedCategories;
        } else {
          console.error("Unexpected data format:", data);
          throw new Error("Unexpected data format from server");
        }
      } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch categories");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  // Update categories when data changes
  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  const handleAddCategory = async (
    newCategoryName: string,
    onCategoryAdded: (newId: string) => void
  ) => {
    if (!newCategoryName.trim() || isProcessing) return;
    setIsProcessing(true);

    const categoryExists = categories.some(
      (category) => category.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
      showErrorToast("Category already exists")
      setIsProcessing(false);
      return;
    }

    try {
      const newCategory = await addCategory({
        cat_type: "FirstAid",
        cat_name: toTitleCase(newCategoryName.trim()),
      });

      if (newCategory && newCategory.cat_id) {
        // Invalidate the query to refetch data
        queryClient.invalidateQueries({ queryKey: ['firstAidCategories'] });
        
        // Call the callback if provided
        if (onCategoryAdded) {
          onCategoryAdded(String(newCategory.cat_id));
        }
        
        showSuccessToast("Category added successfully")
      }
    } catch (error) {
      console.error("❌ Failed to add category:", error);
      showErrorToast("Failed to add category");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle add confirmation
  const categoryHandleAdd = (categoryName: string, onCategoryAdded?: (newId: string) => void) => {
    setNewCategoryName(categoryName);
    setIsAddConfirmationOpen(true);

    if (onCategoryAdded) {
      setOnCategoryAddedCallback(() => onCategoryAdded);
    }
  };

  const handleConfirmAdd = async () => {
    if (isProcessing || !newCategoryName.trim()) return;
    
    // Close modal immediately
    setIsAddConfirmationOpen(false);
    
    try {
      await handleAddCategory(newCategoryName, (newId) => {
        if (onCategoryAddedCallback) {
          onCategoryAddedCallback(newId);
        }
      });
      setNewCategoryName("");
      setOnCategoryAddedCallback(null);
    } catch (error) {
      console.error("Error in confirmation:", error);
    }
  };

  // DELETE CATEGORY
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await api2.delete(`inventory/category/${categoryId}/`);

      if (response.status === 200 || response.status === 204) {
        // Invalidate the query to refetch data
        queryClient.invalidateQueries({ queryKey: ['firstAidCategories'] });
        
        showSuccessToast("Category deleted successfully")
      } else {
        console.error(response);
        showErrorToast("Failed to delete category")
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to delete category. It may be in use.")
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (categoryId: number) => {
    setCategoryToDelete(Number(categoryId));
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete !== null) {
      handleDeleteCategory(categoryToDelete);
    }
    setIsDeleteConfirmationOpen(false);
  };

  const ConfirmationDialogs = () => (
    <>
      {/* Add Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={handleConfirmAdd}
        title="Add Category"
        description={`Are you sure you want to add the category "${newCategoryName}"?`}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
      />
    </>
  );

  return {
    categories: loading ? [] : categories, // Return empty array when loading
    loading,
    error,
    handleAddCategory,
    handleDeleteCategory,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
    refetch,
  };
};