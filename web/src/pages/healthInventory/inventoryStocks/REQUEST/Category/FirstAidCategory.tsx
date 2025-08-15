import { useState, useEffect, useCallback } from "react";
import {api2} from "@/api/api";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { CircleCheck, CircleX } from "lucide-react";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

interface Option {
  id: string;
  name: string;
}

export const useCategoriesFirstAid = () => {
  const [categories, setCategories] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  const { refetch: getCategories } = useQuery({
    queryKey: ['firstAidCategories'],
    queryFn: async () => {
      try {
        setLoading(true);
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

          setCategories(transformedCategories);
          return transformedCategories;
        } else {
          console.error("Unexpected data format:", data);
          setError("Unexpected data format from server");
          return [];
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories");
        return [];
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  useEffect(() => {
    getCategories();
  }, [getCategories]);

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
      setError("Category already exists.");
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
        const newCategoryOption = {
          id: String(newCategory.cat_id),
          name: newCategory.cat_name,
        };

        setCategories((prev) => [...prev, newCategoryOption]);
        onCategoryAdded(newCategoryOption.id);
        queryClient.invalidateQueries({ queryKey: ['firstAidCategories'] });
        
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
        setCategories((prev) =>
          prev.filter((category) => category.id !== String(categoryId))
        );
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
    categories,
    loading,
    error,
    handleAddCategory,
    handleDeleteCategory,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  };
};