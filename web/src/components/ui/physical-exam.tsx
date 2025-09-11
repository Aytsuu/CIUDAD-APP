// import { useState } from "react";
// import { useFormContext } from "react-hook-form";
// import { toast } from "sonner";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button/button";
// import { Edit2, Plus, Save, X, ChevronDown, ChevronRight } from "lucide-react";
// import {
//   updatePEOption,
  
// } from "@/pages/healthServices/doctor/medical-con/restful-api/update";
// import {
//   createPEOption,
// } from "@/pages/healthServices/doctor/medical-con/restful-api/create";

// interface ExamOption {
//   pe_option_id: number;
//   text: string;
//   checked: boolean;
// }

// interface ExamSection {
//   pe_section_id: number;
//   title: string;
//   options: ExamOption[];
//   isOpen: boolean;
// }

// interface PhysicalExamProps {
//   examSections: ExamSection[];
//   setExamSections: (sections: ExamSection[]) => void;
// }

// export function PhysicalExam({ examSections, setExamSections }: PhysicalExamProps) {
//   const { setValue, getValues } = useFormContext();
//   const [editingOption, setEditingOption] = useState<{
//     sectionId: number;
//     optionId: number;
//   } | null>(null);
//   const [editText, setEditText] = useState("");
//   const [newOptionText, setNewOptionText] = useState<{ [key: number]: string }>({});

//   const generateObjSummaryText = (sections: ExamSection[]) => {
//     const selectedOptions = sections.flatMap((section) =>
//       section.options
//         .filter((option) => option.checked)
//         .map((option) => `- ${section.title}: ${option.text}`)
//     );
//     return selectedOptions.join("\n");
//   };

//   const toggleSection = (sectionId: number) => {
//     setExamSections(
//       examSections.map((section) =>
//         section.pe_section_id === sectionId
//           ? { ...section, isOpen: !section.isOpen }
//           : section
//       )
//     );
//   };

//   const toggleOption = (sectionId: number, optionId: number) => {
//     const updatedSections = examSections.map((section) =>
//       section.pe_section_id === sectionId
//         ? {
//             ...section,
//             options: section.options.map((option) =>
//               option.pe_option_id === optionId
//                 ? { ...option, checked: !option.checked }
//                 : option
//             ),
//           }
//         : section
//     );

//     setExamSections(updatedSections);

//     const currentResults = getValues("physicalExamResults") || [];
//     let newResults;
//     if (currentResults.includes(optionId)) {
//       newResults = currentResults.filter((id: any) => id !== optionId);
//     } else {
//       newResults = [...currentResults, optionId];
//     }

//     setValue("physicalExamResults", newResults);

//     const objSummaryText = generateObjSummaryText(updatedSections);
//     setValue("obj_summary", objSummaryText);
//   };

//   const startEditing = (
//     sectionId: number,
//     optionId: number,
//     currentText: string
//   ) => {
//     setEditingOption({ sectionId, optionId });
//     setEditText(currentText);
//   };

//   const saveEdit = async () => {
//     if (!editingOption) return;

//     try {
//       await updatePEOption(editingOption.optionId, editText);

//       setExamSections(
//         examSections.map((section) =>
//           section.pe_section_id === editingOption.sectionId
//             ? {
//                 ...section,
//                 options: section.options.map((option) =>
//                   option.pe_option_id === editingOption.optionId
//                     ? { ...option, text: editText }
//                     : option
//                 ),
//               }
//             : section
//         )
//       );

//       const objSummaryText = generateObjSummaryText(examSections);
//       setValue("obj_summary", objSummaryText);

//       setEditingOption(null);
//       setEditText("");
//       toast.success("Option updated successfully");
//     } catch (error) {
//       console.error("Failed to update option:", error);
//       toast.error("Failed to update option");
//     }
//   };

//   const cancelEdit = () => {
//     setEditingOption(null);
//     setEditText("");
//   };


//   const addNewOption = async (sectionId: number) => {
//     const text = newOptionText[sectionId]?.trim();
//     if (!text) return;
  
//     // Check if the option already exists in this section
//     const section = examSections.find(s => s.pe_section_id === sectionId);
//     if (section) {
//       const optionExists = section.options.some(
//         option => option.text.toLowerCase() === text.toLowerCase()
//       );
  
//       if (optionExists) {
//         toast.error("This finding already exists in this section");
//         return;
//       }
//     }
  
//     try {
//       const response = await createPEOption(sectionId, text);
  
//       const newOption: ExamOption = {
//         pe_option_id: response.pe_option_id,
//         text: response.text,
//         checked: false,
//       };
  
