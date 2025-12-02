import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Ban, Check, MoveRight, Pen, Plus, Trash, X } from "lucide-react";
import React from "react";
import { useSitioList } from "../profiling/queries/profilingFetchQueries";
import { showErrorToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddSitio } from "./queries/administrationAddQueries";
import { useDeleteSitio } from "./queries/administrationDeleteQueries";
import { useUpdateSitio } from "./queries/administrationUpdateQueries";

export default function SitioManagement() {
  // ================== STATE INITIALIZATION ==================
  const [deleteMode, setDeleteMode] = React.useState<boolean>(false);
  const [insertMode, setInsertMode] = React.useState<boolean>(false);
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [_, setIsSubmitting] = React.useState<boolean>(false);
  const [newSitio, setNewSitio] = React.useState<Record<string, any>[]>([
    {
      sitio_id: "",
      sitio_name: "",
    },
  ]);
  const [editedSitio, setEditedSitio] = React.useState<Record<string, any>>({});

  const { data: sitioList, isLoading: _isLoadingSitio } = useSitioList();
  const { mutateAsync: addSitio } = useAddSitio();
  const { mutateAsync: deleteSitio } = useDeleteSitio();
  const { mutateAsync: updateSitio } = useUpdateSitio();

  // ================== HANDLERS ==================
  const handleSitioAdd = (value: string, index: number) => {
    setNewSitio((prev: any) =>
      prev.map((sitio: any, idx: number) => {
        if (idx == index) {
          return {
            sitio_id: value.toLowerCase(),
            sitio_name: value.toUpperCase(),
          };
        }
        return sitio;
      })
    );
  };

  const create = async () => {
    const finalList = newSitio?.filter(
      (sitio) => sitio.sitio_id != "" && sitio.sitio_name != ""
    );
    if (finalList.length == 0) {
      setInsertMode(false);
      setNewSitio([
        {
          sitio_id: "",
          sitio_name: "",
        },
      ]);
      return;
    }

    try {
      setIsSubmitting(true);
      await addSitio(finalList);

      setInsertMode(false);
      setNewSitio([
        {
          sitio_id: "",
          sitio_name: "",
        },
      ]);
    } catch (err) {
      showErrorToast("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const edit = async () => {
    try {
      setIsSubmitting(true);
      await updateSitio(
        Object.entries(editedSitio)
          .filter(([_key, val]) => val != "")
          .map(([key, val]) => ({
            sitio_id: key,
            sitio_name: val,
          }))
      );
      setEditMode(false)
    } catch (err) {
      showErrorToast("Failed to update sitio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (sitio_id: string) => {
    try {
      setIsSubmitting(true);
      await deleteSitio(sitio_id);
    } catch (err) {
      showErrorToast("Failed to remove sitio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================== RENDER ==================
  const RenderList = React.memo(() => (
    <div className="flex flex-wrap h-full max-h-[400px] pb-10 overflow-y-auto gap-4 px-5">
      {sitioList?.map((sitio: { sitio_id: string; sitio_name: string }) => (
        <div key={sitio.sitio_id} className="relative">
          <div className="flex">
            {deleteMode && (
              <ConfirmationModal
                trigger={
                  <div className="absolute top-0 right-[-10px] p-1 bg-red-400/20 rounded-full cursor-pointer">
                    <X size={14} className="text-red-600" />
                  </div>
                }
                title="Confirm Deletion"
                description="Are you sure you want to delete this sitio? Once confirmed, it cannot be undone."
                variant="destructive"
                onClick={() => remove(sitio.sitio_id)}
              />
            )}
          </div>
          <div className="pt-2">
            <p className="py-2 px-3 bg-gray-200 rounded-lg text-sm">
              {sitio.sitio_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  ));

  const RenderCreate = (
    <div className="w-full h-full max-h-[400px] pb-10 overflow-y-auto space-y-2 px-2 py-1">
      {newSitio?.map((sitio: Record<string, any>, index: number) => (
        <div key={index} className="w-full items-center gap-4 space-y-3">
          <div className="relative flex gap-1">
            <Input
              placeholder="Enter sitio name"
              className="w-full focus-visible:ring-0"
              value={sitio.sitio_name}
              onChange={(e) => handleSitioAdd(e.target.value, index)}
            />
            {index > 0 && (
              <Button
                variant={"ghost"}
                className="absolute hover:bg-transparent text-red-500 hover:text-red-500 top-1/2 right-[-5px] transform -translate-y-1/2"
                onClick={() => {
                  setNewSitio((prev) =>
                    prev.filter((_, idx: number) => idx !== index)
                  );
                }}
              >
                <X />
              </Button>
            )}
          </div>
          {index + 1 == newSitio.length && (
            <Button
              variant={"outline"}
              className="text-gray-700 border-none"
              onClick={() => {
                setNewSitio((prev) => [
                  ...prev,
                  {
                    sitio_id: "",
                    sitio_name: "",
                  },
                ]);
              }}
            >
              <Plus /> New Field
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  const RenderEdit = (
    <div className="w-full h-full max-h-[400px] pb-10 overflow-y-auto space-y-4 px-2 py-1">
      {sitioList?.map(
        (sitio: { sitio_id: string; sitio_name: string }, index: number) => (
          <div key={index} className="flex gap-4 items-center">
            <Label className="text-gray-500 font-normal">{index + 1}</Label>
            <div className="flex items-center gap-2">
              <Label>{sitio.sitio_name}</Label>
              <MoveRight />
              <Input
                placeholder="Replace with"
                className="w-full focus-visible:ring-0"
                value={editedSitio[sitio.sitio_id]}
                onChange={(e) => {
                  setEditedSitio((prev) => ({
                    ...prev,
                    [sitio.sitio_id]: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="flex">
      {insertMode ? RenderCreate : editMode ? RenderEdit : <RenderList />}
      <div className="absolute w-full bottom-0 right-0 p-4 bg-white rounded-b-lg">
        <div className="flex justify-end gap-2">
          {!deleteMode ? (
            <Button
              variant={"destructive"}
              className="rounded-full w-7 h-8"
              onClick={() => {
                setDeleteMode((prev) => !prev);
                setInsertMode(false);
                setEditMode(false);
              }}
            >
              <Trash size={18} />
            </Button>
          ) : (
            <Button
              variant={"secondary"}
              className="rounded-full h-8 text-red-600 bg-red-50 hover:bg-red-50"
              onClick={() => setDeleteMode((prev) => !prev)}
            >
              <Ban size={18} />
              Cancel
            </Button>
          )}
          {!editMode ? (
            <Button
              className="rounded-full w-7 h-8"
              onClick={() => {
                setEditMode((prev) => !prev);
                setInsertMode(false);
                setDeleteMode(false);
                setEditedSitio(
                  sitioList?.reduce((acc: any, curr: any) => {
                    acc[curr.sitio_id] = "";
                    return acc;
                  }, {})
                );
              }}
            >
              <Pen size={18} />
            </Button>
          ) : (
            <Button
              variant={"secondary"}
              className="rounded-full h-8 text-green-600 bg-green-100 hover:bg-green-100"
              onClick={() => edit()}
            >
              <Check size={18} />
              Save
            </Button>
          )}
          {!insertMode ? (
            <Button
              className="rounded-full w-7 h-8"
              onClick={() => {
                setInsertMode((prev) => !prev);
                setDeleteMode(false);
                setEditMode(false);
              }}
            >
              <Plus size={18} />
            </Button>
          ) : (
            <Button
              variant={"secondary"}
              className="rounded-full h-8 text-green-600 bg-green-100 hover:bg-green-100"
              onClick={create}
            >
              <Check size={18} />
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
