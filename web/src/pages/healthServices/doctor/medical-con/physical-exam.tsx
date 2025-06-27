"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Edit2, Save, X } from "lucide-react"
import { getPESections, getPEOptions, updatePEOption, createPEResults } from "./restful-api/getAPI"
import { toast } from "sonner"

interface ExamOption {
  pe_option_id: number
  text: string
  checked: boolean
}

interface ExamSection {
  pe_section_id: number
  title: string
  options: ExamOption[]
  isOpen: boolean
}

export default function PhysicalExamForm() {
  const [examSections, setExamSections] = useState<ExamSection[]>([])
  const [editingOption, setEditingOption] = useState<{ sectionId: number; optionId: number } | null>(null)
  const [editText, setEditText] = useState("")
  const [newOptionText, setNewOptionText] = useState<{ [key: number]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [sectionsData, optionsData] = await Promise.all([
          getPESections(),
          getPEOptions()
        ])
        
        const sections: ExamSection[] = sectionsData.map((section: any) => ({
          pe_section_id: section.pe_section_id,
          title: section.title,
          isOpen: false,
          options: []
        }))
        
        optionsData.forEach((option: any) => {
          const section = sections.find(s => s.pe_section_id === option.pe_section)
          if (section) {
            section.options.push({
              pe_option_id: option.pe_option_id,
              text: option.text,
              checked: false
            })
          }
        })
        
        setExamSections(sections)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load physical exam data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const toggleSection = (sectionId: number) => {
    setExamSections((sections) =>
      sections.map((section) => (section.pe_section_id === sectionId ? { ...section, isOpen: !section.isOpen } : section)),
    )
  }

  const toggleOption = (sectionId: number, optionId: number) => {
    setExamSections((sections) =>
      sections.map((section) =>
        section.pe_section_id === sectionId
          ? {
              ...section,
              options: section.options.map((option) =>
                option.pe_option_id === optionId ? { ...option, checked: !option.checked } : option,
              ),
            }
          : section,
      ),
    )
  }

  const startEditing = (sectionId: number, optionId: number, currentText: string) => {
    setEditingOption({ sectionId, optionId })
    setEditText(currentText)
  }

  const saveEdit = async () => {
    if (!editingOption) return

    try {
      await updatePEOption(editingOption.optionId, editText)
      
      setExamSections((sections) =>
        sections.map((section) =>
          section.pe_section_id === editingOption.sectionId
            ? {
                ...section,
                options: section.options.map((option) =>
                  option.pe_option_id === editingOption.optionId ? { ...option, text: editText } : option,
                ),
              }
            : section,
        ),
      )
      setEditingOption(null)
      setEditText("")
      toast.success("Option updated successfully")
    } catch (error) {
      console.error("Failed to update option:", error)
      toast.error("Failed to update option")
    }
  }

  const cancelEdit = () => {
    setEditingOption(null)
    setEditText("")
  }

  const addNewOption = (sectionId: number) => {
    const text = newOptionText[sectionId]?.trim()
    if (!text) return

    const newOption: ExamOption = {
      pe_option_id: Date.now(),
      text,
      checked: false,
    }

    setExamSections((sections) =>
      sections.map((section) =>
        section.pe_section_id === sectionId ? { ...section, options: [...section.options, newOption] } : section,
      ),
    )

    setNewOptionText((prev) => ({ ...prev, [sectionId]: "" }))
  }

  const getSelectedCount = () => {
    return examSections.reduce((total, section) => {
      return total + section.options.filter((option) => option.checked).length
    }, 0)
  }

  const clearAllSelections = () => {
    setExamSections((sections) =>
      sections.map((section) => ({
        ...section,
        options: section.options.map((option) => ({ ...option, checked: false })),
      })),
    )
  }

  const handleSaveExamination = async () => {
    // Get array of just the IDs of selected options
    const selectedOptionIds = examSections.flatMap(section => 
      section.options
        .filter(option => option.checked)
        .map(option => option.pe_option_id))
    
    if (selectedOptionIds.length === 0) {
      toast.warning("Please select at least one examination finding")
      return;
    }
  
    try {
      setIsSaving(true);
      // Send as an array of IDs directly
      await createPEResults(selectedOptionIds);
      toast.success("Physical examination results saved successfully!")
      clearAllSelections();
    } catch (error) {
      console.error("Failed to save examination:", error);
      toast.error("Failed to save examination results")
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading physical exam data...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Physical Examination Form
            <Badge variant="secondary">{getSelectedCount()} items selected</Badge>
          </CardTitle>
          <CardDescription>
            Complete the physical examination by checking applicable findings. You can edit options as needed.
          </CardDescription>
          {getSelectedCount() > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllSelections}>
              Clear All Selections
            </Button>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {examSections.map((section) => (
          <Card key={section.pe_section_id}>
            <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(section.pe_section_id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{section.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {section.options.filter((opt) => opt.checked).length}/{section.options.length}
                      </Badge>
                      {section.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {section.options.map((option) => (
                      <div key={option.pe_option_id} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            id={`option-${option.pe_option_id}`}
                            checked={option.checked}
                            onCheckedChange={() => toggleOption(section.pe_section_id, option.pe_option_id)}
                          />
                          {editingOption?.sectionId === section.pe_section_id && editingOption?.optionId === option.pe_option_id ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEdit}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Label
                              htmlFor={`option-${option.pe_option_id}`}
                              className={`flex-1 cursor-pointer ${option.checked ? "text-primary font-medium" : ""}`}
                            >
                              {option.text}
                            </Label>
                          )}
                        </div>

                        {editingOption?.sectionId !== section.pe_section_id || editingOption?.optionId !== option.pe_option_id ? (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(section.pe_section_id, option.pe_option_id, option.text)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))}

                    <Separator />

                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add new examination finding..."
                        value={newOptionText[section.pe_section_id] || ""}
                        onChange={(e) =>
                          setNewOptionText((prev) => ({
                            ...prev,
                            [section.pe_section_id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addNewOption(section.pe_section_id)
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => addNewOption(section.pe_section_id)}
                        disabled={!newOptionText[section.pe_section_id]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Examination Summary</h3>
              <p className="text-sm text-muted-foreground">
                {getSelectedCount()} findings documented across {examSections.length} body systems
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={handleSaveExamination}
              disabled={isSaving || getSelectedCount() === 0}
            >
              {isSaving ? "Saving..." : "Save Examination"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}