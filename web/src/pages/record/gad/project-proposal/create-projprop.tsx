import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { jsPDF } from "jspdf";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { useAddProjectProposal, useAddSupportDocument} from "./queries/addqueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetStaffList } from "./queries/fetchqueries";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { ProjectProposalSchema } from "@/form-schema/gad-projprop-create-form-schema";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

export interface ProjectProposalFormProps {
  onSuccess: () => void;
  existingProposal?: any;
}

interface Signatory {
  name: string;
  position: string;
  type: "prepared" | "approved";
}

export const ProjectProposalForm: React.FC<ProjectProposalFormProps> = ({
  onSuccess,
  existingProposal,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [supportingDocs, setSupportingDocs] = useState<MediaUploadType>([]);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const addSupportDocMutation = useAddSupportDocument();

  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const addMutation = useAddProjectProposal();

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof ProjectProposalSchema>>({
    resolver: zodResolver(ProjectProposalSchema),
    defaultValues: {
      projectTitle: "",
      background: "",
      objectives: [""],
      participants: [{ category: "", count: "0" }],
      date: "",
      venue: "",
      budgetItems: [{ name: "", pax: "", amount: "0" }],
      monitoringEvaluation: "",
      signatories: [{ name: "", position: "", type: "prepared" }],
      paperSize: "letter",
      headerImage: [],
      supportingDocs: [],
    },
  });

  const { control, setValue, watch, handleSubmit } = form;

  // Sync local state with form state
  const projectTitle = watch("projectTitle");
  const background = watch("background");
  const objectives = watch("objectives");
  const participants = watch("participants");
  const date = watch("date");
  const venue = watch("venue");
  const budgetItems = watch("budgetItems");
  const monitoringEvaluation = watch("monitoringEvaluation");
  const signatories = watch("signatories");
  const paperSize = watch("paperSize");

  const participantCategories = [
    "Women",
    "LGBTQIA+",
    "Responsible Person",
    "Senior",
    "PWD",
    "Solo Parent",
    "Erpat",
    "Children",
    "Barangay Staff",
    "GAD Staff",
  ];

  const addParticipant = () => {
    const newParticipants = [...participants, { category: "", count: "0" }];
    setValue("participants", newParticipants);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setValue("participants", newParticipants);
    }
  };

  const addBudgetItem = () => {
    const newItems = [...budgetItems, { name: "", pax: "", amount: "0" }];
    setValue("budgetItems", newItems);
  };

  const removeBudgetItem = (index: number) => {
    if (budgetItems.length > 1) {
      const newItems = [...budgetItems];
      newItems.splice(index, 1);
      setValue("budgetItems", newItems);
    }
  };

  const addObjective = () => {
    const newObjectives = [...objectives, ""];
    setValue("objectives", newObjectives);
  };

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      const newObjectives = [...objectives];
      newObjectives.splice(index, 1);
      setValue("objectives", newObjectives);
    }
  };

  const addSignatory = (type: "prepared" | "approved") => {
    const newSignatories = [...signatories, { name: "", position: "", type }];
    setValue("signatories", newSignatories);
  };

  const removeSignatory = (index: number) => {
    if (signatories.length > 1) {
      const newSignatories = [...signatories];
      newSignatories.splice(index, 1);
      setValue("signatories", newSignatories);
    }
  };

  const updateSignatory = (
    index: number,
    field: keyof Signatory,
    value: string,
    position?: string
  ) => {
    setValue(`signatories.${index}.${field}`, value);
    if (position && field === "name") {
      setValue(`signatories.${index}.position`, position);
    }
  };

  const generatePDF = async (preview = false) => {
    const pageSize = {
      a4: [595.28, 841.89],
      letter: [612, 792],
      legal: [612, 1008],
    }[paperSize] || [595.28, 841.89];

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: pageSize,
    });

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const margin = 72;
    let yPos = margin;
    const pageWidth = pageSize[0];
    const pageHeight = pageSize[1] - margin * 2;
    const lineHeight = 14;
    const sectionGap = 20;
    const signatureColumnWidth = 200;

    const addTextWithPageBreak = (
      text: string,
      x: number,
      y: number,
      maxWidth: number
    ) => {
      const displayText = text || "N/A";
      const splitText = doc.splitTextToSize(displayText, maxWidth);
      for (let i = 0; i < splitText.length; i++) {
        if (y + lineHeight > pageHeight) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitText[i], x, y);
        y += lineHeight;
      }
      return y;
    };

    const addSectionTitle = (title: string, y: number) => {
      doc.setFont("times", "bold");
      y = addTextWithPageBreak(title, margin, y, pageWidth - margin * 2);
      doc.setFont("times", "normal");
      return y + lineHeight;
    };

    if (headerImageUrl) {
      try {
        let dataUrl = headerImageUrl;
        if (!headerImageUrl.startsWith("data:image")) {
          const response = await fetch(headerImageUrl, {
            mode: "cors",
            headers: {
              Accept: "image/*",
            },
          });
          if (!response.ok)
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          const blob = await response.blob();
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(blob);
          });
        }

        if (dataUrl && dataUrl.startsWith("data:image")) {
          const img = new Image();
          img.src = dataUrl;
          await new Promise<void>((resolve) => {
            img.onload = () => {
              const imgWidth = pageWidth - margin * 2;
              const imgHeight = (img.height / img.width) * imgWidth;
              const maxHeight = 80;
              const scaleFactor = Math.min(1, maxHeight / imgHeight);
              const finalHeight = imgHeight * scaleFactor;
              doc.addImage(
                dataUrl,
                "JPEG",
                margin,
                margin,
                imgWidth,
                finalHeight
              );
              yPos += finalHeight + 20;
              resolve();
            };
            img.onerror = () => resolve();
          });
        }
      } catch (e) {
        console.error("Error processing header image for PDF:", e);
      }
    }

    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleWidth = doc.getTextWidth("PROJECT PROPOSAL");
    doc.text("PROJECT PROPOSAL", (pageWidth - titleWidth) / 2, yPos);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    yPos += sectionGap + lineHeight;

    yPos = addSectionTitle("Project Title:", yPos);
    yPos = addTextWithPageBreak(projectTitle || "Untitled", margin, yPos, pageWidth - margin * 2);
    yPos += sectionGap;

    yPos = addSectionTitle("Background:", yPos);
    yPos = addTextWithPageBreak(background || "No background provided", margin, yPos, pageWidth - margin * 2);
    yPos += sectionGap;

    yPos = addSectionTitle("Objectives:", yPos);
    if (objectives.length === 0 || objectives.every(obj => !obj.trim())) {
      yPos = addTextWithPageBreak("No objectives provided", margin + 10, yPos, pageWidth - margin * 2 - 10);
    } else {
      objectives.forEach((obj) => {
        if (obj.trim()) {
          yPos = addTextWithPageBreak(`• ${obj}`, margin + 10, yPos, pageWidth - margin * 2 - 10);
        }
      });
    }
    yPos += sectionGap;

    yPos = addSectionTitle("Participants:", yPos);
    if (participants.length === 0 || participants.every(p => !p.category.trim())) {
      yPos = addTextWithPageBreak("No participants provided", margin, yPos, pageWidth - margin * 2);
    } else {
      participants.forEach((participant) => {
        if (participant.category.trim()) {
          const text = `${participant.count || "0"} ${participant.category}`;
          yPos = addTextWithPageBreak(text, margin, yPos, pageWidth - margin * 2);
        }
      });
    }
    yPos += sectionGap;

    yPos = addSectionTitle("Date and Venue:", yPos);
    yPos = addTextWithPageBreak(date || "No date provided", margin, yPos, pageWidth - margin * 2);
    yPos = addTextWithPageBreak(venue || "No venue provided", margin, yPos, pageWidth - margin * 2);
    yPos += sectionGap;

    yPos = addSectionTitle("Budgetary Requirements:", yPos);
    const tableCols = [200, 80, 80, 80];
    const tableStartX = margin;

    const addTableRow = (
      row: string[],
      y: number,
      isHeader: boolean = false
    ) => {
      if (y + lineHeight > pageHeight) {
        doc.addPage();
        y = margin;
      }

      if (isHeader) doc.setFont("times", "bold");

      let x = tableStartX;
      let maxCellHeight = lineHeight;
      const cellHeights = row.map((cell, i) => {
        const colWidth = tableCols[i];
        const text = doc.splitTextToSize(cell, colWidth - 10);
        return text.length * lineHeight;
      });
      maxCellHeight = Math.max(...cellHeights, lineHeight);

      row.forEach((cell, i) => {
        const colWidth = tableCols[i];
        const text = doc.splitTextToSize(cell, colWidth - 10);
        let textY = y;
        text.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0 && textY + lineHeight > pageHeight) {
            doc.addPage();
            textY = margin;
          }
          doc.text(line, x + 5, textY + lineIndex * lineHeight);
        });
        doc.rect(x, y - lineHeight + 2, colWidth, maxCellHeight, "S");
        x += colWidth;
      });

      if (isHeader) doc.setFont("times", "normal");

      return y + maxCellHeight;
    };

    yPos = addTableRow(["Name", "Pax", "Amount", "Total"], yPos, true);

    let grandTotal = 0;
    if (budgetItems.length === 0 || budgetItems.every(item => !item.name.trim())) {
      yPos = addTableRow(["No budget items provided", "", "", ""], yPos);
    } else {
      budgetItems.forEach((item) => {
        if (item.name.trim()) {
          const amount = parseFloat(item.amount) || 0;
          const paxCount = item.pax.trim() && item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1;
          const total = paxCount * amount;
          grandTotal += total;
          yPos = addTableRow(
            [
              item.name,
              item.pax || "N/A",
              amount ? `(${amount.toFixed(2)})` : "(0.00)",
              total.toLocaleString(),
            ],
            yPos
          );
        }
      });
    }

    doc.setFont("times", "bold");
    yPos = addTableRow(
      [
        "",
        "",
        "TOTAL",
        grandTotal ? `P ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "P 0.00",
      ],
      yPos
    );
    doc.setFont("times", "normal");
    yPos += sectionGap;

    yPos = addSectionTitle("Monitoring Evaluation:", yPos);
    yPos = addTextWithPageBreak(monitoringEvaluation || "No evaluation provided", margin, yPos, pageWidth - margin * 2);
    yPos += sectionGap;

    const preparedBy = signatories.filter((s) => s.type === "prepared");
    const approvedBy = signatories.filter((s) => s.type === "approved");

    const preparedHeight = preparedBy.length * 60;
    const approvedHeight =
      approvedBy.length * 60 +
      (approvedBy.length > 1 ? (approvedBy.length - 1) * 40 : 0);
    const maxSignatureHeight = Math.max(preparedHeight, approvedHeight);

    if (yPos + maxSignatureHeight + 20 > pageHeight) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont("times", "bold");
    doc.text("Prepared by:", margin, yPos);
    doc.text("Approved by:", margin + 250, yPos);
    yPos += 40;

    if (preparedBy.length === 0) {
      doc.setFont("times", "normal");
      doc.text("No preparers assigned", margin, yPos);
    } else {
      preparedBy.forEach((sig, i) => {
        if (sig.name.trim()) {
          const nameWidth = doc.getTextWidth(sig.name);
          const positionWidth = doc.getTextWidth(sig.position);
          doc.setFont("times", "normal");
          const nameX = margin + (signatureColumnWidth - nameWidth) / 2;
          doc.text(sig.name, nameX, yPos + i * 60);
          doc.setFont("times", "bold");
          const positionX = margin + (signatureColumnWidth - positionWidth) / 2;
          doc.text(sig.position || "N/A", positionX, yPos + i * 60 + 20);
          doc.setDrawColor(200, 200, 200);
        }
      });
    }

    if (approvedBy.length === 0) {
      doc.setFont("times", "normal");
      doc.text("No approvers assigned", margin + 250, yPos);
    } else {
      approvedBy.forEach((sig, i) => {
        if (sig.name.trim()) {
          const nameWidth = doc.getTextWidth(sig.name);
          const positionWidth = doc.getTextWidth(sig.position);
          doc.setFont("times", "normal");
          const nameX = margin + 250 + (signatureColumnWidth - nameWidth) / 2;
          doc.text(sig.name, nameX, yPos + i * 60);
          doc.setFont("times", "bold");
          const positionX =
            margin + 250 + (signatureColumnWidth - positionWidth) / 2;
          doc.text(sig.position || "N/A", positionX, yPos + i * 60 + 20);
          doc.setDrawColor(200, 200, 200);
        }
      });
    }

    if (preview) {
      const pdfUrl = URL.createObjectURL(
        new Blob([doc.output("blob")], { type: "application/pdf" })
      );
      setPdfPreview(pdfUrl);
      setIsPreviewOpen(true);
    } else {
      doc.save(
        `${(projectTitle || "proposal").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_proposal.pdf`
      );
    }
  };
  
  const closePreview = () => {
    if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    setIsPreviewOpen(false);
  };

  const handleSave = async (data: z.infer<typeof ProjectProposalSchema>) => {
    try {
      setErrorMessage(null);

      const headerImage = mediaFiles[0]?.publicUrl || mediaFiles[0]?.previewUrl || null;

      // Process supporting documents
      const validSupportDocs = supportingDocs.filter(doc => 
      doc.status === 'uploaded' && 
      doc.publicUrl && 
      doc.storagePath &&
      doc.file?.name &&
      doc.file?.type
    );


      const proposalData = {
        projectTitle: data.projectTitle,
        background: data.background,
        objectives: data.objectives.filter((obj) => obj.trim() !== ""),
        participants: data.participants.filter((p) => p.category.trim() !== ""),
        date: data.date,
        venue: data.venue,
        budgetItems: data.budgetItems.filter((item) => item.name.trim() !== ""),
        monitoringEvaluation: data.monitoringEvaluation,
        signatories: data.signatories.filter((s) => s.name.trim() !== ""),
        gpr_header_img: headerImage,
        paperSize: paperSize,
        staff_id: null,
      };

      // First create the proposal
      const proposalResponse = await addMutation.mutateAsync(proposalData);
      
      // Then add support docs if any
       if (validSupportDocs.length > 0) {
      await Promise.all(
        validSupportDocs.map(doc => {
          const fileData = {
            psd_url: doc.publicUrl!,
            psd_path: doc.storagePath!,
            psd_name: doc.file.name,
            psd_type: doc.file.type
          };
          return addSupportDocMutation.mutateAsync({
            gprId: proposalResponse.gprId,
            fileData
          });
        })
      );
    }

      form.reset();
      setMediaFiles([]);
      setSupportingDocs([]);
      setHeaderImageUrl(null);
      onSuccess();
    
  }  catch (error) {
      console.error("Error in handleSave:", error);
      setErrorMessage(
      "Failed to save proposal. Please check the form data and try again."
      );
    }
  };

  useEffect(() => {
    if (existingProposal) {
    const suppDocs = existingProposal.gprSuppDocs?.map((url: string) => ({
        id: `img-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image' as const,
        publicUrl: url,
        status: 'uploaded' as const,
        previewUrl: url,
        file: new File([], url.split('/').pop() || 'image.jpg'),
      })) || [];
    
    setSupportingDocs(suppDocs);

    if (existingProposal?.gpr_header_img) {
      setHeaderImageUrl(existingProposal.gpr_header_img);
      setMediaFiles([
        {
          id: "existing",
          type: "image",
          file: new File([], "existing.jpg"),
          publicUrl: existingProposal.gpr_header_img,
          status: "uploaded",
          previewUrl: existingProposal.gpr_header_img,
        },
      ]);
    }
  }
  }, [existingProposal]);

  useEffect(() => {
    return () => {
      if (headerImageUrl && headerImageUrl.startsWith("blob:"))
        URL.revokeObjectURL(headerImageUrl);
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    };
  }, [headerImageUrl, pdfPreview]);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
      {errorMessage && (
        <div className="mb-4 p-2 sm:p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Paper Size</label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paperSize"
              checked={paperSize === "a4"}
              onChange={() => {setValue("paperSize", "a4");}}
            />
            A4
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paperSize"
              checked={paperSize === "letter"}
              onChange={() => {setValue("paperSize", "letter");}}
            />
            Letter
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paperSize"
              checked={paperSize === "legal"}
              onChange={() => {setValue("paperSize", "legal");}}
            />
            Legal
          </label>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleSave)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Header Image (optional)
              </label>
              <MediaUpload
                title="Header Image"
                description="Upload an image for the proposal header"
                mediaFiles={mediaFiles}
                activeVideoId={activeVideoId}
                setMediaFiles={(filesOrUpdater) => {
                  setMediaFiles((prev) => {
                    const newFiles =
                      typeof filesOrUpdater === "function"
                        ? filesOrUpdater(prev)
                        : filesOrUpdater;
                    const imageUrl =
                      newFiles[0]?.publicUrl || newFiles[0]?.previewUrl || null;
                    setHeaderImageUrl(imageUrl);
                    return newFiles;
                  });
                }}
                setActiveVideoId={setActiveVideoId}
              />
              {headerImageUrl && (
                <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center">
                  <img
                    src={headerImageUrl}
                    alt="Header preview"
                    className="max-h-40"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setMediaFiles([]);
                      setHeaderImageUrl(null);
                    }}
                    className="mt-2 sm:mt-0"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Supporting Documents (optional)
              </label>
              <MediaUpload
                title="Supporting Documents"
                description="Upload any supporting documents for your proposal"
                mediaFiles={supportingDocs}
                activeVideoId={activeVideoId}
                setMediaFiles={setSupportingDocs}
                setActiveVideoId={setActiveVideoId}
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="projectTitle"
                label="Project Title"
                placeholder="Enter project title"
                type="text"
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="background"
                label="Background"
                placeholder="Enter project background"
                type="textarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((_, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                    <FormInput
                      control={control}
                      name={`objectives.${index}`}
                      label=""
                      placeholder={`Objective ${index + 1}`}
                      type="textarea"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeObjective(index)}
                      disabled={objectives.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addObjective}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Objective
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Participants
              </label>
              <div className="space-y-2">
                {participants.map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                  >
                    <FormSelect
                      control={control}
                      name={`participants.${index}.category`}
                      label="Category"
                      options={participantCategories.map((cat) => ({
                        id: cat,
                        name: cat,
                      }))}
                    />
                    <FormInput
                      control={control}
                      name={`participants.${index}.count`}
                      label="Count"
                      placeholder="Count"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-8"
                      onClick={() => removeParticipant(index)}
                      disabled={participants.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addParticipant}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Participant Category
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormDateTimeInput
                  control={control}
                  name="date"
                  label="Date"
                  type="date"
                />
              </div>
              <div>
                <FormInput
                  control={control}
                  name="venue"
                  label="Venue"
                  placeholder="e.g. CEBU CITY HALL, PLAZA SUGBO"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Budgetary Requirements
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-medium text-sm">
                  <span>Name</span>
                  <span>Pax</span>
                  <span>Amount</span>
                  <span>Action</span>
                </div>
                {budgetItems.map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                  >
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.name`}
                      label=""
                      placeholder="Item name"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.pax`}
                      label=""
                      placeholder="e.g. 73 pax"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.amount`}
                      label=""
                      placeholder="Amount"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeBudgetItem(index)}
                      disabled={budgetItems.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addBudgetItem}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Budget Item
                </Button>
              </div>
            </div>

            <div>
              <FormInput
                control={control}
                name="monitoringEvaluation"
                label="Monitoring Evaluation"
                placeholder="Enter monitoring evaluation"
                type="textarea"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prepared by
                </label>
                <div className="space-y-2">
                  {signatories
                    .filter((s) => s.type === "prepared")
                    .map((sig, index) => {
                      const globalIndex = signatories.findIndex(
                        (s) => s === sig
                      );
                      return (
                        <div
                          key={globalIndex}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                        >
                          <div className="flex-1">
                            <Popover
                              open={openCombobox === globalIndex}
                              onOpenChange={(open) =>
                                setOpenCombobox(open ? globalIndex : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openCombobox === globalIndex}
                                  className="w-full h-10 justify-between truncate"
                                  disabled={isStaffLoading}
                                >
                                  <span className="truncate">
                                    {isStaffLoading
                                      ? "Loading staff..."
                                      : sig.name || "Select staff..."}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search staff..."
                                    onValueChange={(value) => {
                                      if (
                                        !staffList.some((staff) =>
                                          staff.full_name
                                            .toLowerCase()
                                            .includes(value.toLowerCase())
                                        )
                                      ) {
                                        updateSignatory(
                                          globalIndex,
                                          "name",
                                          value
                                        );
                                      }
                                    }}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      No staff found. Enter name manually.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {staffList.map((staff) => (
                                        <CommandItem
                                          key={staff.staff_id}
                                          value={staff.full_name}
                                          onSelect={() => {
                                            updateSignatory(
                                              globalIndex,
                                              "name",
                                              staff.full_name,
                                              staff.position
                                            );
                                            setOpenCombobox(null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              sig.name === staff.full_name
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {staff.full_name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex-1">
                            <FormInput
                              control={control}
                              name={`signatories.${globalIndex}.position`}
                              label=""
                              placeholder=""
                              type="text"
                              className="mb-2 p-0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSignatory(globalIndex)}
                            disabled={signatories.length <= 1}
                            className="p-4 mt-1"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  <Button
                    type="button"
                    onClick={() => addSignatory("prepared")}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Approved by
                </label>
                <div className="space-y-2">
                  {signatories
                    .filter((s) => s.type === "approved")
                    .map((sig, index) => {
                      const globalIndex = signatories.findIndex(
                        (s) => s === sig
                      );
                      return (
                        <div
                          key={globalIndex}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                        >
                          <div className="flex-1">
                            <Popover
                              open={openCombobox === globalIndex}
                              onOpenChange={(open) =>
                                setOpenCombobox(open ? globalIndex : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openCombobox === globalIndex}
                                  className="w-full h-10 justify-between truncate"
                                  disabled={isStaffLoading}
                                >
                                  <span className="truncate">
                                    {isStaffLoading
                                      ? "Loading staff..."
                                      : sig.name || "Select staff..."}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search staff..."
                                    onValueChange={(value) => {
                                      if (
                                        !staffList.some((staff) =>
                                          staff.full_name
                                            .toLowerCase()
                                            .includes(value.toLowerCase())
                                        )
                                      ) {
                                        updateSignatory(
                                          globalIndex,
                                          "name",
                                          value
                                        );
                                      }
                                    }}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      No staff found. Enter name manually.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {staffList.map((staff) => (
                                        <CommandItem
                                          key={staff.staff_id}
                                          value={staff.full_name}
                                          onSelect={() => {
                                            updateSignatory(
                                              globalIndex,
                                              "name",
                                              staff.full_name,
                                              staff.position
                                            );
                                            setOpenCombobox(null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              sig.name === staff.full_name
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {staff.full_name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex-1">
                            <FormInput
                              control={control}
                              name={`signatories.${globalIndex}.position`}
                              label=""
                              placeholder=""
                              type="text"
                              className="mb-2 p-0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSignatory(globalIndex)}
                            disabled={signatories.length <= 1}
                            className="p-4 mt-1"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  <Button
                    type="button"
                    onClick={() => addSignatory("approved")}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto mb-5"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3">
              <Button
                type="button"
                onClick={() => generatePDF(true)}
                variant="outline"
                className="w-full sm:w-auto items-center gap-2 mb-5"
              >
                Preview
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto items-center gap-2"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0">
          <DialogHeader className="p-4 sticky top-0 bg-background z-10">
            <DialogTitle className="flex flex-row items-center justify-between">
              Preview
              <X
                className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-50"
                size="20"
                onClick={closePreview}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfPreview && (
              <iframe
                src={`${pdfPreview}#zoom=FitH`}
                className="w-full h-full border-t-0 bg-white"
                title="PDF Preview"
                style={{ minHeight: "calc(90vh - 4rem)" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};