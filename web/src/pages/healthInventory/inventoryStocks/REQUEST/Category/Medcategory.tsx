import { useState, useEffect, useCallback } from "react";
import { api } from "@/pages/api/api";
import { ConfirmationDialog } from "../../../../../components/ui/confirmationLayout/ConfirmModal";

interface Option { 
  id: string;
  name: string;
}

export const useCategoriesMedicine = () => {
  const [categories, setCategories] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for delete confirmation dialog
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // State to store the onCategoryAdded callback
  const [onCategoryAddedCallback, setOnCategoryAddedCallback] = useState<((newId: string) => void) | null>(null);

  // ADD CATEGORY
  const addCategory = async (CategoryInfo: Record<string, string>) => {
    try {
      const res = await api.post("inventory/category/", {
        cat_type: CategoryInfo.cat_type,
        cat_name: CategoryInfo.cat_name,
      });
      console.log("Category added successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error adding category:", err);
      return null;
    }
  };

  // GET CATEGORIES
  const getCategories = useCallback(async () => {
    try {
      const { data } = await api.get("inventory/category/", {
        params: { cat_type: "Medicine" },
      });
      console.log(data);

      if (Array.isArray(data)) {
        const transformedCategories = data
          .filter((cat) => cat.cat_type === "Medicine")
          .map((cat) => ({
            id: String(cat.cat_id),
            name: cat.cat_name,
          }));

        setCategories(transformedCategories);
      } else {
        console.error(error);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = async (
    newCategoryName: string,
    onCategoryAdded: (newId: string) => void
  ) => {
    if (!newCategoryName.trim() || isAdding) return;
    setIsAdding(true);

    const categoryExists = categories.some(
      (category) =>
        category.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
      setError("Category already exists.");
      setTimeout(() => setError(null), 5000);
      setIsAdding(false);
      return;
    }

    try {
      const newCategory = await addCategory({
        cat_type: "Medicine",
        cat_name: newCategoryName,
      });

      if (newCategory && newCategory.cat_id) {
        const newCategoryOption = {
          id: String(newCategory.cat_id),
          name: newCategory.cat_name,
        };

        // Update the categories state with the new category
        setCategories((prev) => [...prev, newCategoryOption]);
        onCategoryAdded(newCategoryOption.id); // Call the callback with the new category ID
      }
    } catch (error) {
      console.error("❌ Failed to add category:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle add confirmation
  const categoryHandleAdd = (categoryName: string, onCategoryAdded?: (newId: string) => void) => {
    setNewCategoryName(categoryName);
    setIsAddConfirmationOpen(true);

    // Store the callback for later use
    if (onCategoryAdded) {
      setOnCategoryAddedCallback(() => onCategoryAdded);
    }
  };

  const handleConfirmAdd = async () => {
    if (newCategoryName.trim()) {
      await handleAddCategory(newCategoryName, (newId) => {
        // Call the stored callback with the new category ID
        if (onCategoryAddedCallback) {
          onCategoryAddedCallback(newId);
        }
      });
      setIsAddConfirmationOpen(false);
      setNewCategoryName("");
      setOnCategoryAddedCallback(null); // Clear the callback after use
    }
  };

   // DELETE CATEGORY
   const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await api.delete(
        `inventory/category/${categoryId}/`
      );

      if (response.status === 200 || response.status === 204) {
        console.log("✅ Category deleted successfully!");

        // Remove the deleted category from the state
        setCategories((prev) =>
          prev.filter((category) => category.id !== String(categoryId))
        );
      } else {
        console.error(response);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteConfirmationOpen(true);
  };

// ... (previous code)
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
      onConfirm={() => {
        if (categoryToDelete !== null) {
          handleDeleteCategory(categoryToDelete);
        }
        setIsDeleteConfirmationOpen(false);
      }}
      title="Delete Category"
      description="Are you sure you want to delete this category?"
    />
  </>
);

// ... (rest of the code)

  return {
    categories,
    loading,
    handleAddCategory,
    handleDeleteCategory,
    error,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  };
};