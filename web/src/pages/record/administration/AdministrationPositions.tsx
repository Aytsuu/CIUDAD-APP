import React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { useNavigate } from "react-router"
import { Action, Type } from "./AdministrationEnums"
import { useDeletePosition } from "./queries/administrationDeleteQueries"
import { ChevronRight, Ellipsis, Trash, Loader2, Plus, Pen, Users, FolderOpen } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const { mutateAsync: deletePosition, isPending: isDeleting } = useDeletePosition()

  // Check if any deletion is in progress
  const isDeletingAny = isDeleting

  // Group positions by category with filtering logic
  const groupedPositions = React.useMemo(() => {
    const filtered =
      positions?.filter((position: any) => {
        const exclude = ["Admin"]
        if (exclude.includes(position.pos_title)) {
          return false
        }

        // Backend already handles filtering based on staff_type
        // Frontend just needs to exclude Admin positions
        return true
      }) || []

    return filtered.reduce((acc: Record<string, any[]>, position: any) => {
      // Use 'Other' category for positions without a group
      const category = position.pos_group || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(position)
      return acc
    }, {})
  }, [positions])

  // Delete a position
  const handleAction = React.useCallback(
    (value: string) => {
      if (!selectedPosition) return
      if (value === Action.Delete) handleDelete()
      if (value === Action.Edit) handleEdit()
    },
    [selectedPosition],
  )

  const handleDelete = React.useCallback(async () => {
    if (!selectedPosition) return
    
    try {
      // Delete position (API handles dual database deletion)
      await deletePosition(selectedPosition)
      
      // Clear selection after successful deletion
      setSelectedPosition("")
    } catch (error) {
      console.error("Error deleting position:", error)
      // Handle error appropriately - you might want to show a toast notification
    }
  }, [selectedPosition, deletePosition, setSelectedPosition])

  const handleEdit = React.useCallback(() => {
    navigate("position", {
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

  const handleCreateSelect = (value: string) => {
    if(value === "new") {
      navigate('position', {
        state: {
          params: {
            type: Type.Add,
            title: "New Position",
            description: "Fill out all fields to proceed with creating new position.",
          }
        }
      })
    } else {
      navigate('group-position', {
        state: {
          params: {
            type: Type.Add,
            title: "New Group",
            description: "Fill out all fields to proceed with creating new group.",
          }
        }
      })
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <Label className="text-[20px] text-darkBlue1 font-semibold">Positions</Label>
          <Label className="text-sm text-black/60">Manage barangay positions</Label>
        </div>
        <DropdownLayout 
          trigger={<Button className="gap-2 text-[13px] h-8 w-22">
            <Plus className="w-4 h-4" />
            Create
          </Button>}
          options={[
            {
              id: 'new',
              name: 'New Position',
              variant: 'default'
            },
            {
              id: 'group',
              name: 'New Group',
              variant: 'default'
            },
          ]}  
          onSelect={handleCreateSelect}
        />
      </div>

      <Separator />

      {/* Positions grouped by category - Accordion */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="w-full pr-4 pt-1 pb-16">
          {Object.keys(groupedPositions).length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {Object.entries(groupedPositions).map(([category, categoryPositions]) => {
                const isSelected = categoryPositions.find((pos: any) => pos.pos_id == selectedPosition)
                
                return (
                  <AccordionItem key={category} value={category} className="border-none">
                    <Card className="w-full">
                      <AccordionTrigger className={`hover:no-underline p-0 pr-5 ${isSelected && 'bg-blue-50'}`}>
                        <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors pb-4 w-full">
                          <CardTitle className="flex items-center justify-between text-base">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{category}</span>
                              </div>
                              <Badge variant="secondary" className={`text-xs bg-green-100 text-green-800 border-green-200`}>
                                {categoryPositions.length} position{categoryPositions.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                      </AccordionTrigger>

                      <AccordionContent className="pb-0 mt-3">
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
                                  <Label className="text-black/90 text-sm font-medium">{position.pos_title}</Label>
                                  <div className="flex items-center gap-4 text-black/60">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <Label className="text-[12px]">Position Holders: {position.total_holders}/{position.pos_max}</Label>
                                    </div>
                                    {position.is_maxed && 
                                      <Badge variant={"secondary"} className="bg-red-100 border-red-200 text-red-800 hover:bg-red-100 rounded-full">
                                        full
                                      </Badge>} 
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {position.pos_id === selectedPosition ? (
                                    !isDeletingAny ? (
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
                                            disabled: position.pos_is_predefined
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
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )
              })}
            </Accordion>
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
      </ScrollArea>
    </div>
  )
}