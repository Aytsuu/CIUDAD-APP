import { useState, useEffect, useCallback } from "react";
import api from "@/pages/api/api";
import axios, { AxiosError } from "axios"; // Ensure you import AxiosError if needed

interface Option {
  id: string;
  name: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // GET
  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("inventory/category/", {
        params: { cat_type: "Medicine" },
      });
      console.log("Fetched categories from API:", data);

      if (!Array.isArray(data)) throw new Error("Invalid data format");

      const transformedCategories = data
        .filter((cat) => cat.cat_type === "Medicine")
        .map((cat) => ({
          id: String(cat.cat_id),
          name: cat.cat_name || "Unnamed Category",
        }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
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

    setIsAdding(true); // Prevent multiple calls

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

        if (
          !categories.some((category) => category.id === newCategoryOption.id)
        ) {
          setCategories((prev) => [...prev, newCategoryOption]);
          onCategoryAdded(newCategoryOption.id);
        }
      }
    } catch (error) {
      console.error("❌ Failed to add category:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // DELETE
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await api.delete(
        `inventory/delete_category/${categoryId}/`
      );

      if (response.status === 200 || response.status === 204) {
        console.log("✅ Category deleted successfully!");

        // Remove the deleted category from the state
        setCategories((prev) =>
          prev.filter((category) => category.id !== String(categoryId))
        );
      } else {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }
    } catch (error) {
      console.error(
        "❌ Error deleting category:",
        axios.isAxiosError(error)
          ? error.response?.data || error.message
          : error
      );
    }
  };

  return {
    categories,
    loading,
    handleAddCategory,
    handleDeleteCategory,
    error,
  };
};
