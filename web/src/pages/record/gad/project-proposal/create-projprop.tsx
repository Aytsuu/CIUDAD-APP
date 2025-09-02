import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, X, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import {
  useAddProjectProposal,
  // useAddSupportDocument,
} from "./queries/addqueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useGetStaffList } from "./queries/fetchqueries";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { ProjectProposalSchema } from "@/form-schema/gad-projprop-create-form-schema";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useGADBudgets } from "../budget-tracker/queries/BTFetchQueries";
import { useGetGADYearBudgets } from "../budget-tracker/queries/BTYearQueries";
import { generateProposalPdf } from "./personalized-compo/pdfGenerator";
import { Signatory, ProjectProposalFormProps } from "./projprop-types";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";

export const ProjectProposalForm: React.FC<ProjectProposalFormProps> = ({
  existingProposal,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [supportingDocs, setSupportingDocs] = useState<MediaUploadType>([]);
  const [headerImageUrl, _setHeaderImageUrl] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const addSupportDocMutation = useAddSupportDocument();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const addMutation = useAddProjectProposal();

  const {
    data: budgetEntries = [],
    isLoading: isBudgetLoading,
  } = useGADBudgets(new Date().getFullYear().toString());
  const { data: yearBudgets } = useGetGADYearBudgets();
  const currentYear = new Date().getFullYear().toString();
  const currentYearBudget = yearBudgets?.find(
    (budget) => budget.gbudy_year === currentYear
  )?.gbudy_budget;

  const latestExpenseWithBalance = budgetEntries
    .filter(
      (entry) =>
        entry.gbud_type === "Expense" &&
        !entry.gbud_is_archive &&
        entry.gbud_remaining_bal != null
    )
    .sort(
      (a, b) =>
        new Date(b.gbud_datetime).getTime() -
        new Date(a.gbud_datetime).getTime()
    )[0];

  const availableBudget = latestExpenseWithBalance
    ? Number(latestExpenseWithBalance.gbud_remaining_bal) === 0
      ? currentYearBudget
        ? Number(currentYearBudget)
        : 0
      : Number(latestExpenseWithBalance.gbud_remaining_bal)
    : currentYearBudget
    ? Number(currentYearBudget)
    : 0;

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
    try {
      const pdfUrl = await generateProposalPdf(
        {
          projectTitle,
          background,
          objectives,
          participants,
          date,
          venue,
          budgetItems,
          monitoringEvaluation,
          signatories,
          paperSize,
          headerImage: headerImageUrl,
        },
        preview
      );

      if (preview && pdfUrl) {
        setPdfPreview(pdfUrl);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setErrorMessage("Failed to generate PDF preview. Please try again.");
    }
  };

  const closePreview = () => {
    if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    setIsPreviewOpen(false);
  };

  const handleSave = async (_data: z.infer<typeof ProjectProposalSchema>) => {
    // try {
    //   setErrorMessage(null);

    //   const headerImage =
    //     mediaFiles[0]?.publicUrl || mediaFiles[0]?.previewUrl || null;

    //   const validSupportDocs = supportingDocs.filter(
    //     (doc) =>
    //       doc.status === "uploaded" &&
    //       doc.publicUrl &&
    //       doc.storagePath &&
    //       doc.file?.name &&
    //       doc.file?.type
    //   );

    //   const proposalData = {
    //     projectTitle: data.projectTitle,
    //     background: data.background,
    //     objectives: data.objectives.filter((obj) => obj.trim() !== ""),
    //     participants: data.participants.filter((p) => p.category.trim() !== ""),
    //     date: data.date,
    //     venue: data.venue,
    //     budgetItems: data.budgetItems.filter((item) => item.name.trim() !== ""),
    //     monitoringEvaluation: data.monitoringEvaluation,
    //     signatories: data.signatories.filter((s) => s.name.trim() !== ""),
    //     gpr_header_img: headerImage,
    //     paperSize: paperSize,
    //     staff_id: null,
    //   };

    //   const proposalResponse = await addMutation.mutateAsync(proposalData);

    //   if (validSupportDocs.length > 0) {
    //     await Promise.all(
    //       validSupportDocs.map((doc) => {
    //         const fileData = {
    //           psd_url: doc.publicUrl!,
    //           psd_path: doc.storagePath!,
    //           psd_name: doc.file.name,
    //           psd_type: doc.file.type,
    //         };
    //         return addSupportDocMutation.mutateAsync({
    //           gprId: proposalResponse.gprId,
    //           fileData,
    //         });
    //       })
    //     );
    //   }

    //   form.reset();
    //   setMediaFiles([]);
    //   setSupportingDocs([]);
    //   setHeaderImageUrl(null);
    //   onSuccess();
    // } catch (error) {
    //   console.error("Error in handleSave:", error);
    //   setErrorMessage(
    //     "Failed to save proposal. Please check the form data and try again."
    //   );
    // }
  };

  useEffect(() => {
    if (existingProposal) {
      const suppDocs =
        existingProposal.gprSuppDocs?.map((url: string) => ({
          id: `img-${Math.random().toString(36).substr(2, 9)}`,
          type: "image" as const,
          publicUrl: url,
          status: "uploaded" as const,
          previewUrl: url,
          file: new File([], url.split("/").pop() || "image.jpg"),
        })) || [];

      setSupportingDocs(suppDocs);

      // if (existingProposal?.gpr_header_img) {
      //   setHeaderImageUrl(existingProposal.gpr_header_img);
      //   setMediaFiles([
      //     {
      //       id: "existing",
      //       type: "image",
      //       file: new File([], "existing.jpg"),
      //       publicUrl: existingProposal.gpr_header_img,
      //       status: "uploaded",
      //       previewUrl: existingProposal.gpr_header_img,
      //     },
      //   ]);
      // }
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
              onChange={() => {
                setValue("paperSize", "a4");
              }}
            />
            A4
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paperSize"
              checked={paperSize === "letter"}
              onChange={() => {
                setValue("paperSize", "letter");
              }}
            />
            Letter
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paperSize"
              checked={paperSize === "legal"}
              onChange={() => {
                setValue("paperSize", "legal");
              }}
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
                title=""
                description="Upload an image for the proposal header"
                mediaFiles={mediaFiles}
                activeVideoId={activeVideoId}
                setMediaFiles={(filesOrUpdater) => {
                  setMediaFiles((prev) => {
                    const newFiles =
                      typeof filesOrUpdater === "function"
                        ? filesOrUpdater(prev)
                        : filesOrUpdater;
                    // const imageUrl =
                    //   newFiles[0]?.publicUrl || newFiles[0]?.previewUrl || null;
                    // setHeaderImageUrl(imageUrl);
                    return newFiles;
                  });
                }}
                setActiveVideoId={setActiveVideoId}
                maxFiles={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Supporting Documents (optional)
              </label>
              <MediaUpload
                title=""
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
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-2 items-center"
                  >
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
                      label=""
                      options={participantCategories.map((cat) => ({
                        id: cat,
                        name: cat,
                      }))}
                    />
                    <FormInput
                      control={control}
                      name={`participants.${index}.count`}
                      label=""
                      placeholder="Count"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
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
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  Budgetary Requirements
                </label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span>Available Funds:</span>
                  {isBudgetLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : availableBudget != null ? (
                    <span className="font-mono text-red-500">
                      ₱
                      {availableBudget.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ) : (
                    <span className="text-gray-500">No expense records</span>
                  )}
                </div>
              </div>
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
                    .map((sig) => {
                      const globalIndex = signatories.findIndex(
                        (s) => s === sig
                      );
                      return (
                        <div
                          key={globalIndex}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                        >
                          <ComboboxInput
                            value={sig.name}
                            options={staffList}
                            isLoading={isStaffLoading}
                            label=""
                            placeholder="Select staff..."
                            emptyText="No staff found. Enter name manually."
                            onSelect={(value, item) => {
                              updateSignatory(
                                globalIndex,
                                "name",
                                value,
                                item?.position
                              );
                            }}
                            onCustomInput={(value) => {
                              updateSignatory(globalIndex, "name", value);
                            }}
                            displayKey="full_name"
                            valueKey="staff_id"
                            additionalDataKey="position"
                          />
                          <div className="flex-1">
                            <FormInput
                              control={control}
                              name={`signatories.${globalIndex}.position`}
                              label=""
                              placeholder=""
                              type="text"
                              className="p-0"
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
                    .map((sig) => {
                      const globalIndex = signatories.findIndex(
                        (s) => s === sig
                      );
                      return (
                        <div
                          key={globalIndex}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                        >
                          <ComboboxInput
                            value={sig.name}
                            options={staffList}
                            isLoading={isStaffLoading}
                            label=""
                            placeholder="Select staff..."
                            emptyText="No staff found. Enter name manually."
                            onSelect={(value, item) => {
                              updateSignatory(
                                globalIndex,
                                "name",
                                value,
                                item?.position
                              );
                            }}
                            onCustomInput={(value) => {
                              updateSignatory(globalIndex, "name", value);
                            }}
                            displayKey="full_name"
                            valueKey="staff_id"
                            additionalDataKey="position"
                          />
                          <div className="flex-1">
                            <FormInput
                              control={control}
                              name={`signatories.${globalIndex}.position`}
                              label=""
                              placeholder=""
                              type="text"
                              className="p-0"
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