//       setExamSections(
//         examSections.map((section) =>
//           section.pe_section_id === sectionId
//             ? { ...section, options: [...section.options, newOption] }
//             : section
//         )
//       );
  
//       setNewOptionText((prev) => ({ ...prev, [sectionId]: "" }));
//       toast.success("Option created successfully");
//     } catch (error) {
//       console.error("Failed to create option:", error);
//       toast.error("Failed to create option");
//     }
//   };  

//   const getSelectedCount = () => {
//     return examSections.reduce((total, section) => {
//       return total + section.options.filter((option) => option.checked).length;
//     }, 0);
//   };

//   const clearAllSelections = () => {
//     const clearedSections = examSections.map((section) => ({
//       ...section,
//       options: section.options.map((option) => ({
//         ...option,
//         checked: false,
//       })),
//     }));
//     setExamSections(clearedSections);
//     setValue("physicalExamResults", []);
//     setValue("obj_summary", "");
//   };

//   return (
//     <Card className="w-full overflow-hidden shadow-sm">
//       <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
//             <CardTitle className="text-base sm:text-lg font-medium text-gray-900">
//               Physical Examination
//             </CardTitle>
//             <Badge
//               variant={getSelectedCount() > 0 ? "default" : "secondary"}
//               className="text-xs self-start sm:self-center"
//             >
//               {getSelectedCount()} selected
//             </Badge>
//           </div>
//           <div className="flex gap-2 self-end sm:self-center">
//             {getSelectedCount() > 0 && (
//               <Button
//                 variant="outline"
//                 type="button"
//                 size="sm"
//                 onClick={clearAllSelections}
//                 className="h-8 px-2 text-xs sm:text-sm"
//               >
//                 <X className="h-3 w-3 mr-1" />
//                 Clear All
//               </Button>
//             )}
//           </div>
//         </div>
//         <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
//           Document physical examination findings
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
//         <div className="space-y-4">
//           {/* Main grid container */}
//           <div className="w-full overflow-hidden">
//             <div
//               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 bg-gray-50/50 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
//             >
//               {examSections.map((section) => (
//                 <Card
//                   key={section.pe_section_id}
//                   className="border border-gray-200 shadow-sm bg-white w-full min-w-0 overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   <Collapsible
//                     open={section.isOpen}
//                     onOpenChange={() => toggleSection(section.pe_section_id)}
//                   >
//                     <CollapsibleTrigger asChild>
//                       <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-2 px-3 sm:py-3 sm:px-4">
//                         <div className="flex items-center justify-between w-full min-w-0">
//                           <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
//                             <span className="font-medium text-sm text-gray-900 truncate flex-1 min-w-0">
//                               {section.title}
//                             </span>
//                             <Badge
//                               variant={
//                                 section.options.filter((opt) => opt.checked)
//                                   .length > 0
//                                   ? "default"
//                                   : "outline"
//                               }
//                               className="text-xs px-1.5 py-0.5 flex-shrink-0"
//                             >
//                               {
//                                 section.options.filter((opt) => opt.checked)
//                                   .length
//                               }
//                             </Badge>
//                           </div>
//                           {section.isOpen ? (
//                             <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
//                           ) : (
//                             <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
//                           )}
//                         </div>
//                       </CardHeader>
//                     </CollapsibleTrigger>

//                     <CollapsibleContent>
//                       <CardContent className="pt-0 px-3 sm:px-4 pb-2 sm:pb-3">
//                         <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
//                           {section.options.map((option) => (
//                             <div
//                               key={option.pe_option_id}
//                               className="flex items-start justify-between group hover:bg-gray-50 rounded p-1 -mx-1"
//                             >
//                               <div className="flex items-start space-x-2 flex-1 min-w-0 overflow-hidden">
//                                 <Checkbox
//                                   className="h-4 w-4 border border-zinc-400 mt-0.5"
//                                   id={`option-${option.pe_option_id}`}
//                                   checked={option.checked}
//                                   onCheckedChange={() =>
//                                     toggleOption(
//                                       section.pe_section_id,
//                                       option.pe_option_id
//                                     )
//                                   }
//                                 />

