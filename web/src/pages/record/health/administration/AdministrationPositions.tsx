import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { Separator } from "@/components/ui/separator";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { Link, useNavigate } from "react-router";
import { Action, Type } from "./administrationEnums";
import { useDeletePosition } from "../../administration/queries/administrationDeleteQueries";
import {
  ChevronRight,
  Ellipsis,
  Trash,
  Loader2,
  Plus,
  Pen
} from "lucide-react";

export default function AdministrationPositions({
  positions,
  selectedPosition,
  setSelectedPosition,
}: {
  positions: any[]
  selectedPosition: string;
  setSelectedPosition: (value: string) => void;
}) {
  const navigate = useNavigate();
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition();

  // Delete a position
  const handleAction = React.useCallback(
    (value: string) => {
      if (!selectedPosition) return;
      if (value === Action.Delete) handleDelete();
      if (value === Action.Edit) handleEdit();
    }, [selectedPosition]);

  const handleDelete = React.useCallback(() => {
    deletePosition(selectedPosition, {
      onSuccess: () => setSelectedPosition(""),
    });
  }, [selectedPosition, deletePosition]);

  const handleEdit = React.useCallback(() => {
    navigate("/health-administration/role/add-position",
      {state : {
        params: {
          type: Type.Edit,
          title: "Edit Position",
          description: "Apply your changes and click save.",
          data: positions.find((position: any) => position.pos_id == selectedPosition)
        }
      }}
    )
  }, [selectedPosition]);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="w-full flex justify-between items-start">
        <Label className="text-[20px] text-darkBlue1">Positions</Label>
        <Link 
          to="/health-administration/role/add-position"
          state={{
            params: {
              type: Type.Add,
              title: "New Position",
              description: "Fill out all fields to proceed with creating new position."
            }
          }}
        >
          <Button>
            <Plus />
            Add Position
          </Button>
        </Link>
      </div>

      <Separator />
      <div className="w-full flex flex-col gap-2">
        {positions?.length > 1 ? (
          positions.map((value: any) => {
            const exclude = ["Admin"];
            if (!exclude.includes(value.pos_title)) {
              return (
                <div
                  key={value.pos_id}
                  className={`w-full flex justify-between items-center p-3 rounded-md cursor-pointer shadow-sm border
                        ${ value.pos_id == selectedPosition ? "bg-lightBlue" : "hover:bg-lightBlue/40" }`}
                  onClick={() => { setSelectedPosition(value.pos_id) }}
                >
                  <Label className="text-black/80 text-[15px] font-medium">
                    {value.pos_title}  
                    <div className="flex items-center gap-2 text-black/60">
                      <Label className="text-[13px]">Max Holders : </Label> {value.pos_max}
                    </div>
                  </Label>
                  {value.pos_id === selectedPosition ? (
                    !isDeleting ? (
                      // Change elipsis to loader if is deleting
                      <DropdownLayout
                        trigger={<Ellipsis size={20} />}
                        options={[
                          {
                            id: "delete",
                            name: "Delete",
                            icon: <Trash />,
                            variant: "delete",
                          },
                          {
                            id: "edit",
                            name: "Edit",
                            icon: <Pen />,
                            variant: "default",
                          },
                        ]}
                        onSelect={handleAction}
                      />
                    ) : (
                      <Loader2 size={22} className="animate-spin opacity-50" />
                    )
                  ) : (
                    <ChevronRight size={20} className="text-black/80" />
                  )}
                </div>
              );
            }
          })
        ) : (
          <Label className="text-[15px] text-black/60">No position added</Label>
        )}
      </div>
    </div>
  );
}
