import React from "react";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  Ellipsis,
  Trash,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Separator } from "@/components/ui/separator";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { deletePosition } from "./restful-api/administrationDeleteAPI";
import { Position } from "./administrationTypes";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import AddPosition from "./AddPosition";
import { Link } from "react-router";

export default function AdministrationPositions({
  positions,
  setPositions,
  selectedPosition,
  setSelectedPosition,
}: {
  positions: Position[];
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  selectedPosition: string;
  setSelectedPosition: (value: string) => void;
}) {
  
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false)

  // Delete a position
  const handleDeletePosition = React.useCallback(async () => {
    setIsDeleting(true);

    const res = await deletePosition(selectedPosition);
    if (res?.status === 204) {
      setPositions((prev) =>
        prev.filter((position) => position.id !== selectedPosition)
      );

      setSelectedPosition("");
      setIsDeleting(false);
    }
  }, [selectedPosition]);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="w-full flex justify-between items-start">
        <Label className="text-[20px] text-darkBlue1">Positions</Label>
        <Link to='/administration/role/add-position'>
          <Button>
            <Plus/>Add Position
          </Button>
        </Link>
      </div>

      <Separator />
      <div className="w-full flex flex-col">   
        {positions?.length > 1 ? (positions.map((value: any) => {
          const exclude = ["Admin"];

          if (!exclude.includes(value.name)) {
            return (
              <div
                key={value.id}
                className={`w-full flex justify-between items-center hover:bg-lightBlue/40 p-3 rounded-md cursor-pointer 
                        ${value.id == selectedPosition ? "bg-lightBlue" : ""}`}
                onClick={() => {
                  setSelectedPosition(value.id);
                }}
              >
                <Label className="text-black/80 text-[15px] font-medium">
                  {value.name}
                </Label>
                {value.id === selectedPosition ? (
                  !isDeleting ? (
                    // Change elipsis to loader if is deleting
                    <DropdownLayout
                      trigger={<Ellipsis size={20} />}
                      itemClassName="text-red-500 focus:text-red-500"
                      options={[
                        {
                          id: "delete",
                          name: "Delete",
                          icon: <Trash />,
                        },
                      ]}
                      onSelect={handleDeletePosition}
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
        })) : (
          <Label className="text-[15px] text-black/60">
            No position added
          </Label>
        )}
      </div>
    </div>
  );
}
