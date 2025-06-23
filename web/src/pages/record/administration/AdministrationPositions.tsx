import React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { Link, useNavigate } from "react-router"
import { Action, Type } from "./administrationEnums"
import { useDeletePosition } from "./queries/administrationDeleteQueries"
import { ChevronRight, ChevronDown, Ellipsis, Trash, Loader2, Plus, Pen, Users, FolderOpen } from "lucide-react"

export default function AdministrationPositions({
  positions,
  selectedPosition,
  setSelectedPosition,
}: {
  positions: any[]
  selectedPosition: string
  setSelectedPosition: (value: string) => void
}) {
  const navigate = useNavigate()
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition()
  const [openCategories, setOpenCategories] = React.useState<Set<string>>(new Set())

  // Group positions by category
  const groupedPositions = React.useMemo(() => {
    const filtered =
      positions?.filter((position: any) => {
        const exclude = ["Admin"]
        return !exclude.includes(position.pos_title)
      }) || []

    return filtered.reduce((acc: Record<string, any[]>, position: any) => {
      const category = position.pos_category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(position)
      return acc
    }, {})
  }, [positions])

  // Initialize all categories as open
  React.useEffect(() => {
    const categories = Object.keys(groupedPositions)
    setOpenCategories(new Set(categories))
  }, [groupedPositions])

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Delete a position
  const handleAction = React.useCallback(
    (value: string) => {
      if (!selectedPosition) return
      if (value === Action.Delete) handleDelete()
      if (value === Action.Edit) handleEdit()
    },
    [selectedPosition],
  )

  const handleDelete = React.useCallback(() => {
    deletePosition(selectedPosition, {
      onSuccess: () => setSelectedPosition(""),
    })
  }, [selectedPosition, deletePosition])

  const handleEdit = React.useCallback(() => {
    navigate("/administration/role/add-position", {
      state: {
        params: {
          type: Type.Edit,
          title: "Edit Position",
          description: "Apply your changes and click save.",
          data: positions.find((position: any) => position.pos_id == selectedPosition),
        },
      },
    })
  }, [selectedPosition])

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <Label className="text-[20px] text-darkBlue1 font-semibold">Positions</Label>
          <Label className="text-sm text-black/60">Manage barangay positions</Label>
        </div>
        <Link
          to="/administration/role/add-position"
          state={{
            params: {
              type: Type.Add,
              title: "New Position",
              description: "Fill out all fields to proceed with creating new position.",
            },
          }}
        >
          <Button className="gap-2 text-[13px] h-8 w-22">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Positions grouped by category */}
      <div className="w-full flex flex-col gap-4">
        {Object.keys(groupedPositions).length > 0 ? (
          Object.entries(groupedPositions).map(([category, categoryPositions]) => (
            <Card key={category} className="w-full">
              <Collapsible open={openCategories.has(category)} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category}</span>
                        </div>
                        <Badge variant="secondary" className={`text-xs bg-green-100 text-green-800 border-green-200`}>
                          {categoryPositions.length} position{categoryPositions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {openCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-2">
                      {categoryPositions.map((position: any) => (
                        <div
                          key={position.pos_id}
                          className={`w-full flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border
                                ${
                                  position.pos_id == selectedPosition
                                    ? "bg-lightBlue border-blue-200 shadow-sm"
                                    : "hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                                }`}
                          onClick={() => {
                            setSelectedPosition(position.pos_id)
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <Label className="text-black/90 text-[15px] font-medium">{position.pos_title}</Label>
                            <div className="flex items-center gap-4 text-black/60">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <Label className="text-[12px]">Max: {position.pos_max}</Label>
                              </div>
                              {position.staff && (
                                <div className="flex items-center gap-1">
                                  <Label className="text-[12px]">Current: {position.staff}</Label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {position.pos_id === selectedPosition ? (
                              !isDeleting ? (
                                <DropdownLayout
                                  trigger={
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Ellipsis className="w-4 h-4" />
                                    </Button>
                                  }
                                  options={[
                                    {
                                      id: "edit",
                                      name: "Edit",
                                      icon: <Pen className="w-4 h-4" />,
                                      variant: "default",
                                    },
                                    {
                                      id: "delete",
                                      name: "Delete",
                                      icon: <Trash className="w-4 h-4" />,
                                      variant: "delete",
                                    },
                                  ]}
                                  onSelect={handleAction}
                                />
                              ) : (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                              )
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        ) : (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
              <Label className="text-[16px] text-black/60 mb-2">No positions added</Label>
              <Label className="text-[14px] text-black/40">Create your first position to get started</Label>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}