//                                 {editingOption?.sectionId ===
//                                   section.pe_section_id &&
//                                 editingOption?.optionId ===
//                                   option.pe_option_id ? (
//                                   <div className="flex items-center gap-1 flex-1 min-w-0">
//                                     <Input
//                                       value={editText}
//                                       onChange={(e) =>
//                                         setEditText(e.target.value)
//                                       }
//                                       className="flex-1 h-8 text-sm"
//                                       onKeyDown={(e) => {
//                                         if (e.key === "Enter") saveEdit();
//                                         if (e.key === "Escape") cancelEdit();
//                                       }}
//                                       autoFocus
//                                     />
//                                     <Button
//                                       size="sm"
//                                       onClick={saveEdit}
//                                       type="button"
//                                       className="h-8 w-8 p-0"
//                                     >
//                                       <Save className="h-4 w-4" />
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="outline"
//                                       type="button"
//                                       onClick={cancelEdit}
//                                       className="h-8 w-8 p-0"
//                                     >
//                                       <X className="h-4 w-4" />
//                                     </Button>
//                                   </div>
//                                 ) : (
//                                   <Label
//                                     htmlFor={`option-${option.pe_option_id}`}
//                                     className={`flex-1 cursor-pointer text-sm leading-normal min-w-0 ${
//                                       option.checked
//                                         ? "text-primary font-medium"
//                                         : "text-gray-700 hover:text-gray-900"
//                                     }`}
//                                   >
//                                     {option.text}
//                                   </Label>
//                                 )}
//                               </div>

//                               {editingOption?.sectionId !==
//                                 section.pe_section_id ||
//                               editingOption?.optionId !==
//                                 option.pe_option_id ? (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   onClick={() =>
//                                     startEditing(
//                                       section.pe_section_id,
//                                       option.pe_option_id,
//                                       option.text
//                                     )
//                                   }
//                                   type="button"
//                                   className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 flex-shrink-0"
//                                 >
//                                   <Edit2 className="h-3.5 w-3.5" />
//                                 </Button>
//                               ) : null}
//                             </div>
//                           ))}

//                           <div className="pt-2 border-t border-gray-100">
//                             <div className="flex items-center gap-1 mb-2 px-1">
//                               <Input
//                                 placeholder="Add new finding..."
//                                 value={
//                                   newOptionText[section.pe_section_id] || ""
//                                 }
//                                 onChange={(e) =>
//                                   setNewOptionText((prev) => ({
//                                     ...prev,
//                                     [section.pe_section_id]: e.target.value,
//                                   }))
//                                 }
//                                 onKeyDown={(e) => {
//                                   if (e.key === "Enter")
//                                     addNewOption(section.pe_section_id);
//                                 }}
//                                 className="flex-1 h-8 text-sm"
//                               />
//                               <Button
//                                 size="sm"
//                                 onClick={() =>
//                                   addNewOption(section.pe_section_id)
//                                 }
//                                 disabled={
//                                   !newOptionText[section.pe_section_id]?.trim()
//                                 }
//                                 type="button"
//                                 className="h-8 w-8 p-0"
//                               >
//                                 <Plus className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </CollapsibleContent>
//                   </Collapsible>
//                 </Card>
//               ))}
//             </div>

//             {getSelectedCount() > 0 && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg mt-4 p-3">
//                 <Collapsible>
//                   <CollapsibleTrigger asChild>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="w-full justify-between p-0 h-auto"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-blue-900">
//                           Selected Findings ({getSelectedCount()})
//                         </span>
//                         <Badge
//                           variant="secondary"
//                           className="bg-blue-500 text-white text-xs"
//                         >
//                           Click to view
//                         </Badge>
//                       </div>
//                       <ChevronDown className="h-4 w-4 text-blue-600" />
//                     </Button>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent>
//                     <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
//                       {examSections.map((section) =>
//                         section.options
//                           .filter((option) => option.checked)
//                           .map((option) => (
//                             <div
//                               key={option.pe_option_id}
//                               className="flex items-start gap-2 text-sm"
//                             >
//                               <span className="text-blue-600 font-medium min-w-max">
//                                 {section.title}:
//                               </span>
//                               <span className="text-blue-900 break-words">
//                                 {option.text}
//                               </span>
//                             </div>
//                           ))
//                       )}
//                     </div>
//                   </CollapsibleContent>
//                 </Collapsible>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-2 sm:gap-0">
//               <div className="text-xs text-gray-500">
//                 {examSections.length} sections available
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     setExamSections(examSections.map((section) => ({
//                       ...section,
//                       isOpen: true,
//                     })));
//                   }}
//                   className="text-xs px-3 h-8"
//                 >
//                   Expand All
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   type="button"
//                   onClick={() => {
//                     setExamSections(examSections.map((section) => ({
//                       ...section,
//                       isOpen: false,
//                     })));
//                   }}
//                   className="text-xs px-3 h-8"
//                 >
//                   Collapse All
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }